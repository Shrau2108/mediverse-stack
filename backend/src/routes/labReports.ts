import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all lab reports
router.get('/', async (req, res) => {
  try {
    const { status, category, patientId } = req.query;
    const where: any = {};
    if (status) where.Status = status;
    if (category) where.Category = category;
    if (patientId) where.Patient_ID = patientId;

    const reports = await prisma.labReport.findMany({
      where,
      include: {
        Patient: true,
        Examine: {
          include: { Doctor: true },
        },
      },
      orderBy: { Date: 'desc' },
    });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get lab report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await prisma.labReport.findUnique({
      where: { Lab_No: req.params.id },
      include: {
        Patient: true,
        Examine: {
          include: { Doctor: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Lab report not found' });
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending lab reports (for lab technician)
router.get('/pending/all', async (req, res) => {
  try {
    const reports = await prisma.labReport.findMany({
      where: {
        Status: { in: ['Pending', 'In Progress'] },
      },
      include: {
        Patient: true,
        Examine: {
          include: { Doctor: true },
        },
      },
      orderBy: { Date: 'asc' },
    });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create lab report request (from doctor)
router.post('/', async (req, res) => {
  try {
    const { Patient_ID, Category, Test_Name, Amount, Doctor_ID } = req.body;

    const report = await prisma.labReport.create({
      data: {
        Patient_ID,
        Category,
        Test_Name,
        Amount: Amount || 0,
        Examine: {
          create: {
            Doctor_ID,
            Patient_ID,
            Status: 'Requested',
          },
        },
      },
      include: {
        Patient: true,
        Examine: {
          include: { Doctor: true },
        },
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.LAB, 'lab:test:requested', report);
      emitToRoom(io, SocketRooms.PATIENT(Patient_ID), 'lab:test:requested', report);
    }

    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update lab report (upload result, update status)
router.put('/:id', async (req, res) => {
  try {
    const { Result, Report_File, Status, Doctor_Notes } = req.body;

    const report = await prisma.labReport.update({
      where: { Lab_No: req.params.id },
      data: {
        ...(Result && { Result }),
        ...(Report_File && { Report_File }),
        ...(Status && { Status }),
        ...(Doctor_Notes && { Doctor_Notes }),
      },
      include: {
        Patient: true,
        Examine: {
          include: { Doctor: true },
        },
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.PATIENT(report.Patient_ID), 'lab:report:updated', report);
      emitToRoom(io, SocketRooms.LAB, 'lab:report:updated', report);
      
      // Notify doctor if report is completed
      if (report.Status === 'Completed' && report.Examine.length > 0) {
        const doctorId = report.Examine[0].Doctor_ID;
        emitToRoom(io, SocketRooms.DOCTOR(doctorId), 'lab:report:completed', report);
      }
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark examine as reviewed (doctor reviewed the report)
router.put('/:id/review', async (req, res) => {
  try {
    const { Doctor_ID, Notes } = req.body;

    const examine = await prisma.examine.updateMany({
      where: {
        Lab_No: req.params.id,
        Doctor_ID,
      },
      data: {
        Status: 'Reviewed',
        Notes,
      },
    });

    const report = await prisma.labReport.findUnique({
      where: { Lab_No: req.params.id },
      include: {
        Patient: true,
        Examine: {
          include: { Doctor: true },
        },
      },
    });

    const io = req.app.get('io');
    if (io && report) {
      emitToRoom(io, SocketRooms.PATIENT(report.Patient_ID), 'lab:report:reviewed', report);
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





