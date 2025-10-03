# Liar's Bar WebSocket Server

A real-time multiplayer WebSocket server for the Liar's Bar game, built with Node.js and TypeScript.

## 🚀 Features

- **Real-time multiplayer gameplay** using WebSockets
- **Lobby management** with group creation and joining
- **Player ready system** for synchronized game starts
- **TypeScript** for type safety and better development experience
- **Modular architecture** with separate managers for different game aspects

## 📋 Requirements

- Node.js 18+ 
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd liars-bar/ws
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Development**
   ```bash
   # Run in development mode with hot reload
   npm run dev
   
   # Build TypeScript
   npm run build
   
   # Watch for changes and rebuild
   npm run watch
   ```

4. **Production**
   ```bash
   npm run build
   npm start
   ```

## 📚 WebSocket API Reference

This document details the complete message contract for communicating with the game server via WebSockets. All requests and responses are transmitted as JSON objects.

### 🏗️ Data Structures

#### Player Object
Represents an individual client in a lobby.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | A unique identifier for the player |
| `name` | string | The display name of the player |
| `ready` | boolean | Current ready status of the player |

---

## 📤 Client-to-Server Messages (Requests)

Client messages are sent to the server to initiate an action and use a `LobbyEvent` type.

### 🏠 LobbyEvent.CREATE_GROUP
Used by a client to create a new group and automatically become the group owner.

| Field | Type | Description |
|-------|------|-------------|
| `type` | LobbyEvent | `"CREATE_GROUP"` |
| `payload.ownerName` | string | The desired name for the owner player |

**Example Request:**
```json
{
  "type": "CREATE_GROUP",
  "payload": {
    "ownerName": "GamerTag123"
  }
}
```

### 🚪 LobbyEvent.JOIN_GROUP
Used by a client to join an existing group using its ID.

| Field | Type | Description |
|-------|------|-------------|
| `type` | LobbyEvent | `"JOIN_GROUP"` |
| `payload.groupId` | string | The ID of the group to join |
| `payload.name` | string | The desired name for the joining player |

**Example Request:**
```json
{
  "type": "JOIN_GROUP",
  "payload": {
    "groupId": "9a0a4c2f-e8d0",
    "name": "QuickJoiner"
  }
}
```

### ✅ LobbyEvent.PLAYER_SET_READY
Used by a player to toggle their ready status.

| Field | Type | Description |
|-------|------|-------------|
| `type` | LobbyEvent | `"PLAYER_SET_READY"` |
| `payload.ready` | boolean | The new ready state (true or false) |

**Example Request:**
```json
{
  "type": "PLAYER_SET_READY",
  "payload": {
    "ready": true
  }
}
```

### 🎮 LobbyEvent.START_GAME
Used by the group owner to initiate the game. Requires all players to be ready.

| Field | Type | Description |
|-------|------|-------------|
| `type` | LobbyEvent | `"START_GAME"` |
| `payload` | object | An empty object `{}` |

**Example Request:**
```json
{
  "type": "START_GAME",
  "payload": {}
}
```

---

## 📥 Server-to-Client Messages (Responses & Events)

Server messages are events or responses broadcast to one or more clients and use a `ServerEvent` type.

### 🏠 ServerEvent.GROUP_CREATED (Response)
Sent only to the client who successfully created a group.

| Field | Type | Description |
|-------|------|-------------|
| `type` | ServerEvent | `"GROUP_CREATED"` |
| `payload.groupId` | string | The ID of the newly created group |
| `payload.owner` | Player | The full details of the owner player |

**Example Response:**
```json
{
  "type": "GROUP_CREATED",
  "payload": {
    "groupId": "9a0a4c2f-e8d0",
    "owner": { "id": "p-123", "name": "GamerTag123", "ready": false }
  }
}
```

### 🚪 ServerEvent.JOINED (Response)
Sent only to the client who successfully joined a group.

| Field | Type | Description |
|-------|------|-------------|
| `type` | ServerEvent | `"JOINED"` |
| `payload.player` | Player | The full details of the newly joined player |
| `payload.groupId` | string | The ID of the group they joined |

