import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getPayments,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const paymentRoutes = Router();

paymentRoutes.use(requireAuth);

paymentRoutes.get("/", getPayments);
paymentRoutes.post("/", createPayment);
paymentRoutes.delete("/:id", deletePayment);