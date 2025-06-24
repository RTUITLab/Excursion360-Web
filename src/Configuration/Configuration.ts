export class Configuration {
    public sceneUrl: string;
    public logoUrl: string;
    public bottomImage: BottomImageConfiguration | null = null;
    public forceInputProfileWebXr: string | null;
    public minFOV?: number;
    public maxFOV?: number;
}
export class BottomImageConfiguration {
    public url: string;
    public size: number;
}