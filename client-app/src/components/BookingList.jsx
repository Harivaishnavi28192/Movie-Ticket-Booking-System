import axios from "axios";
import { useEffect, useState } from "react";
import { API, todayString } from "../api";

const statusColor = { Booked: "primary", Completed: "success", Cancelled: "danger" };

// A ticket can be cancelled only while it is "Booked" and the show date has not passed
const canCancel = (b) => b.status === "Booked" && b.showDate >= todayString();

function BookingList({ refresh, setMessage, onSeatsChanged }) {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");

  const loadBookings = () => {
    axios.get(`${API}/bookings/viewAll`, { params: status ? { status } : {} })
      .then((res) => setBookings(res.data))
      .catch((err) => console.log(err));
  };

  // Reload whenever a new booking is placed
  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const updateStatus = (id, newStatus) => {
    if (newStatus === "Cancelled" && !window.confirm("Cancel this ticket? The seats will be released.")) return;
    axios.post(`${API}/bookings/updateStatus`, { id, status: newStatus })
      .then((res) => { setMessage(res.data.status); loadBookings(); onSeatsChanged(); });
  };

  const deleteBooking = (id) => {
    if (!window.confirm("Delete this booking record?")) return;
    axios.post(`${API}/bookings/delete`, { id })
      .then((res) => { setMessage(res.data.status); loadBookings(); onSeatsChanged(); });
  };

  return (
    <div className="mb-5">
      <h3>Track Bookings</h3>
      <div className="input-group mb-3">
        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option>Booked</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <button className="btn btn-primary" onClick={loadBookings}>View Bookings</button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Movie</th>
              <th>Show</th>
              <th>Seats</th>
              <th>Seats & Snacks</th>
              <th>Total (Rs.)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">No Bookings Yet</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookingId}</td>
                  <td>{b.customerName}<br /><small className="text-muted">{b.phone}</small></td>
                  <td>{b.movieTitle}<br /><small className="text-muted">{b.theatre}</small></td>
                  <td className="text-nowrap">{b.showDate}<br /><small className="text-muted">{b.showTime}</small></td>
                  <td>{b.seats}</td>
                  <td>{b.items.map((i) => `${i.name} x ${i.qty}`).join(", ")}</td>
                  <td>{b.totalAmount}</td>
                  <td><span className={`badge bg-${statusColor[b.status]}`}>{b.status}</span></td>
                  <td className="text-nowrap">
                    {b.status === "Booked" ? (
                      <>
                        <button className="btn btn-outline-success btn-sm me-1" onClick={() => updateStatus(b._id, "Completed")}>Complete</button>
                        {canCancel(b) && (
                          <button className="btn btn-outline-warning btn-sm" onClick={() => updateStatus(b._id, "Cancelled")}>Cancel Ticket</button>
                        )}
                      </>
                    ) : (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => deleteBooking(b._id)}>Delete</button>
                    )}
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

export default BookingList;
