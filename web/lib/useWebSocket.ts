"use client";

import { useEffect, useRef, useCallback } from "react";
import { ClientMessage, ServerMessage } from "./lobby.types";

export function useWebSocket(
  url: string,
  onMessage: (msg: ServerMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("[WS] ✅ Connected");
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as ServerMessage;
        onMessage(msg);
      } catch (err) {
        console.error("[WS] Invalid message:", e.data);
      }
    };
    ws.onclose = () => console.log("[WS] ❌ Disconnected");
    ws.onerror = (err) => console.error("[WS] ⚠️ Error:", err);

    return () => ws.close();
  }, [url, onMessage]);

  // ✅ Safe send function
  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (!ws) {
      console.warn("[WS] Not initialized yet");
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else if (ws.readyState === WebSocket.CONNECTING) {
      console.warn("[WS] Still connecting... retrying in 100ms");
      setTimeout(() => send(msg), 100);
    } else {
      console.error("[WS] Cannot send message, socket closed or invalid");
    }
  }, []);

  return { send };
}
