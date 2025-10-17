import React from 'react';
import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Home } from "./pages/Home";
import { MovieDetails } from "./pages/MovieDetails";
import { Profile } from "./pages/Profile";

import { Recommendations } from "./pages/Recommendations";
import { UserData } from "./data/types";
import { motion, AnimatePresence } from "framer-motion";
import { getMe, addFilmToHistory, removeFilmFromHistory } from "./services/apiService";

type Page = "recommendations" | "search" | "movie" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("recommendations");
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
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
  }, []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page as Page);
    if (page !== "movie") {
      setSelectedMovieId(null);
    }
  };

  const handleMovieSelect = (movieId: string) => {
    setSelectedMovieId(movieId);
    setCurrentPage("movie");
  };

  const handleBackToHome = () => {
    setCurrentPage("recommendations");
    setSelectedMovieId(null);
  };
  
  const handleUserDataChange = (newUserData: UserData) => {
    // ici, vous pourriez aussi appeler l'API pour persister les changements
    setUserData(newUserData);
  };

  const renderCurrentPage = () => {
    if (!userData) {
      return null;
    }
    
    switch (currentPage) {
      case "recommendations":
        return (
          <Recommendations
            userData={userData}
            onUserDataChange={handleUserDataChange}
            onMovieSelect={handleMovieSelect}
          />
        );
      case "search":
        return (
          <Home
            onMovieSelect={handleMovieSelect}
            userData={userData}
            onUserDataChange={handleUserDataChange}
          />
        );
      case "movie":
        return selectedMovieId ? (
          <MovieDetails
            movieId={selectedMovieId}
            onBack={handleBackToHome}
            userData={userData}
            onUserDataChange={handleUserDataChange}
            onMovieSelect={handleMovieSelect}
          />
        ) : (
          <Recommendations
            userData={userData}
            onUserDataChange={handleUserDataChange}
            onMovieSelect={handleMovieSelect}
          />
        );
      case "profile":
        return (
          <Profile
            userData={userData}
            onUserDataChange={handleUserDataChange}
            onMovieSelect={handleMovieSelect}
          />
        );
      default:
        return (
          <Recommendations
            userData={userData}
            onUserDataChange={handleUserDataChange}
            onMovieSelect={handleMovieSelect}
          />
        );
    }
  };

  if (loading) {
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
      {currentPage !== "movie" && (
        <Navigation 
          currentPage={currentPage} 
          onPageChange={handlePageChange} 
        />
      )}
      
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage + (selectedMovieId || "")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {renderCurrentPage()}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}