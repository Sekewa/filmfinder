import { mockUserData } from "../data/mockData";
import { Repository, QueryOptions } from "./database";

/**
 * Interface pour les données utilisateur
 */
export interface UserData {
  id: string;
  name: string;
  email?: string;
  favorites: string[];
  watchlist: string[];
  history: string[];
  ratings: UserRating[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRating {
  movieId: string;
  rating: number;
  reviewText?: string;
  createdAt: Date;
}

export interface UserPreferences {
  favoriteGenres: string[];
  preferredLanguages: string[];
  contentRating: string;
  notificationsEnabled: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'view' | 'favorite' | 'watchlist' | 'rating' | 'review';
  movieId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserStatistics {
  totalMoviesWatched: number;
  totalWatchTime: number;
  averageRating: number;
  favoriteGenres: Array<{ genre: string; count: number }>;
  favoriteDirectors: Array<{ director: string; count: number }>;
  favoriteDecades: Array<{ decade: string; count: number }>;
  watchingStreak: number;
  lastActivity: Date;
}

/**
 * Interface pour le service utilisateur
 */
export interface UserService {
  // Gestion des utilisateurs
  getUserById(id: string): Promise<UserData | null>;
  createUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserData>;
  updateUser(id: string, userData: Partial<UserData>): Promise<UserData | null>;
  deleteUser(id: string): Promise<boolean>;

  // Gestion des favoris
  addToFavorites(userId: string, movieId: string): Promise<boolean>;
  removeFromFavorites(userId: string, movieId: string): Promise<boolean>;
  getFavorites(userId: string, options?: QueryOptions): Promise<string[]>;
  isFavorite(userId: string, movieId: string): Promise<boolean>;

  // Gestion de la watchlist
  addToWatchlist(userId: string, movieId: string): Promise<boolean>;
  removeFromWatchlist(userId: string, movieId: string): Promise<boolean>;
  getWatchlist(userId: string, options?: QueryOptions): Promise<string[]>;
  isInWatchlist(userId: string, movieId: string): Promise<boolean>;

  // Gestion de l'historique
  addToHistory(userId: string, movieId: string): Promise<boolean>;
  getHistory(userId: string, options?: QueryOptions): Promise<string[]>;
  clearHistory(userId: string): Promise<boolean>;

  // Gestion des notes
  rateMovie(userId: string, movieId: string, rating: number, reviewText?: string): Promise<UserRating>;
  getUserRating(userId: string, movieId: string): Promise<UserRating | null>;
  getUserRatings(userId: string, options?: QueryOptions): Promise<UserRating[]>;
  removeRating(userId: string, movieId: string): Promise<boolean>;

  // Activités utilisateur
  logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<UserActivity>;
  getUserActivities(userId: string, options?: QueryOptions): Promise<UserActivity[]>;

  // Statistiques et analyse
  getUserStatistics(userId: string): Promise<UserStatistics>;
  getUserTrends(userId: string): Promise<UserTrends>;

  // Préférences
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  getPreferences(userId: string): Promise<UserPreferences>;
}

export interface UserTrends {
  genreEvolution: Array<{ genre: string; popularity: number; trend: 'up' | 'down' | 'stable' }>;
  ratingTrend: Array<{ period: string; averageRating: number }>;
  watchingPatterns: {
    averageMoviesPerWeek: number;
    preferredWatchingDays: string[];
    preferredWatchingTimes: string[];
  };
  discoveryPattern: {
    discoveryMethods: Array<{ method: string; percentage: number }>;
    genreExploration: number; // 0-1 score
  };
}

/**
 * Implémentation du service utilisateur avec données mockées
 */
export class UserServiceImpl implements UserService {
  constructor(
    private userRepository: Repository<UserData>,
    private activityRepository: Repository<UserActivity>
  ) {}

  async getUserById(id: string): Promise<UserData | null> {
    return await this.userRepository.findById(id);
  }

  async createUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserData> {
    const now = new Date();
    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    return await this.userRepository.create(newUser);
  }

  async updateUser(id: string, userData: Partial<UserData>): Promise<UserData | null> {
    const updatedData = {
      ...userData,
      updatedAt: new Date()
    };
    return await this.userRepository.update(id, updatedData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async addToFavorites(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await this.updateUser(userId, { favorites: user.favorites });
      await this.logActivity({ userId, type: 'favorite', movieId });
    }
    return true;
  }

  async removeFromFavorites(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    const index = user.favorites.indexOf(movieId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      await this.updateUser(userId, { favorites: user.favorites });
    }
    return true;
  }

  async getFavorites(userId: string, options?: QueryOptions): Promise<string[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];

    let favorites = user.favorites;
    
    if (options?.offset) {
      favorites = favorites.slice(options.offset);
    }
    
    if (options?.limit) {
      favorites = favorites.slice(0, options.limit);
    }

    return favorites;
  }

  async isFavorite(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.favorites.includes(movieId) || false;
  }

  async addToWatchlist(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
      await this.updateUser(userId, { watchlist: user.watchlist });
      await this.logActivity({ userId, type: 'watchlist', movieId });
    }
    return true;
  }

  async removeFromWatchlist(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    const index = user.watchlist.indexOf(movieId);
    if (index > -1) {
      user.watchlist.splice(index, 1);
      await this.updateUser(userId, { watchlist: user.watchlist });
    }
    return true;
  }

  async getWatchlist(userId: string, options?: QueryOptions): Promise<string[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];

    let watchlist = user.watchlist;
    
    if (options?.offset) {
      watchlist = watchlist.slice(options.offset);
    }
    
    if (options?.limit) {
      watchlist = watchlist.slice(0, options.limit);
    }

    return watchlist;
  }

  async isInWatchlist(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.watchlist.includes(movieId) || false;
  }

  async addToHistory(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    // Supprimer l'entrée existante s'il y en a une
    const index = user.history.indexOf(movieId);
    if (index > -1) {
      user.history.splice(index, 1);
    }
    
    // Ajouter au début
    user.history.unshift(movieId);
    
    // Limiter l'historique à 100 entrées
    user.history = user.history.slice(0, 100);
    
    await this.updateUser(userId, { history: user.history });
    await this.logActivity({ userId, type: 'view', movieId });
    
    return true;
  }

  async getHistory(userId: string, options?: QueryOptions): Promise<string[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];

    let history = user.history;
    
    if (options?.offset) {
      history = history.slice(options.offset);
    }
    
    if (options?.limit) {
      history = history.slice(0, options.limit);
    }

    return history;
  }

