import React from 'react';
import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Plus, Star, Clock, Calendar, MapPin, User, Brain } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { MovieCard } from "../components/MovieCard";
import { ActorCard } from "../components/ActorCard";
import { Movie, UserData } from '../data/types';
import { getFilmById, getRelatedRecommendations } from '../services/apiService';

interface MovieDetailsProps {
  movieId: string;
  onBack: () => void;
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
  onMovieSelect: (movieId: string) => void;
}

export function MovieDetails({ 
  movieId, 
  onBack, 
  userData, 
  onUserDataChange,
  onMovieSelect
}: MovieDetailsProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [backdropLoaded, setBackdropLoaded] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieData, recommendations] = await Promise.all([
          getFilmById(movieId),
          getRelatedRecommendations(movieId)
        ]);
        setMovie(movieData);
        setSimilarMovies(recommendations);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du film:", error);
      }
    };
    fetchMovieData();
  }, [movieId]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Chargement...</h2>
        </div>
      </div>
    );
  }

  const isFavorite = userData.favorites.includes(movie.id);
  const isInWatchlist = userData.watchlist.includes(movie.id);

  const handleFavoriteToggle = () => {
    const newFavorites = isFavorite
      ? userData.favorites.filter(id => id !== movie.id)
      : [...userData.favorites, movie.id];
    
    onUserDataChange({
      ...userData,
      favorites: newFavorites
    });
  };

  const handleWatchlistToggle = () => {
    const newWatchlist = isInWatchlist
      ? userData.watchlist.filter(id => id !== movie.id)
      : [...userData.watchlist, movie.id];
    
    onUserDataChange({
      ...userData,
      watchlist: newWatchlist
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[60vh] overflow-hidden">
        <div className={`absolute inset-0 bg-muted animate-pulse ${backdropLoaded ? 'hidden' : ''}`} />
        <img
          src={movie.backdrop}
          alt={movie.title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            backdropLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setBackdropLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <motion.div 
          className="absolute top-6 left-6 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="secondary"
            onClick={onBack}
            className="rounded-full bg-black/50 text-white hover:bg-black/70 border-none backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
              <motion.div 
                className="w-48 h-72 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <motion.div 
                className="flex-1 text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">{movie.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                    <span className="font-medium">{movie.rating}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {movie.year}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {movie.duration} min
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {movie.country}
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-1" />
                    {movie.director}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="bg-black/50 text-white border-white/20 backdrop-blur-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleFavoriteToggle}
                    className={`rounded-full ${
                      isFavorite 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Retiré des favoris' : 'Ajouter aux favoris'}
                  </Button>
                  <Button
                    onClick={handleWatchlistToggle}
                    variant="outline"
                    className={`rounded-full ${
                      isInWatchlist 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                        : 'bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm'
                    }`}
                  >
                    <Plus className={`h-4 w-4 mr-2 ${isInWatchlist ? 'rotate-45' : ''} transition-transform`} />
                    {isInWatchlist ? 'Retirer de la watchlist' : 'Ajouter à la watchlist'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {movie.synopsis}
                </p>
              </CardContent>
            </Card>
          </motion.section>

          {movie.actors.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Distribution principale</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {movie.actors.map((actor, index) => (
                  <motion.div
                    key={actor.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <ActorCard actor={actor} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {similarMovies.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Films similaires</h2>
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  Recommandés par IA
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarMovies.map((similarMovie, index) => (
                  <motion.div
                    key={similarMovie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <MovieCard
                      movie={similarMovie}
                      isFavorite={userData.favorites.includes(similarMovie.id)}
                      isInWatchlist={userData.watchlist.includes(similarMovie.id)}
                      onFavoriteToggle={(id) => {
                        const newFavorites = userData.favorites.includes(id)
                          ? userData.favorites.filter(fId => fId !== id)
                          : [...userData.favorites, id];
                        onUserDataChange({ ...userData, favorites: newFavorites });
                      }}
                      onWatchlistToggle={(id) => {
                        const newWatchlist = userData.watchlist.includes(id)
                          ? userData.watchlist.filter(wId => wId !== id)
                          : [...userData.watchlist, id];
                        onUserDataChange({ ...userData, watchlist: newWatchlist });
                      }}
                      onClick={onMovieSelect}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}