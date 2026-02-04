import { Link, Outlet, useLocation } from "react-router-dom";
import { getAuth } from "./auth";
//import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./pages/navigation"; 


export default function Layout() {
    const navigate = useNavigate();

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate]);
  const auth = getAuth();
  const isLogged = !!auth?.token;
    //const isAdmin = auth?.role === "Admin";
    const { pathname } = useLocation();
    const hideBottomNav = pathname === "/discover";



  return (
    <div className={`min-h-screen bg-background-dark text-white font-display ${hideBottomNav ? "" : "pb-20"}`}>

      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center p-4 justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">movie</span>
            </div>
            <h1 className="text-white text-lg font-bold tracking-tight">Film</h1>
          </div>

          <div className="flex items-center gap-4">
            {isLogged ? (
              <Link
                className="text-[#9b92c9] text-sm font-semibold hover:text-white transition-colors"
                to="/profile"
              >
                Profil
              </Link>
            ) : (
              <Link
                className="text-[#9b92c9] text-sm font-semibold hover:text-white transition-colors"
                to="/login"
              >
                Zaloguj
              </Link>
            )}
          </div>
        </div>

              <nav className="flex items-center justify-center gap-6 py-3 border-t border-white/5 text-[11px] font-bold uppercase tracking-widest text-[#9b92c9]">
                  <Link className="hover:text-white transition-colors" to="/">
                      Strona główna
                  </Link>

                  <span className="text-white/20">|</span>

                  <Link className="hover:text-white transition-colors" to="/discover">
                      Eksploruj
                  </Link>

                  <span className="text-white/20">|</span>

                  <Link className="hover:text-white transition-colors" to="/profile">
                      Profil
                  </Link>
              </nav>


      </header>

          <main className="max-w-7xl mx-auto pb-24">
              <Outlet />
          </main>

          
          <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/10 px-6 py-3 flex justify-between items-center z-50">
              <Link to="/" className="flex flex-col items-center gap-1 text-[#9b92c9] hover:text-white transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      home
                  </span>
                  <span className="text-[10px] font-medium">Home</span>
              </Link>

              <Link to="/discover" className="flex flex-col items-center gap-1 text-primary hover:text-white transition-colors">
                  <span className="material-symbols-outlined">explore</span>
                  <span className="text-[10px] font-bold">Odkrywaj</span>
              </Link>

              {isLogged ? (
                  <Link to="/profile" className="flex flex-col items-center gap-1 text-[#9b92c9] hover:text-white transition-colors">
                      <span className="material-symbols-outlined">person</span>
                      <span className="text-[10px] font-medium">Profil</span>
                  </Link>
              ) : (
                  <Link to="/login" className="flex flex-col items-center gap-1 text-[#9b92c9] hover:text-white transition-colors">
                      <span className="material-symbols-outlined">login</span>
                      <span className="text-[10px] font-medium">Zaloguj</span>
                  </Link>
              )}
          </nav>
          
    </div>
  );
}
