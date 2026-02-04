import { useEffect, useState } from "react";
import { apiFetch } from "../../apiFetch";

type Category = { id: number; name: string };

type Movie = {
    id: number;
    title: string;
    categories?: Category[];
    description: string;
    coverUrl: string;
    year: number;
    type: string;
    durationMinutes: number | null;
    seasonsCount: number | null;
    episodesCount: number | null;
};

type CreateMovie = {
    title: string;
    description: string;
    coverUrl: string;
    year: number;
    type: string;
    durationMinutes: number;
    seasonsCount: number;
    episodesCount: number;
};

type MovieUpsertPayload = Omit<CreateMovie, "durationMinutes" | "seasonsCount" | "episodesCount"> & {
    durationMinutes: number | null;
    seasonsCount: number | null;
    episodesCount: number | null;
};

function toPayload(f: CreateMovie): MovieUpsertPayload {
    if (f.type === "Movie") {
        return {
            ...f,
            durationMinutes: Math.max(1, f.durationMinutes),
            seasonsCount: null,
            episodesCount: null,
        };
    }
    return {
        ...f,
        durationMinutes: null,
        seasonsCount: Math.max(1, f.seasonsCount),
        episodesCount: Math.max(1, f.episodesCount),
    };
}

const emptyForm: CreateMovie = {
    title: "",
    description: "",
    coverUrl: "",
    year: new Date().getFullYear(),
    type: "Movie",
    durationMinutes: 120,
    seasonsCount: 0,
    episodesCount: 0,
};

