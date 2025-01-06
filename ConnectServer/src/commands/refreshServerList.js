import { encodeServerListResponse } from "@messages/messages";

export default {
  name: "refreshServerList",
  description: "Send the updated server list to all connected clients",
  execute(_, connectedClients) {
    console.log("Refreshing server list...");

    const serverList = [
      { name: "GameServer1", ip: "127.0.0.1", port: 5000 },
      { name: "GameServer2", ip: "127.0.0.2", port: 5001 },
    ];

    const serverListMessage = { servers: serverList };

    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const encoded = encodeServerListResponse(serverListMessage);
        client.send(encoded);
      }
    });

    console.log("Server list refreshed!");
  },
};
