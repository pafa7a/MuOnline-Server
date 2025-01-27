import { loadAllConfigs } from "@/helpers/configHelpers";
import { initWebSocketServer } from "@/webSocketServer";
import { initCli } from "@/cli";
import { connectToConnectServer } from "@/helpers/connectServerConnection";

loadAllConfigs();
initWebSocketServer();
connectToConnectServer();
initCli();