import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all prescriptions
router.get('/', async (req, res) => {
  try {
    const { status, doctorId, patientId, shopId } = req.query;
    const where: any = {};
    if (status) where.Status = status;
    if (doctorId) where.Doctor_ID = doctorId;
    if (patientId) where.Patient_ID = patientId;
    if (shopId) where.Shop_ID = shopId;

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        Doctor: true,
        Patient: true,
        Chemist: true,
      },
      orderBy: { CreatedAt: 'desc' },
    });

    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { Prescription_ID: req.params.id },
      include: {
        Doctor: true,
        Patient: true,
        Chemist: true,
      },
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create prescription (from doctor)
router.post('/', async (req, res) => {
  try {
    const {
      Doctor_ID,
      Patient_ID,
      Shop_ID,
      Medicine_Name,
      Dosage,
      Frequency,
      Duration,
      Quantity,
    } = req.body;

    const prescription = await prisma.prescription.create({
      data: {
        Doctor_ID,
        Patient_ID,
        Shop_ID,
        Medicine_Name,
        Dosage,
        Frequency,
        Duration,
        Quantity,
      },
      include: {
        Doctor: true,
        Patient: true,
        Chemist: true,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(Patient_ID), 'prescription:created', prescription);
      if (Shop_ID) {
        emitToRoom(io, SocketRooms.CHEMIST(Shop_ID), 'prescription:created', prescription);
      }
      emitToRoom(io, SocketRooms.DOCTOR(Doctor_ID), 'prescription:created', prescription);
    }

    res.status(201).json(prescription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update prescription
router.put('/:id', async (req, res) => {
  try {
    const { Status, Dispensed_Date, Shop_ID } = req.body;

    const updateData: any = {};
    if (Status) updateData.Status = Status;
    if (Dispensed_Date) updateData.Dispensed_Date = new Date(Dispensed_Date);
    if (Shop_ID !== undefined) updateData.Shop_ID = Shop_ID;
    if (Status === 'Dispensed' && !Dispensed_Date) {
      updateData.Dispensed_Date = new Date();
    }

    const prescription = await prisma.prescription.update({
      where: { Prescription_ID: req.params.id },
      data: updateData,
      include: {
        Doctor: true,
        Patient: true,
        Chemist: true,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(prescription.Patient_ID), 'prescription:updated', prescription);
      if (prescription.Shop_ID) {
        emitToRoom(io, SocketRooms.CHEMIST(prescription.Shop_ID), 'prescription:updated', prescription);
      }
    }

    res.json(prescription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





