import { internalClients } from "@/webSocketServer";

export default {
  name: "getConnectedServers",
  description: "Prints info about all connected servers.",
  execute() {
    internalClients.forEach((client, id) => {
      console.log(`[${id}] Name: ${client.name}; Port: ${client.port}; Group: ${client.group}; Online: ${client.onlinePlayers}; ServerLoad: ${client.loadPercentage}`);
    });
  },
};
