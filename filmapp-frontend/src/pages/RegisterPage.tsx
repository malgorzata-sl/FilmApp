import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

function validatePassword(pw: string) {
    const minLength = 6;
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);

    if (pw.length < minLength) return `Hasło musi mieć minimum ${minLength} znaków.`;
    if (!hasNumber) return "Hasło musi zawierać co najmniej jedną cyfrę.";
    if (!hasSpecial) return "Hasło musi zawierać co najmniej jeden znak specjalny.";
    return null;
}

export default function RegisterPage() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    async function onRegister() {
        setErr(null);
        setOkMsg(null);

        if (!email.trim() || !password || !password2) {
            setErr("Podaj email i dwa razy hasło.");
            return;
        }

        if (password !== password2) {
            setErr("Hasła nie są takie same.");
            return;
        }

        const validationError = validatePassword(password);
        if (validationError) {
            setErr(validationError);
            return;
        }

        setBusy(true);

        try {
            const res = await fetch(`${API_BASE}/api/Auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                try {
                    const errData = await res.json();
                    if (errData.errors?.Password) {
                        setErr(errData.errors.Password.join(" "));
                    } else {
                        setErr(`Błąd rejestracji: HTTP ${res.status}`);
                    }
                } catch {
                    setErr(`Błąd rejestracji: HTTP ${res.status}`);
                }
                return;
            }

            setOkMsg("Konto utworzone. Możesz się zalogować.");
            setTimeout(() => nav("/login"), 1000);
        } catch (e: unknown) {
            setErr((e as Error).message || "Błąd rejestracji");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-background-dark text-white min-h-screen flex flex-col">
            <main className="flex-grow flex flex-col items-center justify-center px-6 py-10 w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8 tracking-tight">
                    Zarejestruj się
                </h2>

                <form
                    className="w-full space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onRegister();
                    }}
                >
                    <div className="space-y-4">
                        <input
                            className="w-full h-12 bg-surface-dark border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-[#9b92c9] focus:border-primary/50 focus:ring-0"
                            placeholder="E-mail"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            className="w-full h-12 bg-surface-dark border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-[#9b92c9] focus:border-primary/50 focus:ring-0"
                            placeholder="Hasło"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <input
                            className="w-full h-12 bg-surface-dark border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-[#9b92c9] focus:border-primary/50 focus:ring-0"
                            placeholder="Powtórz hasło"
                            type="password"
                            autoComplete="new-password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                        />

                        <p className="text-xs text-[#9b92c9] flex items-center gap-1.5 px-1">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Twoim loginem będzie adres e-mail
                        </p>
                    </div>

                    {err && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-500 text-sm text-center">
                            {err}
                        </div>
                    )}

                    {okMsg && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-green-500 text-sm text-center">
                            {okMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
                    >
                        {busy ? "Rejestruję..." : "Utwórz konto"}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-[#9b92c9]">
                            Masz już konto?{" "}
                            <Link
                                to="/login"
                                className="text-white font-semibold hover:underline"
                            >
                                Zaloguj się
                            </Link>
                        </p>
                    </div>
                </form>
            </main>

            <footer className="bg-background-dark border-t border-white/10 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
                    <div className="flex gap-6 text-[#9b92c9] text-xs font-medium">
                        <span>O nas</span>
                        <span>Regulamin</span>
                        <span>Prywatność</span>
                        <span>Pomoc</span>
                    </div>
                    <p className="text-[#9b92c9]/40 text-[10px] tracking-wide uppercase text-center">
                        © 2024 Film App. Wszelkie prawa zastrzeżone.
                    </p>
                </div>
            </footer>
        </div>
    );
}
