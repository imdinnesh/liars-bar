export interface Player {
    id: string;
    name: string;
    ready: boolean;
}

export enum LobbyEvent {
    CREATE_GROUP = "CREATE_GROUP",
    JOIN_GROUP = "JOIN_GROUP",
    PLAYER_SET_READY = "PLAYER_SET_READY",
    START_GAME = "START_GAME",
}

export enum ServerEvent {
    GROUP_CREATED = "GROUP_CREATED",
    JOINED = "JOINED",
    PLAYER_JOINED = "PLAYER_JOINED",
    LOBBY_UPDATE = "LOBBY_UPDATE",
    GAME_START = "GAME_START",
    LEFT = "LEFT",
    ERROR = "ERROR",
}

export interface ClientMessage {
    type: LobbyEvent;
    payload: any;
}

export interface ServerMessage {
    type: ServerEvent;
    payload: any;
}
