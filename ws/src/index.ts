import { WebSocketServer, WebSocket } from "ws";
import {
  ClientMessage,
  LobbyEvent,
  ServerMessage,
  ServerEvent,
} from "./lobby.types";
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
    if (mapping?.groupId === groupId && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Broadcast to all the members of a group except the sender
const BroadcastToGroupExceptSender = (
  sender: WebSocket,
  groupId: string,
  msg: ServerMessage
) => {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    const mapping = clientMap.get(client);
    if (
      mapping?.groupId === groupId &&
      client !== sender &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(data);
    }
  });
}

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
      // Group Created
      case LobbyEvent.CREATE_GROUP: {
        const { ownerName } = data.payload;
        const newGroup = groupManager.createGroup(ownerName);
        // Maintain a Map
        clientMap.set(ws, {
          groupId: newGroup.groupId,
          playerId: newGroup.owner?.id || "",
        });

        // Confirm the Group Owner
        if (newGroup.owner) {
          SendMessage(ws, {
            type: ServerEvent.GROUP_CREATED,
            payload: {
              groupId: newGroup.groupId,
              owner: newGroup.owner,
            },
          });
          return;
          // No need to broadcast, as the owner is the only one in the group
        } else {
          SendMessage(ws, {
            type: ServerEvent.ERROR,
            payload: "Group owner not found",
          });
        }
      }

      // Player joined
      case LobbyEvent.JOIN_GROUP: {
        const { groupId, name } = data.payload;
        const lobby = groupManager.getGroup(groupId);

        // No lobby is found
        if (!lobby) {
          SendMessage(ws, {
            type: ServerEvent.ERROR,
            payload: "Group not found",
          });
          return;
        }

        // Lobby is full
        if (lobby.isFull()) {
          SendMessage(ws, {
            type: ServerEvent.ERROR,
            payload: "Group is full",
          });
          return;
        }

        // Create a new player and add to the lobby
        const newPlayer = lobby.addPlayer(name);
        if (!newPlayer) return;

        clientMap.set(ws, { playerId: newPlayer.id, groupId });

        // Notify the new player
        SendMessage(ws, {
          type: ServerEvent.JOINED,
          payload: { player: newPlayer, groupId },
        });

        // Notify all others in the group
        BroadcastToGroupExceptSender(ws, groupId, {
          type: ServerEvent.PLAYER_JOINED,
          payload: newPlayer,
        });

        // Broadcast updated lobby to all in the group
        BroadcastToGroup(groupId, {
          type: ServerEvent.LOBBY_UPDATE,
          payload: lobby.getPlayers(),
        });
        break;
      }

      // Player ready
      case LobbyEvent.PLAYER_SET_READY: {
        const { ready } = data.payload;
        const mapping = clientMap.get(ws);
        if (!mapping) {
          SendMessage(ws, { type: ServerEvent.ERROR, payload: "Not in a group" });
          return;
        }

        const { groupId, playerId } = mapping;
        const lobby = groupManager.getGroup(groupId);

        if (!lobby) {
          SendMessage(ws, { type: ServerEvent.ERROR, payload: "Group not found" });
          return;
        }

        lobby.setPlayerReady(playerId, ready);

        // Broadcast updated lobby to all in the group
        BroadcastToGroup(groupId, {
          type: ServerEvent.LOBBY_UPDATE,
          payload: lobby.getPlayers(),
        });
      }
      // Start Game By the Owner 
      case LobbyEvent.START_GAME: {
        const mapping = clientMap.get(ws);
        if (!mapping) {
          SendMessage(ws, { type: ServerEvent.ERROR, payload: "Not in a group" });
          return;
        }

        const { groupId, playerId } = mapping;
        const lobby = groupManager.getGroup(groupId);

        if (!lobby) {
          SendMessage(ws, { type: ServerEvent.ERROR, payload: "Group not found" });
          return;
        }

        // Check owner
        if (lobby.owner?.id !== playerId) {
          SendMessage(ws, {
            type: ServerEvent.ERROR,
            payload: "Only the group owner can start the game"
          });
          return;
        }

        // Check all players are ready before starting
        if (!lobby.allReady()) {
          SendMessage(ws, {
            type: ServerEvent.ERROR,
            payload: "All players must be ready before starting",
          });
          return;
        }

        // Broadcast to everyone in the group that game started
        BroadcastToGroup(groupId, {
          type: ServerEvent.GAME_STARTED,
          payload: {
            groupId,
            players: lobby.getPlayers(),
            startedBy: lobby.owner,
          },
        });
        break;
      }


    }

  });

  ws.on("close", () => {
    console.log("Client disconnected");
    const mapping = clientMap.get(ws);
    if (mapping) {
      const { groupId, playerId } = mapping;
      const lobby = groupManager.getGroup(groupId);
      lobby?.removePlayer(playerId);

      // Notify all others in the group
      BroadcastToGroupExceptSender(ws, groupId, {
        type: ServerEvent.PLAYER_LEFT,
        payload: playerId,
      });

      // If the lobby is empty, remove it
      if (lobby && lobby.getPlayers().length === 0) {
        groupManager.removeGroup(groupId);
      }
      clientMap.delete(ws);

      // Broadcast updated lobby to all in the group
      BroadcastToGroup(groupId, {
        type: ServerEvent.LOBBY_UPDATE,
        payload: lobby?.getPlayers() || [],
      });
      
    }

  });
});
