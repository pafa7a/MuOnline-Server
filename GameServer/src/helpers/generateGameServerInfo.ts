import { GameServerInfo, Wrapper } from "@/messages/internal";
import { connectedClients } from "@/webSocketServer";
import { getConfig } from "@/helpers/configHelpers";

export const generateGameServerInfo = () => {
  const onlinePlayers = connectedClients.size;
  const maxPlayers = getConfig('common', 'maxPlayers');
  const loadPercentage = (maxPlayers > 0 ? onlinePlayers / maxPlayers : 0).toFixed(2);
  return Wrapper.encode({
    type: "GameServerInfo",
    payload: GameServerInfo.encode({
      loadPercentage,
      onlinePlayers,
    }).finish(),
  }).finish();
};