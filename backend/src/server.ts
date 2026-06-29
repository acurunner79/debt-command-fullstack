import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { authRoutes } from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "DebtCommand",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`DebtCommand API running on port ${PORT}`);
});