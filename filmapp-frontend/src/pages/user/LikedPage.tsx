import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../apiFetch";
import { useNavigate } from "react-router-dom";

type Category = { id: number; name: string };

type Movie = {
    id: number;
    title: string;
    year: number | null;
    type: string;
    coverUrl?: string | null;
    likesCount: number;
    likedByMe?: boolean;
    rating: number;
    ratingCount: number;
    categories: Category[];
};

type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export default function LikedPage() {
    const [page, setPage] = useState(1);
    const pageSize = 16;

    const [items, setItems] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const title = useMemo(() => "Polubione", []);

    async function load(p: number) {
        setBusy(true);
        setError(null);

        const res = await apiFetch(`/api/movies/liked?page=${p}&pageSize=${pageSize}`);
        setBusy(false);

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`Nie mogê pobraæ polubionych. HTTP ${res.status} ${txt}`);
            return;
        }

        const data: PagedResult<Movie> = await res.json();
        setItems(data.items ?? []);
        setPage(data.page ?? p);
        setTotalPages(data.totalPages ?? 1);
    }

    async function toggleLike(movieId: number) {
        const before = items;
        const current = before.find((x) => x.id === movieId);
        const wasLiked = !!current?.likedByMe;

        setItems((prev) =>
            prev.map((m) =>
                m.id !== movieId
                    ? m
                    : {
                        ...m,
                        likedByMe: !m.likedByMe,
                        likesCount: m.likesCount + (m.likedByMe ? -1 : 1),
                    }
            )
        );

        const res = await apiFetch(`/api/movies/${movieId}/like`, {
            method: wasLiked ? "DELETE" : "POST",
        });

        if (!res.ok) {
            setItems(before);
            const txt = await res.text().catch(() => "");
            setError(`Nie uda³o siê zmieniæ ulubionych. HTTP ${res.status} ${txt}`);
            return;
        }

        if (wasLiked) {
            setItems((prev) => prev.filter((m) => m.id !== movieId));
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await load(page);
        };

        fetchData();
    }, [page]);


    return (
        <div className="px-4 py-6">
            <h1 className="text-white text-lg font-bold tracking-tight mb-5">{title}</h1>

            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
                    {error}
                </div>
            )}

            {busy && <div className="text-white/60 text-sm mb-4">£adowanie…</div>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6">
                {items.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => navigate(`/movies/${m.id}`)}
                        className="flex flex-col gap-1.5 cursor-pointer"
                    >
                        <div className="relative rounded-md overflow-hidden border border-white/10 bg-surface-dark aspect-[2/3] w-full min-h-[200px] md:min-h-[250px]">
                            {m.coverUrl && (
                                <img
                                    src={`https://localhost:7289${m.coverUrl}`}
                                    alt={m.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            )}

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(m.id);
                                }}
                                className="absolute top-1 right-1"
                                title={m.likedByMe ? "Usuñ z ulubionych" : "Dodaj do ulubionych"}
                            >
                                <span
                                    className={`material-symbols-outlined text-[14px] ${m.likedByMe ? "text-red-500" : "text-white/30"
                                        }`}
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    favorite
                                </span>
                            </button>
                        </div>

                        <div className="space-y-0.5">
                            <h3 className="text-white font-bold text-[9px] leading-tight line-clamp-1 uppercase">
                                {m.title}
                            </h3>
                            <div className="flex flex-wrap gap-x-1 items-center text-[8px] text-[#9b92c9] font-medium">
                                <span>{m.type === "Movie" ? "Film" : "Serial"}</span>
                                <span className="text-[6px] opacity-30">•</span>
                                <span>{m.year ?? "—"}</span>
                            </div>
                            <div className="text-[8px] text-accent-blue font-bold line-clamp-1">
                                {m.categories?.map((c) => c.name).join(", ") || "—"}
                            </div>
                            <div className="flex items-center gap-0.5 text-[8px] text-white/60">
                                <span
                                    className="material-symbols-outlined text-[10px]"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    favorite
                                </span>
                                <span>{m.likesCount}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {!busy && items.length === 0 && (
                    <div className="text-white/60 text-sm col-span-4 text-center">
                        Nie masz jeszcze polubionych.
                    </div>
                )}
            </div>

            <div className="flex justify-center mt-12 mb-6">
                <nav className="flex items-center gap-1">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={busy || page <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-purple-400 disabled:opacity-50"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>

                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-purple-600 bg-purple-600 text-white text-xs font-bold"
                        type="button"
                    >
                        {page}
                    </button>

                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={busy || page >= totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-purple-400 disabled:opacity-50"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
