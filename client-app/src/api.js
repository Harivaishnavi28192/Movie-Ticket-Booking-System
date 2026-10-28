// Base URL of the Node JS + Express server
export const API = "http://localhost:7000/api";

// Today's date as YYYY-MM-DD in local time
export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
