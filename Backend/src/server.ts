import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import candidatesRoutes from "./routes/candidates"; 
import adminRoutes from "./routes/admin";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SB1";

// Middleware
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'https://sb-1-eight.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);





app.use("/api/candidates", candidatesRoutes); 
app.use("/api/admin", adminRoutes); // ✅ Enables /api/admin/data

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);




// Health Check Route
app.get("/", (req, res) => {
  res.send(" Backend is running!");
});

// Start Server
app.listen(PORT, () => console.log(`  Server running on http://localhost:${PORT}`));
