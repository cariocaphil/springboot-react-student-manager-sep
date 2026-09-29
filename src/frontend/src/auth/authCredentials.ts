export type AuthCredentials = {
  username: string;
  password: string;
};

let credentials: AuthCredentials | null = null;
let unauthorizedHandler: (() => void) | null = null;

/** In-memory only — never write password to localStorage/sessionStorage. */
export function setAuthCredentials(next: AuthCredentials): void {
  credentials = next;
}

export function clearAuthCredentials(): void {
  credentials = null;
}

export function getAuthCredentials(): AuthCredentials | null {
  return credentials;
}

export function hasAuthCredentials(): boolean {
  return credentials !== null;
}

export function encodeBasicAuthorizationHeader(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

/** Authorization header when credentials are present; otherwise undefined. */
export function getAuthorizationHeader(): string | undefined {
  if (credentials === null) {
    return undefined;
  }
  return encodeBasicAuthorizationHeader(credentials.username, credentials.password);
}

/** Called by the API client when a response is HTTP 401. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}
