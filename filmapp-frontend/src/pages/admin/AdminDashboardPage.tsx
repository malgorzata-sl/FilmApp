import { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch'; 
import { clearAuth } from '../../auth';  
import { Link, useNavigate } from 'react-router-dom';

type Metrics = {
    totalMovies: number;
    newProposals: number;
    totalUsers: number;
    ratingsToday: number;
};

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState<Metrics>({ totalMovies: 0, newProposals: 0, totalUsers: 0, ratingsToday: 0 });
    const [loading, setLoading] = useState(true);
    const handleLogout = () => {    
        clearAuth();
        navigate('/', { replace: true });
    };

    useEffect(() => {
        apiFetch('/api/admin/reports/admin-metrics')
            .then(res => res.ok ? res.json() : Promise.reject('Błąd'))
            .then((data: Metrics) => setMetrics(data))
            .catch(() => setMetrics({ totalMovies: 0, newProposals: 0, totalUsers: 0, ratingsToday: 0 }))
            .finally(() => setLoading(false));

    }, []);

    return (
        <div className="p-6 space-y-8">
            <section>
                <h1 className="text-3xl font-bold text-white mb-2">Dzień dobry, Administratorze</h1>
                <p className="text-[#9b92c9] text-lg mb-8">Oto szybki przegląd systemu</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">movie</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#9b92c9] uppercase tracking-wider">Baza tytułów</p>
                                <p className="text-2xl font-bold text-white">{loading ? '...' : metrics.totalMovies.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">new_releases</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#9b92c9] uppercase tracking-wider">Nowe propozycje</p>
                                <p className="text-2xl font-bold text-primary">{loading ? '...' : metrics.newProposals}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">person</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#9b92c9] uppercase tracking-wider">Użytkownicy</p>
                                <p className="text-2xl font-bold text-white">{loading ? '...' : metrics.totalUsers.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">star</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#9b92c9] uppercase tracking-wider">Oceny dziś</p>
                                <p className="text-2xl font-bold text-accent">{loading ? '...' : metrics.ratingsToday}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">grid_view</span>
                    Szybki dostęp
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/admin/movies" className="group block bg-gradient-to-br from-surface-dark/50 to-surface-dark/20 border border-white/10 rounded-2xl p-8 hover:border-primary/50 hover:shadow-primary/10 transition-all hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-primary/20 border-2 border-primary/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-3xl">movie_edit</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">Zarządzaj filmami</h3>
                                <p className="text-[#9b92c9] text-sm leading-relaxed">Edytuj bibliotekę tytułów</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/categories" className="group block bg-gradient-to-br from-surface-dark/50 to-surface-dark/20 border border-white/10 rounded-2xl p-8 hover:border-primary/50 hover:shadow-primary/10 transition-all hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-primary/20 border-2 border-primary/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-3xl">category</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">Kategorie</h3>
                                <p className="text-[#9b92c9] text-sm leading-relaxed">Zarządzaj kategoriami</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/proposals" className="group block bg-gradient-to-br from-surface-dark/50 to-surface-dark/20 border border-white/10 rounded-2xl p-8 hover:border-primary/50 hover:shadow-primary/10 transition-all hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-primary/20 border-2 border-primary/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-3xl">new_releases</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">Propozycje</h3>
                                <p className="text-[#9b92c9] text-sm leading-relaxed">Akceptuj propozycje userów</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/reports" className="group block bg-gradient-to-br from-surface-dark/50 to-surface-dark/20 border border-white/10 rounded-2xl p-8 hover:border-primary/50 hover:shadow-primary/10 transition-all hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-primary/20 border-2 border-primary/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">Raporty</h3>
                                <p className="text-[#9b92c9] text-sm leading-relaxed">Statystyki i analizy</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>
            <div className="pt-12 border-t border-white/10 mt-12">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/90 hover:bg-red-600 text-white py-4 px-8 rounded-2xl font-bold text-lg border-2 border-red-500/50 shadow-lg hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Wyloguj się
                    </button>
                </div>
            </div>
        </div>
    );
}
