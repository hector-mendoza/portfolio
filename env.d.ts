declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SANITY_PROJECT_ID: string;
    NEXT_PUBLIC_SANITY_DATASET: string;
    NEXT_PUBLIC_SANITY_API_VERSION: string;
    SANITY_API_READ_TOKEN?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
