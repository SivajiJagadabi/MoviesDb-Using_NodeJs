const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());
let db = null;

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Database Error ${e.message}`);
    process.exit(1);
  }
};

initializerDbAndServer();

const convertDbObj = (Data) => {
  return {
    movieId: Data.movie_id,
    directorId: Data.director_id,
    movieName: Data.movie_name,

    leadActor: Data.lead_actor,
  };
};

const convertDbOfDirectors = (Data) => {
  return {
    directorId: Data.director_id,
    directorName: Data.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesArray = `
        select movie_name as movieName from movie;
    `;

  const moviesArray = await db.all(getMoviesArray);
  response.send(moviesArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
        Insert Into movie 
        (director_id,movie_name,lead_actor)
       Values (${directorId},'${movieName}','${leadActor}') ;
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        select * from movie
        where movie_id=${movieId};
    `;

  const movie = await db.get(getMovieQuery);
  response.send(convertDbObj(movie));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE movie 
        SET 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}' 
        WHERE movie_id=${movieId};
    
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        delete from movie
        where movie_id=${movieId};
    
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        select * from director;
    
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachArray) => convertDbOfDirectors(eachArray))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesQuery = `
        select movie_name as movieName from movie
        where director_id=${directorId};
    `;

  const movies = await db.all(getMovieNamesQuery);
  response.send(movies);
});

module.exports = app;
