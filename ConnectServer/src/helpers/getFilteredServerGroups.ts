import { getConfig } from "@/helpers/configHelpers";
import { ServerGroupInfo } from "@/messages/connect";
import { internalClients } from "@/webSocketServer";

interface Server {
  id: Number;
  name: String;
  ip: String;
  port: Number;
  loadPercentage: String;
}

interface ServerGroup {
  name: String;
  servers: Server[];
}

const getFilteredServerGroups = () => {
  const serverGroups = getConfig('common', 'serverGroups') as ServerGroup[];

  // Add servers to server groups, based on the group index.
  serverGroups.forEach((group, groupIndex) => {
    group.servers = Array.from(internalClients.values())
    .filter(client => client.group === groupIndex)
    .map((client, id) => ({
      id,
      name: client.name.toString(),
      ip: "77.85.106.132",
      port: Number(client.port),
      loadPercentage: client.loadPercentage || '0'
    }));
  });

  // Filter out server groups with empty servers array.
  return serverGroups.filter((group: ServerGroup): boolean => group.servers.length > 0) as ServerGroupInfo[];
}

export default getFilteredServerGroups;