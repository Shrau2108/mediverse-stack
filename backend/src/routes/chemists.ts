import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all chemists
router.get('/', async (req, res) => {
  try {
    const chemists = await prisma.chemist.findMany({
      include: {
        Prescriptions: {
          where: { Status: 'Pending' },
          include: { Patient: true, Doctor: true },
          orderBy: { CreatedAt: 'desc' },
        },
      },
      orderBy: { Name: 'asc' },
    });

    res.json(chemists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chemist by ID
router.get('/:id', async (req, res) => {
  try {
    const chemist = await prisma.chemist.findUnique({
      where: { Shop_ID: req.params.id },
      include: {
        Prescriptions: {
          include: { Patient: true, Doctor: true },
          orderBy: { CreatedAt: 'desc' },
        },
        Charges: {
          include: { Bill: { include: { Patient: true } } },
          orderBy: { CreatedAt: 'desc' },
        },
      },
    });

    if (!chemist) {
      return res.status(404).json({ error: 'Chemist not found' });
    }

    res.json(chemist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending prescriptions for chemist
router.get('/:id/prescriptions/pending', async (req, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        Shop_ID: req.params.id,
        Status: 'Pending',
      },
      include: {
        Patient: true,
        Doctor: true,
      },
      orderBy: { CreatedAt: 'desc' },
    });

    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update prescription status (dispense medicine)
router.put('/prescriptions/:prescriptionId/dispense', async (req, res) => {
  try {
    const prescription = await prisma.prescription.update({
      where: { Prescription_ID: req.params.prescriptionId },
      data: {
        Status: 'Dispensed',
        Dispensed_Date: new Date(),
      },
      include: {
        Patient: true,
        Doctor: true,
        Chemist: true,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(prescription.Patient_ID), 'prescription:dispensed', prescription);
      emitToRoom(io, SocketRooms.DOCTOR(prescription.Doctor_ID), 'prescription:dispensed', prescription);
      if (prescription.Shop_ID) {
        emitToRoom(io, SocketRooms.CHEMIST(prescription.Shop_ID), 'prescription:dispensed', prescription);
      }
    }

    res.json(prescription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create chemist
router.post('/', async (req, res) => {
  try {
    const { Name, Phone_No, Email, Address } = req.body;

    const chemist = await prisma.chemist.create({
      data: {
        Name,
        Phone_No,
        Email,
        Address,
      },
    });

    res.status(201).json(chemist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





