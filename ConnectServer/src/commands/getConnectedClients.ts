import { externalClients } from "@/webSocketServer";

export default {
  name: "getConnectedClients",
  description: "Prints info about all connected clients.",
  execute() {
    let index = 1;
    externalClients.forEach((client) => {
      console.log(`[${index}] IP ${client.remoteAddress}; Internal port: ${client.remotePort}; OS type: ${client.osType}; OS version: ${client.osVersion}`);
      index++;
    });
  },
};
