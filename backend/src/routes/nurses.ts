import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Get all nurses
router.get('/', async (req, res) => {
  try {
    const nurses = await prisma.nurse.findMany({
      include: {
        Healthcare: {
          include: { Patient: true, Doctor: true },
          orderBy: { Date: 'desc' },
          take: 10,
        },
      },
      orderBy: { Name: 'asc' },
    });

    res.json(nurses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get nurse by ID
router.get('/:id', async (req, res) => {
  try {
    const nurse = await prisma.nurse.findUnique({
      where: { Nurse_ID: req.params.id },
      include: {
        Healthcare: {
          include: {
            Patient: {
              include: {
                Accommodations: {
                  where: { Status: 'Active' },
                  include: { Room: true },
                },
                Prescriptions: {
                  where: { Status: 'Pending' },
                  orderBy: { CreatedAt: 'desc' },
                },
              },
            },
            Doctor: true,
          },
          orderBy: { Date: 'desc' },
        },
      },
    });

    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found' });
    }

    res.json(nurse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get nurse's assigned patients
router.get('/:id/patients', async (req, res) => {
  try {
    const healthcare = await prisma.healthcare.findMany({
      where: { Nurse_ID: req.params.id },
      include: {
        Patient: {
          include: {
            Accommodations: {
              where: { Status: 'Active' },
              include: { Room: true },
            },
            Prescriptions: {
              where: { Status: 'Pending' },
              include: { Doctor: true },
            },
          },
        },
        Doctor: true,
      },
      orderBy: { Date: 'desc' },
    });

    const patients = healthcare.map((h) => h.Patient);
    const uniquePatients = Array.from(
      new Map(patients.map((p) => [p.Patient_ID, p])).values()
    );

    res.json(uniquePatients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create nurse
router.post('/', async (req, res) => {
  try {
    const { Name, Specialty, Work_Experience, Gender, Age, DOB, Contact_No, Email } = req.body;

    const nurse = await prisma.nurse.create({
      data: {
        Name,
        Specialty,
        Work_Experience: Work_Experience || 0,
        Gender,
        Age,
        DOB: DOB ? new Date(DOB) : null,
        Contact_No,
        Email,
      },
    });

    res.status(201).json(nurse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





