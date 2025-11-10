import express from 'express';
import prisma from '../lib/prisma';
import { emitToRoom, SocketRooms } from '../utils/socket';

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const where: any = {};
    if (status) where.Status = status;
    if (type) where.Room_Type = type;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        Accommodations: {
          where: { Status: 'Active' },
          include: { Patient: true },
        },
      },
      orderBy: { Room_No: 'asc' },
    });

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get available rooms for assignment
router.get('/available', async (req, res) => {
  try {
    const { type } = req.query;
    const where: any = {
      Status: 'Available',
    };
    if (type) where.Room_Type = type;

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { Room_No: 'asc' },
    });

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get room by number
router.get('/:roomNo', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { Room_No: req.params.roomNo },
      include: {
        Accommodations: {
          include: { Patient: true },
          orderBy: { Check_In_Date: 'desc' },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create room
router.post('/', async (req, res) => {
  try {
    const { Room_No, Room_Type, Status, Floor } = req.body;

    const room = await prisma.room.create({
      data: {
        Room_No,
        Room_Type,
        Status: Status || 'Available',
        Floor,
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.ADMIN, 'room:created', room);
    }

    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update room status
router.put('/:roomNo', async (req, res) => {
  try {
    const { Room_Type, Status, Floor } = req.body;

    const room = await prisma.room.update({
      where: { Room_No: req.params.roomNo },
      data: {
        ...(Room_Type && { Room_Type }),
        ...(Status && { Status }),
        ...(Floor !== undefined && { Floor }),
      },
    });

    const io = req.app.get('io');
    if (io) {
      emitToRoom(io, SocketRooms.ADMIN, 'room:updated', room);
    }

    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





