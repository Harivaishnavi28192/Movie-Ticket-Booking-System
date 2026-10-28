import axios from "axios";
import { useEffect, useState } from "react";
import { API, todayString } from "../api";

const today = todayString();
const emptyForm = { customerName: "", phone: "", movieId: "", showDate: today, showTime: "" };

function BookingForm({ movies, onBooked }) {
  const [menu, setMenu] = useState([]);
  const [showTimes, setShowTimes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [quantities, setQuantities] = useState({});

  // Load seat/snack prices and show times from the server
  useEffect(() => {
    axios.get(`${API}/menu`)
      .then((res) => { setMenu(res.data.menu); setShowTimes(res.data.showTimes); })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const total = menu.reduce((sum, item) => sum + item.price * (parseInt(quantities[item.name]) || 0), 0);
  const seatCount = menu
    .filter((item) => item.name.endsWith("Seat"))
    .reduce((sum, item) => sum + (parseInt(quantities[item.name]) || 0), 0);
  const selectedMovie = movies.find((m) => m.movieId === form.movieId);
  const tooManySeats = selectedMovie && seatCount > selectedMovie.availableSeats;

  const bookTickets = (event) => {
    event.preventDefault();
    axios.post(`${API}/bookings/addNew`, { ...form, quantities })
      .then((res) => {
        onBooked(res.data.status);
        if (res.data.status.startsWith("Booking")) {
          setForm(emptyForm);
          setQuantities({});
        }
      })
      .catch((err) => onBooked(err.message));
  };

  return (
    <div className="card bg-light p-4 mb-4">
      <h3>Book Movie Tickets</h3>
      <form onSubmit={bookTickets}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Customer Name</label>
            <input name="customerName" className="form-control"
              value={form.customerName} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone Number</label>
            <input name="phone" className="form-control" pattern="[0-9]{10}" title="Enter a 10 digit phone number"
              value={form.phone} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Movie</label>
            <select name="movieId" className="form-select" value={form.movieId} onChange={handleChange} required>
              <option value="">Select movie</option>
              {movies.map((m) => (
                <option key={m._id} value={m.movieId} disabled={m.availableSeats === 0}>
                  {m.title} ({m.language}) - {m.theatre} - {m.availableSeats === 0 ? "Housefull" : `${m.availableSeats} seats left`}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Show Date</label>
            <input name="showDate" type="date" min={today} className="form-control"
              value={form.showDate} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Showtime</label>
            <select name="showTime" className="form-select" value={form.showTime} onChange={handleChange} required>
              <option value="">Select time</option>
              {showTimes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>Seat / Snack</th>
                <th>Price (Rs.)</th>
                <th style={{ width: "140px" }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    <input type="number" min="0" max="20" className="form-control form-control-sm"
                      value={quantities[item.name] || ""}
                      onChange={(e) => setQuantities({ ...quantities, [item.name]: e.target.value })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h5>Number of Seats: {seatCount}</h5>
        {tooManySeats && (
          <div className="text-danger mb-2">Only {selectedMovie.availableSeats} seats available for this movie.</div>
        )}
        <h5>Total Bill: Rs. {total}</h5>
        <button type="submit" className="btn btn-success mt-2" disabled={seatCount === 0 || tooManySeats}>
          Book Tickets
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