  async clearHistory(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    await this.updateUser(userId, { history: [] });
    return true;
  }

  async rateMovie(userId: string, movieId: string, rating: number, reviewText?: string): Promise<UserRating> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Supprimer l'ancienne note s'il y en a une
    const existingIndex = user.ratings.findIndex(r => r.movieId === movieId);
    if (existingIndex > -1) {
      user.ratings.splice(existingIndex, 1);
    }

    const newRating: UserRating = {
      movieId,
      rating,
      reviewText,
      createdAt: new Date()
    };

    user.ratings.push(newRating);
    await this.updateUser(userId, { ratings: user.ratings });
    await this.logActivity({ userId, type: 'rating', movieId, metadata: { rating } });

    return newRating;
  }

  async getUserRating(userId: string, movieId: string): Promise<UserRating | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    return user.ratings.find(r => r.movieId === movieId) || null;
  }

  async getUserRatings(userId: string, options?: QueryOptions): Promise<UserRating[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];

    let ratings = user.ratings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (options?.offset) {
      ratings = ratings.slice(options.offset);
    }
    
    if (options?.limit) {
      ratings = ratings.slice(0, options.limit);
    }

    return ratings;
  }

  async removeRating(userId: string, movieId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    const index = user.ratings.findIndex(r => r.movieId === movieId);
    if (index > -1) {
      user.ratings.splice(index, 1);
      await this.updateUser(userId, { ratings: user.ratings });
      return true;
    }
    return false;
  }

  async logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<UserActivity> {
    const newActivity: UserActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    };

    return await this.activityRepository.create(newActivity);
  }

  async getUserActivities(userId: string, options?: QueryOptions): Promise<UserActivity[]> {
    return await this.activityRepository.search({
      ...options,
      filters: { userId },
      orderBy: 'timestamp',
      orderDirection: 'desc'
    });
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Cette implémentation est simplifiée - dans un vrai système, 
    // ces calculs seraient optimisés avec des requêtes spécifiques
    return {
      totalMoviesWatched: user.history.length,
      totalWatchTime: user.history.length * 120, // Estimation
      averageRating: user.ratings.length > 0 
        ? user.ratings.reduce((sum, r) => sum + r.rating, 0) / user.ratings.length 
        : 0,
      favoriteGenres: [],
      favoriteDirectors: [],
      favoriteDecades: [],
      watchingStreak: 0,
      lastActivity: new Date()
    };
  }

  async getUserTrends(userId: string): Promise<UserTrends> {
    // Implémentation simplifiée
    return {
      genreEvolution: [],
      ratingTrend: [],
      watchingPatterns: {
        averageMoviesPerWeek: 0,
        preferredWatchingDays: [],
        preferredWatchingTimes: []
      },
      discoveryPattern: {
        discoveryMethods: [],
        genreExploration: 0
      }
    };
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const updatedPreferences = { ...user.preferences, ...preferences };
    await this.updateUser(userId, { preferences: updatedPreferences });
    
    return updatedPreferences;
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');
    
    return user.preferences;
  }
}

/**
 * Conversion des données mockées vers le nouveau format
 */
export function convertMockUserData(): UserData {
  return {
    id: 'mock_user_1',
    name: 'Utilisateur Demo',
    email: 'demo@filmfinder.com',
    favorites: mockUserData.favorites,
    watchlist: mockUserData.watchlist,
    history: mockUserData.history,
    ratings: [],
    preferences: {
      favoriteGenres: [],
      preferredLanguages: ['fr', 'en'],
      contentRating: 'PG-13',
      notificationsEnabled: true
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };
}