require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const bookingRoutes = require("./routes/bookingRoutes");

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/bookings", bookingRoutes);

// Local development only
if (process.env.NODE_ENV !== "production") {
    const port = 6969;

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = app;