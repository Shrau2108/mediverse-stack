import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import patientRoutes from './routes/patients';
import doctorRoutes from './routes/doctors';
import nurseRoutes from './routes/nurses';
import chemistRoutes from './routes/chemists';
import roomRoutes from './routes/rooms';
import billRoutes from './routes/bills';
import labReportRoutes from './routes/labReports';
import treatmentRoutes from './routes/treatments';
import accommodationRoutes from './routes/accommodations';
import prescriptionRoutes from './routes/prescriptions';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Room-based updates for real-time notifications
  socket.on('join-room', (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leave-room', (room: string) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/chemists', chemistRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mediverse HMS API is running' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time updates`);
});

export { io };





