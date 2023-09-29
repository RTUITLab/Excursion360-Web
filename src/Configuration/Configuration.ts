export class Configuration {
    public sceneUrl: string;
    public logoUrl: string;
    public bottomImage: BottomImageConfiguration | null = null;
}
export class BottomImageConfiguration {
    public url: string;
    public size: number;
}