import { ServerGroupList, Wrapper } from "@/messages/connect";
import { IHandler } from "./types";
import getFilteredServerGroups from "@/helpers/getFilteredServerGroups";

const RequestServerList: IHandler = {
  type: "RequestServerGroupList",
  handle: (ws, _) => {
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
    ws.send(response);
  },
};

export default RequestServerList;