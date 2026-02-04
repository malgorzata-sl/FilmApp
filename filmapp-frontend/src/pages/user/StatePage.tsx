import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../apiFetch";

type WatchStatus = "Watching" | "WantToWatch" | "Watched";

type StatusRow = {
    movieId: number;
    status: WatchStatus;
    updatedAt: string;
};

type Category = { id: number; name: string };

type Movie = {
    id: number;
    title: string;
    coverUrl?: string | null;
    year?: number | null;
    rating: number;
    ratingCount: number;
    likesCount: number;
    likedByMe: boolean;
    categories: Category[];
};

export default function StatePage({ status }: { status: WatchStatus }) {
    const [rows, setRows] = useState<StatusRow[]>([]);
    const [movies, setMovies] = useState<Record<number, Movie>>({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const title = useMemo(() => {
        if (status === "Watching") return "Oglądam";
        if (status === "WantToWatch") return "Chcę obejrzeć";
        return "Obejrzane";
    }, [status]);

    async function load() {
        setBusy(true);
        setError(null);

        const res = await apiFetch("/api/me/statuses");
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setBusy(false);
            setError(`Nie mogę pobrać statusów. HTTP ${res.status} ${txt}`);
            return;
        }

        const data: StatusRow[] = await res.json();
        const filtered = (data ?? []).filter((x) => x.status === status);
        setRows(filtered);

        const pairs = await Promise.all(
            filtered.map(async (r) => {
                const mRes = await apiFetch(`/api/movies/${r.movieId}`);
                if (!mRes.ok) return [r.movieId, null] as const;
                const m: Movie = await mRes.json();
                return [r.movieId, m] as const;
            })
        );

        const map: Record<number, Movie> = {};
        for (const [id, m] of pairs) if (m) map[id] = m;
        setMovies(map);

        setBusy(false);
    }

    async function removeStatus(movieId: number) {
        const res = await apiFetch(`/api/movies/${movieId}/status`, { method: "DELETE" });
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`Nie udało się usunąć statusu. HTTP ${res.status} ${txt}`);
            return;
        }
        setRows((prev) => prev.filter((r) => r.movieId !== movieId));
        setMovies((prev) => {
            const copy = { ...prev };
            delete copy[movieId];
            return copy;
        });
    }

    useEffect(() => {
        load();
    }, [status]);

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
            <section className="flex items-center justify-between py-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                <Link className="text-primary text-sm font-semibold hover:underline flex items-center gap-1" to="/profile">
                    Wróć do profilu
                </Link>
            </section>

            {error && (
                <div className="mb-4 p-3 rounded-2xl border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
                    {error}
                </div>
            )}

            {busy && <div className="text-white/60 text-sm">Ładowanie…</div>}

            {!busy && rows.length === 0 && (
                <div className="text-white/60 text-sm">Brak filmów w tej zakładce.</div>
            )}

            <div className="space-y-4">
                {rows.map((r) => {
                    const m = movies[r.movieId];
                    if (!m) return null;

                    return (
                        <div key={r.movieId} className="bg-surface-dark/40 border border-white/10 rounded-2xl p-4 flex gap-4">
                            <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/5">
                                {m.coverUrl && <img src={`https://localhost:7289${m.coverUrl}`} alt={m.title} className="w-full h-full object-cover" />}
                            </div>

                            <div className="flex-grow flex flex-col justify-between min-w-0">
                                <div className="flex justify-between items-start">
                                    <div className="truncate pr-2">
                                        <h2 className="text-lg font-bold text-white leading-tight truncate">{m.title}</h2>
                                        <div className="flex items-center gap-2 text-xs text-[#9b92c9] mt-1">
                                            <span>{m.year ?? "-"}</span>
                                            <span className="text-white/20">•</span>
                                            <span>{m.categories.map((c) => c.name).join(", ") || "-"}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-[#9b92c9] shrink-0">
                                        {new Date(r.updatedAt).toLocaleDateString("pl-PL")}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3 mt-2">
                                    <div className="flex items-center gap-4 text-xs text-[#9b92c9]">
                                        <span className="flex items-center gap-1">Likes: {m.likesCount}</span>
                                        <span className="flex items-center gap-1">Rating: ★ {m.rating.toFixed(1)} ({m.ratingCount})</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/movies/${r.movieId}`}
                                            className="flex-1 bg-primary/80 hover:bg-primary text-white py-2 px-4 rounded-lg text-xs font-bold transition-colors text-center"
                                        >
                                            Szczegóły
                                        </Link>
                                        <button
                                            onClick={() => removeStatus(r.movieId)}
                                            className="flex-1 bg-danger/60 hover:bg-danger text-white py-2 px-4 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Usuń status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
