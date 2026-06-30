import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { authRoutes } from "./routes/authRoutes.js";
import { incomeRoutes } from "./routes/incomeRoutes.js";
import { billRoutes } from "./routes/billRoutes.js";
import { payoffScenarioRoutes } from "./routes/payoffScenarioRoutes.js";
import { paymentRoutes } from "./routes/paymentRoutes.js";

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
app.use("/api/income", incomeRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payoff-scenarios", payoffScenarioRoutes);
app.use("/api/payments", paymentRoutes);


app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`DebtCommand API running on port ${PORT}`);
});