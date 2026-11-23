/** Envelope JSON standar (AC-03): { status, data, meta, message, errors } */
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiSuccess<T> {
  status: 'success';
  data: T;
  meta?: PaginationMeta;
  message: string;
  errors: null;
}

export interface ApiErrorBody {
  code: string;
  details?: unknown;
}

export interface ApiError {
  status: 'error';
  data: null;
  message: string;
  errors: ApiErrorBody;
}
