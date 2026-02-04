import { useEffect, useState } from 'react';
import { apiFetch } from "../../apiFetch";

type MovieRatingReport = {
    name: string;
    avgScore: number;
    ratingCount: number;
};

export default function AdminReportsPage() {
    const [data, setData] = useState<MovieRatingReport[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setBusy(true);
        setError(null);
        try {
            const res = await apiFetch('/api/admin/reports/movies-ratings');
            if (!res.ok) {
                const txt = await res.text();
                setError(`HTTP ${res.status}: ${txt}`);
                return;
            }
            const result = await res.json();
            setData(Array.isArray(result) ? result : []);
        } catch (e: any) {
            setError(`Błąd: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }


    function exportCSV() {
        if (!data.length) return;

        const headers = ["Film", "Średnia", "Oceny"];
        const rows = data.map(d => [d.name, d.avgScore.toFixed(1), d.ratingCount.toString()]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `movies_ratings_report.csv`;
        link.click();

        URL.revokeObjectURL(url);
    }

    useEffect(() => void load(), []);

    return (
        <div className="p-6 max-w-7xl mx-auto text-white">
            <h1 className="text-2xl font-bold tracking-tight mb-4">Raporty Admina</h1>

            <div className="flex items-center gap-2 mb-4">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-white text-sm font-bold transition-colors"
                    onClick={load}
                    disabled={busy}
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    {busy ? 'Ładowanie...' : 'Odśwież'}
                </button>

                <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500/90 rounded-lg text-white text-sm font-bold transition-colors"
                    onClick={exportCSV}
                    disabled={busy || !data.length}
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Eksportuj CSV
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto border border-white/10 rounded-xl bg-surface-dark/20">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[#9b92c9]">Film</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[#9b92c9] text-center">Średnia</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[#9b92c9] text-right">Oceny</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.length ? data.map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 text-sm font-medium text-white">{row.name}</td>
                                <td className="p-4 text-sm font-bold text-center text-white">{row.avgScore.toFixed(1)}</td>
                                <td className="p-4 text-sm font-medium text-right text-[#9b92c9]">{row.ratingCount}</td>
                            </tr>
                        )) : !busy && (
                            <tr>
                                <td className="p-6 text-white/60 text-center" colSpan={3}>
                                    Brak danych lub błąd ładowania
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col items-center gap-4 pt-2">
                <span className="text-[10px] font-bold text-[#9b92c9] uppercase tracking-widest">Strona 1 z 1</span>
                <div className="flex gap-2 w-full">
                    <button className="flex-1 border border-white/10 rounded-lg py-2.5 text-[11px] font-bold uppercase text-[#9b92c9] opacity-50 cursor-not-allowed">
                        Poprzednia
                    </button>
                    <button className="flex-1 border border-white/10 rounded-lg py-2.5 text-[11px] font-bold uppercase text-[#9b92c9] opacity-50 cursor-not-allowed">
                        Następna
                    </button>
                </div>
            </div>
        </div>
    );
}
