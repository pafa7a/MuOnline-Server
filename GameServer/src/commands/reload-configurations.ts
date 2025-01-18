import { loadAllConfigs } from "@/helpers/configHelpers";

export default {
  name: "reload-configurations",
  description: "Reloads all configurations.",
  async execute() {
    loadAllConfigs();
  },
};
