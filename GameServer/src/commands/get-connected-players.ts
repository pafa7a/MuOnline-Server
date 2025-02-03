import { connectedClients } from "@/webSocketServer";

export default {
  name: "get-connected-players",
  description: "Prints info about all connected players.",
  execute() {
    let index = 1;
    connectedClients.forEach((client) => {
      console.log(`[${index}] IP ${client.remoteAddress}; Internal port: ${client.remotePort}; OS type: ${client.osType}; OS version: ${client.osVersion}`);
      index++;
    });
  },
};
