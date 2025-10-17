import React from 'react';
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Home } from "./pages/Home";
import { MovieDetails } from "./pages/MovieDetails";
import { Profile } from "./pages/Profile";
import { Recommendations } from "./pages/Recommendations";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserData } from "./data/types";
import { motion, AnimatePresence } from "framer-motion";
import { getMe } from "./services/apiService";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const user = await getMe();
          setUserData(user);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const handleMovieSelect = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  const handleUserDataChange = (newUserData: UserData) => {
    setUserData(newUserData);
  };

  const isMovieDetailsPage = location.pathname.startsWith('/movie/');

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de Film Finder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isAuthenticated && !isMovieDetailsPage && (
        <Navigation />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Recommendations
                userData={userData!}
                onUserDataChange={handleUserDataChange}
                onMovieSelect={handleMovieSelect}
              />
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <Home
                onMovieSelect={handleMovieSelect}
                userData={userData!}
                onUserDataChange={handleUserDataChange}
              />
            </ProtectedRoute>
          } />

          <Route path="/movie/:id" element={
            <ProtectedRoute>
              <MovieDetails
                userData={userData!}
                onUserDataChange={handleUserDataChange}
                onMovieSelect={handleMovieSelect}
              />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile
                userData={userData!}
                onUserDataChange={handleUserDataChange}
                onMovieSelect={handleMovieSelect}
              />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}