import React from 'react';
import { useState, useEffect } from "react";
import { Heart, Clock, History, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { MovieCard } from "../components/MovieCard";
import { Movie, UserData } from '../data/types';
import { getFilms } from '../services/apiService';

interface ProfileProps {
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
  onMovieSelect: (movieId: string) => void;
}

export function Profile({ userData, onUserDataChange, onMovieSelect }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("favorites");
  const [allMovies, setAllMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await getFilms();
        setAllMovies(movies);
      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
      }
    };
    fetchMovies();
  }, []);

  const favoriteMovies = allMovies.filter(movie => userData.favorites.includes(movie.id));
  const watchlistMovies = allMovies.filter(movie => userData.watchlist.includes(movie.id));
  const historyMovies = allMovies.filter(movie => userData.history.includes(movie.id));

  const handleFavoriteToggle = (movieId: string) => {
    const newFavorites = userData.favorites.includes(movieId)
      ? userData.favorites.filter(id => id !== movieId)
      : [...userData.favorites, movieId];
    
    onUserDataChange({
      ...userData,
      favorites: newFavorites
    });
  };

  const handleWatchlistToggle = (movieId: string) => {
    const newWatchlist = userData.watchlist.includes(movieId)
      ? userData.watchlist.filter(id => id !== movieId)
      : [...userData.watchlist, movieId];
    
    onUserDataChange({
      ...userData,
      watchlist: newWatchlist
    });
  };

  const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );

  const MovieGrid = ({ movies, showFavoriteButton = true, showWatchlistButton = true }: { 
    movies: any[], 
    showFavoriteButton?: boolean,
    showWatchlistButton?: boolean 
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MovieCard
            movie={movie}
            isFavorite={userData.favorites.includes(movie.id)}
            isInWatchlist={userData.watchlist.includes(movie.id)}
            onFavoriteToggle={showFavoriteButton ? handleFavoriteToggle : undefined}
            onWatchlistToggle={showWatchlistButton ? handleWatchlistToggle : undefined}
            onClick={onMovieSelect}
          />
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos films favoris, votre watchlist et votre historique
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card rounded-2xl">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{userData.favorites.length}</div>
              <div className="text-muted-foreground">Favoris</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card rounded-2xl">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{userData.watchlist.length}</div>
              <div className="text-muted-foreground">À regarder</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card rounded-2xl">
            <CardContent className="p-6 text-center">
              <History className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{userData.history.length}</div>
              <div className="text-muted-foreground">Vus</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 rounded-2xl">
              <TabsTrigger value="favorites" className="rounded-xl">
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="rounded-xl">
                <Clock className="h-4 w-4 mr-2" />
                À regarder
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl">
                <History className="h-4 w-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-0">
              {favoriteMovies.length > 0 ? (
                <MovieGrid movies={favoriteMovies} showFavoriteButton={true} />
              ) : (
                <EmptyState 
                  icon={Heart}
                  title="Aucun film favori"
                  description="Ajoutez des films à vos favoris en cliquant sur le cœur"
                />
              )}
            </TabsContent>

            <TabsContent value="watchlist" className="mt-0">
              {watchlistMovies.length > 0 ? (
                <MovieGrid movies={watchlistMovies} showWatchlistButton={true} />
              ) : (
                <EmptyState 
                  icon={Clock}
                  title="Watchlist vide"
                  description="Ajoutez des films à regarder plus tard en cliquant sur le +"
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              {historyMovies.length > 0 ? (
                <MovieGrid movies={historyMovies} />
              ) : (
                <EmptyState 
                  icon={History}
                  title="Aucun historique"
                  description="Votre historique de films visionnés apparaîtra ici"
                />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}