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
  LOBBY_UPDATE = "LOBBY_UPDATE",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  GAME_STARTED = "GAME_STARTED",
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

export type ClientMessage =
  | { type: LobbyEvent.CREATE_GROUP; payload: CreateGroupPayload }
  | { type: LobbyEvent.JOIN_GROUP; payload: JoinGroupPayload }
  | { type: LobbyEvent.PLAYER_SET_READY; payload: SetReadyPayload }
  | { type: LobbyEvent.START_GAME; payload?: undefined };

export type ServerMessage =
  | { type: ServerEvent.GROUP_CREATED; payload: any }
  | { type: ServerEvent.JOINED; payload: any }
  | { type: ServerEvent.LOBBY_UPDATE; payload: any }
  | { type: ServerEvent.PLAYER_JOINED; payload: Player }
  | { type: ServerEvent.PLAYER_LEFT; payload: { id: string } }
  | { type: ServerEvent.GAME_STARTED; payload: any }
  | { type: ServerEvent.ERROR; payload: { message: string } };
