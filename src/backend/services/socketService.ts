import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { registerEventHandlers } from "./eventHandlers";
import { logger } from "../lib/logger";
import { v4 as uuidv4 } from "uuid";

class SocketService {
  private io: SocketIOServer | null = null;
  private pendingEvents = new Map<string, { event: string, data: any, target: string, type: 'PROJECT' | 'USER' | 'ALL', retries: number }>();

  init(server: HttpServer) {
    if (this.io) return this.io;

    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*", 
        methods: ["GET", "POST"]
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      }
    });

    this.io.on("connection", (socket) => {
      logger.info("Client connected", { socketId: socket.id });
      registerEventHandlers(socket);

      socket.on("join:project", (projectId: string) => {
        socket.join(`project_${projectId}`);
        logger.debug("Socket joined project", { socketId: socket.id, projectId });
      });

      socket.on("join:user", (userId: string) => {
        socket.join(`user_${userId}`);
        logger.debug("Socket joined user room", { socketId: socket.id, userId });
      });

      // Event Acknowledgement from client
      socket.on("event:ack", (eventId: string) => {
        if (this.pendingEvents.has(eventId)) {
          this.pendingEvents.delete(eventId);
          logger.debug("Event acknowledged by client", { eventId, socketId: socket.id });
        }
      });

      socket.on("disconnect", (reason) => {
        logger.info("Client disconnected", { socketId: socket.id, reason });
      });
    });

    if (typeof global !== 'undefined') {
      (global as any).socketIO = this.io;
    }

    // Start retry interval
    setInterval(() => this.retryPendingEvents(), 5000);

    return this.io;
  }

  private retryPendingEvents() {
    const now = Date.now();
    for (const [id, item] of this.pendingEvents.entries()) {
      if (item.retries >= 3) {
        logger.warn("Event failed after max retries", { id, event: item.event });
        this.pendingEvents.delete(id);
        continue;
      }

      item.retries++;
      logger.debug("Retrying event", { id, event: item.event, retry: item.retries });
      
      const payload = { ...item.data, _eid: id, _retry: item.retries };
      
      if (item.type === 'PROJECT') {
        this.getIO().to(`project_${item.target}`).emit(item.event, payload);
      } else if (item.type === 'USER') {
        this.getIO().to(`user_${item.target}`).emit(item.event, payload);
      } else {
        this.getIO().emit(item.event, payload);
      }
    }
  }

  getIO(): SocketIOServer {
    if (this.io) return this.io;
    if (typeof global !== 'undefined' && (global as any).socketIO) {
      this.io = (global as any).socketIO;
      return this.io!;
    }
    return {
      to: () => ({ emit: () => {} }),
      emit: () => {},
    } as any;
  }

  private emitWithReliability(type: 'PROJECT' | 'USER' | 'ALL', target: string, event: string, data: any) {
    const eventId = uuidv4();
    const payload = { ...data, _eid: eventId };
    
    // Track for reliability
    this.pendingEvents.set(eventId, { type, target, event, data, retries: 0 });

    if (type === 'PROJECT') {
      this.getIO().to(`project_${target}`).emit(event, payload);
    } else if (type === 'USER') {
      this.getIO().to(`user_${target}`).emit(event, payload);
    } else {
      this.getIO().emit(event, payload);
    }

    logger.info("Socket event emitted", { event, eventId, type, target });
  }

  emitToProject(projectId: string, event: string, data: any) {
    this.emitWithReliability('PROJECT', projectId, event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.emitWithReliability('USER', userId, event, data);
  }

  emitAll(event: string, data: any) {
    this.emitWithReliability('ALL', '', event, data);
  }
}

export const socketService = new SocketService();
