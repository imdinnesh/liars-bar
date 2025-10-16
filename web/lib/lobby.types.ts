// Common message and event types

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
  PLAYER_LEFT = "PLAYER_LEFT",
  PLAYER_READY = "PLAYER_READY",
  GAME_STARTED = "GAME_STARTED",
}

export interface ClientMessage {
  event: LobbyEvent;
  payload?: any;
}

export interface ServerMessage {
  event: ServerEvent;
  payload?: any;
}
