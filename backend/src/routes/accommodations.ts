import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all accommodations
router.get('/', async (req, res) => {
  try {
    const { status, patientId, roomNo } = req.query;
    const where: any = {};
    if (status) where.Status = status;
    if (patientId) where.Patient_ID = patientId;
    if (roomNo) where.Room_No = roomNo;

    const accommodations = await prisma.accommodation.findMany({
      where,
      include: {
        Patient: true,
        Room: true,
      },
      orderBy: { Check_In_Date: 'desc' },
    });

    res.json(accommodations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active accommodations
router.get('/active', async (req, res) => {
  try {
    const accommodations = await prisma.accommodation.findMany({
      where: { Status: 'Active' },
      include: {
        Patient: true,
        Room: true,
      },
      orderBy: { Check_In_Date: 'desc' },
    });

    res.json(accommodations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create accommodation (assign room to patient)
router.post('/', async (req, res) => {
  try {
    const { Patient_ID, Room_No, Daily_Rate } = req.body;

    // Check if room is available
    const room = await prisma.room.findUnique({
      where: { Room_No },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.Status !== 'Available') {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Check if patient already has active accommodation
    const existingAccommodation = await prisma.accommodation.findFirst({
      where: {
        Patient_ID,
        Status: 'Active',
      },
    });

    if (existingAccommodation) {
      return res.status(400).json({ error: 'Patient already has an active accommodation' });
    }

    // Create accommodation
    const accommodation = await prisma.accommodation.create({
      data: {
        Patient_ID,
        Room_No,
        Daily_Rate: Daily_Rate || 0,
      },
      include: {
        Patient: true,
        Room: true,
      },
    });

    // Update room status
    await prisma.room.update({
      where: { Room_No },
      data: { Status: 'Occupied' },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(Patient_ID), 'accommodation:created', accommodation);
      emitToRoom(io, SocketRooms.ADMIN, 'accommodation:created', accommodation);
    }

    res.status(201).json(accommodation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check out patient (end accommodation)
router.put('/:id/checkout', async (req, res) => {
  try {
    const accommodation = await prisma.accommodation.findUnique({
      where: { Accommodation_ID: req.params.id },
      include: { Room: true },
    });

    if (!accommodation) {
      return res.status(404).json({ error: 'Accommodation not found' });
    }

    // Calculate total charges
    const checkIn = new Date(accommodation.Check_In_Date);
    const checkOut = new Date();
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalCharge = days * accommodation.Daily_Rate;

    // Update accommodation
    const updated = await prisma.accommodation.update({
      where: { Accommodation_ID: req.params.id },
      data: {
        Status: 'Checked Out',
        Check_Out_Date: checkOut,
      },
      include: {
        Patient: true,
        Room: true,
      },
    });

    // Free up the room
    await prisma.room.update({
      where: { Room_No: accommodation.Room_No },
      data: { Status: 'Available' },
    });

    // Create or update bill with room charges
    const bill = await prisma.bill.findFirst({
      where: {
        Patient_ID: accommodation.Patient_ID,
        Status: { in: ['Pending', 'Partial'] },
      },
    });

    if (bill) {
      // Add room charge to existing bill
      await prisma.charges.create({
        data: {
          Bill_ID: bill.Bill_ID,
          Charge_Type: 'Room',
          Description: `Room ${accommodation.Room_No} - ${days} days`,
          Amount: totalCharge,
          Quantity: days,
        },
      });

      // Recalculate bill total
      const charges = await prisma.charges.findMany({
        where: { Bill_ID: bill.Bill_ID },
      });
      const totalAmount = charges.reduce((sum, c) => sum + (c.Amount * c.Quantity), 0);
      await prisma.bill.update({
        where: { Bill_ID: bill.Bill_ID },
        data: { Amount: totalAmount },
      });
    }

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(accommodation.Patient_ID), 'accommodation:checked-out', updated);
      emitToRoom(io, SocketRooms.ADMIN, 'accommodation:checked-out', updated);
    }

    res.json({ ...updated, totalRoomCharge: totalCharge, days });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





