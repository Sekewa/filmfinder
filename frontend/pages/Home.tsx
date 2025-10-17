import React from 'react';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SearchBar } from "../components/SearchBar";
import { FilterSidebar } from "../components/FilterSidebar";
import { MovieCard } from "../components/MovieCard";
import { getFilms, addFilmToFavorites, removeFilmFromFavorites, addFilmToWatchlist, removeFilmFromWatchlist } from '../services/apiService';
import { Movie, UserData } from '../data/types';

interface HomeProps {
  onMovieSelect: (movieId: string) => void;
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
}

export function Home({ onMovieSelect, userData, onUserDataChange }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    genres: [] as string[],
    yearRange: [1990, 2024] as [number, number],
    durationRange: [60, 240] as [number, number],
    minRating: 0,
    countries: [] as string[]
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await getFilms();
        setAllMovies(movies);
        setFilteredMovies(movies);
      } catch (error) {
        console.error("Erreur lors de la récupération des films :", error);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    let filtered = allMovies;

    if (searchQuery.trim()) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.actors.some(actor => actor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.genres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genres.some(genre => filters.genres.includes(genre))
      );
    }

    if (filters.countries.length > 0) {
      filtered = filtered.filter(movie =>
        filters.countries.includes(movie.country)
      );
    }

    filtered = filtered.filter(movie =>
      movie.year >= filters.yearRange[0] && 
      movie.year <= filters.yearRange[1] &&
      movie.duration >= filters.durationRange[0] && 
      movie.duration <= filters.durationRange[1] &&
      movie.rating >= filters.minRating
    );

    setFilteredMovies(filtered);
  }, [searchQuery, filters, allMovies]);

  const handleFavoriteToggle = async (movieId: string) => {
    try {
      if (userData.favorites.includes(movieId)) {
        await removeFilmFromFavorites(movieId);
        onUserDataChange({
          ...userData,
          favorites: userData.favorites.filter(id => id !== movieId)
        });
      } else {
        await addFilmToFavorites(movieId);
        onUserDataChange({
          ...userData,
          favorites: [...userData.favorites, movieId]
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
    }
  };

  const handleWatchlistToggle = async (movieId: string) => {
    try {
      if (userData.watchlist.includes(movieId)) {
        await removeFilmFromWatchlist(movieId);
        onUserDataChange({
          ...userData,
          watchlist: userData.watchlist.filter(id => id !== movieId)
        });
      } else {
        await addFilmToWatchlist(movieId);
        onUserDataChange({
          ...userData,
          watchlist: [...userData.watchlist, movieId]
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la watchlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Découvrez votre prochain film préféré
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Explorez une vaste collection de films, découvrez de nouveaux genres et créez vos listes personnalisées
          </p>
          <SearchBar 
            onSearch={setSearchQuery}
            onSuggestionSelect={onMovieSelect}
          />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div 
            className="lg:w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </motion.div>

          <div className="flex-1">
            <motion.div 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold">
                {searchQuery ? `Résultats pour "${searchQuery}"` : 'Films populaires'}
              </h2>
              <span className="text-muted-foreground">
                {filteredMovies.length} film{filteredMovies.length > 1 ? 's' : ''}
              </span>
            </motion.div>

            {filteredMovies.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {filteredMovies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <MovieCard
                      movie={movie}
                      isFavorite={userData.favorites.includes(movie.id)}
                      isInWatchlist={userData.watchlist.includes(movie.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                      onWatchlistToggle={handleWatchlistToggle}
                      onClick={onMovieSelect}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-medium mb-2">Aucun film trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez d'ajuster vos filtres ou votre recherche
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}