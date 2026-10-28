const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // for parsing JSON data

// ---------------- MongoDB Connection ----------------
mongoose.connect("mongodb://127.0.0.1:27017/movie_ticket_booking")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// ---------------- Schemas and Models ----------------
const movieSchema = new mongoose.Schema({
  movieId: { type: String, required: true, unique: true }, // avoid duplicates
  title: { type: String, required: true },
  genre: { type: String, required: true },
  language: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  theatre: { type: String, required: true },
  totalSeats: { type: Number, required: true, min: 1 },
  availableSeats: { type: Number, required: true, min: 0 }
});
const Movie = mongoose.model("Movie", movieSchema, "movies");

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  movieRef: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  movieId: { type: String, required: true },
  movieTitle: { type: String, required: true },
  seats: { type: Number, required: true },
  theatre: { type: String, required: true },
  showDate: { type: String, required: true },
  showTime: { type: String, required: true },
  items: [{ name: String, price: Number, qty: Number }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Booked", "Completed", "Cancelled"], default: "Booked" }
}, { timestamps: true });
const Booking = mongoose.model("Booking", bookingSchema, "bookings");

// Ticket and snack price list (kept on the server so the bill can't be changed from the browser)
const menu = [
  { name: "Silver Seat", price: 150 },
  { name: "Gold Seat", price: 200 },
  { name: "Platinum Seat", price: 300 },
  { name: "Popcorn Combo", price: 180 },
  { name: "Cold Drink", price: 80 },
  { name: "Nachos", price: 120 }
];
const showTimes = ["10:00 AM", "01:30 PM", "05:00 PM", "09:00 PM"];

// Today's date as YYYY-MM-DD (local time), used to check show dates
const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Create API for the URL "/"
app.get("/", (req, res) => {
  res.send("Movie Ticket Booking API is running");
});

// API to get price list and show times
app.get("/api/menu", (req, res) => {
  res.json({ menu, showTimes });
});

// ======================= MOVIE APIs (CRUD) =======================

// READ - view all movies (optional search by title)
app.get("/api/movies/viewAll", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    let filter = {};
    if (search) {
      // escape special characters so the text is matched as typed
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter = { title: regex };
    }
    const movies = await Movie.find(filter).sort({ movieId: 1 });
    res.send(movies);
  } catch (err) {
    res.status(500).json({ status: err.message });
  }
});

// CREATE - add a new movie
app.post("/api/movies/addNew", async (req, res) => {
  try {
    // a new movie starts with all seats available
    const newMovie = new Movie({ ...req.body, availableSeats: req.body.totalSeats });
    await newMovie.save();
    res.json({ status: "Movie Added Successfully" });
  } catch (err) {
    if (err.code == 11000) {
      // handle duplicate error
      res.json({ status: `${req.body.movieId} already exists` });
    } else {
      res.json({ status: err.message });
    }
  }
});

// UPDATE - edit a movie using its _id
app.post("/api/movies/update", async (req, res) => {
  const { id, availableSeats, ...data } = req.body;
  try {
    const movie = await Movie.findById(id);
    if (!movie) return res.json({ status: "Movie not found" });

    // keep already-booked seats booked when total seats change
    const bookedSeats = movie.totalSeats - movie.availableSeats;
    if (data.totalSeats < bookedSeats) {
      return res.json({ status: `Total seats cannot be less than ${bookedSeats} (already booked)` });
    }
    data.availableSeats = data.totalSeats - bookedSeats;

    await Movie.findByIdAndUpdate(id, data, { runValidators: true });
    // keep the movie title shown in bookings up to date
    await Booking.updateMany({ movieRef: id }, { movieId: data.movieId, movieTitle: data.title, theatre: data.theatre });
    res.json({ status: "Movie Updated Successfully" });
  } catch (err) {
    if (err.code == 11000) {
      res.json({ status: `${data.movieId} already exists` });
    } else {
      res.json({ status: err.message });
    }
  }
});

// DELETE - remove a movie using its _id
app.post("/api/movies/delete", async (req, res) => {
  const { id } = req.body;
  try {
    await Movie.findByIdAndDelete(id);
    res.json({ status: "Movie Deleted Successfully" });
  } catch (err) {
    res.json({ status: "Error deleting movie" });
  }
});

