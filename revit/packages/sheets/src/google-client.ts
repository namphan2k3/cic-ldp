import fs from 'node:fs';
import path from 'node:path';
import { JWT } from 'google-auth-library';
import { sheets as googleSheets } from 'googleapis/build/src/apis/sheets/index.js';
import { drive as googleDrive } from 'googleapis/build/src/apis/drive/index.js';

export interface ServiceAccountCreds {
  clientEmail: string;
  privateKey: string;
  projectId?: string;
  sourceFile?: string;
}

let cachedCredsList: ServiceAccountCreds[] | null = null;
const spreadsheetCredIndexMap = new Map<string, number>();

function sanitizePrivateKey(rawKey: string): string {
  const trimmed = rawKey.trim();
  return trimmed.includes('\\n') ? trimmed.replace(/\\n/g, '\n') : trimmed;
}

function tryReadCredFile(filePath: string): ServiceAccountCreds | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.client_email && parsed.private_key) {
      const privateKey = sanitizePrivateKey(parsed.private_key);
      if (privateKey.includes('BEGIN PRIVATE KEY')) {
        return {
          clientEmail: String(parsed.client_email).trim(),
          privateKey,
          projectId: parsed.project_id ? String(parsed.project_id).trim() : undefined,
          sourceFile: path.basename(filePath),
        };
      }
    }
  } catch {
    // ignore invalid json
  }
  return null;
}

export function loadAllServiceAccountCredentials(): ServiceAccountCreds[] {
  if (cachedCredsList && cachedCredsList.length > 0) {
    return cachedCredsList;
  }

  const list: ServiceAccountCreds[] = [];
  const seenEmails = new Set<string>();

  const pushUnique = (cred: ServiceAccountCreds | null) => {
    if (cred && !seenEmails.has(cred.clientEmail)) {
      seenEmails.add(cred.clientEmail);
      list.push(cred);
    }
  };

  // 1. Direct env vars
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    pushUnique({
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim(),
      privateKey: sanitizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
      projectId: process.env.GOOGLE_PROJECT_ID?.trim(),
      sourceFile: 'env',
    });
  }

  // 2. Directory scan (GOOGLE_CREDENTIALS_DIR or relative credentials folder)
  const candidateDirs = [
    process.env.GOOGLE_CREDENTIALS_DIR?.trim(),
    path.resolve(process.cwd(), 'credentials'),
    path.resolve(process.cwd(), '../../credentials'),
  ].filter((d): d is string => Boolean(d));

  for (const dir of candidateDirs) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        for (const file of fs.readdirSync(dir)) {
          if (file.endsWith('.json')) {
            pushUnique(tryReadCredFile(path.join(dir, file)));
          }
        }
      }
    } catch {
      // ignore
    }
  }

  cachedCredsList = list;
  return list;
}

export function reloadServiceAccountCredentials(): ServiceAccountCreds[] {
  cachedCredsList = null;
  spreadsheetCredIndexMap.clear();
  return loadAllServiceAccountCredentials();
}

