import React from "react";
import Search from "./components/Search";
import { useState, useEffect } from "react";
import heroImage from "./assets/hero.png";
import logo from "./assets/logo.png";
import Spinner from "./components/spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite";
import noMovie from "../src/assets/no-movie.png";
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setsearchTerm] = useState("");
  const [errorMessage, seterrorMessage] = useState("");
  const [moviesList, setmoviesList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState("");
  const [tringingNovies, setTringingNovies] = useState([]);
  useDebounce(() => setdebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTringingNovies(movies);
    } catch (error) {
      console.log("error fetching trending movies", error);
    }
  };

  const feachMovies = async (query = "") => {
    setisLoading(true);
    seterrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw Error("failed to fetch movies");
      }
      const data = await response.json();
      if (data.response === "False") {
        seterrorMessage(data.error || "failed to fetch movies");
        setmoviesList([]);
        return;
      }
      setmoviesList(data.results);
      // update search count in appwrite
      if (query && data.results.length > 0) {
        updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.log("error fetching movies", error);
      seterrorMessage("error fetching movies");
    } finally {
      setisLoading(false);
    }
  };
  useEffect(() => {
    feachMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern">
        <div className="wrap">
          <header>
            <img src={logo} alt="" className="max-w-[50px] mb-5" />
            <img
              src={heroImage}
              alt="hero banner"
              className="max-w-[400px] mb-5"
            />
            <h1>
              Find <span className="text-gradient">Movies</span> you'll enjoy
              Without Hassle
            </h1>
            <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm} />
          </header>
          {tringingNovies.length > 0 && (
            <section className="trending lg:pl-40 lg:pr-40">
              <h2 className="mt-20 ml-3">Trending Movies</h2>
              <ul>
                {tringingNovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img
                      src={
                        movie?.poster_url && !movie.poster_url.endsWith("null")
                          ? movie.poster_url
                          : noMovie
                      }
                      alt={movie?.title || "Untitled"}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="all-movies lg:pl-40 lg:pr-40">
            <h2 className="ml-3">All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-600">{errorMessage}</p>
            ) : (
              <ul>
                {moviesList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;