// ======================= BOOKING APIs (CRUD) =======================

// READ - view all bookings (optional filter by status)
app.get("/api/bookings/viewAll", async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.send(bookings);
  } catch (err) {
    res.status(500).json({ status: err.message });
  }
});

// CREATE - book tickets
app.post("/api/bookings/addNew", async (req, res) => {
  try {
    const { customerName, phone, movieId, showDate, showTime, quantities } = req.body;

    if (!showTimes.includes(showTime)) return res.json({ status: "Please select a valid showtime" });
    if (!showDate || showDate < todayString()) return res.json({ status: "Show date cannot be in the past" });

    // Build the items list and total from the server price list
    const items = menu
      .map(m => ({ name: m.name, price: m.price, qty: Math.max(0, parseInt(quantities?.[m.name]) || 0) }))
      .filter(i => i.qty > 0);
    const seats = items.filter(i => i.name.endsWith("Seat")).reduce((s, i) => s + i.qty, 0);
    if (seats === 0) return res.json({ status: "Please select at least one seat" });
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Reserve seats: only succeeds if enough seats are still available
    const movie = await Movie.findOneAndUpdate(
      { movieId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { returnDocument: "after" }
    );
    if (!movie) {
      const exists = await Movie.findOne({ movieId });
      if (!exists) return res.json({ status: "Please select a valid movie" });
      return res.json({ status: `Only ${exists.availableSeats} seats available for ${exists.title}` });
    }

    try {
      // Generate next booking ID: BK1001, BK1002, ...
      const last = await Booking.findOne({ bookingId: /^BK\d+$/ }).sort({ createdAt: -1 });
      const nextNumber = last ? parseInt(last.bookingId.slice(2)) + 1 : 1001;

      const booking = new Booking({
        bookingId: "BK" + nextNumber,
        customerName, phone,
        movieRef: movie._id,
        movieId: movie.movieId,
        movieTitle: movie.title,
        theatre: movie.theatre,
        seats, showDate, showTime, items, totalAmount
      });
      await booking.save();
      res.json({ status: `Booking ${booking.bookingId} confirmed! ${seats} seat(s), Total: Rs. ${totalAmount}` });
    } catch (err) {
      // booking failed, so give the seats back
      await Movie.findByIdAndUpdate(movie._id, { $inc: { availableSeats: seats } });
      throw err;
    }
  } catch (err) {
    res.json({ status: err.message });
  }
});

// UPDATE - change booking status (Completed / Cancelled)
// Only "Booked" tickets are eligible. Cancelling also needs a show date that has not passed,
// and it returns the seats to the movie.
app.post("/api/bookings/updateStatus", async (req, res) => {
  const { id, status } = req.body;
  try {
    if (!["Completed", "Cancelled"].includes(status)) return res.json({ status: "Invalid status" });

    const filter = { _id: id, status: "Booked" };
    if (status === "Cancelled") filter.showDate = { $gte: todayString() };

    const booking = await Booking.findOneAndUpdate(filter, { status });
    if (!booking) {
      return res.json({ status: status === "Cancelled"
        ? "This booking is not eligible for cancellation"
        : "Only booked tickets can be marked as completed" });
    }

    if (status === "Cancelled") {
      await Movie.findByIdAndUpdate(booking.movieRef, { $inc: { availableSeats: booking.seats } });
      return res.json({ status: `Booking ${booking.bookingId} cancelled. ${booking.seats} seat(s) released` });
    }
    res.json({ status: `Booking ${booking.bookingId} marked as Completed` });
  } catch (err) {
    res.json({ status: "Error updating booking" });
  }
});

// DELETE - remove a booking (if it was still active, its seats are released)
app.post("/api/bookings/delete", async (req, res) => {
  const { id } = req.body;
  try {
    const booking = await Booking.findByIdAndDelete(id);
    if (booking && booking.status === "Booked") {
      await Movie.findByIdAndUpdate(booking.movieRef, { $inc: { availableSeats: booking.seats } });
    }
    res.json({ status: "Booking Deleted Successfully" });
  } catch (err) {
    res.json({ status: "Error deleting booking" });
  }
});

// Start server
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
