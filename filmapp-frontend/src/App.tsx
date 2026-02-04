//import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
//import React from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProposalsPage from "./pages/user/ProposalsPage";
import AdminProposalsPage from "./pages/admin/AdminProposalsPage";
import AdminMoviesPage from "./pages/admin/AdminMoviesPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import RequireAuth from "./RequireAuth";
import RequireAdmin from "./RequireAdmin";
import DiscoverPage from "./pages/DiscoverPage";
import LikedPage from "./pages/user/LikedPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import RegisterPage from "./pages/RegisterPage";
import StatePage from "./pages/user/StatePage";
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserReportsPage from './pages/user/UserReportsPage';
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";


export default function App() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>  
                    <Route index element={<HomePage />} />  
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />

                    <Route element={<RequireAuth />}>  
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="proposals" element={<ProposalsPage />} />
                        <Route path="profile/liked" element={<LikedPage />} />
                        <Route path="profile/ogladam" element={<StatePage status="Watching" />} />
                        <Route path="profile/obejrzane" element={<StatePage status="Watched" />} />
                        <Route path="profile/chceobejrzec" element={<StatePage status="WantToWatch" />} />
                        <Route path="profile/reports" element={<UserReportsPage />} />
                    </Route>

                    <Route element={<RequireAdmin />}>  
                        <Route path="admin/movies" element={<AdminMoviesPage />} />
                        <Route path="admin/categories" element={<AdminCategoriesPage />} />
                        <Route path="admin/proposals" element={<AdminProposalsPage />} />
                        <Route path="admin/reports" element={<AdminReportsPage />} />
                        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                    </Route>

                    <Route path="discover" element={<DiscoverPage />} />
                    <Route path="movies/:id" element={<MovieDetailsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}