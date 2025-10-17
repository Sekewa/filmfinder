import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Eye, Star, Users, Calendar, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

// Fix import path for utils
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface AnalysisMetrics {
  popularity?: number;
  rating?: number;
  voteCount?: number;
  trendScore?: number;
  discoveryScore?: number;
}

interface Analysis {
  type: 'trending' | 'hidden_gem' | 'genre_discovery';
  metrics: AnalysisMetrics;
  genres?: string[];
  newGenres?: string[];
  seenGenres?: string[];
  year?: number;
  reason: string;
}

interface RecommendationAnalysisProps {
  analysis: Analysis;
  score: number;
}

export function RecommendationAnalysis({ analysis, score }: RecommendationAnalysisProps) {
  const getTypeIcon = () => {
    switch (analysis.type) {
      case 'trending':
        return <TrendingUp className="h-5 w-5" />;
      case 'hidden_gem':
        return <Sparkles className="h-5 w-5" />;
      case 'genre_discovery':
        return <Eye className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (analysis.type) {
      case 'trending':
        return 'Film Tendance';
      case 'hidden_gem':
        return 'Trésor Caché';
      case 'genre_discovery':
        return 'Découverte';
      default:
        return 'Recommandé';
    }
  };

  const getTypeColor = () => {
    switch (analysis.type) {
      case 'trending':
        return 'from-orange-500 to-red-500';
      case 'hidden_gem':
        return 'from-purple-500 to-pink-500';
      case 'genre_discovery':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-primary to-primary/60';
    }
  };

  const scorePercentage = Math.round(score * 100);

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header avec type et score */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor()}`}>
                <div className="text-white">
                  {getTypeIcon()}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg">{getTypeLabel()}</h4>
                <p className="text-sm text-muted-foreground">Analyse algorithmique</p>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-2xl font-bold bg-gradient-to-r ${getTypeColor()} bg-clip-text text-transparent`}>
                {scorePercentage}%
              </div>
              <p className="text-xs text-muted-foreground">Score de match</p>
            </div>
          </div>

          {/* Barre de progression du score */}
          <div className="space-y-2">
            <Progress value={scorePercentage} className="h-2" />
          </div>

          {/* Raison détaillée */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{analysis.reason}</p>
          </div>

          {/* Métriques détaillées */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {analysis.metrics.rating !== undefined && (
              <motion.div
                className="bg-background rounded-lg p-3 border"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Note</span>
                </div>
                <p className="text-lg font-bold">{analysis.metrics.rating.toFixed(1)}/10</p>
              </motion.div>
            )}

            {analysis.metrics.voteCount !== undefined && (
              <motion.div
                className="bg-background rounded-lg p-3 border"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Votes</span>
                </div>
                <p className="text-lg font-bold">{analysis.metrics.voteCount.toLocaleString()}</p>
              </motion.div>
            )}

            {analysis.metrics.popularity !== undefined && (
              <motion.div
                className="bg-background rounded-lg p-3 border"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Popularité</span>
                </div>
                <p className="text-lg font-bold">{Math.round(analysis.metrics.popularity)}</p>
              </motion.div>
            )}

            {analysis.year !== undefined && (
              <motion.div
                className="bg-background rounded-lg p-3 border"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Année</span>
                </div>
                <p className="text-lg font-bold">{analysis.year}</p>
              </motion.div>
            )}
          </div>

          {/* Genres */}
          {analysis.type === 'genre_discovery' && analysis.newGenres && analysis.newGenres.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Nouveaux genres à découvrir :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.newGenres.map((genre) => (
                  <Badge key={genre} variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    {genre}
                  </Badge>
                ))}
              </div>
              {analysis.seenGenres && analysis.seenGenres.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">
                    Vos genres habituels : {analysis.seenGenres.slice(0, 5).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {(analysis.genres && analysis.genres.length > 0 && analysis.type !== 'genre_discovery') && (
            <div className="flex flex-wrap gap-2">
              {analysis.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
