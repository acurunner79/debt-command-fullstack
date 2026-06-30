import { Router } from "express";
import {
  archiveBill,
  createBill,
  getBills,
  updateBill,
  updateBillBalance,
} from "../controllers/billController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const billRoutes = Router();

billRoutes.use(requireAuth);

billRoutes.get("/", getBills);
billRoutes.post("/", createBill);
billRoutes.patch("/:id/balance", updateBillBalance);
billRoutes.put("/:id", updateBill);
billRoutes.delete("/:id", archiveBill);