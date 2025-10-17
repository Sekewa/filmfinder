import React from 'react';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Brain } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { RecommendationCard } from "../components/RecommendationCard";
import { Movie, UserData } from '../data/types';
import { getHiddenGems, getByMood } from '../services/apiService';

interface RecommendationsProps {
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
  onMovieSelect: (movieId: string) => void;
}

export function Recommendations({ userData, onUserDataChange, onMovieSelect }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState("forYou");
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        let recs: Movie[] = [];
        if (activeTab === 'forYou' && userData.favorites.length > 0) {
          // Utilise le premier favori pour obtenir des recommandations liées pour la démo
          recs = await getRelatedRecommendations(userData.favorites[0]);
        } else if (activeTab === 'hiddenGems') {
          recs = await getHiddenGems();
        } else if (activeTab === 'byMood') {
          // Exemple de mots-clés, pourrait être une entrée utilisateur
          recs = await getByMood("thriller,suspense");
        }
        setRecommendations(recs);
      } catch (error) {
        console.error("Erreur lors de la récupération des recommandations:", error);
      }
    };

    fetchRecommendations();
  }, [userData.favorites, activeTab]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-4">Recommandations IA</h1>
          <p className="text-muted-foreground">
            Découvrez des films parfaitement adaptés à vos goûts grâce à notre algorithme de corrélation graphe
          </p>
        </motion.div>

        {userData.favorites.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucune recommandation disponible</h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez quelques films à vos favoris pour commencer à recevoir des recommandations personnalisées
            </p>
            <Button onClick={() => window.location.href = "/search"}>
              Parcourir les films
            </Button>
          </motion.div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 rounded-2xl">
              <TabsTrigger value="forYou" className="rounded-xl">
                <Zap className="h-4 w-4 mr-2" />
                Pour vous
              </TabsTrigger>
              <TabsTrigger value="hiddenGems" className="rounded-xl">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trésors cachés
              </TabsTrigger>
              <TabsTrigger value="byMood" className="rounded-xl">
                <Zap className="h-4 w-4 mr-2" />
                Par Ambiance
              </TabsTrigger>
            </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {recommendations.length > 0 ? (
                    <div className="space-y-6">
                      {recommendations.map((movie, index) => (
                          <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <RecommendationCard
                              movie={movie}
                              score={movie.rating / 10} // score factice
                              reasons={[{ type: 'genre', weight: 0.5, description: movie.reason || 'Recommandé pour vous', relatedNodes:[] }]}
                              isFavorite={userData.favorites.includes(movie.id)}
                              isInWatchlist={userData.watchlist.includes(movie.id)}
                              onFavoriteToggle={handleFavoriteToggle}
                              onWatchlistToggle={handleWatchlistToggle}
                              onClick={onMovieSelect}
                            />
                          </motion.div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Calcul en cours...</h3>
                      <p className="text-muted-foreground">
                        Notre IA analyse vos préférences pour générer des recommandations
                      </p>
                    </div>
                  )}
                </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}