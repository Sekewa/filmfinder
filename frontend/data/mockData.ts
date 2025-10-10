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

export const mockMovies: Movie[] = [
  {
    id: "1",
    title: "The Dark Knight",
    year: 2008,
    duration: 152,
    rating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMGNpbmVtYSUyMHBvc3RlcnxlbnwxfHx8fDE3NTkwNTY4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    backdrop: "https://images.unsplash.com/photo-1583297184120-6e79788816e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwbm9pciUyMGRhcmt8ZW58MXx8fHwxNzU5MDY3ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    director: "Christopher Nolan",
    country: "USA",
    actors: [
      {
        id: "1",
        name: "Christian Bale",
        character: "Bruce Wayne / Batman",
        photo: "https://images.unsplash.com/photo-1573088593824-52c03d56ec4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTA2NzgxOHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "2", 
        name: "Heath Ledger",
        character: "The Joker",
        photo: "https://images.unsplash.com/photo-1573088593824-52c03d56ec4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTA2NzgxOHww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  {
    id: "2",
    title: "Pulp Fiction",
    year: 1994,
    duration: 154,
    rating: 8.9,
    genres: ["Crime", "Drama"],
    synopsis: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster: "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMGNpbmVtYSUyMHBvc3RlcnxlbnwxfHx8fDE3NTkwNTY4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    backdrop: "https://images.unsplash.com/photo-1583297184120-6e79788816e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwbm9pciUyMGRhcmt8ZW58MXx8fHwxNzU5MDY3ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    director: "Quentin Tarantino",
    country: "USA",
    actors: [
      {
        id: "3",
        name: "John Travolta",
        character: "Vincent Vega",
        photo: "https://images.unsplash.com/photo-1573088593824-52c03d56ec4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTA2NzgxOHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "4",
        name: "Samuel L. Jackson",
        character: "Jules Winnfield",
        photo: "https://images.unsplash.com/photo-1573088593824-52c03d56ec4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTA2NzgxOHww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  {
    id: "3",
    title: "Inception",
    year: 2010,
    duration: 148,
    rating: 8.8,
    genres: ["Action", "Sci-Fi", "Thriller"],
    synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxdb3ZpZSUyMGNpbmVtYSUyMHBvc3RlcnxlbnwxfHx8fDE3NTkwNTY4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    backdrop: "https://images.unsplash.com/photo-1583297184120-6e79788816e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwbm9pciUyMGRhcmt8ZW58MXx8fHwxNzU5MDY3ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    director: "Christopher Nolan",
    country: "USA",
    actors: [
      {
        id: "5",
        name: "Leonardo DiCaprio",
        character: "Dom Cobb",
        photo: "https://images.unsplash.com/photo-1573088593824-52c03d56ec4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTA2NzgxOHww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  {
    id: "4",
    title: "Interstellar",
    year: 2014,
    duration: 169,
    rating: 8.6,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMGNpbmVtYSUyMHBvc3RlcnxlbnwxfHx8fDE3NTkwNTY4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    backdrop: "https://images.unsplash.com/photo-1583297184120-6e79788816e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwbm9pciUyMGRhcmt8ZW58MXx8fHwxNzU5MDY3ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    director: "Christopher Nolan",
    country: "USA",
    actors: [
      {
        id: "6",
        name: "Matthew McConaughey",
        character: "Cooper",
        photo: "https://images.unsplash.com/photo-1573088593824-52c03d56ec4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTA2NzgxOHww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  }
];

export const genres = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", 
  "Music", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"
];

export const countries = [
  "USA", "France", "UK", "Germany", "Italy", "Japan", "South Korea", 
  "Spain", "Canada", "Australia", "India", "China", "Russia", "Brazil"
];

export const mockUserData: UserData = {
  favorites: ["1", "3"],
  watchlist: ["2", "4"],
  history: ["1", "2", "3"]
};