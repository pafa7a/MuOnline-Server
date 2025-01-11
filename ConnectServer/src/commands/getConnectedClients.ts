import { connectedClients } from "@server/index";

export default {
  name: "getConnectedClients",
  description: "Prints info about all connected clients.",
  execute() {
    let index = 1;
    connectedClients.forEach((client) => {
      console.log(`[${index}] IP ${client.remoteAddress}; Internal port: ${client.remotePort}; OS type: ${client.osType}; OS version: ${client.osVersion}`);
      index++;
    });
  },
};
