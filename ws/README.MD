# WS Server

This is the WebSocket server for the Liars Bar game. It manages player connections, lobby state, and game events.

## Lobby Events

### Client Payloads

#### Once connected, the client can send the following payloads:

- **Join Lobby**: `{ type: "JOIN", payload: { name: string } }`
- **Set Ready**: `{ type: "SET_READY", payload: { ready: boolean } }`
- **Start Game**: `{ type: "START_GAME" }`

### Server Payloads

#### The server can send the following payloads to clients:

- **Lobby Update**: `{ type: "LOBBY_UPDATE", payload: Player[] }`
- **Joined**: `{ type: "JOINED", payload: { newPlayer: Player } }`
- **Game Start**: `{ type: "GAME_START", payload: { players: Player[] } }`
- **Player Left**: `{ type: "LEFT", payload: { player: Player } }`
- **Error**: `{ type: "ERROR", payload: string }`



