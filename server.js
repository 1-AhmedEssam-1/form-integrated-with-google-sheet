require("dotenv").config();
const express = require("express");
const app = express();
const port = 6969;
const path = require("path")
const bookingRoutes = require("./routes/bookingRoutes");
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/bookings",bookingRoutes);


app.listen(port,() => {
  console.log("all this is working u can visit in ");
  console.log(`http://localhost:${port} `)
}
)
