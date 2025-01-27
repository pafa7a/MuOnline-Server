import getFilteredServerGroups from "@/helpers/getFilteredServerGroups";
import { ServerGroupList, Wrapper } from "@/messages/connect";
import { externalWss } from "@/webSocketServer";

export default {
  name: "refreshServerList",
  description: "Send the updated server list to all connected clients",
  execute(args: any) {
    const filteredServerGroups = getFilteredServerGroups();
    if (filteredServerGroups.length === 0) {
      return;
    }

    const response = Wrapper.encode({
      type: "ServerGroupList",
      payload: ServerGroupList.encode({
        serverGroups: filteredServerGroups,
      }).finish(),
    }).finish();

    externalWss.broadcast(response);
  },
};
