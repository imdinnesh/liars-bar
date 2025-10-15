import { create } from "zustand";
import { ClientMessage, ServerMessage } from "@/lib/lobby.types";

interface LobbyState {
    isConnected: boolean;
    messages: ServerMessage[];
    sendMessage: (msg: ClientMessage) => void;
    connect: (url: string) => void;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
    isConnected: false,
    messages: [],
    sendMessage: (msg) => {
        const ws = (get() as any).ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg));
        } else {
            console.warn("WebSocket not connected");
        }
    },
    connect: (url) => {
        const ws = new WebSocket(url);
        (get() as any).ws = ws;

        ws.onopen = () => set({ isConnected: true });
        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data) as ServerMessage;
                set((state) => ({ messages: [...state.messages, data] }));
            } catch {
                console.warn("Invalid WS message:", e.data);
            }
        };
        ws.onclose = () => set({ isConnected: false });
        ws.onerror = () => ws.close();
    },
}));
