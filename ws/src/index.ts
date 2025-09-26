import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage, LobbyEvent, ServerMessage, ServerEvent } from "./lobby.types";
import { SendMessage } from "./utils/SendMessage";
import { GroupManager } from "./GroupManager";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
const groupManager = new GroupManager();


// Map: socket -> { playerId, groupId }
const clientMap = new Map<WebSocket, { playerId: string; groupId: string }>();

console.log(`WebSocket server running on ws://localhost:${PORT}`);

// Broadcast helper (to a specific group only)
const BroadcastToGroup = (groupId: string, msg: ServerMessage) => {
    const data = JSON.stringify(msg);
    wss.clients.forEach((client) => {
        const mapping = clientMap.get(client);
        if (
            mapping?.groupId === groupId &&
            client.readyState === WebSocket.OPEN
        ) {
            client.send(data);
        }
    });
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


            case LobbyEvent.CREATE_GROUP:{
                const {ownerName}=data.payload;
                const newGroup=groupManager.createGroup(ownerName);
                clientMap.set(ws,{
                    groupId:newGroup.groupId,
                    playerId:newGroup.owner?.id||""
                })

                if (newGroup.owner) {
                    SendMessage(ws, {
                        type: ServerEvent.GROUP_CREATED,
                        payload: {
                            groupId: newGroup.groupId,
                            owner: newGroup.owner
                        }
                    });

                    // Also Update the Group
                    BroadcastToGroup(newGroup.groupId,{
                        type: ServerEvent.LOBBY_UPDATE,
                        payload: newGroup.owner ? [newGroup.owner] : []
                    })

                } else {
                    SendMessage(ws, {
                        type: ServerEvent.ERROR,
                        payload: "Group owner not found"
                    });
                }
            }
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
