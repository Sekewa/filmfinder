import React from 'react';
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getFilms } from '../services/apiService';
import { Movie } from '../data/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect: (movieId: string) => void;
}

export function SearchBar({ onSearch, onSuggestionSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await getFilms();
        setAllMovies(movies);
      } catch (error) {
        console.error("Erreur lors de la récupération des films :", error);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = allMovies
        .filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          movie.director.toLowerCase().includes(query.toLowerCase()) ||
          movie.actors.some(actor => actor.name.toLowerCase().includes(query.toLowerCase())) ||
          movie.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, allMovies]);

  const handleSearch = () => {
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (movieId: string) => {
    setQuery("");
    setShowSuggestions(false);
    onSuggestionSelect(movieId);
  };

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div 
        className="relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Rechercher un film, acteur, réalisateur, genre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="pl-12 pr-20 py-6 rounded-2xl bg-card border-border text-lg shadow-lg focus:shadow-xl transition-shadow"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 w-8 p-0 rounded-full hover:bg-destructive/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button 
            onClick={handleSearch}
            className="px-4 py-2 rounded-xl"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {suggestions.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSuggestionClick(movie.id)}
                className="flex items-center p-4 hover:bg-accent cursor-pointer transition-colors border-b border-border last:border-b-0"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{movie.title}</h4>
                  <p className="text-sm text-muted-foreground">{movie.year} • {movie.director}</p>
                  <p className="text-xs text-muted-foreground">{movie.genres.join(", ")}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  ⭐ {movie.rating}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}