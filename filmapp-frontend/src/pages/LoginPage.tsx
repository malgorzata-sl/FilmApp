import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setAuth } from "../auth";
import { apiFetch } from "../apiFetch";
import { API_BASE } from "../api";

export default function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);  
    const [busy, setBusy] = useState(false);

    async function onLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);  
        setBusy(true);

        try {
            const res = await fetch(`${API_BASE}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                setError(`Błąd logowania: HTTP ${res.status}`);  
                return;
            }

            const data: { token: string } = await res.json();
            setAuth({ token: data.token });

            const meRes = await apiFetch("/api/auth/whoami");
            if (meRes.ok) {
                const me = await meRes.json();
                const role = me?.roles?.[0]; 
                setAuth({
                    token: data.token,
                    role,
                    name: me?.name, 
                }); 
            }

            nav("/profile");
        } catch (error) {
            setError("Błąd połączenia");  
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-background-dark text-white min-h-screen flex flex-col">
            <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8 tracking-tight text-white">
                    Zaloguj się
                </h2>

                <form className="w-full space-y-4" onSubmit={onLogin}>
                    {error && (  
                        <div className="bg-danger/20 border border-danger/50 rounded-xl p-3 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                className="w-full h-12 bg-surface-dark border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-[#9b92c9] focus:border-primary/50 focus:ring-0 transition-all"
                                placeholder="E-mail lub nazwa użytkownika"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={busy}
                            />
                        </div>

                        <div className="relative">
                            <input
                                className="w-full h-12 bg-surface-dark border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-[#9b92c9] focus:border-primary/50 focus:ring-0 transition-all"
                                placeholder="Hasło"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={busy}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">

                    </div>

                    <div className="pt-2">
                        <button
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={busy || !email || !password}
                        >
                            {busy ? "Logowanie..." : "Zaloguj się"}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-sm text-[#9b92c9]">
                            Nie masz konta?{" "}
                            <Link className="text-white font-bold hover:underline" to="/register">
                                Zarejestruj się
                            </Link>
                        </p>
                    </div>
                </form>
            </main>

            <footer className="bg-background-dark border-t border-white/10 py-8 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
                    <div className="flex gap-6 text-[#9b92c9] text-xs font-medium">
                        <Link to="/about">O nas</Link>
                        <Link to="/terms">Regulamin</Link>
                        <Link to="/privacy">Prywatność</Link>
                        <Link to="/help">Pomoc</Link>
                    </div>
                    <p className="text-[#9b92c9]/40 text-[10px] tracking-wide uppercase text-center">
                        © 2024 FILMWEB STYLE APP. WSZELKIE PRAWA ZASTRZEŻONE.
                    </p>
                </div>
            </footer>
        </div>
    );
}
