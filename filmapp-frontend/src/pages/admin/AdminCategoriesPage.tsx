import { useEffect, useState } from "react";
import { apiFetch } from "../../apiFetch";

type Category = {
    id: number;
    name: string;
};

export default function AdminCategoriesPage() {
    const [items, setItems] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function load() {
        setError(null);
        const res = await apiFetch("/api/Categories");
        if (!res.ok) {
            setError(`Nie mogê pobraæ kategorii: HTTP ${res.status}`);
            return;
        }
        const data = await res.json();
        setItems(data.items ?? data);
    }

    useEffect(() => {
        (async () => {
            await load();
        })();
    }, []);

    async function createCategory() {
        setBusy(true);
        setError(null);
        const res = await apiFetch("/api/Categories", {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        setBusy(false);
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`B³¹d dodawania: HTTP ${res.status} ${txt}`);
            return;
        }
        setName("");
        await load();
    }

    async function updateCategory() {
        if (editId == null) return;
        setBusy(true);
        setError(null);
        const res = await apiFetch(`/api/Categories/${editId}`, {
            method: "PUT",
            body: JSON.stringify({ name }),
        });
        setBusy(false);
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`B³¹d edycji: HTTP ${res.status} ${txt}`);
            return;
        }
        setEditId(null);
        setName("");
        await load();
    }

    async function deleteCategory(id: number) {
        if (!confirm("Na pewno usun¹æ kategoriê?")) return;
        setBusy(true);
        setError(null);
        const res = await apiFetch(`/api/Categories/${id}`, { method: "DELETE" });
        setBusy(false);
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`B³¹d usuwania: HTTP ${res.status} ${txt}`);
            return;
        }
        await load();
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-8">
            <section className="space-y-4">
                <h2 className="text-white text-2xl font-bold tracking-tight px-1">Panel admina: Kategorie</h2>

                {error && (
                    <div className="p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-lg">add_circle</span>
                        <h3 className="text-white text-sm font-bold uppercase tracking-wider opacity-80">
                            {editId === null ? "Dodaj" : "Edytuj"}
                        </h3>
                    </div>

                    <div className="bg-surface-dark/30 border border-white/10 rounded-xl p-4 flex gap-3 shadow-xl">
                        <input
                            className="flex-1 h-11 px-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Nazwa kategorii"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {editId === null ? (
                            <button
                                className="px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm transition-all active:scale-[0.98]"
                                disabled={busy || !name.trim()}
                                onClick={createCategory}
                            >
                                Dodaj
                            </button>
                        ) : (
                            <>
                                <button
                                    className="px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm transition-all active:scale-[0.98]"
                                    disabled={busy || !name.trim()}
                                    onClick={updateCategory}
                                >
                                    Zapisz
                                </button>
                                <button
                                    className="px-6 border border-white/20 text-white font-bold rounded-lg text-sm transition-all active:scale-[0.98]"
                                    disabled={busy}
                                    onClick={() => {
                                        setEditId(null);
                                        setName("");
                                    }}
                                >
                                    Anuluj
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">list</span>
                        <h3 className="text-white text-sm font-bold uppercase tracking-wider opacity-80">Lista</h3>
                    </div>
                    <button
                        className="text-[10px] font-bold text-primary uppercase border border-primary/20 px-2 py-1 rounded"
                        onClick={load}
                        disabled={busy}
                    >
                        Odœwie¿
                    </button>
                </div>

                <div className="overflow-hidden border border-white/10 rounded-xl bg-surface-dark/20">
                    <div className="grid grid-cols-1 divide-y divide-white/5">
                        {items.length === 0 && (
                            <div className="p-4 text-white/60">Brak kategorii.</div>
                        )}

                        {items.map((c) => (
                            <div key={c.id} className="p-4 flex items-center justify-between group">
                                <span className="text-sm font-medium text-white">{c.name}</span>
                                <div className="flex gap-2">
                                    <button
                                        className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                        disabled={busy}
                                        onClick={() => {
                                            setEditId(c.id);
                                            setName(c.name ?? "");
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-sm text-[#9b92c9]">edit</span>
                                    </button>
                                    <button
                                        className="p-2 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                                        disabled={busy}
                                        onClick={() => deleteCategory(c.id)}
                                    >
                                        <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
