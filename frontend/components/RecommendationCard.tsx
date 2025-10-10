import React from 'react';
import React from 'react';
import { useState } from "react";
import { Heart, Plus, Star, Calendar, Clock, TrendingUp, Users, Camera, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { motion } from "framer-motion";
import { Movie } from "../data/mockData";

interface RecommendationReason {
  type: string;
  weight: number;
  description: string;
  relatedNodes: string[];
}

interface RecommendationCardProps {
  movie: Movie;
  score: number;
  reasons: RecommendationReason[];
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  onFavoriteToggle?: (movieId: string) => void;
  onWatchlistToggle?: (movieId: string) => void;
  onClick?: (movieId: string) => void;
}

export function RecommendationCard({ 
  movie, 
  score,
  reasons,
  isFavorite = false,
  isInWatchlist = false,
  onFavoriteToggle,
  onWatchlistToggle,
  onClick
}: RecommendationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(movie.id);
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWatchlistToggle?.(movie.id);
  };

  const handleClick = () => {
    onClick?.(movie.id);
  };

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'genre':
        return <Zap className="h-3 w-3" />;
      case 'director':
        return <Camera className="h-3 w-3" />;
      case 'actor':
        return <Users className="h-3 w-3" />;
      default:
        return <TrendingUp className="h-3 w-3" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.6) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Excellente correspondance";
    if (score >= 0.6) return "Bonne correspondance";
    return "Correspondance modérée";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-card border-border"
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Poster */}
            <div className="relative w-32 h-48 flex-shrink-0">
              <div className={`absolute inset-0 bg-muted animate-pulse rounded-l-2xl ${imageLoaded ? 'hidden' : ''}`} />
              <img
                src={movie.poster}
                alt={movie.title}
                className={`w-full h-full object-cover rounded-l-2xl group-hover:scale-105 transition-transform duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Score Badge */}
              <div className="absolute top-2 left-2">
                <Badge className={`${getScoreColor(score)} bg-black/80 border-none`}>
                  <Star className="h-3 w-3 mr-1" fill="currentColor" />
                  {movie.rating}
                </Badge>
              </div>

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFavorite}
                  className={`rounded-full ${
                    isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleWatchlist}
                  className={`rounded-full ${
                    isInWatchlist ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                  }`}
                >
                  <Plus className={`h-4 w-4 ${isInWatchlist ? 'rotate-45' : ''} transition-transform`} />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 flex flex-col">
              {/* Header */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <div className="ml-2 text-right">
                    <div className={`text-sm font-semibold ${getScoreColor(score)}`}>
                      {Math.round(score * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      compatibilité
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-3">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {movie.year}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {movie.duration}min
                  </span>
                  <span className="flex items-center">
                    <Camera className="h-3 w-3 mr-1" />
                    {movie.director}
                  </span>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {movie.description}
                </p>
              </div>

              {/* Recommendation Details */}
              <div className="mt-auto pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Raisons de la recommandation</span>
                  <span className={`text-xs ${getScoreColor(score)}`}>
                    {getScoreLabel(score)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {reasons.slice(0, 3).map((reason, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="text-muted-foreground">
                        {getReasonIcon(reason.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {reason.description}
                        </div>
                        <Progress 
                          value={reason.weight * 100} 
                          className="h-1 mt-1"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {Math.round(reason.weight * 100)}%
                      </div>
                    </div>
                  ))}
                  
                  {reasons.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{reasons.length - 3} autres facteurs
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}