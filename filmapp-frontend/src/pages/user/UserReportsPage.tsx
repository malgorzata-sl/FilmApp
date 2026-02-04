import { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch';
import { Link } from 'react-router-dom'; // 

type MyLikedMovieRow = { id: number; title: string };
type MyMovieStatusRow = { movieId: number; title: string; status: string; updatedAt: string };
//type UserStats = {
//  likedMovies: number;
//  movieStatuses: number;
//};

export default function UserReportsPage() {
  const [likedMovies, setLikedMovies] = useState<MyLikedMovieRow[]>([]);
  const [movieStatuses, setMovieStatuses] = useState<MyMovieStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'liked' | 'statuses'>('liked');

  useEffect(() => {
    Promise.all([
      apiFetch('/api/me/reports/liked-movies').then(r => r.ok ? r.json() : []),
      apiFetch('/api/me/reports/movie-statuses').then(r => r.ok ? r.json() : [])
    ]).then(([liked, statuses]: [MyLikedMovieRow[], MyMovieStatusRow[]]) => {
      setLikedMovies(liked);
      setMovieStatuses(statuses);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-white/50 animate-pulse">£adowanie...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">analytics</span>
        Moje statystyki
      </h1>

      <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden flex">
        <button 
          className={`flex-1 py-4 px-6 font-bold text-sm transition-all ${
            activeTab === 'liked' 
              ? 'bg-primary text-white shadow-primary/20' 
              : 'text-[#9b92c9] hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('liked')}
        >
          Polubione filmy ({likedMovies.length})
        </button>
        <button 
          className={`flex-1 py-4 px-6 font-bold text-sm transition-all ${
            activeTab === 'statuses' 
              ? 'bg-primary text-white shadow-primary/20' 
              : 'text-[#9b92c9] hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('statuses')}
        >
          Statusy ({movieStatuses.length})
        </button>
      </div>

      {activeTab === 'liked' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Polubione filmy</h3>
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
              {likedMovies.length}
            </span>
          </div>
          
          {likedMovies.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedMovies.map(movie => (
                <Link 
                  key={movie.id} 
                  to={`/movies/${movie.id}`}
                  className="block bg-surface-dark/50 border border-white/10 rounded-xl p-6 hover:border-primary/50 hover:bg-surface-dark transition-all group"
                >
                  <h4 className="font-bold text-white text-lg group-hover:text-primary mb-2 line-clamp-2">
                    {movie.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[#9b92c9] text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">favorite</span>
                    <span>Polubione</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <span className="material-symbols-outlined text-6xl block mb-4 opacity-20">favorite</span>
              <p>Nie masz jeszcze polubionych filmów</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statuses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Moje statusy</h3>
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
              {movieStatuses.length}
            </span>
          </div>
          
          {movieStatuses.length ? (
            <div className="space-y-3">
              {movieStatuses.map(status => (
                <Link 
                  key={status.movieId} 
                  to={`/movies/${status.movieId}`}
                  className="flex items-center gap-4 p-4 bg-surface-dark/50 border border-white/10 rounded-xl hover:border-primary/50 hover:bg-surface-dark transition-all group"
                >
                  <div className="w-20 h-28 bg-gradient-to-br from-black/30 to-transparent rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-lg line-clamp-2 group-hover:text-primary mb-1">
                      {status.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        status.status === 'Watching' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        status.status === 'WantToWatch' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {status.status === 'Watching' ? 'Ogl¹dam' :
                         status.status === 'WantToWatch' ? 'Chcê obejrzeæ' : 'Obejrzane'}
                      </span>
                      <span className="text-[#9b92c9] text-xs">
                        {new Date(status.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <span className="material-symbols-outlined text-6xl block mb-4 opacity-20">visibility</span>
              <p>Nie ustawi³eœ jeszcze statusów dla ¿adnych filmów</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
