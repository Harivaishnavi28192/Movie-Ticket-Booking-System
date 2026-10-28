function MovieList({ movies, search, setSearch, onSearch, onEdit, onDelete }) {
  return (
    <div className="mb-4">
      <h3>View All Movies</h3>
      <form className="input-group mb-3" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
        <input className="form-control" placeholder="Search movies by title"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Movie ID</th>
              <th>Title</th>
              <th>Genre</th>
              <th>Language</th>
              <th>Duration</th>
              <th>Theatre</th>
              <th>Seats Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">No Movies Found</td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie._id}>
                  <td>{movie.movieId}</td>
                  <td>{movie.title}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.language}</td>
                  <td>{movie.duration} min</td>
                  <td>{movie.theatre}</td>
                  <td>
                    <span className={`badge bg-${movie.availableSeats === 0 ? "danger" : "success"}`}>
                      {movie.availableSeats === 0 ? "Housefull" : `${movie.availableSeats} / ${movie.totalSeats}`}
                    </span>
                  </td>
                  <td className="text-nowrap">
                    <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => onEdit(movie)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(movie._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MovieList;
