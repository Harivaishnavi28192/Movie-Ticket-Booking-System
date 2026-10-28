import axios from "axios";
import { useEffect, useState } from "react";
import { API } from "./api";
import MovieForm from "./components/MovieForm";
import MovieList from "./components/MovieList";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [editMovie, setEditMovie] = useState(null); // movie currently being edited
  const [message, setMessage] = useState(null);
  const [refreshBookings, setRefreshBookings] = useState(0); // bump to reload bookings

  // Display all movies when the page loads
  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = (searchText = search) => {
    axios.get(`${API}/movies/viewAll`, { params: { search: searchText } })
      .then((res) => setMovies(res.data))
      .catch(() => setMessage("Cannot reach server. Is it running on port 7000?"));
  };

  // Delete movie
  const deleteMovie = (id) => {
    if (!window.confirm("Delete this movie?")) return;
    axios.post(`${API}/movies/delete`, { id })
      .then((res) => {
        setMessage(res.data.status);
        loadMovies();
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="container py-4">
      <h1 className="text-success fw-semibold mb-1">🎬 Movie Ticket Booking System</h1>
      <p className="text-muted mb-4">
        Developed by: Christy Vincelet A (URK24CS1199) &amp; Hari Vaishnavi (URK24CS1238)
      </p>

      {message && (
        <div className="alert alert-info alert-dismissible">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      <MovieForm
        editMovie={editMovie}
        onDone={(msg) => { setMessage(msg); setEditMovie(null); loadMovies(); }}
        onCancelEdit={() => setEditMovie(null)}
      />

      <MovieList
        movies={movies}
        search={search}
        setSearch={setSearch}
        onSearch={() => loadMovies()}
        onEdit={(movie) => { setEditMovie(movie); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        onDelete={deleteMovie}
      />

      <hr className="my-4" />

      <BookingForm
        movies={movies}
        onBooked={(msg) => { setMessage(msg); setRefreshBookings(refreshBookings + 1); loadMovies(); }}
      />

      <BookingList refresh={refreshBookings} setMessage={setMessage} onSeatsChanged={() => loadMovies()} />

      <footer className="text-center text-muted border-top pt-3">
        Movie Ticket Booking System · React JS, Node.js, Express.js &amp; MongoDB
      </footer>
    </div>
  );
}

export default App;
