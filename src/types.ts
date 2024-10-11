export interface Env {
  ENVIRONMENT?: "dev" | "prod";
  ORIGIN_URL: string; // S3 bucket URL
  R2_BUCKET: R2Bucket; // R2 client instance
}

export interface InvalidateRequestBody {
  id?: string;
  updateFile?: string;
}

export type ParsedRange =
  | { offset: number; length: number }
  | { suffix: number };
