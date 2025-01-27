import { GameServerInfo } from "@/messages/internal";
import { IHandler } from "./types";
import { internalClients } from "@/webSocketServer";

const GameServerInfoHandler: IHandler = {
  type: "GameServerInfo",
  handle: (_, payload, requestHeaders) => {
    const serverInfo = GameServerInfo.decode(payload);
    const serverCode = Number(requestHeaders?.['x-server-code']);
    if (typeof serverCode !== 'number') {
      return;
    }
    const server = internalClients.get(serverCode);
    if (!server) {
      return;
    }
    server.loadPercentage = serverInfo.loadPercentage;
    server.onlinePlayers = serverInfo.onlinePlayers;
  },

}

export default GameServerInfoHandler;