export function saveServiceAccountJsonFile(rawJson: string): ServiceAccountCreds {
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson.trim());
  } catch {
    throw new Error('Nội dung JSON không hợp lệ.');
  }
  if (!parsed?.client_email || !parsed?.private_key) {
    throw new Error('File JSON phải chứa trường client_email và private_key của Google Service Account.');
  }
  const privateKey = sanitizePrivateKey(String(parsed.private_key));
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Trường private_key không đúng định dạng PEM (BEGIN PRIVATE KEY).');
  }

  const credDir =
    process.env.GOOGLE_CREDENTIALS_DIR?.trim() ||
    path.resolve(process.cwd(), '../../credentials');
  if (!fs.existsSync(credDir)) {
    fs.mkdirSync(credDir, { recursive: true });
  }
  const safeName = String(parsed.project_id || parsed.client_email)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
  const fileName = `${safeName}.json`;
  const fullPath = path.join(credDir, fileName);
  fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2), 'utf8');

  reloadServiceAccountCredentials();
  return {
    clientEmail: String(parsed.client_email).trim(),
    privateKey,
    projectId: parsed.project_id ? String(parsed.project_id).trim() : undefined,
    sourceFile: fileName,
  };
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = String(input ?? '').trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export function formatSheetRange(sheetName: string, subRange: string): string {
  const clean = (sheetName || 'Sheet1').trim();
  const escaped = clean.replace(/'/g, "''");
  return `'${escaped}'!${subRange}`;
}

async function withCredentialFallback<T>(
  spreadsheetId: string,
  fn: (cred: ServiceAccountCreds) => Promise<T>
): Promise<T> {
  const creds = loadAllServiceAccountCredentials();
  if (creds.length === 0) {
    throw new Error(
      'Chưa cấu hình Google Service Account trong thư mục credentials/ hoặc biến môi trường.'
    );
  }

  const preferredIdx = spreadsheetCredIndexMap.get(spreadsheetId);
  const orderedIndices =
    preferredIdx !== undefined
      ? [preferredIdx, ...creds.map((_, i) => i).filter((i) => i !== preferredIdx)]
      : creds.map((_, i) => i);

  let lastError: unknown = null;
  for (const idx of orderedIndices) {
    try {
      const result = await fn(creds[idx]);
      spreadsheetCredIndexMap.set(spreadsheetId, idx);
      return result;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || err?.response?.status;
      // Only try next credential on 403/404 permission/not-found errors
      if (status !== 403 && status !== 404) {
        break;
      }
    }
  }
  throw lastError;
}

function createAuth(cred: ServiceAccountCreds, scopes: string[]) {
  return new JWT({
    email: cred.clientEmail,
    key: cred.privateKey,
    scopes,
  });
}

export async function getDriveFileModifiedTime(spreadsheetId: string): Promise<string | null> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  try {
    return await withCredentialFallback(cleanId, async (cred) => {
      const auth = createAuth(cred, ['https://www.googleapis.com/auth/drive.metadata.readonly']);
      const drive = googleDrive({ version: 'v3', auth: auth as any });
      const res = await drive.files.get({
        fileId: cleanId,
        fields: 'modifiedTime',
        supportsAllDrives: true,
      });
      return (res.data as { modifiedTime?: string }).modifiedTime || null;
    });
  } catch {
    return null;
  }
}

export interface SheetInspectionResult {
  spreadsheetId: string;
  spreadsheetTitle: string;
  serviceAccountEmail: string;
  tabs: Array<{ title: string; rowCount: number; columnCount: number }>;
  activeTab: string;
  headers: string[];
  sampleRows: unknown[][];
}

export async function inspectSpreadsheet(
  spreadsheetIdOrUrl: string,
  preferredSheetName?: string,
  headerRow = 1
): Promise<SheetInspectionResult> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  return withCredentialFallback(spreadsheetId, async (cred) => {
    const auth = createAuth(cred, ['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const sheets = googleSheets({ version: 'v4', auth: auth as any });
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    const tabs = (meta.data.sheets || []).map((s) => ({
      title: s.properties?.title || 'Sheet1',
      rowCount: s.properties?.gridProperties?.rowCount || 0,
      columnCount: s.properties?.gridProperties?.columnCount || 0,
    }));

    const activeTab =
      (preferredSheetName && tabs.find((t) => t.title === preferredSheetName)?.title) ||
      tabs[0]?.title ||
      'Sheet1';

    const endRow = Math.max(headerRow + 20, 25);
    const valRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: formatSheetRange(activeTab, `A${headerRow}:ZZ${endRow}`),
      valueRenderOption: 'FORMATTED_VALUE',
    });

    const rows = valRes.data.values || [];
    let headerIdx = 0;
    const row0NonEmpty = (rows[0] || []).filter((c) => String(c ?? '').trim() !== '').length;
    const row1NonEmpty = (rows[1] || []).filter((c) => String(c ?? '').trim() !== '').length;
    if (headerRow === 1 && row0NonEmpty <= 1 && row1NonEmpty >= 3) {
      headerIdx = 1;
    }
    const headers = (rows[headerIdx] || []).map((h, i) => String(h ?? '').trim() || `Cột ${i + 1}`);
    const sampleRows = rows.slice(headerIdx + 1, headerIdx + 21);

    return {
      spreadsheetId,
      spreadsheetTitle: meta.data.properties?.title || spreadsheetId,
      serviceAccountEmail: cred.clientEmail,
      tabs,
      activeTab,
      headers,
      sampleRows,
    };
  });
}

