import React from 'react';
import { useState } from "react";
import { Heart, Plus, Star, Clock, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { Movie } from "../data/mockData";

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  onFavoriteToggle?: (movieId: string) => void;
  onWatchlistToggle?: (movieId: string) => void;
  onClick?: (movieId: string) => void;
  variant?: "grid" | "horizontal";
}

export function MovieCard({ 
  movie, 
  isFavorite = false,
  isInWatchlist = false,
  onFavoriteToggle,
  onWatchlistToggle,
  onClick,
  variant = "grid"
}: MovieCardProps) {
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

  if (variant === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-card border-border"
          onClick={handleClick}
        >
          <CardContent className="p-0">
            <div className="flex">
              {/* Poster */}
              <div className="relative w-24 h-36 flex-shrink-0">
                <div className={`absolute inset-0 bg-muted animate-pulse rounded-l-2xl ${imageLoaded ? 'hidden' : ''}`} />
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className={`w-full h-full object-cover rounded-l-2xl transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-3">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {movie.year}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {movie.duration}min
                    </span>
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                      {movie.rating}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col justify-center p-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                  className={`h-8 w-8 p-0 rounded-full ${
                    isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWatchlist}
                  className={`h-8 w-8 p-0 rounded-full ${
                    isInWatchlist ? 'text-blue-500 hover:text-blue-600' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Plus className={`h-4 w-4 ${isInWatchlist ? 'rotate-45' : ''} transition-transform`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-card border-border"
        onClick={handleClick}
      >
        <CardContent className="p-0">
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <div className={`absolute inset-0 bg-muted animate-pulse ${imageLoaded ? 'hidden' : ''}`} />
            <img
              src={movie.poster}
              alt={movie.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            
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

            {/* Rating badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-black/80 text-white border-none">
                <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                {movie.rating}
              </Badge>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors mb-2">
              {movie.title}
            </h3>
            
            <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-3">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {movie.year}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {movie.duration}min
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}