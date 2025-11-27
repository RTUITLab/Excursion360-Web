export class BuildConfiguration {
	public static get ConfigFilePath(): string {
		return process.env.CONFIG_FILE_PATH;
	}
	public static get NeedDebugLayer(): boolean {
		return process.env.NEED_DEBUG_LAYER === "true";
	}
}
