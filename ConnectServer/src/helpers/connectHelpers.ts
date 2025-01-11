import { IncomingHttpHeaders } from "http";

export const getConnectedPlayerOSType = (headers: IncomingHttpHeaders): String => {
  const clientType = headers?.clienttype as string | undefined;
  if (headers["user-agent"]) {
    return 'Browser';
  }
  if (clientType) {
    return clientType.replace("Player", "").replace("Editor", "");
  }
  return "unknown";
}

export const getConnectedPlayerOSVersion = (headers: IncomingHttpHeaders): String => {
  const clientversion = headers?.clientversion as string | undefined;
  if (headers["user-agent"]) {
    return headers["user-agent"] as string;
  }
  if (clientversion) {
    const version = [];
    if (headers?.clienttype && headers.clienttype.includes("Editor")) {
      version.push('Unity Editor');
    }
    version.push(clientversion);
    return version.join(" ");
  }
  return "unknown";
}
