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
    console.log(`Handled HelloResponse:`, HelloResponse.decode(payload));
    console.log(`ConnectedClients: `, connectedClients.size);
  },
};

export default helloHandler;
