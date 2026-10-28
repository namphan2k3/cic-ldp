import type { LandingPageSectionRow, LandingSiteRow } from '@cic/db';

export interface RobotCongTrinhTemplateProps {
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

export interface RobotHeaderPayload {
  tagline?: string;
  skip?: string;
  nav_intro?: string;
  nav_robot?: string;
  nav_infrastructure?: string;
  nav_faq?: string;
  cta?: string;
  [key: string]: any;
}

export interface RobotHeroPayload {
  eyebrow?: string;
  title?: string;
  description?: string;
  primary_cta?: string;
  secondary_cta?: string;
  strapline?: string;
  link?: string;
  [key: string]: any;
}

export interface RobotIntroPayload {
  eyebrow?: string;
  topic?: string;
  title?: string;
  statement?: string;
  subtitle?: string;
  description?: string;
  description_2?: string;
  fit_1?: string;
  fit_2?: string;
  fit_3?: string;
  [key: string]: any;
}

export interface CatalogItem {
  label: string;
  tag: string;
  title: string;
  model: string;
  price: string;
  description: string;
  application: string;
  cta: string;
  is_duo?: boolean;
  [key: string]: any;
}

export interface RobotCatalogPayload {
  eyebrow?: string;
  title?: string;
  description?: string;
  price_label?: string;
  application_label?: string;
  items?: CatalogItem[];
  download_profile?: string;
  profile_file?: string;
  [key: string]: any;
}

export interface VideoSlideItem {
  url: string;
  embed: string;
  caption: string;
  [key: string]: any;
}

export interface RobotVideoSliderPayload {
  items: VideoSlideItem[];
  [key: string]: any;
}

export interface RobotInfrastructurePayload {
  eyebrow?: string;
  title?: string;
  description?: string;
  price_label?: string;
  cta?: string;
  items?: Array<{
    title: string;
    model?: string;
    price?: string;
    description: string;
    image_url?: string;
    video_url?: string;
    video_embed?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface RobotFormPayload {
  eyebrow?: string;
  title?: string;
  description?: string;
  phone_label?: string;
  email_label?: string;
  note?: string;
  contact_label?: string;
  phone?: string;
  phone_2?: string;
  email?: string;
  email_2?: string;
  form_title?: string;
  name?: string;
  company?: string;
  interest?: string;
  select_placeholder?: string;
  message?: string;
  submit?: string;
  [key: string]: any;
}

export interface RobotFaqPayload {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: Array<{
    question: string;
    answer: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface RobotFooterPayload {
  company?: string;
  address?: string;
  hotline?: string;
  email?: string;
  tax_id?: string;
  copyright?: string;
  privacy_policy?: string;
  terms?: string;
  description?: string;
  contact?: string;
  hotline_label?: string;
  telephone_label?: string;
  email_label?: string;
  website_label?: string;
  facebook_label?: string;
  explore?: string;
  nav_intro?: string;
  nav_robot?: string;
  nav_infrastructure?: string;
  nav_form?: string;
  nav_faq?: string;
  signature?: string;
  [key: string]: any;
}
