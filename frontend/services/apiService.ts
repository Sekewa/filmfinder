// frontend/services/apiService.ts

import { Movie, UserData } from '../data/types';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// --- Fonctions d'adaptation des données de l'API vers le format du Front-end ---

// Adapte un objet film de l'API au format Movie du front-end
const adaptApiMovieToFrontend = (apiMovie: any): Movie => ({
    id: String(apiMovie.id.low),
    title: apiMovie.title || 'Titre inconnu',
    year: apiMovie.release_date ? new Date(apiMovie.release_date).getFullYear() : 0,
    duration: apiMovie.runtime?.low || 120,
    rating: apiMovie.vote_average || 0,
    genres: apiMovie.genres ? apiMovie.genres.map((g: any) => g.name) : [],
    synopsis: apiMovie.overview || apiMovie.tagline || 'Synopsis non disponible.',
    poster: `https://image.tmdb.org/t/p/w500/${apiMovie.poster_path}`,
    backdrop: `https://image.tmdb.org/t/p/w1280/${apiMovie.backdrop_path}`,
    director: apiMovie.credits?.crew.find((c: any) => c.job === 'Director')?.name || 'Inconnu',
    country: apiMovie.production_countries?.[0]?.iso_3166_1 || 'N/A',
    actors: apiMovie.credits?.cast.slice(0, 6).map((a: any) => ({
        id: String(a.id),
        name: a.name,
        character: a.character,
        photo: `https://image.tmdb.org/t/p/w200/${a.profile_path}`,
    })) || [],
    reason: apiMovie.reason,
});

// --- Fonctions d'appel à l'API ---

/**
 * Récupère une liste de films depuis l'API.
 */
export const getFilms = async (): Promise<Movie[]> => {
  const response = await fetch(`${API_BASE_URL}/films`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des films.');
  }
  const apiMovies = await response.json();
  return apiMovies.map(adaptApiMovieToFrontend);
};

/**
 * Récupère un film par son ID.
 */
export const getFilmById = async (id: string): Promise<Movie | null> => {
  const response = await fetch(`${API_BASE_URL}/films/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Erreur lors de la récupération du film.');
  }
  const apiMovie = await response.json();
  return adaptApiMovieToFrontend(apiMovie);
};

/**
 * Récupère les recommandations de films similaires à un film donné.
 */
export const getRelatedRecommendations = async (filmId: string): Promise<Movie[]> => {
  const response = await fetch(`${API_BASE_URL}/recommendations/related-to/${filmId}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des recommandations similaires.');
  }
  const apiMovies = await response.json();
  return apiMovies.map(adaptApiMovieToFrontend);
};

/**
 * Recommandations "Trésors Cachés"
 */
export const getHiddenGems = async (): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/hidden-gems`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des trésors cachés.');
    const data = await response.json();
    return data.map(adaptApiMovieToFrontend);
}

/**
 * Recommandations par ambiance/mots-clés
 */
export const getByMood = async (keywords: string): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/by-mood?keywords=${encodeURIComponent(keywords)}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des recommandations par ambiance.');
    const data = await response.json();
    return data.map(adaptApiMovieToFrontend);
}

/**
 * Récupère le profil de l'utilisateur authentifié.
 */
export const getMe = async (): Promise<UserData> => {
    const response = await fetch(`${API_BASE_URL}/users/me`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil utilisateur.');
    }
    const user = await response.json();
    return {
        favorites: user.history.map(String),
        watchlist: [], // L'API ne gère pas la watchlist
        history: user.history.map(String),
    }
};

/**
 * Ajoute un film à l'historique de l'utilisateur.
 */
export const addFilmToHistory = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/history/films/${filmId}`, {
        method: 'PUT',
    });
    return response.ok;
};

/**
 * Retire un film de l'historique de l'utilisateur.
 */
export const removeFilmFromHistory = async (filmId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/users/me/history/films/${filmId}`, {
        method: 'DELETE',
    });
    return response.ok;
};