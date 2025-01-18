import { loadAllConfigs } from "@/helpers/configHelpers";
import { initWebSocketServer } from "@/webSocketServer";
import { initCli } from "@/cli";

loadAllConfigs();
initWebSocketServer();
initCli();