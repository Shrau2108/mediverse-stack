import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Get overall analytics
router.get('/overview', async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalNurses,
      activeAccommodations,
      totalRooms,
      pendingPrescriptions,
      pendingLabTests,
      totalBills,
      pendingBills,
      todayAppointments,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.nurse.count(),
      prisma.accommodation.count({ where: { Status: 'Active' } }),
      prisma.room.count(),
      prisma.prescription.count({ where: { Status: 'Pending' } }),
      prisma.labReport.count({ where: { Status: { in: ['Pending', 'In Progress'] } } }),
      prisma.bill.count(),
      prisma.bill.count({ where: { Status: { in: ['Pending', 'Partial'] } } }),
      prisma.treatment.count({
        where: {
          Treatment_Date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const occupiedRooms = await prisma.room.count({ where: { Status: 'Occupied' } });
    const availableRooms = totalRooms - occupiedRooms;

    res.json({
      patients: {
        total: totalPatients,
        active: await prisma.patient.count({ where: { Status: 'Active' } }),
        discharged: await prisma.patient.count({ where: { Status: 'Discharged' } }),
      },
      staff: {
        doctors: totalDoctors,
        nurses: totalNurses,
      },
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        available: availableRooms,
        occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
      },
      activeAccommodations,
      prescriptions: {
        pending: pendingPrescriptions,
        total: await prisma.prescription.count(),
      },
      labTests: {
        pending: pendingLabTests,
        total: await prisma.labReport.count(),
      },
      bills: {
        total: totalBills,
        pending: pendingBills,
        paid: await prisma.bill.count({ where: { Status: 'Paid' } }),
      },
      todayAppointments,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue analytics
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      Status: 'Paid',
    };

    if (startDate || endDate) {
      where.Payment_Date = {};
      if (startDate) where.Payment_Date.gte = new Date(startDate as string);
      if (endDate) where.Payment_Date.lte = new Date(endDate as string);
    }

    const bills = await prisma.bill.findMany({
      where,
      include: { Charges: true },
    });

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.Amount, 0);

    const revenueByType = bills.reduce((acc: any, bill) => {
      bill.Charges.forEach((charge) => {
        if (!acc[charge.Charge_Type]) {
          acc[charge.Charge_Type] = 0;
        }
        acc[charge.Charge_Type] += charge.Amount * charge.Quantity;
      });
      return acc;
    }, {});

    // Daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBills = await prisma.bill.findMany({
      where: {
        Status: 'Paid',
        Payment_Date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { Payment_Date: 'asc' },
    });

    const dailyRevenue = recentBills.reduce((acc: any, bill) => {
      const date = bill.Payment_Date?.toISOString().split('T')[0] || '';
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += bill.Amount;
      return acc;
    }, {});

    res.json({
      totalRevenue,
      revenueByType,
      dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount,
      })),
      totalBills: bills.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient flow analytics
router.get('/patient-flow', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const [admissions, discharges, newPatients] = await Promise.all([
      prisma.accommodation.findMany({
        where: {
          Check_In_Date: { gte: startDate },
        },
      }),
      prisma.accommodation.findMany({
        where: {
          Check_Out_Date: { gte: startDate },
        },
      }),
      prisma.patient.findMany({
        where: {
          CreatedAt: { gte: startDate },
        },
      }),
    ]);

    res.json({
      period: `${daysNum} days`,
      admissions: admissions.length,
      discharges: discharges.length,
      newPatients: newPatients.length,
      netAdmissions: admissions.length - discharges.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor performance
router.get('/doctors/performance', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        Patients: true,
        Treatments: {
          where: {
            Treatment_Date: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        },
        Prescriptions: {
          where: {
            CreatedAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        },
      },
    });

    const performance = doctors.map((doctor) => ({
      doctorId: doctor.Doctor_ID,
      name: doctor.Name,
      specialty: doctor.Specialty,
      totalPatients: doctor.Patients.length,
      treatmentsThisMonth: doctor.Treatments.length,
      prescriptionsThisMonth: doctor.Prescriptions.length,
    }));

    res.json(performance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





