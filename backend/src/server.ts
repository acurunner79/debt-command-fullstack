import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "DebtCommand",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`DebtCommand API running on port ${PORT}`);
});