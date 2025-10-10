// src/services/filmService.js

// SIMULATION DE BASE DE DONNÉES pour les films
const FILMS = [
    { id: 1, title: "Inception", genre: "Science-Fiction", year: 2010 },
    { id: 2, title: "The Dark Knight", genre: "Action", year: 2008 },
    { id: 3, title: "Pulp Fiction", genre: "Crime", year: 1994 },
    { id: 4, title: "Interstellar", genre: "Science-Fiction", year: 2014 }
];

class FilmService {
    /**
     * Récupère les films, avec filtres et tri basés sur req.query.
     * Ex: filter=genre=Science-Fiction&sort=year:desc
     */
    getAll(params) {
        let results = [...FILMS];

        // 1. Filtrage (simulation simple)
        if (params.filter) {
            const [key, value] = params.filter.split('=');
            if (key && value) {
                results = results.filter(film => String(film[key]).toLowerCase().includes(value.toLowerCase()));
            }
        }

        // 2. Tri (simulation simple)
        if (params.sort) {
            const [key, order] = params.sort.split(':');
            if (key) {
                results.sort((a, b) => {
                    if (a[key] < b[key]) return order === 'desc' ? 1 : -1;
                    if (a[key] > b[key]) return order === 'desc' ? -1 : 1;
                    return 0;
                });
            }
        }

        return results;
    }

    getById(id) {
        return FILMS.find(film => film.id === id);
    }
}

module.exports = new FilmService();