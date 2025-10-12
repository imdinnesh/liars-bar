"use client";

import { ClientMessage, ServerMessage } from "@/lib/lobby.types";
import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<ServerMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as ServerMessage;
                setMessages((prev) => [...prev, data]);
            } catch {
                console.warn("Invalid WS message:", event.data);
            }
        };

        ws.onclose = () => setIsConnected(false);
        ws.onerror = () => ws.close();

        return () => ws.close();
    }, [url]);

    const sendMessage = useCallback((msg: ClientMessage) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        } else {
            console.warn("WebSocket not connected");
        }
    }, []);

    return { isConnected, messages, sendMessage };
}
