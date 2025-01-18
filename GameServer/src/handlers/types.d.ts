import { WebSocket } from "ws";

interface IHandler {
  type: string;
  handle: (ws: WebSocket, payload: Uint8Array) => void;
}