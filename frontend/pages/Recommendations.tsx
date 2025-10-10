import React from 'react';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Target, Brain, ArrowRight, Star, Users, Calendar, Film } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { RecommendationCard } from "../components/RecommendationCard";
import { RecommendationEngine, RecommendationScore } from "../utils/recommendationEngine";
import { mockMovies, mockUserData } from "../data/mockData";

interface RecommendationsProps {
  userData: typeof mockUserData;
  onUserDataChange: (data: typeof mockUserData) => void;
  onMovieSelect: (movieId: string) => void;
}

export function Recommendations({ userData, onUserDataChange, onMovieSelect }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationScore | null>(null);
  const [activeTab, setActiveTab] = useState("recommendations");
  
  const engine = new RecommendationEngine();

  useEffect(() => {
    if (userData.favorites.length > 0) {
      const recs = engine.generateRecommendations(
        userData.favorites, 
        userData.history, 
        12
      );
      setRecommendations(recs);
      
      const userTrends = engine.analyzeTrends(userData.favorites);
      setTrends(userTrends);
    }
  }, [userData.favorites, userData.history]);

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

  const getRecommendationColor = (score: number) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.6) return "text-yellow-500";
    if (score >= 0.4) return "text-orange-500";
    return "text-red-500";
  };

  const RecommendationDetails = ({ rec }: { rec: RecommendationScore }) => {
    const movie = mockMovies.find(m => m.id === rec.movieId);
    if (!movie) return null;

    return (
      <Card className="bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Analyse de Recommandation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score global */}
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getRecommendationColor(rec.score)}`}>
              {Math.round(rec.score * 100)}%
            </div>
            <p className="text-muted-foreground">Score de compatibilité</p>
            <Progress value={rec.score * 100} className="mt-2" />
          </div>

          {/* Raisons de recommandation */}
          <div>
            <h4 className="font-medium mb-3">Raisons de la recommandation</h4>
            <div className="space-y-3">
              {rec.reasons.slice(0, 5).map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getRecommendationColor(reason.weight)}`} />
                    <span className="text-sm">{reason.description}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(reason.weight * 100)}%
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chemin de corrélation */}
          <div>
            <h4 className="font-medium mb-3">Chemin de Corrélation</h4>
            <div className="flex flex-wrap items-center gap-2">
              {rec.correlationPath.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <Badge 
                    variant={node.type === 'movie' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {node.label}
                  </Badge>
                  {index < rec.correlationPath.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => onMovieSelect(rec.movieId)}
            className="w-full rounded-xl"
          >
            Voir les détails du film
          </Button>
        </CardContent>
      </Card>
    );
  };

  const TrendsAnalysis = () => {
    if (!trends) return null;

    return (
      <div className="space-y-6">
        {/* Genres préférés */}
        <Card className="bg-card rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-primary" />
              <span>Vos Genres Préférés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.favoriteGenres.map(([genre, count]: [string, number], index: number) => (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <span>{genre}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={(count / userData.favorites.length) * 100} className="w-20" />
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Réalisateurs préférés */}
        <Card className="bg-card rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Film className="h-5 w-5 text-primary" />
              <span>Vos Réalisateurs Préférés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.favoriteDirectors.map(([director, count]: [string, number], index: number) => (
                <motion.div
                  key={director}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <span>{director}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={(count / userData.favorites.length) * 100} className="w-20" />
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Décennies préférées */}
        <Card className="bg-card rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Vos Décennies Préférées</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.favoriteDecades.map(([decade, count]: [string, number], index: number) => (
                <motion.div
                  key={decade}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <span>{decade}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={(count / userData.favorites.length) * 100} className="w-20" />
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Note moyenne */}
        <Card className="bg-card rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Profil de Goût</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {trends.averageRating.toFixed(1)}/10
              </div>
              <p className="text-muted-foreground">Note moyenne de vos films préférés</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 rounded-2xl">
              <TabsTrigger value="recommendations" className="rounded-xl">
                <Zap className="h-4 w-4 mr-2" />
                Recommandations
              </TabsTrigger>
              <TabsTrigger value="trends" className="rounded-xl">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyse des Goûts
              </TabsTrigger>
            </TabsList>

                <TabsContent value="recommendations" className="mt-0">
                  {recommendations.length > 0 ? (
                    <div className="space-y-6">
                      {recommendations.map((rec, index) => {
                        const movie = mockMovies.find(m => m.id === rec.movieId);
                        if (!movie) return null;

                        return (
                          <motion.div
                            key={rec.movieId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <RecommendationCard
                              movie={movie}
                              score={rec.score}
                              reasons={rec.reasons}
                              isFavorite={userData.favorites.includes(movie.id)}
                              isInWatchlist={userData.watchlist.includes(movie.id)}
                              onFavoriteToggle={handleFavoriteToggle}
                              onWatchlistToggle={handleWatchlistToggle}
                              onClick={onMovieSelect}
                            />
                          </motion.div>
                        );
                      })}
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

            <TabsContent value="trends" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TrendsAnalysis />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}