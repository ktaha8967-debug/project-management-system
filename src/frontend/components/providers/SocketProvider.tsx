"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isPolling: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isPolling: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const queryClient = useQueryClient();
  const processedEvents = useRef<Set<string>>(new Set());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const handleSocketEvent = (event: string, data: any, callback?: () => void) => {
    // Deduplication
    if (data._eid) {
      if (processedEvents.current.has(data._eid)) {
        console.warn("Duplicate event ignored:", data._eid);
        return;
      }
      processedEvents.current.add(data._eid);
      // Keep set size manageable
      if (processedEvents.current.size > 1000) {
        const first = processedEvents.current.values().next().value;
        if (first !== undefined) processedEvents.current.delete(first);
      }

      // Acknowledgement
      if (socket) {
        socket.emit("event:ack", data._eid);
      }
    }

    if (callback) callback();
  };

  useEffect(() => {
    if (!session) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket", "polling"], // Allow polling as fallback
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO");
      setIsConnected(true);
      setIsPolling(false);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      
      const userId = (session.user as any)?.id;
      if (userId) {
        socketInstance.emit("join:user", userId);
      }
    });

    socketInstance.on("task:updated", (data) => {
      handleSocketEvent("task:updated", data, () => {
        console.log("Task updated via socket:", data);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      });
    });

    socketInstance.on("notification:new", (data) => {
      handleSocketEvent("notification:new", data, () => {
        console.log("New notification via socket:", data);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });
    });

    socketInstance.on("comment:added", (data) => {
      handleSocketEvent("comment:added", data, () => {
        console.log("New comment via socket:", data);
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      });
    });

    socketInstance.on("critical_alert", (data) => {
      handleSocketEvent("critical_alert", data, () => {
        alert(`CRITICAL ALERT: ${data.message}`);
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("Disconnected from Socket.IO:", reason);
      setIsConnected(false);
      
      // Fallback to polling mode
      if (reason === "io client disconnect" || reason === "transport close") {
        setIsPolling(true);
        startPolling();
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err);
      setIsPolling(true);
      startPolling();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [session, queryClient]);

  const startPolling = () => {
    if (pollingInterval.current) return;
    console.info("Switching to background polling mode...");
    pollingInterval.current = setInterval(() => {
      // Background re-sync
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, 30000); // Poll every 30s
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, isPolling }}>
      {children}
    </SocketContext.Provider>
  );
};
