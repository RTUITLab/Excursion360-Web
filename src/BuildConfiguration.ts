export class BuildConfiguration {
    public static get ConfigFilePath(): string {
        return process.env.CONFIG_FILE_PATTH;
    }
    public static get NeedDebugLayer(): string {
        return process.env.NEED_DEBUG_LAYER;
    }
}
