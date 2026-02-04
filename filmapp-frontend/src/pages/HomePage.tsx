import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../apiFetch';

type Category = { id: number; name: string };
type MovieItem = {
    id: number;
    title: string;
    year?: number | null;
    type?: string;  
    coverUrl?: string | null;
    likesCount?: number;
    likedByMe?: boolean;
    rating?: number;
    ratingCount?: number;
    categories?: Category[];
};

export default function HomePage() {
    const navigate = useNavigate();
    const [topMovies, setTopMovies] = useState<MovieItem[]>([]);
    const [topSeries, setTopSeries] = useState<MovieItem[]>([]);
    const [discoverItems, setDiscoverItems] = useState<MovieItem[]>([]);
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setBusy(true);
                const res = await apiFetch('/api/movies?page=1&pageSize=50');
                if (!res.ok) return;
                const data = await res.json();
                const allItems: MovieItem[] = data.items ?? data;

                // Top 4 filmy 
                const moviesOnly = allItems
                    .filter((m: MovieItem) => m.type === 'Movie')
                    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                    .slice(0, 4);
                setTopMovies(moviesOnly);

                // Top 4 seriale
                const seriesOnly = allItems
                    .filter((m: MovieItem) => m.type === 'Series')
                    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                    .slice(0, 4);
                setTopSeries(seriesOnly);

                // 8 mix 
                const mix = allItems.slice(0, 8);
                setDiscoverItems(mix);
            } catch (e) {
                console.error('Błąd ładowania home:', e);
            } finally {
                setBusy(false);
            }
        }
        loadData();
    }, []);

    function openMovie(movieId: number) {
        navigate(`/movies/${movieId}`);
    }

    function MovieCard({ item }: { item: MovieItem }) {
        return (
            <div
                onClick={() => openMovie(item.id)}
                className="flex flex-col gap-1.5 cursor-pointer"
            >
                <div className="relative rounded-md overflow-hidden border border-white/10 bg-surface-dark aspect-[2/3] w-full min-h-[200px] md:min-h-[250px]">
                    {item.coverUrl ? (
                        <img
                            src={`https://localhost:7289${item.coverUrl}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                            <span className="material-symbols-outlined text-2xl">movie</span>
                        </div>
                    )}

                    {item.rating !== undefined && (
                        <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded">
                            <div className="flex items-center gap-0.5 text-xs text-yellow-400">
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span>{item.rating.toFixed(1)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-0.5">
                    <h3 className="text-white font-bold text-[9px] leading-tight line-clamp-1 uppercase">{item.title}</h3>
                    <div className="flex flex-wrap gap-x-1 items-center text-[8px] text-[#9b92c9] font-medium">
                        <span>{item.type === 'Series' ? 'Serial' : 'Film'}</span>
                        <span className="text-[6px] opacity-30">•</span>
                        <span>{item.year ?? '—'}</span>
                    </div>
                    <div className="text-[8px] text-[#9b92c9] font-bold line-clamp-1 italic">
                        {item.categories?.map((c) => c.name).join(', ') ?? ''}
                    </div>
                    <div className="flex items-center gap-0.5 text-[8px] text-white/60">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1", color: '#fbbf24' }}>
                            star
                        </span>
                        <span>{item.rating?.toFixed(1) ?? '—'}</span>
                        <span className="text-[#9b92c9] text-[7px] ml-1">{item.ratingCount?.toLocaleString() ?? ''}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (busy) {
        return (
            <div className="flex justify-center pt-20">
                <span className="text-white/50 text-sm">Ładowanie...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12 pb-20">
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h2 className="text-white text-lg font-bold tracking-tight">Najlepiej oceniane filmy</h2>
                </div>
                {topMovies.length === 0 ? (
                    <p className="text-white/40 text-sm">Brak filmów w bazie.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6">
                        {topMovies.map((m) => (
                            <MovieCard key={m.id} item={m} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-[#3b82f6] rounded-full" />
                    <h2 className="text-white text-lg font-bold tracking-tight">Najlepiej oceniane seriale</h2>
                </div>
                {topSeries.length === 0 ? (
                    <p className="text-white/40 text-sm">Brak seriali w bazie.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6">
                        {topSeries.map((m) => (
                            <MovieCard key={m.id} item={m} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-[#9b92c9] rounded-full" />
                        <h2 className="text-white text-lg font-bold tracking-tight">Poznaj te filmy</h2>
                    </div>
                    <Link to="/discover" className="text-xs font-bold text-[#9b92c9] hover:text-white transition-colors">
                        Więcej →
                    </Link>
                </div>
                {discoverItems.length === 0 ? (
                    <p className="text-white/40 text-sm">Brak propozycji.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6">
                        {discoverItems.map((m) => (
                            <MovieCard key={m.id} item={m} />
                        ))}
                    </div>
                )}
            </section>

            <div className="flex justify-center pt-8">
                <Link
                    to="/discover"
                    className="px-8 py-2.5 bg-surface-dark border border-white/10 rounded-full text-white font-medium hover:bg-white/5 transition-all"
                >
                    Odkrywaj więcej
                </Link>
            </div>
        </div>
    );
}
