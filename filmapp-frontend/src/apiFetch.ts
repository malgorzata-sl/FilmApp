import { getAuth } from "./auth";
import { API_BASE } from "./api";
import { go } from "./pages/navigation";

export async function apiFetch(path: string, init?: RequestInit) {
    const auth = getAuth();
    const headers = new Headers(init?.headers);

    if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (auth?.token) headers.set("Authorization", `Bearer ${auth.token}`);

    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

    if (res.status === 401 && window.location.pathname !== "/login") {
        go("/login");
    }

    return res;
}
