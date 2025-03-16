import { AddChatMessage, PlayerSendChatMessage, SetPlayerColor, Wrapper } from "@/messages/gameserver";
import { IHandler } from "./types";
import { playerStates, wss, wsToUserId } from "@/webSocketServer";

const PlayerSendChatMessageHandler: IHandler = {
  type: "PlayerSendChatMessage",
  handle: (ws, payload) => {
    const data = PlayerSendChatMessage.decode(payload);
    const userId = wsToUserId.get(ws);
    if (!userId) {
      return;
    }
    const playerState = playerStates.get(userId);
    if (!playerState) {
      return;
    }

    if (data.message.startsWith('/setcolor ')) {
      const [_, username, ...colors] = data.message.split(' ');
      const [r, g, b] = colors.map(Number);
      if (!username || colors.length !== 3) {
        return;
      }
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return;
      }

      const targetPlayerState = Array.from(playerStates.values()).find(p => p.username === username);
      if (!targetPlayerState) {
        return;
      }

      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        targetPlayerState.color = { r, g, b };
        const message = Wrapper.encode({
          type: "SetPlayerColor",
          payload: SetPlayerColor.encode({
            id: targetPlayerState.id.toString(),
            color: { r, g, b },
          }).finish(),
        }).finish();
        wss.broadcast(message);
        return;
      }
    }

    if (data.message.startsWith('/')) {
      return;
    }

    const message = Wrapper.encode({
      type: "AddChatMessage",
      payload: AddChatMessage.encode({
        id: userId.toString(),
        username: playerState.username,
        message: data.message,
      }).finish(),
    }).finish();

    wss.broadcast(message);
  },
};

export default PlayerSendChatMessageHandler;