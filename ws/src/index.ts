import { WebSocketServer, WebSocket } from "ws";
import {
  ClientMessage,
  LobbyEvent,
  ServerMessage,
  ServerEvent,
  CreateGroupPayload,
  JoinGroupPayload,
  SetReadyPayload,
  LobbyUpdatePayload,
  GameStartedPayload,
  GroupCreatedPayload,
  JoinedPayload,
  ErrorPayload,
  Player,
  PlayerLeftPayload
} from "./lobby.types";
import { SendMessage } from "./utils/SendMessage";
import { GroupManager } from "./GroupManager";
import { Logger } from "./utils/Logger";

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });
const groupManager = new GroupManager();
const logger = new Logger();

// Map: socket -> { playerId, groupId }
const clientMap = new Map<WebSocket, { playerId: string; groupId: string }>();

logger.info(`WebSocket server running on ws://localhost:${PORT}`);

// Broadcast helper to a specific group
const broadcastToGroup = (
  groupId: string,
  msg: ServerMessage,
  excludeClient?: WebSocket
) => {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    const mapping = clientMap.get(client);
    if (
      mapping?.groupId === groupId &&
      client.readyState === WebSocket.OPEN &&
      client !== excludeClient
    ) {
      client.send(data);
    }
  });
};

wss.on("connection", (ws: WebSocket) => {
  logger.info("New client connected");

  ws.on("message", (raw) => {
    let data: ClientMessage;
    try {
      data = JSON.parse(raw.toString());
    } catch (e) {
      const errorPayload: ErrorPayload = { message: "Invalid JSON" };
      SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
      return;
    }

    switch (data.type) {
      case LobbyEvent.CREATE_GROUP: {
        const { ownerName } = data.payload as CreateGroupPayload;
        const newGroup = groupManager.createGroup(ownerName);
        if (!newGroup.owner) {
          const errorPayload: ErrorPayload = { message: "Failed to create group owner" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        clientMap.set(ws, {
          groupId: newGroup.groupId,
          playerId: newGroup.owner.id,
        });

        const responsePayload: GroupCreatedPayload = {
          groupId: newGroup.groupId,
          owner: newGroup.owner,
        };
        SendMessage(ws, { type: ServerEvent.GROUP_CREATED, payload: responsePayload });
        logger.info(`New group created with ID: ${newGroup.groupId}`);
        break;
      }

      case LobbyEvent.JOIN_GROUP: {
        const { groupId, name } = data.payload as JoinGroupPayload;
        const lobby = groupManager.getGroup(groupId);

        if (!lobby) {
          const errorPayload: ErrorPayload = { message: "Group not found" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        if (lobby.isFull()) {
          const errorPayload: ErrorPayload = { message: "Group is full" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        const newPlayer = lobby.addPlayer(name);
        if (!newPlayer) {
          const errorPayload: ErrorPayload = { message: "Failed to add player to lobby" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        clientMap.set(ws, { playerId: newPlayer.id, groupId });

        const joinedPayload: JoinedPayload = { player: newPlayer, groupId };
        SendMessage(ws, { type: ServerEvent.JOINED, payload: joinedPayload });
        logger.info(`Player '${name}' joined group '${groupId}'`);

        broadcastToGroup(groupId, {
          type: ServerEvent.PLAYER_JOINED,
          payload: newPlayer,
        }, ws);

        const lobbyUpdatePayload: LobbyUpdatePayload = lobby.getLobbyState();
        broadcastToGroup(groupId, {
          type: ServerEvent.LOBBY_UPDATE,
          payload: lobbyUpdatePayload,
        });
        break;
      }

      case LobbyEvent.PLAYER_SET_READY: {
        const { ready } = data.payload as SetReadyPayload;
        const mapping = clientMap.get(ws);

        if (!mapping) {
          const errorPayload: ErrorPayload = { message: "Not in a group" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        const { groupId, playerId } = mapping;
        const lobby = groupManager.getGroup(groupId);

        if (!lobby) {
          const errorPayload: ErrorPayload = { message: "Group not found" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        lobby.setPlayerReady(playerId, ready);
        logger.info(`Player '${playerId}' set ready status to '${ready}' in group '${groupId}'`);

        const lobbyUpdatePayload: LobbyUpdatePayload = lobby.getLobbyState();
        broadcastToGroup(groupId, {
          type: ServerEvent.LOBBY_UPDATE,
          payload: lobbyUpdatePayload,
        });
        break;
      }
      
      case LobbyEvent.START_GAME: {
        const mapping = clientMap.get(ws);
        if (!mapping) {
          const errorPayload: ErrorPayload = { message: "Not in a group" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        const { groupId, playerId } = mapping;
        const lobby = groupManager.getGroup(groupId);

        if (!lobby) {
          const errorPayload: ErrorPayload = { message: "Group not found" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        if (lobby.owner?.id !== playerId) {
          const errorPayload: ErrorPayload = { message: "Only the group owner can start the game" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }

        if (!lobby.allReady()) {
          const errorPayload: ErrorPayload = { message: "All players must be ready before starting" };
          SendMessage(ws, { type: ServerEvent.ERROR, payload: errorPayload });
          return;
        }
        
        const gameStartedPayload: GameStartedPayload = {
          groupId,
          players: lobby.getLobbyState().players,
          startedBy: lobby.owner,
        };
        broadcastToGroup(groupId, {
          type: ServerEvent.GAME_STARTED,
          payload: gameStartedPayload,
        });
        logger.info(`Game started in group '${groupId}'`);
        break;
      }
    }
  });

  ws.on("close", () => {
    logger.info("Client disconnected");
    const mapping = clientMap.get(ws);
    if (mapping) {
      const { groupId, playerId } = mapping;
      const lobby = groupManager.getGroup(groupId);
      lobby?.removePlayer(playerId);

      if (lobby) {
        const playerLeftPayload: PlayerLeftPayload = { id: playerId };
        broadcastToGroup(groupId, {
          type: ServerEvent.PLAYER_LEFT,
          payload: playerLeftPayload,
        }, ws);

        if (lobby.getPlayers().length === 0) {
          groupManager.removeGroup(groupId);
          logger.info(`Group '${groupId}' removed as it's now empty`);
        } else {
          const lobbyUpdatePayload: LobbyUpdatePayload = lobby.getLobbyState();
          broadcastToGroup(groupId, {
            type: ServerEvent.LOBBY_UPDATE,
            payload: lobbyUpdatePayload,
          });
        }
      }
      clientMap.delete(ws);
      logger.info(`Player '${playerId}' removed from group '${groupId}'`);
    }
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: Closing WebSocket server.");
  wss.clients.forEach(client => client.close());
  wss.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});