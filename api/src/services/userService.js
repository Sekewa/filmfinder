// src/services/userService.js

// SIMULATION DE BASE DE DONNÉES pour les utilisateurs
let USERS = [
    { id: 1, email: "user.a@example.com", name: "User A", history: [1, 2] }, // history: film_ids
    { id: 2, email: "user.b@example.com", name: "User B", history: [3] }
];
let nextId = 3;

class UserService {
    // Simule la récupération de l'utilisateur authentifié (le premier pour l'exemple)
    getAuthenticatedUser(userId) {
        return USERS.find(u => u.id === userId); 
    }

    create(data) {
        if (!data.email || !data.password) {
            return null; // Erreur de validation
        }
        const newUser = {
            id: nextId++,
            email: data.email,
            name: data.name || 'Nouvel Utilisateur',
            history: []
        };
        USERS.push(newUser);
        // Retourne l'objet utilisateur sans le mot de passe (sécurité)
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    updateMe(userId, data) {
        const user = this.getAuthenticatedUser(userId);
        if (user) {
            if (data.name) user.name = data.name;
            if (data.email) user.email = data.email;
            return user;
        }
        return null;
    }

    addFilmToHistory(userId, filmId) {
        const user = this.getAuthenticatedUser(userId);
        if (user && !user.history.includes(filmId)) {
            user.history.push(filmId);
            return true;
        }
        return false;
    }

    removeFilmFromHistory(userId, filmId) {
        const user = this.getAuthenticatedUser(userId);
        if (user) {
            const initialLength = user.history.length;
            user.history = user.history.filter(id => id !== filmId);
            return user.history.length < initialLength;
        }
        return false;
    }
}

module.exports = new UserService();