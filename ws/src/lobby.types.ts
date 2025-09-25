export interface Player {
    id: string;
    name: string;
    ready: boolean;
}

export interface ClientMessage {
    type: string;
    payload?: any;
}

export interface ServerMessage {
    type: string;
    payload?: any;
}
