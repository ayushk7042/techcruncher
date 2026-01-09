// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const connectDB = require("./config/db");

// const app = express();
// connectDB();

// app.use(express.json());

// app.use("/api/admin", require("./routes/authRoutes"));
// app.use("/api/category", require("./routes/categoryRoutes"));
// app.use("/api/news", require("./routes/newsRoutes"));
// app.use("/api/homepage", require("./routes/homepageRoutes"));

// /**
//  * 🔥 LIVE USERS (Socket ready)
//  * socket.io can be plugged here directly
//  */
// const server = http.createServer(app);

// server.listen(5000, () =>
//   console.log("🔥 Affiliate News Backend Running on 5000")
// );



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

/* ================== DB ================== */
connectDB();
                  
/* ================== CORS ================== */
app.use(
  cors({
    origin: "http://localhost:5173", // React/Vite frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================== MIDDLEWARE ================== */
app.use(express.json());

/* ================== ROUTES ================== */
app.use("/api/admin", require("./routes/authRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/homepage", require("./routes/homepageRoutes"));

/* ================== SERVER ================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🔥 Affiliate News Backend Running on ${PORT}`)
);
