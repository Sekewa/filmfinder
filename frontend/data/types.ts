export interface AnalysisMetrics {
  popularity?: number;
  rating?: number;
  voteCount?: number;
  trendScore?: number;
  discoveryScore?: number;
}

export interface MovieAnalysis {
  type: 'trending' | 'hidden_gem' | 'genre_discovery' | 'personalized';
  metrics: AnalysisMetrics & { matchScore?: number };
  genres?: string[];
  newGenres?: string[];
  seenGenres?: string[];
  sharedGenres?: string[];
  favoriteGenres?: string[];
  year?: number;
  reason: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  duration: number;
  rating: number;
  genres: string[];
  synopsis: string;
  poster: string;
  backdrop: string;
  director: string;
  country: string;
  actors: Actor[];
  reason?: string;
  score?: number; // Score de recommandation (0-1)
  analysis?: MovieAnalysis; // Analyse détaillée de la recommandation
}

export interface Actor {
  id: string;
  name: string;
  character: string;
  photo: string;
}

export interface UserData {
  favorites: string[];
  watchlist: string[];
  history: string[];
}

export const genres: string[] = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
  "Music", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"
];

export const countries: string[] = [
  "USA", "France", "UK", "Germany", "Italy", "Japan", "South Korea",
  "Spain", "Canada", "Australia", "India", "China", "Russia", "Brazil"
];