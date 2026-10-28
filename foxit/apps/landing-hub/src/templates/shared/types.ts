import type { LandingSiteRow, LandingPageSectionRow, LandingFormRow } from '@cic/db';

export type SupportedLocale = 'vi' | 'en' | 'zh';

export interface ModularTemplateProps {
  site: LandingSiteRow;
  sections: LandingPageSectionRow[];
  locale: SupportedLocale;
  formConfig?: LandingFormRow;
  isPreview?: boolean;
}

export interface ModularSectionProps {
  payload: Record<string, any>;
  allPayloads?: Record<string, any>[];
  locale?: SupportedLocale;
}
