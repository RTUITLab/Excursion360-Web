export class Configuration {
    public static get SceneURL(): string {
        return process.env.SCENE_URL;
    }
}