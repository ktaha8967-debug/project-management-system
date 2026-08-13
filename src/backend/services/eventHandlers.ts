import { Socket } from "socket.io";
import { socketService } from "./socketService";

export const registerEventHandlers = (socket: Socket) => {
  // Handle presence
  socket.on("user:online", (userId: string) => {
    socketService.emitAll("user:online", { userId });
  });

  socket.on("task:viewing", (data: { taskId: string, userId: string, userName: string }) => {
    socket.to(`project_${data.taskId}`).emit("task:viewing", data);
  });

  // Handle live time tracking
  socket.on("timer:start", (data: { taskId: string, userId: string }) => {
    socketService.emitToProject(data.taskId, "timer:started", data);
  });

  socket.on("timer:stop", (data: { taskId: string, userId: string }) => {
    socketService.emitToProject(data.taskId, "timer:stopped", data);
  });
};
