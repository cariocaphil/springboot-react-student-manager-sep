export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student {
  id: number;
  name: string;
  email: string;
  gender: Gender;
}

export type NewStudent = Omit<Student, 'id'>;

export interface ApiErrorBody {
  message: string;
  status: number;
  error: string;
}

/** Minimal response shape returned by `unfetch`. */
export type ApiResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json: <T = unknown>() => Promise<T>;
};

export type HttpError = Error & { response: ApiResponse };

export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as HttpError).response != null
  );
}
