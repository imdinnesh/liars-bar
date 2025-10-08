"use client";

import { Player } from "@/lib/lobby.types";
import { create } from "zustand";


interface LobbyState {
    groupId?: string;
    owner?: Player;
    players: Player[];
    setLobby: (groupId: string, players: Player[], owner?: Player) => void;
    setReady: (id: string, ready: boolean) => void;
    addPlayer: (player: Player) => void;
    removePlayer: (id: string) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
    players: [],
    setLobby: (groupId, players, owner) => set({ groupId, players, owner }),
    setReady: (id, ready) =>
        set((s) => ({
            players: s.players.map((p) => (p.id === id ? { ...p, ready } : p)),
        })),
    addPlayer: (player) =>
        set((s) => ({ players: [...s.players, player] })),
    removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
}));
