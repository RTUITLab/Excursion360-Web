import { LinkToState } from "./LinkToState";
import { Scene, Vector3, Material, AbstractMesh, Animation } from "babylonjs";
import { GroupLink } from "./GroupLink";

export class LinkToStatePool {

    private links: LinkToState[] = [];

    // private timer: NodeJS.Timeout;

    constructor(private scene: Scene) {
        setInterval(() => {
            for (const link of this.links) {
                link.rotate(Vector3.Up(), Math.PI / 180);
            }
        }, 10);
    }

    public getLink(
        name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>): LinkToState {
        const link = new LinkToState(name, position, material, triggered, this.scene);
        this.links.push(link);
        return link;
    }
    public getGroupLink(
        name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>): LinkToState {
        const link = new GroupLink(name, position, material, triggered, this.scene);
        this.links.push(link);
        return link;
    }

    public clean(): void {
        for (const link of this.links) {
            link.dispose();
        }
        this.links = [];
    }

    public isLinkMesh(mesh: AbstractMesh): boolean {
        return this.links.some(l => l.isLinkMesh(mesh));
    }
}
