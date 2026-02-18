declare namespace NodeJS {
  interface ProcessEnv {
    RESEND_API_KEY: string;
    HCAPTCHA_SECRET_KEY: string;
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: string;
    CONTACT_EMAIL?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
