import { LinkToState } from "./LinkToState";
import { Scene, Vector3, Material } from "babylonjs";

export class LinkToStatePool {

    private links: LinkToState[] = [];

    constructor(private scene: Scene) {}

    public getLink(
        name: string,
        position: Vector3,
        material: Material): LinkToState {
        return new LinkToState(name, position, material, this.scene);
    }

    public clean(): void {
        for (const link of this.links) {
            link.dispose();
        }
        this.links = [];
    }
}
