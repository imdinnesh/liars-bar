import { WebSocket } from "ws";
import { ServerMessage } from "../lobby.types";

export const SendMessage = (ws: WebSocket, msg: ServerMessage) => {
    ws.send(JSON.stringify(msg));
};