export class Configuration {
    public static get SceneURL(): string {
        return process.env.SCENE_URL;
    }
    public static get LogoURL(): string {
        return process.env.LOGO_URL;
    }
}