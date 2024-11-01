import z from "zod";

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().max(10).default(5),
  poster: z.string().url({
    message: "Poster must be a valid URL",
  }),
  genre: z.array(
    z.enum([
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Science Fiction",
      "Romance",
      "Thriller",
      "Fantasy",
      "Documentary",
      "Crime",
      "Sci-Fi",
    ]),
    {
      required_error: "Movie genre is required",
      invalid_type_error: "Movie genre must be an array of enum Genre",
    }
  ),
});

function validateMovie(obj) {
  return movieSchema.safeParse(obj);
}

function validatePartialMovie(obj) {
  return movieSchema.partial().safeParse(obj);
}

export default {
  validateMovie,
  validatePartialMovie
};
