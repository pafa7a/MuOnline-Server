import { GameServerInfo, Wrapper } from "@/messages/internal";

export const generateGameServerInfo = () => {
  return Wrapper.encode({
    type: "GameServerInfo",
    payload: GameServerInfo.encode({
      loadPercentage: 0.5,
      onlinePlayers: 50,
    }).finish(),
  }).finish();
};