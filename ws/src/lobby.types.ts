// Events the client can send
export enum LobbyEvent {
    CREATE_GROUP = "CREATE_GROUP",
    PLAYER_JOINED = "PLAYER_JOINED",
    PLAYER_SET_READY = "PLAYER_SET_READY",
    START_GAME = "START_GAME",
}

// Events the server can send
export enum ServerEvent {
    GROUP_CREATED = "GROUP_CREATED",
    JOINED = "JOINED",
    LOBBY_UPDATE = "LOBBY_UPDATE",
    GAME_START = "GAME_START",
    LEFT = "PLAYER_LEFT",
    ERROR = "ERROR",
}

// Shape of a player
export interface Player {
    id: string;
    name: string;
    ready: boolean;
}

// Messages client → server
export type ClientMessage =
    | { type: LobbyEvent.CREATE_GROUP; payload: { ownerName: string } }
    | { type: LobbyEvent.PLAYER_JOINED; payload: { name: string, groupId: string } }
    | { type: LobbyEvent.PLAYER_SET_READY; payload: { ready: boolean } }
    | { type: LobbyEvent.START_GAME };

// Messages server → client
export type ServerMessage =
    | { type: ServerEvent.GROUP_CREATED; payload: { groupId: string; owner: Player } }
    | { type: ServerEvent.JOINED; payload: { newPlayer: Player } }
    | { type: ServerEvent.LOBBY_UPDATE; payload: Player[] }
    | { type: ServerEvent.GAME_START; payload: { players: Player[] } }
    | { type: ServerEvent.LEFT; payload: { player: Player } }
    | { type: ServerEvent.ERROR; payload: string };
