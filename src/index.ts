import { Config } from "./types";

export { CRUDAction } from "./actionBuilder";
export * from "./staticSlices/errorSlice";
export * from "./staticSlices/fetchingSlice";
export * from "./staticSlices/messageSlice";

export { LoadingIndicator } from "./LoadInterceptor";

export class GlobalConfig {
  private static config: Config;
  private constructor() {}
  public static getConfig(): Config {
    if (!GlobalConfig.config) {
      GlobalConfig.config = {};
    }
    return GlobalConfig.config;
  }
  public static setConfig(_config: Config) {
    GlobalConfig.config = _config;
  }
}
