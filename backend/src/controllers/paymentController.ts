import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export async function getPayments(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payments = await prisma.payment.findMany({
    where: {
      userId: req.userId,
    },
    include: {
      bill: true,
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return res.json({ payments });
}

export async function createPayment(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { billId, month, year, amountPaid, paymentDate, status, notes } =
    req.body;

  if (!billId || month === undefined || year === undefined || amountPaid === undefined) {
    return res.status(400).json({
      message: "Bill, month, year, and amount paid are required",
    });
  }

  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const parsedAmount = Number(amountPaid);

  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res.status(400).json({ message: "Month must be between 1 and 12" });
  }

  if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
    return res.status(400).json({ message: "Year must be valid" });
  }

  if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
    return res.status(400).json({ message: "Amount paid must be valid" });
  }

  const bill = await prisma.bill.findFirst({
    where: {
      id: billId,
      userId: req.userId,
      active: true,
    },
  });

  if (!bill) {
    return res.status(404).json({ message: "Bill not found" });
  }

  const payment = await prisma.payment.upsert({
    where: {
      billId_month_year: {
        billId,
        month: parsedMonth,
        year: parsedYear,
      },
    },
    create: {
      userId: req.userId,
      billId,
      month: parsedMonth,
      year: parsedYear,
      amountPaid: parsedAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: status || "PAID",
      notes: notes ? String(notes).trim() : null,
    },
    update: {
      amountPaid: parsedAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: status || "PAID",
      notes: notes ? String(notes).trim() : null,
    },
    include: {
      bill: true,
    },
  });

  return res.status(201).json({ payment });
}

export async function deletePayment(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid payment id" });
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!existingPayment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  await prisma.payment.delete({
    where: {
      id,
    },
  });

  return res.json({ payment: existingPayment });
}