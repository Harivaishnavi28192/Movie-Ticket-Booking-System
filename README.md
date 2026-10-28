# Movie Ticket Booking System

Full stack app: **React JS + Bootstrap** (client-app), **Node.js + Express** (server-app), **MongoDB** (database `movie_ticket_booking`).

## How to run

1. Make sure MongoDB is running (`localhost:27017`).
2. Backend (terminal 1):
   ```
   cd server-app
   npm install
   npm run dev
   ```
   Runs on http://localhost:7000
3. Frontend (terminal 2):
   ```
   cd client-app
   npm install
   npm run dev
   ```
   Open http://localhost:5173

**Developed by:** Christy Vincelet A (URK24CS1199) & Hari Vaishnavi (URK24CS1238)

## Required modules

1. **Add New Movie Details** – movie ID, title, genre, duration, language (plus theatre and total seats)
2. **View All Movies** – table with seats available (shows "Housefull" at 0)
3. **Search Movies** – find movies by title
4. **Book Tickets** – select movie, show date, showtime and number of seats; seats are taken from availability
5. **View Ticket Bookings** – all reservations, filterable by status
6. **Cancel Tickets** – only "Booked" tickets whose show date hasn't passed; cancelling releases the seats

## Features (CRUD)

| Section | Create | Read | Update | Delete |
|---|---|---|---|---|
| Movies | Add New Movie form | View All Movies + search | Edit button → Update Movie | Delete button |
| Bookings | Book Movie Tickets form (auto ID BK1001…) | Track Bookings + status filter | Complete / Cancel | Delete (completed/cancelled) |

## API list

| Method | URL | Purpose |
|---|---|---|
| GET | /api/menu | Seat/snack prices and show times |
| GET | /api/movies/viewAll?search= | List / search movies |
| POST | /api/movies/addNew | Add movie |
| POST | /api/movies/update | Edit movie (`id` + fields) |
| POST | /api/movies/delete | Delete movie (`id`) |
| GET | /api/bookings/viewAll?status= | List / filter bookings |
| POST | /api/bookings/addNew | Book tickets (total is calculated on the server) |
| POST | /api/bookings/updateStatus | Mark Completed / Cancelled |
| POST | /api/bookings/delete | Delete booking (`id`) |