**Example Response:**
```json
{
  "type": "JOINED",
  "payload": {
    "player": { "id": "p-456", "name": "QuickJoiner", "ready": false },
    "groupId": "9a0a4c2f-e8d0"
  }
}
```

### 👥 ServerEvent.PLAYER_JOINED (Broadcast)
Broadcast to all existing players in the group when a new player joins.

| Field | Type | Description |
|-------|------|-------------|
| `type` | ServerEvent | `"PLAYER_JOINED"` |
| `payload` | Player | The full details of the new player |

**Example Broadcast:**
```json
{
  "type": "PLAYER_JOINED",
  "payload": { "id": "p-456", "name": "QuickJoiner", "ready": false }
}
```

### 👋 ServerEvent.PLAYER_LEFT (Broadcast)
Broadcast to all remaining players when a player disconnects or leaves.

| Field | Type | Description |
|-------|------|-------------|
| `type` | ServerEvent | `"PLAYER_LEFT"` |
| `payload.id` | string | The ID of the player who left |

**Example Broadcast:**
```json
{
  "type": "PLAYER_LEFT",
  "payload": { "id": "p-456" }
}
```

### 🔄 ServerEvent.LOBBY_UPDATE (Broadcast)
Broadcast to all players in a group whenever any player changes their state (join, leave, ready status change).

| Field | Type | Description |
|-------|------|-------------|
| `type` | ServerEvent | `"LOBBY_UPDATE"` |
| `payload.ownerId` | string \| null | The ID of the group owner |
| `payload.players` | Player[] | An array of all current players and their states |

**Example Broadcast:**
```json
{
  "type": "LOBBY_UPDATE",
  "payload": {
    "ownerId": "p-123",
    "players": [
      { "id": "p-123", "name": "GamerTag123", "ready": true },
      { "id": "p-456", "name": "QuickJoiner", "ready": false }
    ]
  }
}
```

### 🎯 ServerEvent.GAME_STARTED (Broadcast)
Broadcast to all players in the group when the game owner successfully starts the game.

| Field | Type | Description |
|-------|------|-------------|
| `type` | ServerEvent | `"GAME_STARTED"` |
| `payload.groupId` | string | The group ID of the game |
| `payload.players` | Player[] | The final list of players starting the game |
| `payload.startedBy` | Player | The owner who initiated the start |

**Example Broadcast:**
```json
{
  "type": "GAME_STARTED",
  "payload": {
    "groupId": "9a0a4c2f-e8d0",
    "players": [
      { "id": "p-123", "name": "GamerTag123", "ready": true },
      { "id": "p-456", "name": "QuickJoiner", "ready": true }
    ],
    "startedBy": { "id": "p-123", "name": "GamerTag123", "ready": true }
  }
}
```

### ❌ ServerEvent.ERROR (Response)
Sent to the client when a request fails due to invalid data, business logic constraints, or server issues.

| Field | Type | Description |
|-------|------|-------------|
| `type` | ServerEvent | `"ERROR"` |
| `payload.message` | string | A human-readable description of the error |

**Example Error Response:**
```json
{
  "type": "ERROR",
  "payload": {
    "message": "All players must be ready before starting"
  }
}
```

#### Common Error Messages:
- `"Invalid JSON"`
- `"Not in a group"`
- `"Group not found"`
- `"Group is full"`
- `"Only the group owner can start the game"`
- `"All players must be ready before starting"`

---

## 🏗️ Architecture

```
src/
├── index.ts           # Main server entry point
├── lobby.ts           # Lobby management logic
├── lobby.types.ts     # TypeScript type definitions
├── GroupManager.ts    # Group management utilities
└── utils/
    ├── Logger.ts      # Logging utilities
    └── SendMessage.ts # Message sending utilities
```

## 🔧 Configuration

The server runs on WebSocket protocol and can be configured through environment variables or direct code modification in `src/index.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**imdinnesh** - [GitHub Profile](https://github.com/imdinnesh)

---

*Built with ❤️ for multiplayer gaming experiences*