import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const { status, type, doctorId } = req.query;
    const where: any = {};
    
    if (status) where.Status = status;
    if (type) where.Patient_Type = type;
    if (doctorId) where.Dr_ID = doctorId;

    const patients = await prisma.patient.findMany({
      where,
      include: {
        Doctor: true,
        Treatments: {
          include: { Doctor: true },
          orderBy: { Treatment_Date: 'desc' },
          take: 1,
        },
        Accommodations: {
          where: { Status: 'Active' },
          include: { Room: true },
        },
      },
      orderBy: { CreatedAt: 'desc' },
    });

    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { Patient_ID: req.params.id },
      include: {
        Doctor: true,
        Treatments: {
          include: { Doctor: true },
          orderBy: { Treatment_Date: 'desc' },
        },
        LabReports: {
          orderBy: { Date: 'desc' },
        },
        Bills: {
          orderBy: { CreatedAt: 'desc' },
          include: { Charges: true },
        },
        Accommodations: {
          include: { Room: true },
          orderBy: { Check_In_Date: 'desc' },
        },
        Prescriptions: {
          include: { Doctor: true, Chemist: true },
          orderBy: { CreatedAt: 'desc' },
        },
        Healthcare: {
          include: { Doctor: true, Nurse: true },
          orderBy: { Date: 'desc' },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new patient (Attendant module)
router.post('/', async (req, res) => {
  try {
    const {
      Name,
      DOB,
      Gender,
      Address,
      Email,
      Phone,
      Weight,
      Height,
      Blood_grp,
      Disease,
      Patient_Type,
      Dr_ID,
      Status,
    } = req.body;

    // Calculate BMI if weight and height provided
    let BMI = null;
    if (Weight && Height) {
      BMI = Weight / ((Height / 100) ** 2);
    }

    const patient = await prisma.patient.create({
      data: {
        Name,
        DOB: new Date(DOB),
        Gender,
        Address,
        Email,
        Phone,
        Weight,
        Height,
        Blood_grp,
        Disease,
        Patient_Type: Patient_Type || 'Out-Patient',
        Dr_ID,
        Status: Status || 'Active',
        BMI,
      },
      include: { Doctor: true },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.ADMIN, 'patient:created', patient);
      if (Dr_ID) {
        emitToRoom(io, SocketRooms.DOCTOR(Dr_ID), 'patient:assigned', patient);
      }
    }

    res.status(201).json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const {
      Name,
      DOB,
      Gender,
      Address,
      Email,
      Phone,
      Weight,
      Height,
      Blood_grp,
      Disease,
      Patient_Type,
      Dr_ID,
      Status,
    } = req.body;

    const updateData: any = {};
    if (Name !== undefined) updateData.Name = Name;
    if (DOB !== undefined) updateData.DOB = new Date(DOB);
    if (Gender !== undefined) updateData.Gender = Gender;
    if (Address !== undefined) updateData.Address = Address;
    if (Email !== undefined) updateData.Email = Email;
    if (Phone !== undefined) updateData.Phone = Phone;
    if (Weight !== undefined) updateData.Weight = Weight;
    if (Height !== undefined) updateData.Height = Height;
    if (Blood_grp !== undefined) updateData.Blood_grp = Blood_grp;
    if (Disease !== undefined) updateData.Disease = Disease;
    if (Patient_Type !== undefined) updateData.Patient_Type = Patient_Type;
    if (Dr_ID !== undefined) updateData.Dr_ID = Dr_ID;
    if (Status !== undefined) updateData.Status = Status;

    // Recalculate BMI if weight or height changed
    if (Weight !== undefined || Height !== undefined) {
      const existing = await prisma.patient.findUnique({
        where: { Patient_ID: req.params.id },
      });
      if (existing) {
        const finalWeight = Weight ?? existing.Weight;
        const finalHeight = Height ?? existing.Height;
        if (finalWeight && finalHeight) {
          updateData.BMI = finalWeight / ((finalHeight / 100) ** 2);
        }
      }
    }

    const patient = await prisma.patient.update({
      where: { Patient_ID: req.params.id },
      data: updateData,
      include: { Doctor: true },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(patient.Patient_ID), 'patient:updated', patient);
      emitToRoom(io, SocketRooms.ADMIN, 'patient:updated', patient);
    }

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    await prisma.patient.delete({
      where: { Patient_ID: req.params.id },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.ADMIN, 'patient:deleted', { id: req.params.id });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





