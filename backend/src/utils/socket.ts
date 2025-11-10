import { Server as SocketIOServer } from 'socket.io';

export const emitToRoom = (io: SocketIOServer, room: string, event: string, data: any) => {
  io.to(room).emit(event, data);
};

export const emitToAll = (io: SocketIOServer, event: string, data: any) => {
  io.emit(event, data);
};

// Room names for different entities
export const SocketRooms = {
  PATIENT: (patientId: string) => `patient:${patientId}`,
  DOCTOR: (doctorId: string) => `doctor:${doctorId}`,
  NURSE: (nurseId: string) => `nurse:${nurseId}`,
  CHEMIST: (shopId: string) => `chemist:${shopId}`,
  LAB: 'lab:all',
  ADMIN: 'admin:all',
  WARD: (wardId: string) => `ward:${wardId}`,
};





