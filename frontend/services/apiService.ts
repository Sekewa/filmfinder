// frontend/services/apiService.ts

import { Movie, UserData } from '../data/types';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// --- Helper Functions ---

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

/**
 * Create headers with auth token if available
 */
const createHeaders = (includeAuth: boolean = false): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

/**
 * Handle API response and throw proper errors
 */
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Unauthorized - clear auth and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        try {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Une erreur est survenue.');
        } catch {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
    }

    return response.json();
};

// --- Fonctions d'adaptation des données de l'API vers le format du Front-end ---

// Adapte un objet film de l'API au format Movie du front-end
const adaptApiMovieToFrontend = (apiMovie: any): Movie => {
    // Handle Neo4j integer format (objects with .low property)
    const getId = (value: any) => {
        if (typeof value === 'object' && value?.low !== undefined) {
            return String(value.low);
        }
        return String(value);
    };

    const getNumber = (value: any) => {
        if (typeof value === 'object' && value?.low !== undefined) {
            return value.low;
        }
        return value || 0;
    };

    return {
        id: getId(apiMovie.id),
        title: apiMovie.title || 'Titre inconnu',
        year: apiMovie.release_date ? new Date(apiMovie.release_date).getFullYear() : 0,
        duration: getNumber(apiMovie.runtime) || 120,
        rating: apiMovie.vote_average || 0,
        // Neo4j ne renvoie pas les genres dans la structure actuelle - sera vide
        genres: [],
        synopsis: apiMovie.tagline || 'Synopsis non disponible.',
        poster: apiMovie.poster_path ? `https://image.tmdb.org/t/p/w500${apiMovie.poster_path}` : '',
        backdrop: apiMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${apiMovie.backdrop_path}` : '',
        // Pas de director/actors dans Neo4j actuellement
        director: 'Inconnu',
        country: 'N/A',
        actors: [],
        reason: apiMovie.reason || '',
        score: apiMovie.score || undefined,
        analysis: apiMovie.analysis || undefined,
    };
};

// --- Fonctions d'appel à l'API ---

/**
 * Récupère une liste de films depuis l'API.
 */
export const getFilms = async (): Promise<Movie[]> => {
  const response = await fetch(`${API_BASE_URL}/films`, {
    headers: createHeaders(true),
  });
  const apiMovies = await handleResponse(response);
  return apiMovies.map(adaptApiMovieToFrontend);
};

/**
 * Récupère un film par son ID.
 */
export const getFilmById = async (id: string): Promise<Movie | null> => {
  const response = await fetch(`${API_BASE_URL}/films/${id}`, {
    headers: createHeaders(true),
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    await handleResponse(response); // Will throw error
  }

  const apiMovie = await response.json();
  return adaptApiMovieToFrontend(apiMovie);
};

/**
 * Récupère les recommandations de films similaires à un film donné.
 */
export const getRelatedRecommendations = async (filmId: string): Promise<Movie[]> => {
  const response = await fetch(`${API_BASE_URL}/recommendations/related-to/${filmId}`, {
    headers: createHeaders(true),
  });
  const apiMovies = await handleResponse(response);
  return apiMovies.map(adaptApiMovieToFrontend);
};

/**
 * Recommandations "Trésors Cachés"
 */
export const getHiddenGems = async (): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/hidden-gems`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse(response);
    return data.map(adaptApiMovieToFrontend);
}

/**
 * Recommandations par ambiance/mots-clés
 */
export const getByMood = async (keywords: string): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/by-mood?keywords=${encodeURIComponent(keywords)}`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse(response);
    return data.map(adaptApiMovieToFrontend);
}

/**
 * Récupère le profil de l'utilisateur authentifié.
 */
export const getMe = async (): Promise<UserData> => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: createHeaders(true),
    });
    const user = await handleResponse(response);
    return {
        favorites: user.favorites?.map(String) || [],
        watchlist: user.watchlist?.map(String) || [],
        history: user.history?.map(String) || [],
    }
};

/**
 * Ajoute un film à l'historique de l'utilisateur.
 */
export const addFilmToHistory = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/history/films/${filmId}`, {
        method: 'PUT',
        headers: createHeaders(true),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        return false;
    }

    return true;
};

/**
 * Retire un film de l'historique de l'utilisateur.
 */
export const removeFilmFromHistory = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/history/films/${filmId}`, {
        method: 'DELETE',
        headers: createHeaders(true),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        return false;
    }

    return true;
};

/**
 * Recommandations par société de production
 */
export const getByProductionCompany = async (filmId: string): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/by-production-company/${filmId}`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse(response);
    return data.map(adaptApiMovieToFrontend);
};

/**
 * Films tendance actuellement
 */
export const getTrending = async (limit: number = 20): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/trending?limit=${limit}`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse(response);
    return data.map(adaptApiMovieToFrontend);
};

/**
 * Classiques d'une décennie
 */
export const getDecadeClassics = async (decade: number, limit: number = 15): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/decade-classics?decade=${decade}&limit=${limit}`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse(response);
    return data.map(adaptApiMovieToFrontend);
};

/**
 * Découverte de nouveaux genres
 */
export const getGenreDiscovery = async (limit: number = 5): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/genre-discovery?limit=${limit}`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse(response);
    return data.map(adaptApiMovieToFrontend);
};

/**
 * Recommandations personnalisées basées sur vos favoris
 */
export const getPersonalizedRecommendations = async (limit: number = 5): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/personalized?limit=${limit}`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse(response);
    return data.map(adaptApiMovieToFrontend);
};

/**
 * Ajoute un film aux favoris de l'utilisateur.
 */
export const addFilmToFavorites = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/favorites/films/${filmId}`, {
        method: 'PUT',
        headers: createHeaders(true),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        return false;
    }

    return true;
};

/**
 * Retire un film des favoris de l'utilisateur.
 */
export const removeFilmFromFavorites = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/favorites/films/${filmId}`, {
        method: 'DELETE',
        headers: createHeaders(true),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        return false;
    }

    return true;
};

/**
 * Ajoute un film à la watchlist de l'utilisateur.
 */
export const addFilmToWatchlist = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/watchlist/films/${filmId}`, {
        method: 'PUT',
        headers: createHeaders(true),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        return false;
    }

    return true;
};

/**
 * Retire un film de la watchlist de l'utilisateur.
 */
export const removeFilmFromWatchlist = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/watchlist/films/${filmId}`, {
        method: 'DELETE',
        headers: createHeaders(true),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        return false;
    }

    return true;
};