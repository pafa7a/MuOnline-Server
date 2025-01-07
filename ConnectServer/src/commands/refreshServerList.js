import { encodeServerListResponse } from "@messages/messages";
import { decodeServerListResponse, decodeWrapper, encodeHelloResponse, encodeServerInfo, encodeWrapper } from "@server/messages/messages";
import { wss } from "@server/server";

export default {
  name: "refreshServerList",
  description: "Send the updated server list to all connected clients",
  execute(args) {
    console.log("Refreshing server list...");
    const response = encodeWrapper({
      type: 'ServerListResponse',
      payload: encodeServerListResponse({
        servers: [
          {
            name: 'test',
            ip: 'IP',
            port: 55901
          },
          {
            name:(Math.random() + 1).toString(36).substring(7),
            ip: 'IP2',
            port: 55919
          }
        ]
      })
    })
    wss.broadcast(response);
    // const serverList = [
    //   { name: "GameServer1", ip: "127.0.0.1", port: 5000 },
    //   { name: "GameServer2", ip: "127.0.0.2", port: 5001 },
    // ];

    // const serverListMessage = { servers: serverList };

    // connectedClients.forEach((client) => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     const encoded = encodeServerListResponse(serverListMessage);
    //     client.send(encoded);
    //   }
    // });

    // console.log("Server list refreshed!");
  },
};
