import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { specialty } = req.query;
    const where: any = {};
    if (specialty) where.Specialty = specialty;

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        Patients: {
          take: 5,
          orderBy: { CreatedAt: 'desc' },
        },
      },
      orderBy: { Name: 'asc' },
    });

    res.json(doctors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { Doctor_ID: req.params.id },
      include: {
        Patients: {
          include: {
            Treatments: {
              where: { Doctor_ID: req.params.id },
              orderBy: { Treatment_Date: 'desc' },
              take: 5,
            },
            Accommodations: {
              where: { Status: 'Active' },
              include: { Room: true },
            },
          },
        },
        Treatments: {
          include: { Patient: true },
          orderBy: { Treatment_Date: 'desc' },
          take: 10,
        },
        Prescriptions: {
          include: { Patient: true },
          orderBy: { CreatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor's assigned patients
router.get('/:id/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { Dr_ID: req.params.id },
      include: {
        Treatments: {
          where: { Doctor_ID: req.params.id },
          orderBy: { Treatment_Date: 'desc' },
          take: 1,
        },
        Accommodations: {
          where: { Status: 'Active' },
          include: { Room: true },
        },
        LabReports: {
          orderBy: { Date: 'desc' },
          take: 5,
        },
      },
      orderBy: { CreatedAt: 'desc' },
    });

    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create doctor
router.post('/', async (req, res) => {
  try {
    const { Name, Degree, Specialty, Contact_No, Work_Experience, Email } = req.body;

    const doctor = await prisma.doctor.create({
      data: {
        Name,
        Degree,
        Specialty,
        Contact_No,
        Work_Experience: Work_Experience || 0,
        Email,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.ADMIN, 'doctor:created', doctor);
    }

    res.status(201).json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update doctor
router.put('/:id', async (req, res) => {
  try {
    const { Name, Degree, Specialty, Contact_No, Work_Experience, Email } = req.body;

    const doctor = await prisma.doctor.update({
      where: { Doctor_ID: req.params.id },
      data: {
        ...(Name && { Name }),
        ...(Degree && { Degree }),
        ...(Specialty && { Specialty }),
        ...(Contact_No !== undefined && { Contact_No }),
        ...(Work_Experience !== undefined && { Work_Experience }),
        ...(Email !== undefined && { Email }),
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.DOCTOR(doctor.Doctor_ID), 'doctor:updated', doctor);
    }

    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





