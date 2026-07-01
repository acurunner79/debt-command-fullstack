import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getPayments,
  updatePayment
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const paymentRoutes = Router();

paymentRoutes.use(requireAuth);

paymentRoutes.get("/", getPayments);
paymentRoutes.post("/", createPayment);
paymentRoutes.patch("/:id", updatePayment);
paymentRoutes.delete("/:id", deletePayment);