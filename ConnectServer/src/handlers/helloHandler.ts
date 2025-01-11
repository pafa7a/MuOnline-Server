import { HelloResponse } from "@messages/connect";
import { connectedClients } from "@server/index";
import { WebSocket } from "ws";

interface Handler {
  type: string;
  handle: (ws: WebSocket, payload: Uint8Array) => void;
}

const helloHandler: Handler = {
  type: "HelloResponse",
  handle: (ws, payload) => {
  },
};

export default helloHandler;
