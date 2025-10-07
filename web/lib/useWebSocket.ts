"use client";

import { useEffect, useRef } from "react";
import { ClientMessage, ServerMessage } from "./lobby.types";

export function useWebSocket(
  url: string,
  onMessage: (msg: ServerMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("[WS] Connected");
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as ServerMessage;
        onMessage(msg);
      } catch (err) {
        console.error("Invalid WS message:", e.data);
      }
    };
    ws.onclose = () => console.log("[WS] Disconnected");
    ws.onerror = (err) => console.error("[WS] Error:", err);

    return () => ws.close();
  }, [url, onMessage]);

  const send = (msg: ClientMessage) => {
    wsRef.current?.send(JSON.stringify(msg));
  };

  return { send };
}
