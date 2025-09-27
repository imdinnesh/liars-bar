## 📡 WebSocket API Reference

### Client Events (Client → Server)

#### Create Group
Creates a new game group with the specified owner.

```json
{
  "type": "CREATE_GROUP",
  "payload": {
    "ownerName": "Dinesh"
  }
}
```

#### Join Group  
Joins an existing group using the group ID.

```json
{
  "type": "JOIN_GROUP",
  "payload": {
    "groupId": "449187e7-a555-41e3-82aa-0272a0c0f94a",
    "name": "Rahul"
  }
}
```

### Server Events (Server → Client)

#### Group Created
Sent to the client when a group is successfully created.

```json
{
  "type": "GROUP_CREATED",
  "payload": {
    "groupId": "449187e7-a555-41e3-82aa-0272a0c0f94a",
    "owner": {
      "id": "81bc12f5-1c5f-4e48-b794-5df0530a73d2",
      "name": "Dinesh",
      "ready": false
    }
  }
}
```

#### Joined
Confirmation sent to a client when they successfully join a group.

```json
{
  "type": "JOINED",
  "payload": {
    "player": {
      "id": "692b0ed5-7a55-43d9-b4bb-571e9fe059fd",
      "name": "Rahul",
      "ready": false
    },
    "groupId": "449187e7-a555-41e3-82aa-0272a0c0f94a"
  }
}
```

#### Player Joined
Broadcast to all group members when a new player joins.

```json
{
  "type": "PLAYER_JOINED",
  "payload": {
    "id": "6f49652c-911b-40a7-9b67-dbabf9e3aac4",
    "name": "Alice",
    "ready": false
  }
}
```

#### Lobby Update
Broadcast to all group members with the current player list and their states.

```json
{
  "type": "LOBBY_UPDATE",
  "payload": [
    {
      "id": "81bc12f5-1c5f-4e48-b794-5df0530a73d2",
      "name": "Dinesh",
      "ready": false
    },
    {
      "id": "692b0ed5-7a55-43d9-b4bb-571e9fe059fd",
      "name": "Rahul",
      "ready": false
    }
  ]
}
```
