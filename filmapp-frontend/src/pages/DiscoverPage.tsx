import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../apiFetch";
import { useNavigate } from "react-router-dom";

type Tab = "Movies" | "Series";

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

type MovieSortBy = "Title" | "Year" | "Type" | "Rating" | "RatingCount";
type SortDirection = "Asc" | "Desc";

export default function DiscoverPage() {
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<Tab>("Movies");
    const [onlyFav, setOnlyFav] = useState(false);

    const [page, setPage] = useState(1);
    const pageSize = 16;

    const [items, setItems] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const title = useMemo(
        () => (query.trim() ? "Wyniki wyszukiwania" : "Odkrywaj"),
        [query]
    );

    const [sortBy, setSortBy] = useState<MovieSortBy>("Title");
    const [sortDir, setSortDir] = useState<SortDirection>("Asc");

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [categoryMode, setCategoryMode] = useState<"Any" | "Exact">("Any");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const navigate = useNavigate();

    async function load(p: number) {
        setBusy(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("pageSize", String(pageSize));
        if (query.trim()) params.set("search", query.trim());
        params.set("type", tab === "Movies" ? "Movie" : "Series");
        if (onlyFav) params.set("onlyLiked", "true");
        params.set("sortBy", sortBy);
        params.set("sortDir", sortDir);
        selectedCategoryIds.forEach((id) => params.append("categoryIds", String(id)));
        params.set("mode", categoryMode);

        const res = await apiFetch(`/api/movies?${params.toString()}`);
        setBusy(false);

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                navigate("/login");
                return;
            }
            const txt = await res.text().catch(() => "");
            setError(`Nie mogę pobrać filmów. HTTP ${res.status} ${txt}`);
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
            if (res.status === 401 || res.status === 403) {
                setItems(before);
                navigate("/login");
                return;
            }
            setItems(before);
            const txt = await res.text().catch(() => "");
            setError(`Nie udało się zmienić ulubionych. HTTP ${res.status} ${txt}`);
            return;
        }

        if (onlyFav && wasLiked) {
            setItems((prev) => prev.filter((m) => m.id !== movieId));
        }
    }

    async function loadCategories() {
        const res = await apiFetch("/api/categories");
        if (!res.ok) return;
        const data = await res.json();
        setCategories(data.items ?? data);
    }

    useEffect(() => {
        void loadCategories();
    }, []);

    useEffect(() => {
        void load(page);
    }, [page]);

    useEffect(() => {
        setPage(1);
        void load(1);
    }, [tab, onlyFav, query, sortBy, sortDir, selectedCategoryIds, categoryMode]);

    return (
        <div>
            <section className="px-4 pt-6 pb-2">
                <div className="flex w-full">
                    <div className="flex items-center w-full rounded-xl bg-gray-900 border border-gray-700 focus-within:border-purple-500 transition-all overflow-hidden h-12">
                        <div className="text-purple-400 flex items-center justify-center pl-4">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-purple-400 px-3 text-sm font-normal"
                            placeholder="Szukaj filmów, seriali, osób..."
                        />
                    </div>
                </div>
            </section>

            <section className="px-4 py-4 space-y-4">
                <div className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 p-1 border border-gray-700">
                    <label
                        className={`flex cursor-pointer h-full w-1/2 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all ${tab === "Movies" ? "bg-purple-600 text-white" : "text-purple-400"
                            }`}
                    >
                        Filmy
                        <input
                            className="hidden"
                            type="radio"
                            name="filter-type"
                            checked={tab === "Movies"}
                            onChange={() => {
                                setTab("Movies");
                                setPage(1);
                            }}
                        />
                    </label>

                    <label
                        className={`flex cursor-pointer h-full w-1/2 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all ${tab === "Series" ? "bg-purple-600 text-white" : "text-purple-400"
                            }`}
                    >
                        Seriale
                        <input
                            className="hidden"
                            type="radio"
                            name="filter-type"
                            checked={tab === "Series"}
                            onChange={() => {
                                setTab("Series");
                                setPage(1);
                            }}
                        />
                    </label>
                </div>

                <div className="flex gap-2 justify-center flex-wrap">
                    <button
                        onClick={() => {
                            setSortBy((s) => {
                                const order: MovieSortBy[] = ["Title", "Year", "Rating", "RatingCount", "Type"];
                                const i = order.indexOf(s);
                                return order[(i + 1) % order.length];
                            });
                            setPage(1);
                        }}
                        className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-gray-900 border border-gray-700 px-4 active:scale-95 transition-transform"
                        type="button"
                    >
                        <span className="text-white text-xs font-medium">{sortBy}</span>
                        <span className="material-symbols-outlined text-white text-lg leading-none">swap_vert</span>
                    </button>

                    <button
                        onClick={() => {
                            setSortDir((d) => (d === "Asc" ? "Desc" : "Asc"));
                            setPage(1);
                        }}
                        className="flex h-9 items-center justify-center rounded-xl bg-gray-900 border border-gray-700 px-3 active:scale-95 transition-transform"
                        type="button"
                    >
                        <span className="text-white text-xs font-medium">{sortDir}</span>
                    </button>

                    <button
                        onClick={() => setFiltersOpen((v) => !v)}
                        className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-gray-900 border border-gray-700 px-4 active:scale-95 transition-transform"
                        type="button"
                    >
                        <span className="text-white text-xs font-medium">Filtry</span>
                        <span className="material-symbols-outlined text-white text-lg leading-none">
                            {filtersOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setOnlyFav((v) => !v);
                            setPage(1);
                        }}
                        className="flex h-9 items-center justify-center rounded-xl bg-gray-900 border border-gray-700 px-4 active:scale-95 transition-transform"
                        aria-pressed={onlyFav}
                        type="button"
                    >
                        <span
                            className={`material-symbols-outlined text-lg leading-none ${onlyFav ? "text-purple-600" : "text-white/40"
                                }`}
                            style={onlyFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                            favorite
                        </span>
                    </button>
                </div>

                <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${filtersOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="mt-2 p-3 rounded-xl bg-gray-900 border border-gray-700">
                        <div className="flex gap-2 justify-center mb-3 flex-wrap">
                            <button
                                type="button"
                                className="border border-gray-700 px-3 py-2 rounded-lg text-white/70 text-xs"
                                onClick={() => setCategoryMode((m) => (m === "Any" ? "Exact" : "Any"))}
                            >
                                Mode: {categoryMode}
                            </button>

                            <button
                                type="button"
                                className="border border-gray-700 px-3 py-2 rounded-lg text-white/70 text-xs"
                                onClick={() => {
                                    setSelectedCategoryIds([]);
                                    setPage(1);
                                }}
                            >
                                Wyczyść kategorie
                            </button>
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-white/60 text-sm text-center">Brak kategorii.</div>
                        ) : (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {categories.map((c) => {
                                    const checked = selectedCategoryIds.includes(c.id);
                                    return (
                                        <label
                                            key={c.id}
                                            className="text-white/70 text-xs border border-gray-700 px-3 py-2 rounded-lg cursor-pointer select-none"
                                        >
                                            <input
                                                className="mr-2"
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    setSelectedCategoryIds((prev) =>
                                                        e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)
                                                    );
                                                    setPage(1);
                                                }}
                                            />
                                            {c.name}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="px-4 py-4">
                <h2 className="text-white text-lg font-bold tracking-tight mb-5">{title}</h2>

                {error && (
                    <div className="mb-4 p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
                        {error}
                    </div>
                )}
                {busy && <div className="text-white/60 text-sm mb-4">Ładowanie…</div>}

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
                                    />
                                )}


                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLike(m.id);
                                    }}
                                    className="absolute top-1 right-1"
                                    title={m.likedByMe ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
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
                                    <span>{tab === "Movies" ? "Film" : "Serial"}</span>
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
                        <div className="text-white/60 text-sm col-span-4">
                            Brak wyników dla: {tab}, query: “{query || "—"}”
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
            </section>
        </div>
    );
}
