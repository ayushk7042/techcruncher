


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const contactRoutes = require("./routes/contactRoutes");
/* ================== DB ================== */
connectDB();
                  
/* ================== CORS ================== */
app.use(
  cors({
    origin:   process.env.FRONTEND_URL ,// React/Vite frontend
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
// server.js
//app.use("/api/contact", require("./routes/contactRoutes"));

app.use("/api/contact", contactRoutes);

/* ================== SERVER ================== */
const PORT = process.env.PORT ;
app.listen(PORT, () =>
  console.log(`🔥 Affiliate News Backend Running on ${PORT}`)
);