export default function AdminMoviesPage() {
    const [items, setItems] = useState<Movie[]>([]);
    const [form, setForm] = useState<CreateMovie>(emptyForm);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<Record<number, number | "">>({});
    const [formCategoryIds, setFormCategoryIds] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [totalCount, setTotalCount] = useState(0);

    async function load(p = page) {
        setError(null);
        const res = await apiFetch(`/api/Movies?page=${p}&pageSize=${pageSize}`);
        if (!res.ok) return setError(`Nie mogę pobrać filmów: HTTP ${res.status}`);
        const data = await res.json();
        setItems(data.items ?? data);
        setTotalCount(data.totalCount ?? 0);
        setPage(p);
    }

    async function loadCategories() {
        const res = await apiFetch("/api/Categories");
        if (!res.ok) return setError(`Nie mogę pobrać kategorii: HTTP ${res.status}`);
        const data = await res.json();
        setCategories(data.items ?? data);
    }

    useEffect(() => {
        (async () => {
            await load();
            await loadCategories();
        })();
    }, []);

    async function createMovie() {
        setBusy(true);
        setError(null);
        const res = await apiFetch("/api/Movies", {
            method: "POST",
            body: JSON.stringify(toPayload(form)),
        });
        setBusy(false);
        if (!res.ok) return setError(`Błąd dodawania: HTTP ${res.status}`);
        const created: Movie = await res.json();

        for (const categoryId of formCategoryIds) {
            const r = await apiFetch(`/api/Movies/${created.id}/categories/${categoryId}`, { method: "POST" });
            if (!r.ok) break;
        }

        setForm(emptyForm);
        setFormCategoryIds([]);
        await load();
    }

    async function updateMovie() {
        if (editId == null) return;
        setBusy(true);
        setError(null);
        const res = await apiFetch(`/api/Movies/${editId}`, {
            method: "PUT",
            body: JSON.stringify(toPayload(form)),
        });
        setBusy(false);
        if (!res.ok) return setError(`Błąd edycji: HTTP ${res.status}`);
        setEditId(null);
        setForm(emptyForm);
        await load();
    }

    async function deleteMovie(id: number) {
        if (!confirm("Na pewno usunąć?")) return;
        setBusy(true);
        setError(null);
        const res = await apiFetch(`/api/Movies/${id}`, { method: "DELETE" });
        setBusy(false);
        if (!res.ok) return setError(`Błąd usuwania: HTTP ${res.status}`);
        await load();
    }

    async function attachCategory(movieId: number, categoryId: number) {
        setBusy(true);
        setError(null);
        const res = await apiFetch(`/api/Movies/${movieId}/categories/${categoryId}`, { method: "POST" });
        setBusy(false);
        if (!res.ok) return setError(`Błąd przypinania kategorii: HTTP ${res.status}`);
        await load();
    }

    async function detachCategory(movieId: number, categoryId: number) {
        setBusy(true);
        setError(null);
        const res = await apiFetch(`/api/Movies/${movieId}/categories/${categoryId}`, { method: "DELETE" });
        setBusy(false);
        if (!res.ok) return setError(`Błąd odpinania kategorii: HTTP ${res.status}`);
        await load();
    }

    return (
        <div className="p-6 max-w-6xl mx-auto text-white">
            <h1 className="text-2xl font-bold">Panel admina: Filmy</h1>

            {error && <div className="mt-4 p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200">{error}</div>}

            {/* FORMULARZ DODAWANIA/EDYCJI */}
            <div className="mt-6 bg-surface-dark border border-white/10 rounded-xl p-4">
                <h2 className="font-semibold mb-3">Dodaj / Edytuj</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Tytuł */}
                    <input
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/50"
                        placeholder="Tytuł"
                        value={form.title}
                        onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    />

                    {/* Rok */}
                    <input
                        type="number"
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/50"
                        placeholder="Rok"
                        value={form.year}
                        onChange={(e) => setForm((s) => ({ ...s, year: Number(e.target.value) }))}
                    />

                    {/* Opis */}
                    <input
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 md:col-span-2 text-white placeholder:text-white/50"
                        placeholder="Opis"
                        value={form.description}
                        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    />

                    {/* Cover URL */}
                    <input
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 md:col-span-2 text-white placeholder:text-white/50"
                        placeholder="Cover URL"
                        value={form.coverUrl}
                        onChange={(e) => setForm((s) => ({ ...s, coverUrl: e.target.value }))}
                    />

                    {/* Typ: Movie / Series */}
                    <select
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/50"
                        value={form.type}
                        onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                    >
                        <option value="Movie">Movie</option>
                        <option value="Series">Series</option>
                    </select>

                    {/* Czas trwania (Movie) */}
                    <input
                        type="number"
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/50 disabled:opacity-50"
                        placeholder="Czas (min)"
                        value={form.durationMinutes}
                        disabled={form.type === "Series"}
                        onChange={(e) => setForm((s) => ({ ...s, durationMinutes: Number(e.target.value) }))}
                    />

                    {/* Sezony (Series) */}
                    <input
                        type="number"
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/50 disabled:opacity-50"
                        placeholder="Sezony (dla serialu)"
                        value={form.seasonsCount}
                        disabled={form.type === "Movie"}
                        onChange={(e) => setForm((s) => ({ ...s, seasonsCount: Number(e.target.value) }))}
                    />

                    {/* Odcinki (Series) */}
                    <input
                        type="number"
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/50 disabled:opacity-50"
                        placeholder="Odcinki (dla serialu)"
                        value={form.episodesCount}
                        disabled={form.type === "Movie"}
                        onChange={(e) => setForm((s) => ({ ...s, episodesCount: Number(e.target.value) }))}
                    />

                    {/* Kategorie */}
                    <select
                        className="bg-surface-dark/20 border border-white/10 rounded-lg px-3 py-2 md:col-span-2 text-white placeholder:text-white/50"
                        value=""
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            if (!id) return;
                            setFormCategoryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
                        }}
                    >
                        <option value="">+ Dodaj kategorię</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Wybrane kategorie */}
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                        {formCategoryIds.map((id) => {
                            const c = categories.find((x) => x.id === id);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className="text-xs border border-white/20 px-2 py-1 rounded-lg hover:bg-white/5"
                                    onClick={() => setFormCategoryIds((prev) => prev.filter((x) => x !== id))}
                                >
                                    {c?.name ?? `#${id}`} ×
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dodaj / Zapisz / Anuluj */}
                {editId === null ? (
                    <button
                        className="mt-4 bg-primary px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                        disabled={busy || !form.title.trim()}
                        onClick={createMovie}
                    >
                        Dodaj film/serial
                    </button>
                ) : (
                    <div className="mt-4 flex gap-3">
                        <button
                            className="bg-primary px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                            disabled={busy || !form.title.trim()}
                            onClick={updateMovie}
                        >
                            Zapisz zmiany
                        </button>

                        <button
                            className="border border-white/20 px-4 py-2 rounded-lg disabled:opacity-50"
                            disabled={busy}
                            onClick={() => {
                                setEditId(null);
                                setForm(emptyForm);
                            }}
                        >
                            Anuluj
                        </button>
                    </div>
                )}
            </div>


            {/* LISTA FILMÓW */}
            <div className="mt-6 bg-surface-dark/20 border border-white/10 rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                    <h2 className="font-semibold text-[12px] uppercase tracking-wider text-[#9b92c9]">Lista</h2>
                    <button className="text-[10px] font-bold text-[#9b92c9] uppercase border border-white/10 px-2 py-1 rounded" onClick={() => load()} disabled={busy}>
                        Odśwież
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-[10px] text-[#9b92c9] uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Tytuł</th>
                                <th className="p-3">Rok</th>
                                <th className="p-3">Typ</th>
                                <th className="p-3">Kategorie</th>
                                <th className="p-3 text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map(m => (
                                <tr key={m.id} className="hover:bg-white/5">
                                    <td className="p-3 text-white font-medium">{m.title}</td>
                                    <td className="p-3 text-[#9b92c9]">{m.year}</td>
                                    <td className="p-3 text-[#9b92c9]">{m.type}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1">
                                            {(m.categories ?? []).map(c => (
                                                <button key={c.id} className="text-xs border border-white/20 px-2 py-1 rounded-lg hover:bg-white/5" disabled={busy} onClick={() => detachCategory(m.id, c.id)}>
                                                    {c.name} ×
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <select className="bg-background-dark border border-white/10 rounded-lg px-2 py-1 text-[10px]" value={selectedCategoryId[m.id] ?? ""} onChange={e => setSelectedCategoryId(s => ({ ...s, [m.id]: e.target.value ? Number(e.target.value) : "" }))}>
                                                <option value="">+ Dodaj kategorię</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <button className="border border-white/10 px-2 py-1 rounded text-[10px]" disabled={busy || !selectedCategoryId[m.id]} onClick={() => attachCategory(m.id, selectedCategoryId[m.id] as number)}>Dodaj</button>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                                        <button className="border border-white/10 px-3 py-1 rounded hover:bg-white/5 text-[10px]" disabled={busy} onClick={() => {
                                            setEditId(m.id);
                                            setForm({
                                                title: m.title ?? "",
                                                description: m.description ?? "",
                                                coverUrl: m.coverUrl ?? "",
                                                year: m.year ?? new Date().getFullYear(),
                                                type: m.type ?? "Movie",
                                                durationMinutes: m.durationMinutes ?? 120,
                                                seasonsCount: m.seasonsCount ?? 1,
                                                episodesCount: m.episodesCount ?? 1,
                                            });
                                        }}>Edytuj</button>
                                        <button className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-3 py-1 rounded hover:bg-red-500/20" disabled={busy} onClick={() => deleteMovie(m.id)}>Usuń</button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td className="p-6 text-white/60" colSpan={5}>Brak filmów.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalCount > 0 && (
                    <div className="p-4 flex items-center justify-between">
                        <span className="text-[10px] text-[#9b92c9] uppercase tracking-widest font-bold">Strona {page} z {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
                        <div className="flex gap-2">
                            <button className="border border-white/10 px-3 py-1 rounded text-[10px] font-bold uppercase text-[#9b92c9]" disabled={busy || page <= 1} onClick={() => load(page - 1)}>← Poprzednia</button>
                            <button className="border border-white/20 px-3 py-1 rounded text-[10px] font-bold uppercase text-white" disabled={busy || page >= Math.ceil(totalCount / pageSize)} onClick={() => load(page + 1)}>Następna →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
