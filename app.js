import express from "express";
import crypto from "node:crypto";
import cors from "cors";

import movies from "./movies.json" assert { type: "json" };
import moviesSchema from "./schemas/movies.js";


const app = express();
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}));

app.disable("x-powered-by"); // Deshabilitar el header X-powered-by Express


// Todos los recursos que sean MOVIES se identifica con /movies
app.get("/movies", (req, res) => {
  
  // Filtrar según param
  const { genre } = req.query;

  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLocaleLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  // -> path-to-regexp :id -> elemento dinámico

  const { id } = req.params;

  const movie = movies.find((item) => item.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: "Movie not Found" });
});

app.post("/movies", (req, res) => {
  const result = moviesSchema.validateMovie(req.body);
  if (result.error)
    return res.status(400).json({ error: JSON.parse(result.error.message) });

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  //Esto no seria REST porque guardamos el estado de la aplicación en memoria
  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {

  // Validate body
  const result = moviesSchema.validatePartialMovie(req.body);
  if(!result.success) {
    return res.status(400).json( {error: JSON.parse(result.error.message)} )
  }

  // Extract id
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if(movieIndex === -1) return res.status(404).json( { message: "Movie not Found" } );
  const movie = movies[movieIndex];

  const updatedMovie = {
    ...movie,
    ...result.data
  }

  movies[movieIndex] = updatedMovie;
  return res.json(updatedMovie);

});

app.delete('/movies/:id', (req,res) => {
  
  const {id} = req.params;

  const movieIndex = movies.findIndex(movie => movie.id === id);
  if(movieIndex === -1){
    return res.status(404).json({ message: "Movie not Found" })
  }

  movies.splice(movieIndex,1);
  return res.json({ message: "Movie deleted" });

 
})

app.get("/movies/page/:pag", (req, res) => {

  const registrosPag = 3;
  const { pag } = req.params;

  const inicio = (pag - 1) * registrosPag;
  const fin = inicio + registrosPag;

  const updatedMovies = movies.slice(inicio,fin);
  res.json(updatedMovies);
});

const PORT = process.env.PORT ?? 1234;
app.listen(PORT, () => {
  console.log(`Servidor a la escucha en http://localhost:${PORT}`);
});
