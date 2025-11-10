import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
  try {
    const { status, patientId } = req.query;
    const where: any = {};
    if (status) where.Status = status;
    if (patientId) where.Patient_ID = patientId;

    const bills = await prisma.bill.findMany({
      where,
      include: {
        Patient: true,
        Charges: {
          include: { Chemist: true },
        },
      },
      orderBy: { CreatedAt: 'desc' },
    });

    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get bill by ID
router.get('/:id', async (req, res) => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { Bill_ID: req.params.id },
      include: {
        Patient: true,
        Charges: {
          include: { Chemist: true },
        },
      },
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create bill
router.post('/', async (req, res) => {
  try {
    const { Patient_ID, Patient_Type, Health_Card, Charges } = req.body;

    // Calculate total amount from charges
    let totalAmount = 0;
    if (Charges && Array.isArray(Charges)) {
      totalAmount = Charges.reduce((sum: number, charge: any) => sum + (charge.Amount * (charge.Quantity || 1)), 0);
    }

    const bill = await prisma.bill.create({
      data: {
        Patient_ID,
        Patient_Type,
        Health_Card,
        Amount: totalAmount,
        Charges: {
          create: Charges || [],
        },
      },
      include: {
        Patient: true,
        Charges: true,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(bill.Patient_ID), 'bill:created', bill);
      emitToRoom(io, SocketRooms.ADMIN, 'bill:created', bill);
    }

    res.status(201).json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update bill (e.g., add charges, update payment status)
router.put('/:id', async (req, res) => {
  try {
    const { Status, Payment_Method, Payment_Date, Charges } = req.body;

    const updateData: any = {};
    if (Status) updateData.Status = Status;
    if (Payment_Method) updateData.Payment_Method = Payment_Method;
    if (Payment_Date) updateData.Payment_Date = new Date(Payment_Date);
    if (Status === 'Paid' && !Payment_Date) updateData.Payment_Date = new Date();

    // If charges are updated, recalculate amount
    if (Charges && Array.isArray(Charges)) {
      const totalAmount = Charges.reduce((sum: number, charge: any) => sum + (charge.Amount * (charge.Quantity || 1)), 0);
      updateData.Amount = totalAmount;

      // Delete old charges and create new ones
      await prisma.charges.deleteMany({
        where: { Bill_ID: req.params.id },
      });

      await prisma.charges.createMany({
        data: Charges.map((charge: any) => ({
          ...charge,
          Bill_ID: req.params.id,
        })),
      });
    } else {
      // Recalculate from existing charges
      const existingCharges = await prisma.charges.findMany({
        where: { Bill_ID: req.params.id },
      });
      const totalAmount = existingCharges.reduce((sum, charge) => sum + (charge.Amount * charge.Quantity), 0);
      updateData.Amount = totalAmount;
    }

    const bill = await prisma.bill.update({
      where: { Bill_ID: req.params.id },
      data: updateData,
      include: {
        Patient: true,
        Charges: {
          include: { Chemist: true },
        },
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(bill.Patient_ID), 'bill:updated', bill);
      emitToRoom(io, SocketRooms.ADMIN, 'bill:updated', bill);
    }

    res.json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add charge to bill
router.post('/:id/charges', async (req, res) => {
  try {
    const charge = await prisma.charges.create({
      data: {
        Bill_ID: req.params.id,
        ...req.body,
      },
      include: { Bill: { include: { Patient: true } }, Chemist: true },
    });

    // Update bill amount
    const bill = await prisma.bill.findUnique({
      where: { Bill_ID: req.params.id },
      include: { Charges: true },
    });

    if (bill) {
      const totalAmount = bill.Charges.reduce((sum, c) => sum + (c.Amount * c.Quantity), 0);
      await prisma.bill.update({
        where: { Bill_ID: req.params.id },
        data: { Amount: totalAmount },
      });
    }

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(bill!.Patient_ID), 'bill:charge:added', charge);
    }

    res.status(201).json(charge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