export interface RawSheetDataPayload {
  headers: string[];
  unformattedRows: unknown[][];
  formattedRows: unknown[][];
  serviceAccountEmail: string;
}

export async function readFullSheetRows(
  spreadsheetId: string,
  sheetName: string,
  headerRow = 1
): Promise<RawSheetDataPayload> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  return withCredentialFallback(cleanId, async (cred) => {
    const auth = createAuth(cred, ['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const sheets = googleSheets({ version: 'v4', auth: auth as any });
    const range = formatSheetRange(sheetName, `A${headerRow}:ZZ`);

    const [formattedRes, unformattedRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: cleanId,
        range,
        valueRenderOption: 'FORMATTED_VALUE',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: cleanId,
        range,
        valueRenderOption: 'UNFORMATTED_VALUE',
      }),
    ]);

    const formattedAll = formattedRes.data.values || [];
    const unformattedAll = unformattedRes.data.values || [];

    // Auto-detect if row 1 is a single-cell merged banner title and row 2 is the real header row
    let headerOffset = 0;
    const row0NonEmpty = (formattedAll[0] || []).filter((c) => String(c ?? '').trim() !== '').length;
    const row1NonEmpty = (formattedAll[1] || []).filter((c) => String(c ?? '').trim() !== '').length;
    if (headerRow === 1 && row0NonEmpty <= 1 && row1NonEmpty >= 3) {
      headerOffset = 1;
    }

    const rawHeaders = formattedAll[headerOffset] || [];
    let lastNonEmptyCol = -1;
    for (let i = rawHeaders.length - 1; i >= 0; i--) {
      if (String(rawHeaders[i] ?? '').trim() !== '') {
        lastNonEmptyCol = i;
        break;
      }
    }

    const colCount = Math.max(lastNonEmptyCol + 1, 0);
    const headers = Array.from({ length: colCount }, (_, idx) => {
      const val = String(rawHeaders[idx] ?? '').trim();
      return val || `Cột ${idx + 1}`;
    });

    return {
      headers,
      formattedRows: formattedAll.slice(headerOffset + 1),
      unformattedRows: unformattedAll.slice(headerOffset + 1),
      serviceAccountEmail: cred.clientEmail,
    };
  });
}

export async function appendGoogleSheetRowValues(
  spreadsheetId: string,
  sheetName: string,
  values: unknown[]
): Promise<{ updatedRange?: string | null; updatedRows?: number | null }> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  return withCredentialFallback(cleanId, async (cred) => {
    const auth = createAuth(cred, ['https://www.googleapis.com/auth/spreadsheets']);
    const sheets = googleSheets({ version: 'v4', auth: auth as any });
    const formattedValues = values.map((v) => {
      if (v === null || v === undefined) return '';
      const s = String(v).trim();
      if (/^0\d{8,12}$/.test(s)) return `'${s}`;
      return s;
    });

    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: cleanId,
      range: formatSheetRange(sheetName, 'A:A'),
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [formattedValues],
      },
    });

    return {
      updatedRange: res.data.updates?.updatedRange,
      updatedRows: res.data.updates?.updatedRows,
    };
  });
}
