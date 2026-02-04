import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../auth';
import { apiFetch } from '../apiFetch';
import AdminDashboardPage from './admin/AdminDashboardPage';

type UserMetrics = {
    likedMovies: number;
    watchedMovies: number;
    proposalsCount: number;
};

export default function ProfilePage() {
    const nav = useNavigate();
    const auth = getAuth();
    const isAdmin = auth?.role === 'Admin';

    const [metrics, setMetrics] = useState<UserMetrics>({
        likedMovies: 0,
        watchedMovies: 0,
        proposalsCount: 0,
    });
    const [loadingMetrics, setLoadingMetrics] = useState(false);

    useEffect(() => {
        if (isAdmin) return;

        setLoadingMetrics(true);
        apiFetch('/api/me/reports/user-metrics')
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((d: UserMetrics) => setMetrics(d))
            .catch(() =>
                setMetrics({
                    likedMovies: 0,
                    watchedMovies: 0,
                    proposalsCount: 0,
                })
            )
            .finally(() => setLoadingMetrics(false));
    }, [isAdmin]);

    if (isAdmin) {
        return <AdminDashboardPage />;
    }

    return (
        <div className="bg-[#05030e] text-white min-h-screen">
            <header className="sticky top-0 z-50 bg-[#05030e]/95 backdrop-blur-md border-b border-white/5">
                
                
            </header>

            <main className="max-w-7xl mx-auto p-4 space-y-8">
                <section className="pt-2">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Witaj, {auth?.name ?? "Użytkowniku"}!
                        </h2>
                        <p className="text-xs text-[#9b92c9] mt-0.5">
                            Zalogowany jako: {auth?.name ?? "-"}
                        </p>
                        <p className="text-xs text-[#9b92c9] mt-0.5">Rola: {auth?.role ?? '-'}</p>

                    </div>


                    <div className="mt-6 flex gap-3 overflow-x-auto hide-scrollbar">
                        <div className="flex-shrink-0 bg-surface-dark/20 border border-white/5 rounded-lg px-4 py-3 flex flex-col gap-1 min-w-[120px]">
                            <span className="text-[9px] font-bold text-[#9b92c9] uppercase tracking-wider">Polubione</span>
                            <span className="text-lg font-bold text-white leading-none">
                                {loadingMetrics ? '...' : metrics.likedMovies}
                            </span>
                        </div>

                        <div className="flex-shrink-0 bg-surface-dark/20 border border-white/5 rounded-lg px-4 py-3 flex flex-col gap-1 min-w-[120px]">
                            <span className="text-[9px] font-bold text-[#9b92c9] uppercase tracking-wider">Obejrzane</span>
                            <span className="text-lg font-bold text-primary leading-none">
                                {loadingMetrics ? '...' : metrics.watchedMovies}
                            </span>
                        </div>

                        <div className="flex-shrink-0 bg-surface-dark/20 border border-white/5 rounded-lg px-4 py-3 flex flex-col gap-1 min-w-[120px]">
                            <span className="text-[9px] font-bold text-[#9b92c9] uppercase tracking-wider">Moje Propozycje</span>
                            <span className="text-lg font-bold text-white leading-none">
                                {loadingMetrics ? '...' : metrics.proposalsCount}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">grid_view</span>
                        <h3 className="text-white text-xs font-bold uppercase tracking-widest">Twoje Panele</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <Link
                            className="block bg-surface-dark/20 border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-colors active:scale-[0.98]"
                            to="/proposals"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">star</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Moje Propozycje</h4>
                                    <p className="text-[10px] text-[#9b92c9] mt-0.5 leading-relaxed">
                                        Przeglądaj i dodawaj nowe propozycje filmów do bazy.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            className="block bg-surface-dark/20 border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-colors active:scale-[0.98]"
                            to="/profile/liked"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">favorite</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Polubione</h4>
                                    <p className="text-[10px] text-[#9b92c9] mt-0.5 leading-relaxed">
                                        Twoja lista ulubionych filmów i seriali.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            className="block bg-surface-dark/20 border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-colors active:scale-[0.98]"
                            to="/profile/ogladam"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">visibility</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Oglądam</h4>
                                    <p className="text-[10px] text-[#9b92c9] mt-0.5 leading-relaxed">
                                        Zarządzaj listą tytułów, które aktualnie oglądasz.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            className="block bg-surface-dark/20 border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-colors active:scale-[0.98]"
                            to="/profile/chceobejrzec"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Chcę obejrzeć</h4>
                                    <p className="text-[10px] text-[#9b92c9] mt-0.5 leading-relaxed">
                                        Lista filmów i seriali do nadrobienia.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            className="block bg-surface-dark/20 border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-colors active:scale-[0.98]"
                            to="/profile/obejrzane"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">history</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Obejrzane</h4>
                                    <p className="text-[10px] text-[#9b92c9] mt-0.5 leading-relaxed">
                                        Historia Twoich obejrzanych produkcji.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                        <h3 className="text-white text-xs font-bold uppercase tracking-widest">Szybkie Akcje</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button className="bg-surface-dark/40 border border-white/5 px-4 py-3 rounded-lg text-xs font-bold text-white hover:border-white/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">lock_reset</span>
                            Zmień Hasło
                        </button>

                        <button className="bg-surface-dark/40 border border-white/5 px-4 py-3 rounded-lg text-xs font-bold text-white hover:border-white/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">manage_accounts</span>
                            Ustawienia Profilu
                        </button>

                        <button
                            className="bg-danger border border-danger/50 px-4 py-3.5 rounded-lg text-xs font-bold text-white hover:brightness-110 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                            onClick={() => {
                                clearAuth();
                                nav('/', { replace: true });
                            }}
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Wyloguj się
                        </button>
                    </div>
                </section>
            </main>

            <footer className="bg-[#05030e] border-t border-white/5 py-10 px-6 mt-12">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 text-center">
                    <div className="flex items-center gap-2 grayscale opacity-50">
                        <div className="bg-primary px-1.5 py-0.5 rounded flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold uppercase tracking-tighter leading-none">movie</span>
                        </div>
                        <h1 className="text-white text-sm font-bold tracking-tight">Film</h1>
                    </div>

                    <div className="flex gap-6 text-[#9b92c9] text-[10px] font-medium">
                        <a className="hover:text-white transition-colors" href="#">User Support</a>
                        <span className="opacity-20">|</span>
                        <span>ver 2.4.0-stable</span>
                    </div>

                    <p className="text-[#9b92c9]/40 text-[9px] tracking-wide uppercase">
                        © 2024 System Bazy Filmów. Pulpit Użytkownika.
                    </p>
                </div>
            </footer>
        </div>
    );
}
