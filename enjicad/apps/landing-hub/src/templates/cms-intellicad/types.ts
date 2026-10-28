import type { LandingPageSectionRow, LandingSiteRow } from '@cic/db';

export interface CmsIntellicadTemplateProps {
  site: LandingSiteRow;
  sections: LandingPageSectionRow[];
  locale: string;
  formConfig?: {
    form_code?: string;
    fields_schema_json?: Array<{
      name: string;
      label: string;
      type: string;
      placeholder?: string;
      required?: boolean;
      default_value?: any;
      options?: Array<{ label: string; value: string }>;
    }>;
    success_payload_json?: Record<string, any>;
  };
}

export interface HeaderPayload {
  subtitle?: string;
  quote?: string;
  nav_items?: Array<{ label: string; href: string }>;
  hotline?: string;
}

export interface HeroPayload {
  badge?: string;
  title_line?: string;
  title_accent?: string;
  description_1?: string;
  description_2?: string;
  compare_versions?: string;
  pricing?: {
    badge?: string;
    types?: string;
    from?: string;
    price?: string;
    note?: string;
    standalone?: string;
    network?: string;
    options?: string[];
  };
  visual?: {
    real_ui?: string;
    title?: string;
    specs?: Array<{ label: string; value: string }>;
  };
  licensing?: {
    badge?: string;
    title?: string;
    description?: string;
  };
  versions?: Array<{
    name: string;
    icon?: string;
    tag?: string;
    description: string;
  }>;
}

export interface AdvantagesPayload {
  badge?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface ComparisonPayload {
  badge?: string;
  title?: string;
  subtitle?: string;
  matrix?: Array<{
    feature: string;
    autocad: string | boolean;
    intellicad: string | boolean;
    note?: string;
  }>;
  pdf_url?: string;
  modal_title?: string;
}

export interface RequirementsPayload {
  badge?: string;
  title?: string;
  subtitle?: string;
  minimum?: Record<string, string>;
  recommended?: Record<string, string>;
  formats?: Array<{ code: string; name: string }>;
}

export interface ResourcesPayload {
  badge?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    title: string;
    type: string;
    description: string;
    download_url?: string;
    file_size?: string;
  }>;
}

export interface FaqPayload {
  badge?: string;
  title?: string;
  subtitle?: string;
  categories?: string[];
  items?: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
}

export interface FormPayload {
  title?: string;
  subtitle?: string;
  submit_label?: string;
  disclaimer?: string;
}

export interface FooterPayload {
  company_name?: string;
  address?: string;
  hotline?: string;
  email?: string;
  website?: string;
  copyright?: string;
  links?: Array<{ label: string; href: string }>;
}

export interface FloatingCtaPayload {
  hotline?: string;
  zalo_url?: string;
  form_anchor?: string;
}
