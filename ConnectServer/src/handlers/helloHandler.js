import { decodeHelloResponse } from "@messages/messages";
import { connectedClients } from "@server/server";
import { encodeWrapper } from "@messages/messages"; // Import wrapper functions

export default {
  type: "HelloResponse",
  handle: (ws, payload) => {
    console.log(`Handled HelloResponse:`, decodeHelloResponse(payload));
    console.log(`ConnectedClients: `, connectedClients.size)
    ws.send(encodeWrapper({type: 'asd', payload: 'dsa23232'}))
  },
};
