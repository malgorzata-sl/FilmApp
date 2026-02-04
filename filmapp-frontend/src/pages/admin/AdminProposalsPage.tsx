import { useEffect, useState } from "react";
import { apiFetch } from "../../apiFetch";



type Proposal = {
  id: number;
  title: string;
  year: number;
  reason: string;
  type: "Movie" | "Series";
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  userId: string;
};

type PagedResult<T> = {
  items: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

export default function AdminProposalsPage() {
  const [items, setItems] = useState<Proposal[]>([]);
  const [status, setStatus] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProposalStatus = (v: string): v is "Pending" | "Approved" | "Rejected" =>
  v === "Pending" || v === "Approved" || v === "Rejected";


  async function load() {
    setError(null);
    const res = await apiFetch(
      `/api/admin/movie-proposals?status=${status}&page=1&pageSize=20`
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setError(`Nie mogę pobrać listy. HTTP ${res.status} ${txt}`);
      return;
    }
    const data: PagedResult<Proposal> = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    void load();
  }, [status]);

  async function approve(id: number) {
    setBusy(true);
    setError(null);

    const res = await apiFetch(`/api/admin/movie-proposals/${id}/approve`, { method: "POST" });

    setBusy(false);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setError(`Approve nie wyszło. HTTP ${res.status} ${txt}`);
      return;
    }

    await load();
  }

  async function reject(id: number) {
    setBusy(true);
    setError(null);

    const res = await apiFetch(`/api/admin/movie-proposals/${id}/reject`, { method: "POST" });

    setBusy(false);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setError(`Reject nie wyszło. HTTP ${res.status} ${txt}`);
      return;
    }

    await load();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <h1 className="text-2xl font-bold">Admin: Propozycje</h1>

      {error && (
        <div className="mt-4 p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <label className="text-white/70 text-sm">Status:</label>
        <select
          className="bg-background-dark border border-white/10 rounded-lg px-3 py-2"
          value={status}
          onChange={(e) => {
              const v = e.target.value;
              if (isProposalStatus(v)) setStatus(v);
            }}

        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button
          className="text-sm border border-white/20 px-3 py-2 rounded-lg disabled:opacity-50"
          disabled={busy}
          onClick={load}
        >
          Odśwież
        </button>
      </div>

      <div className="mt-4 bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm">Tytuł</th>
              <th className="p-3 text-left text-sm">Rok</th>
              <th className="p-3 text-left text-sm">Typ</th>
              <th className="p-3 text-left text-sm">UserId</th>
              <th className="p-3 text-left text-sm">Status</th>
              <th className="p-3 text-right text-sm">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-white/70">{p.year}</td>
                <td className="p-3 text-white/70">{p.type}</td>
                <td className="p-3 text-white/70">{p.userId}</td>
                <td className="p-3 text-white/70">{p.status}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="border border-white/20 px-3 py-1 rounded-lg disabled:opacity-50"
                      disabled={busy || p.status !== "Pending"}
                      onClick={() => approve(p.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="text-red-300 border border-red-400/40 px-3 py-1 rounded-lg disabled:opacity-50"
                      disabled={busy || p.status !== "Pending"}
                      onClick={() => reject(p.id)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-6 text-white/60" colSpan={6}>
                  Brak rekordów.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
