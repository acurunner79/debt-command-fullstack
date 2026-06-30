import { Router } from "express";
import {
  createPayoffScenario,
  deletePayoffScenario,
  getPayoffScenarios,
} from "../controllers/payoffScenarioController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const payoffScenarioRoutes = Router();

payoffScenarioRoutes.use(requireAuth);

payoffScenarioRoutes.get("/", getPayoffScenarios);
payoffScenarioRoutes.post("/", createPayoffScenario);
payoffScenarioRoutes.delete("/:id", deletePayoffScenario);