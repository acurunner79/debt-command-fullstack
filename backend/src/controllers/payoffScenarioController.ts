import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export async function getPayoffScenarios(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const scenarios = await prisma.payoffScenario.findMany({
    where: {
      userId: req.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({ scenarios });
}

export async function createPayoffScenario(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, strategy, extraPayment, includedDebtTypes, isDefault } = req.body;

  if (!name || !strategy || !Array.isArray(includedDebtTypes)) {
    return res.status(400).json({
      message: "Name, strategy, and included debt types are required",
    });
  }

  const scenario = await prisma.payoffScenario.create({
    data: {
      userId: req.userId,
      name: String(name).trim(),
      strategy,
      extraPayment: Number(extraPayment || 0),
      includedDebtTypes: JSON.stringify(includedDebtTypes),
      isDefault: Boolean(isDefault),
    },
  });

  return res.status(201).json({ scenario });
}

export async function deletePayoffScenario(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid scenario id" });
  }

  const existingScenario = await prisma.payoffScenario.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!existingScenario) {
    return res.status(404).json({ message: "Scenario not found" });
  }

  await prisma.payoffScenario.delete({
    where: {
      id,
    },
  });

  return res.json({ scenario: existingScenario });
}

export async function setDefaultPayoffScenario(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid scenario id" });
  }

  const existingScenario = await prisma.payoffScenario.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!existingScenario) {
    return res.status(404).json({ message: "Scenario not found" });
  }

  await prisma.payoffScenario.updateMany({
    where: {
      userId: req.userId,
    },
    data: {
      isDefault: false,
    },
  });

  const scenario = await prisma.payoffScenario.update({
    where: {
      id,
    },
    data: {
      isDefault: true,
    },
  });

  return res.json({ scenario });
}