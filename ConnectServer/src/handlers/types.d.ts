import { IncomingHttpHeaders } from "http";
import { WebSocket } from "ws";

interface IHandler {
  type: string;
  handle: (
    ws: WebSocket,
    payload: Uint8Array,
    requestHeaders: IncomingHttpHeaders,
  ) => void;
}