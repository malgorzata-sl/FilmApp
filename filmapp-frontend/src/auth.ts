const KEY = "auth";

export type AuthState = {
    token: string;
    role?: string; 
    name?: string; 
};


export function getAuth(): AuthState | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AuthState) : null;
}

export function setAuth(auth: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
