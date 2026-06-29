import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export async function getBills(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bills = await prisma.bill.findMany({
    where: {
      userId: req.userId,
      active: true,
    },
    orderBy: {
      dueDay: "asc",
    },
  });

  return res.json({ bills });
}

export async function createBill(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    name,
    type,
    dueDay,
    balance,
    minimumPayment,
    creditLimit,
    interestRate,
    autopay,
    recurring,
    notes,
  } = req.body;

  if (!name || !type || dueDay === undefined || minimumPayment === undefined) {
    return res.status(400).json({
      message: "Name, type, due day, and minimum payment are required",
    });
  }

  const parsedDueDay = Number(dueDay);

  if (!Number.isInteger(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
    return res.status(400).json({
      message: "Due day must be a number between 1 and 31",
    });
  }

  const bill = await prisma.bill.create({
    data: {
      userId: req.userId,
      name: String(name).trim(),
      type,
      dueDay: parsedDueDay,
      balance: balance ?? null,
      minimumPayment,
      creditLimit: creditLimit ?? null,
      interestRate: interestRate ?? null,
      autopay: Boolean(autopay),
      recurring: recurring === undefined ? true : Boolean(recurring),
      notes: notes ? String(notes).trim() : null,
    },
  });

  return res.status(201).json({ bill });
}

export async function updateBill(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid bill id" });
  }

  const {
    name,
    type,
    dueDay,
    balance,
    minimumPayment,
    creditLimit,
    interestRate,
    autopay,
    recurring,
    notes,
    active,
  } = req.body;

  const existingBill = await prisma.bill.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!existingBill) {
    return res.status(404).json({ message: "Bill not found" });
  }

  const parsedDueDay = dueDay === undefined ? undefined : Number(dueDay);

  if (
    parsedDueDay !== undefined &&
    (!Number.isInteger(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31)
  ) {
    return res.status(400).json({
      message: "Due day must be a number between 1 and 31",
    });
  }

  const bill = await prisma.bill.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(type !== undefined && { type }),
      ...(parsedDueDay !== undefined && { dueDay: parsedDueDay }),
      ...(balance !== undefined && { balance }),
      ...(minimumPayment !== undefined && { minimumPayment }),
      ...(creditLimit !== undefined && { creditLimit }),
      ...(interestRate !== undefined && { interestRate }),
      ...(autopay !== undefined && { autopay: Boolean(autopay) }),
      ...(recurring !== undefined && { recurring: Boolean(recurring) }),
      ...(notes !== undefined && {
        notes: notes ? String(notes).trim() : null,
      }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return res.json({ bill });
}

export async function archiveBill(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid bill id" });
  }

  const existingBill = await prisma.bill.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!existingBill) {
    return res.status(404).json({ message: "Bill not found" });
  }

  const bill = await prisma.bill.update({
    where: { id },
    data: {
      active: false,
    },
  });

  return res.json({ bill });
}