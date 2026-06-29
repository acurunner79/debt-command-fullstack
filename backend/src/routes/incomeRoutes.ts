import { Router } from "express";
import {
  archiveIncomeSource,
  createIncomeSource,
  getIncomeSources,
  updateIncomeSource,
} from "../controllers/incomeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const incomeRoutes = Router();

incomeRoutes.use(requireAuth);

incomeRoutes.get("/", getIncomeSources);
incomeRoutes.post("/", createIncomeSource);
incomeRoutes.put("/:id", updateIncomeSource);
incomeRoutes.delete("/:id", archiveIncomeSource);