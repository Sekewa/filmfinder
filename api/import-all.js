require('dotenv').config();
const fs = 'fs';
const path = 'path';
const zlib = 'zlib';
const neo4j = 'neo4j-driver';
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const pLimit = ('p-limit');

// --- Configuration ---
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const limit = pLimit(40);

// --- Fonctions Utilitaires (modifiées) ---

function getFormattedDate() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}_${day}_${year}`;
}

async function getExistingMovieIds(session) {
    console.log('🔍 Vérification des films déjà présents dans la base de données...');
    const result = await session.run('MATCH (m:Movie) RETURN m.id AS id');
    const ids = new Set(result.records.map(record => record.get('id')));
    console.log(`✅ ${ids.size} films déjà trouvés.`);
    return ids;
}


// --- Étape 1 : Télécharger et décompresser le dump ---
async function downloadAndUnzipDump() {
  const date = getFormattedDate();
  const dumpFileName = `movie_ids_${date}.json.gz`;
  const dumpUrl = `http://files.tmdb.org/p/exports/${dumpFileName}`;
  const gzPath = path.join(__dirname, dumpFileName);
  const jsonPath = path.join(__dirname, 'movie_ids.json');

  console.log(`📥 Téléchargement du dump depuis ${dumpUrl}...`);
  const response = await fetch(dumpUrl);
  if (!response.ok) throw new Error(`Échec du téléchargement: ${response.statusText}`);

  const fileStream = fs.createWriteStream(gzPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
  console.log('✅ Téléchargement terminé.');

  console.log('📦 Décompression du fichier...');
  const gunzip = zlib.createGunzip();
  const source = fs.createReadStream(gzPath);
  const destination = fs.createWriteStream(jsonPath);
  await new Promise((resolve, reject) => {
    source.pipe(gunzip).pipe(destination);
    destination.on('finish', resolve);
    destination.on('error', reject);
  });
  console.log('✅ Décompression terminée.');
  fs.unlinkSync(gzPath);
  return jsonPath;
}

// --- Étape 2 : Traiter les ID et importer les films ---
async function processMovies(jsonPath) {
  const session = driver.session();
  const existingIds = await getExistingMovieIds(session);

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const moviesData = fileContent.split('\n').filter(line => line.trim() !== '');
  let processedCount = 0;

  console.log(`🎬 ${moviesData.length} films au total à vérifier.`);

  const promises = moviesData.map(line => {
    const movieData = JSON.parse(line);
    const movieId = movieData.id.toString();

    // On saute le film si son ID est déjà dans notre Set
    if (existingIds.has(movieId)) {
      return Promise.resolve();
    }
    
    // On limite le nombre de requêtes simultanées à l'API TMDb
    return limit(async () => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=credits,keywords`;
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`⚠️ Film ID ${movieId}: ${response.statusText}`);
            return;
        }
        const movie = await response.json();
        
        const query = `
          MERGE (m:Movie {id: $id})
          SET m.title = $title,
              m.synopsis = $overview,
              m.releaseDate = $release_date,
              m.rating = $vote_average,
              m.posterPath = $poster_path,
              m.backdropPath = $backdrop_path
          FOREACH (genre IN $genres | MERGE (g:Genre {id: genre.id}) ON CREATE SET g.name = genre.name MERGE (m)-[:HAS_GENRE]->(g))
          FOREACH (actor IN $actors | MERGE (a:Actor {id: actor.id}) ON CREATE SET a.name = actor.name, a.profilePath = 'https://image.tmdb.org/t/p/w185' + actor.profile_path MERGE (a)-[:ACTED_IN {character: actor.character}]->(m))
        `;

        await session.run(query, {
          id: movie.id.toString(),
          title: movie.title,
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
          genres: movie.genres,
          actors: movie.credits.cast.slice(0, 10)
        });
        
        processedCount++;
        if (processedCount % 100 === 0) {
            console.log(` -> ${processedCount} nouveaux films ajoutés...`);
        }

      } catch (e) {
        console.error(`❌ Erreur avec le film ID ${movieId}:`, e.message);
      }
    });
  });

  await Promise.all(promises);
  console.log(`✅ Traitement terminé. ${processedCount} nouveaux films ont été importés.`);
  await session.close();
}

// --- Lancement du script ---
async function main() {
  try {
    const jsonPath = await downloadAndUnzipDump();
    await processMovies(jsonPath);
  } catch (error) {
    console.error("❌ Une erreur majeure est survenue:", error);
  } finally {
    await driver.close();
    console.log("🏁 Script terminé.");
  }
}

main();