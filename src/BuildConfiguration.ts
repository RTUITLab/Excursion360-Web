export class BuildConfiguration {
    public static get ConfigFilePath(): string {
        return process.env.CONFIG_FILE_PATTH;
    }
}
