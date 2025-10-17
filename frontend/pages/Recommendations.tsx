import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Compass, Heart, Star, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Movie, UserData } from '../data/types';
import { getPersonalizedRecommendations, getHiddenGems, getTrending } from '../services/apiService';

interface RecommendationsProps {
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
  onMovieSelect: (movieId: string) => void;
}

export function Recommendations({ userData, onUserDataChange, onMovieSelect }: RecommendationsProps) {
  const [personalized, setPersonalized] = useState<Movie[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRecommendations = async () => {
      setLoading(true);
      try {
        const [p, h, t] = await Promise.all([
          getPersonalizedRecommendations(5),
          getHiddenGems(),
          getTrending(5)
        ]);
        setPersonalized(p);
        setHiddenGems(h);
        setTrending(t);
      } catch (error) {
        console.error("Erreur lors de la récupération des recommandations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-white">Analyse en cours...</h2>
          <p className="text-slate-400 mt-2">Calcul des meilleures recommandations pour vous</p>
        </div>
      </div>
    );
  }

  const RecommendationSection = ({ title, icon: Icon, movies, color }: {
    title: string;
    icon: any;
    movies: Movie[];
    color: string;
  }) => (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-slate-400 text-sm">{movies.length} films sélectionnés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="group bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-xl hover:shadow-emerald-500/20"
              onClick={() => onMovieSelect(movie.id)}
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                {/* Score */}
                {movie.score && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                    {Math.round(movie.score * 100)}%
                  </div>
                )}

                {/* Rating */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-sm">{movie.rating.toFixed(1)}</span>
                </div>
              </div>

              <CardContent className="p-5">
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {movie.title}
                </h3>

                {/* Analysis reason */}
                {movie.analysis && (
                  <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {movie.analysis.reason}
                    </p>
                  </div>
                )}

                {/* Shared genres for personalized */}
                {movie.analysis?.sharedGenres && movie.analysis.sharedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {movie.analysis.sharedGenres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                  <span className="text-xs text-slate-400">Année: {movie.year}</span>
                  <ChevronRight className="h-5 w-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700">
          <p className="text-slate-400">Aucune recommandation disponible pour cette catégorie</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full mb-6 border border-emerald-500/20">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Recommandations Intelligentes</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
            Films Sélectionnés Pour Vous
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Basé sur l'analyse de vos favoris et de votre historique de visionnage
          </p>
        </motion.div>

        {/* Personalized Recommendations - Priority */}
        {personalized.length > 0 && (
          <RecommendationSection
            title="Recommandés pour Vous"
            icon={Heart}
            movies={personalized}
            color="from-rose-500 to-pink-600"
          />
        )}

        {/* Hidden Gems */}
        {hiddenGems.length > 0 && (
          <RecommendationSection
            title="Trésors Cachés"
            icon={Sparkles}
            movies={hiddenGems}
            color="from-purple-500 to-violet-600"
          />
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <RecommendationSection
            title="Films Populaires"
            icon={TrendingUp}
            movies={trending}
            color="from-orange-500 to-amber-600"
          />
        )}
      </div>
    </div>
  );
}
