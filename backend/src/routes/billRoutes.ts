import { Router } from "express";
import {
  archiveBill,
  createBill,
  getBills,
  updateBill,
} from "../controllers/billController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const billRoutes = Router();

billRoutes.use(requireAuth);

billRoutes.get("/", getBills);
billRoutes.post("/", createBill);
billRoutes.put("/:id", updateBill);
billRoutes.delete("/:id", archiveBill);