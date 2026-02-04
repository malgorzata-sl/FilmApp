import { useEffect, useState } from "react";
import { apiFetch } from "../../apiFetch";
import { getAuth } from "../../auth";

type Category = { id: number; name: string };

type Proposal = {
    id: number;
    title: string;
    year: number;
    reason: string;
    type: "Movie" | "Series";
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
    userId?: string;
    categories?: Category[];
};

type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

type CreateProposal = {
    title: string;
    year: number;
    type: "Movie" | "Series";
    categoryIds: number[];
    reason: string;
};

const emptyForm: CreateProposal = {
    title: "",
    year: new Date().getFullYear(),
    type: "Movie",
    categoryIds: [],
    reason: "",
};

export default function ProposalsPage() {
    const auth = getAuth();
    const isAdmin = auth?.role === "Admin";

    const [items, setItems] = useState<Proposal[]>([]);
    const [form, setForm] = useState<CreateProposal>(emptyForm);
    const [categories, setCategories] = useState<Category[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isProposalType = (v: string): v is "Movie" | "Series" =>
        v === "Movie" || v === "Series";

    async function load() {
        setError(null);
        const res = await apiFetch(`/api/MovieProposals/mine?page=1&pageSize=20`);
        if (!res.ok) {
            setError(`Nie mogę pobrać propozycji. HTTP ${res.status}`);
            return;
        }
        const data: PagedResult<Proposal> = await res.json();
        setItems(data.items ?? []);
    }

    async function loadCategories() {
        const res = await apiFetch("/api/Categories");
        if (!res.ok) return;
        const data: Category[] = await res.json();
        setCategories(data);
    }

    useEffect(() => {
        void load();
        if (!isAdmin) void loadCategories();
    }, []);

    async function create() {
        setBusy(true);
        setError(null);

        const payload: CreateProposal = {
            ...form,
            title: form.title.trim(),
            reason: form.reason.trim(),
        };

        const res = await apiFetch(`/api/MovieProposals`, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        setBusy(false);

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`Błąd dodawania. HTTP ${res.status} ${txt}`);
            return;
        }

        setForm(emptyForm);
        await load();
    }

    return (
        <div className="p-6 max-w-6xl mx-auto text-white space-y-6">
            <h1 className="text-2xl font-bold">Moje propozycje</h1>

            {error && (
                <div className="p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
                    {error}
                </div>
            )}

            {!isAdmin && (
                <section className="bg-surface-dark/30 border border-white/10 rounded-xl p-6 shadow-xl space-y-6">
                    <h2 className="text-sm font-bold text-white/90">Dodaj propozycję</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="w-full h-11 px-4 bg-transparent border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition"
                            placeholder="Tytuł"
                            value={form.title}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, title: e.target.value }))
                            }
                        />

                        <input
                            className="w-full h-11 px-4 bg-transparent border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition"
                            placeholder="Rok"
                            type="number"
                            value={form.year}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, year: Number(e.target.value) }))
                            }
                        />

                        <select
                            className="w-full h-11 px-4 bg-background-dark border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition"
                            value={form.type}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (isProposalType(v)) setForm((s) => ({ ...s, type: v }));
                            }}
                        >
                            <option value="Movie">Movie</option>
                            <option value="Series">Series</option>
                        </select>

                        <input
                            className="w-full h-11 px-4 bg-transparent border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition md:col-span-2"
                            placeholder="Powód (reason)"
                            value={form.reason}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, reason: e.target.value }))
                            }
                        />

                        <div className="md:col-span-2">
                            <div className="text-white/70 text-sm mb-2 font-bold">Kategorie</div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((c) => {
                                    const checked = form.categoryIds.includes(c.id);
                                    return (
                                        <label
                                            key={c.id}
                                            className="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-sm cursor-pointer select-none bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                className="custom-checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    setForm((s) => ({
                                                        ...s,
                                                        categoryIds: e.target.checked
                                                            ? [...s.categoryIds, c.id]
                                                            : s.categoryIds.filter((id) => id !== c.id),
                                                    }));
                                                }}
                                            />
                                            {c.name}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button
                        className="mt-4 bg-primary px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 transition"
                        disabled={busy || !form.title.trim()}
                        onClick={create}
                    >
                        {busy ? "Dodawanie..." : "Dodaj"}
                    </button>
                </section>
            )}

            <section className="bg-surface-dark/30 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-semibold">Lista</h2>
                    <button
                        className="text-sm border border-white/20 px-3 py-1 rounded-lg hover:bg-white/5 disabled:opacity-50 transition"
                        disabled={busy}
                        onClick={load}
                    >
                        Odśwież
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-[#9b92c9] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Tytuł</th>
                                <th className="px-6 py-3">Rok</th>
                                <th className="px-6 py-3">Typ</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map((p) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-3 font-medium">{p.title}</td>
                                    <td className="px-6 py-3 text-white/70">{p.year}</td>
                                    <td className="px-6 py-3 text-white/70">{p.type}</td>
                                    <td
                                        className={`px-6 py-3 font-bold ${p.status === "Approved"
                                                ? "text-green-400"
                                                : p.status === "Pending"
                                                    ? "text-orange-400"
                                                    : "text-red-400"
                                            }`}
                                    >
                                        {p.status}
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && (
                                <tr>
                                    <td className="p-6 text-white/50 text-center" colSpan={4}>
                                        Brak propozycji.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
