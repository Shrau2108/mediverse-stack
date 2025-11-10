import { Server as SocketIOServer } from 'socket.io';

declare global {
  namespace Express {
    interface Application {
      set(key: string, value: any): void;
      get(key: string): any;
    }
  }
}

export {};





