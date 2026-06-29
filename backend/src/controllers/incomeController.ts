import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export async function getIncomeSources(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const incomeSources = await prisma.incomeSource.findMany({
    where: {
      userId: req.userId,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({ incomeSources });
}

export async function createIncomeSource(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, amount, frequency, notes } = req.body;

  if (!name || amount === undefined || !frequency) {
    return res.status(400).json({
      message: "Name, amount, and frequency are required",
    });
  }

  const incomeSource = await prisma.incomeSource.create({
    data: {
      userId: req.userId,
      name: String(name).trim(),
      amount,
      frequency,
      notes: notes ? String(notes).trim() : null,
    },
  });

  return res.status(201).json({ incomeSource });
}

export async function updateIncomeSource(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

    if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid income source id" });
    }
  const { name, amount, frequency, notes, active } = req.body;

  const existingIncomeSource = await prisma.incomeSource.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!existingIncomeSource) {
    return res.status(404).json({ message: "Income source not found" });
  }

  const incomeSource = await prisma.incomeSource.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(amount !== undefined && { amount }),
      ...(frequency !== undefined && { frequency }),
      ...(notes !== undefined && {
        notes: notes ? String(notes).trim() : null,
      }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return res.json({ incomeSource });
}

export async function archiveIncomeSource(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid income source id" });
  }

  const existingIncomeSource = await prisma.incomeSource.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!existingIncomeSource) {
    return res.status(404).json({ message: "Income source not found" });
  }

  const incomeSource = await prisma.incomeSource.update({
    where: { id },
    data: {
      active: false,
    },
  });

  return res.json({ incomeSource });
}