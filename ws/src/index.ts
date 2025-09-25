import { WebSocketServer, WebSocket } from "ws";
import { Lobby } from "./lobby";
import { ClientMessage, LobbyEvent, ServerMessage, ServerEvent } from "./lobby.types";
import { SendMessage } from "./utils/SendMessage";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
const lobby = new Lobby();
const clientMap = new Map<WebSocket, string>();

console.log(`WebSocket server running on ws://localhost:${PORT}`);

// Broadcast helper
const Broadcast = (msg: ServerMessage) => {
    const data = JSON.stringify(msg);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

// Broadcast current lobby state
const BroadcastLobby = () => {
    Broadcast({ type: ServerEvent.LOBBY_UPDATE, payload: lobby.getPlayers() });
};

wss.on("connection", (ws: WebSocket) => {
    console.log("New client connected");

    ws.on("message", (raw) => {
        let data: ClientMessage;
        try {
            // Parse incoming message
            // raw is a binary buffer, convert to string
            // then parse as JSON
            data = JSON.parse(raw.toString()) as ClientMessage;
        } catch {
            SendMessage(ws, { type: ServerEvent.ERROR, payload: "Invalid JSON" });
            return;
        }

        switch (data.type) {
            case LobbyEvent.PLAYER_JOINED: {
                const { name } = data.payload;
                const newPlayer = lobby.addPlayer(name);
                clientMap.set(ws, newPlayer.id);

                // Acknowledge the joining player
                SendMessage(ws, { type: ServerEvent.JOINED, payload: { newPlayer } });

                // Notify all clients of the updated lobby
                BroadcastLobby();
                break;
            }

            case LobbyEvent.PLAYER_SET_READY: {
                const playerId = clientMap.get(ws);
                if (!playerId) return;
                lobby.setPlayerReady(playerId, data.payload.ready);
                BroadcastLobby();
                break;
            }

            case LobbyEvent.START_GAME: {
                if (lobby.allReady()) {
                    Broadcast({ type: ServerEvent.GAME_START, payload: { players: lobby.getPlayers() } });
                } else {
                    SendMessage(ws, { type: ServerEvent.ERROR, payload: "Not all players are ready" });
                }
                break;
            }

            default:
                SendMessage(ws, { type: ServerEvent.ERROR, payload: "Unknown message type" });
        }
    });

    ws.on("close", () => {
        const playerId = clientMap.get(ws);
        if (playerId) {
            const player=lobby.getPlayers().find(p=>p.id===playerId);
            if(player){
                Broadcast({ type: ServerEvent.LEFT, payload: { player } });
            }
            // Remove player from lobby
            lobby.removePlayer(playerId);
            clientMap.delete(ws);

            // Notify all clients of the updated lobby
            BroadcastLobby();
            console.log(`Player ${playerId} disconnected`);
        }
    });
});
