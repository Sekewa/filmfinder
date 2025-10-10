import React from 'react';
import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Home } from "./pages/Home";
import { MovieDetails } from "./pages/MovieDetails";
import { Profile } from "./pages/Profile";

import { Recommendations } from "./pages/Recommendations";
import { mockUserData } from "./data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { initializeServices, defaultConfig } from "./services/serviceFactory";

type Page = "recommendations" | "search" | "movie" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("recommendations");
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [userData, setUserData] = useState(mockUserData);
  const [servicesInitialized, setServicesInitialized] = useState(false);

  // Initialize services and apply dark theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const initServices = async () => {
      try {
        await initializeServices(defaultConfig);
        setServicesInitialized(true);
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };
    
    initServices();
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "recommendations":
        return (
          <Recommendations
            userData={userData}
            onUserDataChange={setUserData}
            onMovieSelect={handleMovieSelect}
          />
        );
      case "search":
        return (
          <Home
            onMovieSelect={handleMovieSelect}
            userData={userData}
            onUserDataChange={setUserData}
          />
        );
      case "movie":
        return selectedMovieId ? (
          <MovieDetails
            movieId={selectedMovieId}
            onBack={handleBackToHome}
            userData={userData}
            onUserDataChange={setUserData}
            onMovieSelect={handleMovieSelect}
          />
        ) : (
          <Recommendations
            userData={userData}
            onUserDataChange={setUserData}
            onMovieSelect={handleMovieSelect}
          />
        );
      case "profile":
        return (
          <Profile
            userData={userData}
            onUserDataChange={setUserData}
            onMovieSelect={handleMovieSelect}
          />
        );
      default:
        return (
          <Recommendations
            userData={userData}
            onUserDataChange={setUserData}
            onMovieSelect={handleMovieSelect}
          />
        );
    }
  };

  // Show loading until services are initialized
  if (!servicesInitialized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initialisation de Film Finder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation - Only show on non-movie pages */}
      {currentPage !== "movie" && (
        <Navigation 
          currentPage={currentPage} 
          onPageChange={handlePageChange} 
        />
      )}
      
      {/* Main Content with Page Transitions */}
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