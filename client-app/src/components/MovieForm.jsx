import axios from "axios";
import { useEffect, useState } from "react";
import { API } from "../api";

const emptyForm = { movieId: "", title: "", genre: "", language: "", duration: "", theatre: "", totalSeats: "" };

function MovieForm({ editMovie, onDone, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);

  // When Edit is clicked in the table, fill the form with that movie
  useEffect(() => {
    setForm(editMovie ? { ...editMovie } : emptyForm);
  }, [editMovie]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new movie or update existing movie
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      movieId: form.movieId.trim(),
      title: form.title.trim(),
      genre: form.genre.trim(),
      language: form.language.trim(),
      duration: Number(form.duration),
      theatre: form.theatre.trim(),
      totalSeats: Number(form.totalSeats),
    };
    const request = editMovie
      ? axios.post(`${API}/movies/update`, { id: editMovie._id, ...data })
      : axios.post(`${API}/movies/addNew`, data);

    request
      .then((res) => {
        onDone(res.data.status);
        if (res.data.status.includes("Successfully")) setForm(emptyForm);
      })
      .catch((err) => onDone(err.message));
  };

  return (
    <div className="card bg-light p-4 mb-4">
      <h3>{editMovie ? `Edit Movie (${editMovie.movieId})` : "Add New Movie"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Movie ID</label>
            <input name="movieId" className="form-control" placeholder="e.g. M101"
              value={form.movieId} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Movie Title</label>
            <input name="title" className="form-control"
              value={form.title} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Genre</label>
            <select name="genre" className="form-select" value={form.genre} onChange={handleChange} required>
              <option value="">Select genre</option>
              {["Action", "Comedy", "Drama", "Thriller", "Horror", "Romance", "Sci-Fi", "Animation"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Language</label>
            <input name="language" className="form-control" placeholder="e.g. Tamil"
              value={form.language} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Duration (minutes)</label>
            <input name="duration" type="number" min="1" className="form-control"
              value={form.duration} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Total Seats</label>
            <input name="totalSeats" type="number" min="1" className="form-control" placeholder="e.g. 100"
              value={form.totalSeats} onChange={handleChange} required />
          </div>
          <div className="col-md-12">
            <label className="form-label">Theatre / Screen</label>
            <input name="theatre" className="form-control" placeholder="e.g. Brookefields Screen 2"
              value={form.theatre} onChange={handleChange} required />
          </div>
        </div>
        <div className="mt-3">
          <button type="submit" className="btn btn-success me-2">
            {editMovie ? "Update Movie" : "Add Movie"}
          </button>
          {editMovie ? (
            <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>Cancel Edit</button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => setForm(emptyForm)}>Clear Form</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MovieForm;
