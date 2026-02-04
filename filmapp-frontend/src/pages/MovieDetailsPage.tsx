import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../apiFetch";
import { getAuth } from "../auth";

type Category = { id: number; name: string };

type MovieDetails = {
    id: number;
    title: string;
    description: string;
    coverUrl: string | null;
    year: number | null;
    type: string;
    durationMinutes: number | null;
    seasonsCount: number | null;
    episodesCount: number | null;
    rating: number;
    ratingCount: number;
    likesCount: number;
    likedByMe: boolean;
    myStatus?: string | null;
    categories: Category[];
};

type CommentDto = {
    id: number;
    text: string;
    createdAt: string;
    userName: string;
    likesCount: number;
    likedByMe: boolean;
    canDelete: boolean;
};

type WatchStatus = "Watching" | "WantToWatch" | "Watched";

export default function MovieDetailsPage() {
    const { id } = useParams();
    const movieId = Number(id);

    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [commentText, setCommentText] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtitle = useMemo(() => {
        if (!movie) return "";
        const parts: string[] = [];
        if (movie.year) parts.push(String(movie.year));
        if (movie.type === "Movie" && movie.durationMinutes) parts.push(`${movie.durationMinutes} min`);
        if (movie.type === "Series" && movie.seasonsCount) parts.push(`${movie.seasonsCount} sez.`);
        if (movie.type === "Series" && movie.episodesCount) parts.push(`${movie.episodesCount} odc.`);
        return parts.join(" • ");
    }, [movie]);

    async function loadMovie() {
        if (!Number.isFinite(movieId)) {
            setError("Nieprawidłowe ID.");
            return;
        }
        setBusy(true);
        setError(null);

        const res = await apiFetch(`/api/Movies/${movieId}`);
        setBusy(false);

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`Nie mogę pobrać filmu. HTTP ${res.status} ${txt}`);
            return;
        }

        const data: MovieDetails = await res.json();
        setMovie(data);
    }

    async function loadComments() {
        if (!Number.isFinite(movieId)) return;

        const res = await apiFetch(`/api/Movies/${movieId}/comments`);
        if (!res.ok) return;

        const data: CommentDto[] = await res.json();
        setComments(data ?? []);
    }

    async function changeStatus(newStatus: WatchStatus | null) {
        if (!movie) return;
        const before = movie.myStatus ?? null;

        setMovie({ ...movie, myStatus: newStatus });

        let res: Response;
        if (newStatus === null) {
            res = await apiFetch(`/api/movies/${movie.id}/status`, { method: "DELETE" });
        } else {
            res = await apiFetch(`/api/movies/${movie.id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus }),
            });
        }

        if (!res.ok) {
            setMovie({ ...movie, myStatus: before });
            const txt = await res.text().catch(() => "");
            setError(`Nie udało się zaktualizować statusu. HTTP ${res.status} ${txt}`);
        }
    }

    async function submitComment() {
        const text = commentText.trim();
        if (!text) return;

        const res = await apiFetch(`/api/Movies/${movieId}/comments`, {
            method: "POST",
            body: JSON.stringify({ text }),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`Nie mogę dodać komentarza. HTTP ${res.status} ${txt}`);
            return;
        }

        setCommentText("");
        await loadComments();
    }

    async function toggleCommentLike(commentId: number) {
        const before = comments;
        const curr = before.find((c) => c.id === commentId);
        const wasLiked = !!curr?.likedByMe;

        setComments((prev) =>
            prev.map((c) =>
                c.id !== commentId
                    ? c
                    : { ...c, likedByMe: !c.likedByMe, likesCount: c.likesCount + (c.likedByMe ? -1 : 1) }
            )
        );

        const res = await apiFetch(`/api/comments/${commentId}/like`, {
            method: wasLiked ? "DELETE" : "POST",
        });

        if (!res.ok) {
            setComments(before);
            const txt = await res.text().catch(() => "");
            setError(`Nie udało się zmienić polubienia komentarza. HTTP ${res.status} ${txt}`);
        }
    }

    async function deleteComment(commentId: number) {
        if (!confirm("Usunąć komentarz?")) return;

        const auth = getAuth();
        const isAdmin = auth?.role === "Admin";
        const endpoint = isAdmin ? `/api/comments/${commentId}/admin` : `/api/comments/${commentId}`;

        const res = await apiFetch(endpoint, { method: "DELETE" });
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`Nie udało się usunąć komentarza. HTTP ${res.status} ${txt}`);
            return;
        }

        setComments((prev) => prev.filter((c) => c.id !== commentId));
    }

    async function setRating(score: number) {
        const res = await apiFetch(`/api/Movies/${movieId}/ratings`, {
            method: "POST",
            body: JSON.stringify({ score }),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setError(`Nie udało się ustawić oceny. HTTP ${res.status} ${txt}`);
            return;
        }

        await loadMovie();
    }

    async function toggleMovieLike() {
        if (!movie) return;

        const before = movie;
        const wasLiked = !!movie.likedByMe;

        setMovie({
            ...movie,
            likedByMe: !movie.likedByMe,
            likesCount: movie.likesCount + (movie.likedByMe ? -1 : 1),
        });

        const res = await apiFetch(`/api/Movies/${movie.id}/like`, {
            method: wasLiked ? "DELETE" : "POST",
        });

        if (!res.ok) {
            setMovie(before);
            const txt = await res.text().catch(() => "");
            setError(`Nie udało się zmienić ulubionych. HTTP ${res.status} ${txt}`);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await loadMovie();    
            await loadComments(); 
        };
        void fetchData(); 
    }, [movieId]);


    return (
        <div className="page">
            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
                    {error}
                </div>
            )}
            {busy && <div className="text-white/60 text-sm mb-4">Ładowanie…</div>}

            {movie && (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-surface-dark aspect-[2/3] flex items-center justify-center">
                            {movie.coverUrl ? (
                                < img src={`https://localhost:7289${movie.coverUrl}`} alt={movie.title} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white/50 text-sm">Brak okładki</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">{movie.title}</h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                <span className="px-2 py-1 border border-white/10 rounded-md text-[#9b92c9] bg-white/5">
                                    {subtitle || "—"}
                                </span>
                                <span className="text-accent-blue uppercase tracking-wide ml-1">
                                    {movie.categories?.map(c => c.name).join(", ") || "—"}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 py-2">
                                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                                    <span className="material-symbols-outlined text-red-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        favorite
                                    </span>
                                    <span className="text-sm font-bold">{movie.likesCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        star
                                    </span>
                                    <span className="text-xl font-bold text-white">
                                        {movie.rating.toFixed(1)}
                                        <span className="text-sm text-[#9b92c9] font-normal">/10</span>
                                    </span>
                                    <span className="text-xs text-white/60">({movie.ratingCount})</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={toggleMovieLike}
                            className={`w-full h-12 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-white/10 ${movie.likedByMe ? "bg-red-500 text-white" : "bg-surface-dark text-white"}`}
                        >
                            <span className="material-symbols-outlined" style={movie.likedByMe ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                favorite
                            </span>
                            {movie.likedByMe ? "W ulubionych" : "Lubię to!"}
                        </button>

                        <div className="w-full bg-surface-dark border border-white/10 rounded-xl p-3">
                            <div className="text-[10px] text-[#9b92c9] font-bold uppercase mb-2">Twoja ocena</div>
                            <div className="grid grid-cols-5 gap-2 w-full">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setRating(n)}
                                        className="w-full rounded border border-white/10 text-xs text-white/80 hover:bg-white/5 py-2"
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>

                        </div>

                        <button
                            onClick={() => changeStatus(movie?.myStatus === "WantToWatch" ? null : "WantToWatch")}
                            className={`w-full h-12 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-white/10 ${movie?.myStatus === "WantToWatch" ? "bg-primary text-white" : "bg-surface-dark text-white"}`}
                        >
                            <span className="material-symbols-outlined">bookmark</span> Chcę zobaczyć
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={() => changeStatus(movie?.myStatus === "Watched" ? null : "Watched")}
                                className={`flex-1 h-12 font-bold rounded-xl border border-white/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${movie?.myStatus === "Watched" ? "bg-primary text-white" : "bg-surface-dark text-white"}`}
                            >
                                <span className="material-symbols-outlined text-lg">visibility</span> Obejrzane
                            </button>
                            <button
                                onClick={() => changeStatus(movie?.myStatus === "Watching" ? null : "Watching")}
                                className={`flex-1 h-12 font-bold rounded-xl border border-white/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${movie?.myStatus === "Watching" ? "bg-primary text-white" : "bg-surface-dark text-white"}`}
                            >
                                <span className="material-symbols-outlined text-lg">play_circle</span> Oglądam
                            </button>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/3 lg:pl-8 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold uppercase tracking-wider text-[#9b92c9] border-b border-white/10 pb-2">Opis</h3>
                            <p className="text-white/80 leading-relaxed text-sm lg:text-base whitespace-pre-line">{movie.description || "Brak opisu."}</p>
                        </div>
                    </div>
                </div>
            )}

            <section className="mt-12 space-y-6">
                <h3 className="text-lg font-bold uppercase tracking-wider text-[#9b92c9] border-b border-white/10 pb-2">Komentarze</h3>
                <div className="bg-surface-dark border border-white/10 rounded-xl p-4">
                    <textarea
                        className="w-full bg-background-dark/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#9b92c9] p-3 min-h-[80px]"
                        placeholder="Dodaj komentarz..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end mt-3">
                        <button className="bg-primary px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider" onClick={submitComment}>
                            Dodaj
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {comments.length === 0 && <div className="text-white/60 text-sm">Brak komentarzy.</div>}
                    {comments.map((c) => (
                        <div key={c.id} className="bg-surface-dark/40 border border-white/10 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-start gap-3">
                                <div>
                                    <div className="text-sm font-bold">{c.userName || "Użytkownik"}</div>
                                    <div className="text-[10px] text-[#9b92c9]">{new Date(c.createdAt).toLocaleString()}</div>
                                </div>
                                {c.canDelete && (
                                    <button
                                        className="text-xs border border-white/10 px-2 py-1 rounded text-white/60 hover:bg-white/5"
                                        onClick={() => deleteComment(c.id)}
                                        title="Usuń komentarz"
                                    >
                                        Usuń
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{c.text}</p>
                            <div className="flex items-center gap-4 pt-2">
                                <button
                                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase hover:text-white transition-colors"
                                    type="button"
                                    onClick={() => toggleCommentLike(c.id)}
                                >
                                    <span className="material-symbols-outlined text-base">thumb_up</span>
                                    <span className={c.likedByMe ? "text-primary" : "text-[#9b92c9]"}>Lubię to ({c.likesCount})</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
