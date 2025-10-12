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
    GAME_STARTED = "GAME_STARTED",
    PLAYER_LEFT = "PLAYER_LEFT",
    ERROR = "ERROR",
}

export interface CreateGroupPayload {
    ownerName: string;
}

export interface JoinGroupPayload {
    groupId: string;
    name: string;
}

export interface SetReadyPayload {
    ready: boolean;
}

export interface GroupCreatedPayload {
    groupId: string;
    owner: Player;
}

export interface JoinedPayload {
    player: Player;
    groupId: string;
}

export interface LobbyUpdatePayload {
    ownerId: string | null;
    players: Player[];
}

export interface GameStartedPayload {
    groupId: string;
    players: Player[];
    startedBy: Player;
}

export interface PlayerLeftPayload {
    id: string;
}

export interface ErrorPayload {
    message: string;
}

export interface ClientMessage {
    type: LobbyEvent;
    payload: CreateGroupPayload | JoinGroupPayload | SetReadyPayload;
}

export interface ServerMessage {
    type: ServerEvent;
    payload: GroupCreatedPayload | JoinedPayload | LobbyUpdatePayload | GameStartedPayload | PlayerLeftPayload | ErrorPayload | Player;
}