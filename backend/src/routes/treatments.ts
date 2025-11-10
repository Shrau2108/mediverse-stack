import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all treatments
router.get('/', async (req, res) => {
  try {
    const { doctorId, patientId, status } = req.query;
    const where: any = {};
    if (doctorId) where.Doctor_ID = doctorId;
    if (patientId) where.Patient_ID = patientId;
    if (status) where.Status = status;

    const treatments = await prisma.treatment.findMany({
      where,
      include: {
        Doctor: true,
        Patient: true,
      },
      orderBy: { Treatment_Date: 'desc' },
    });

    res.json(treatments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get treatment by ID
router.get('/:id', async (req, res) => {
  try {
    const treatment = await prisma.treatment.findUnique({
      where: { Treatment_ID: req.params.id },
      include: {
        Doctor: true,
        Patient: {
          include: {
            LabReports: {
              orderBy: { Date: 'desc' },
            },
            Prescriptions: {
              orderBy: { CreatedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    res.json(treatment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create treatment
router.post('/', async (req, res) => {
  try {
    const { Doctor_ID, Patient_ID, Diagnosis, Prescription_Notes, Follow_Up_Date } = req.body;

    const treatment = await prisma.treatment.create({
      data: {
        Doctor_ID,
        Patient_ID,
        Diagnosis,
        Prescription_Notes,
        Follow_Up_Date: Follow_Up_Date ? new Date(Follow_Up_Date) : null,
      },
      include: {
        Doctor: true,
        Patient: true,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(Patient_ID), 'treatment:created', treatment);
      emitToRoom(io, SocketRooms.DOCTOR(Doctor_ID), 'treatment:created', treatment);
    }

    res.status(201).json(treatment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update treatment (e.g., discharge patient)
router.put('/:id', async (req, res) => {
  try {
    const { Diagnosis, Prescription_Notes, Status, Discharge_Date, Follow_Up_Date } = req.body;

    const updateData: any = {};
    if (Diagnosis !== undefined) updateData.Diagnosis = Diagnosis;
    if (Prescription_Notes !== undefined) updateData.Prescription_Notes = Prescription_Notes;
    if (Status) updateData.Status = Status;
    if (Discharge_Date) updateData.Discharge_Date = new Date(Discharge_Date);
    if (Follow_Up_Date !== undefined) updateData.Follow_Up_Date = Follow_Up_Date ? new Date(Follow_Up_Date) : null;

    const treatment = await prisma.treatment.update({
      where: { Treatment_ID: req.params.id },
      data: updateData,
      include: {
        Doctor: true,
        Patient: true,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(treatment.Patient_ID), 'treatment:updated', treatment);
      emitToRoom(io, SocketRooms.DOCTOR(treatment.Doctor_ID), 'treatment:updated', treatment);
      
      if (treatment.Status === 'Discharged') {
        emitToRoom(io, SocketRooms.ADMIN, 'patient:discharged', treatment);
      }
    }

    res.json(treatment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





