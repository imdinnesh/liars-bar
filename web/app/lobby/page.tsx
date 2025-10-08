"use client";

import { useEffect } from "react";
import { useLobbyStore } from "@/store/useLobbyStore";
import { useWebSocket } from "@/lib/useWebSocket";
import { LobbyEvent, ServerEvent } from "@/lib/lobby.types";


export default function LobbyPage() {
    const { players, setLobby, addPlayer, removePlayer } = useLobbyStore();

    const { send } = useWebSocket("ws://localhost:8080", (msg) => {
        switch (msg.type) {
            case ServerEvent.LOBBY_UPDATE:
                setLobby(msg.payload.groupId, msg.payload.players, msg.payload.owner);
                break;
            case ServerEvent.PLAYER_JOINED:
                addPlayer(msg.payload);
                break;
            case ServerEvent.PLAYER_LEFT:
                removePlayer(msg.payload.id);
                break;
            case ServerEvent.GAME_STARTED:
                alert(`Game started by ${msg.payload.startedBy.name}`);
                break;
            case ServerEvent.ERROR:
                alert(msg.payload.message);
                break;
        }
    });

    useEffect(() => {
        send({
            type: LobbyEvent.JOIN_GROUP,
            payload: { groupId: "default-group", name: "Dinesh" },
        });
    }, [send]);

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6">
            <h1 className="text-2xl font-bold mb-4">Lobby</h1>
            <ul className="space-y-2">
                {players.map((p) => (
                    <li key={p.id} className="bg-neutral-800 p-3 rounded">
                        {p.name} {p.ready ? "✅" : "❌"}
                    </li>
                ))}
            </ul>
            <button
                className="mt-6 bg-blue-600 px-4 py-2 rounded"
                onClick={() => send({ type: LobbyEvent.PLAYER_SET_READY, payload: { ready: true } })}
            >
                Ready Up
            </button>
        </div>
    );
}
