import { LinkToState } from "./LinkToState";
import { Scene, Vector3, Material, AbstractMesh, Animation, StandardMaterial, AssetsManager } from "babylonjs";
import { GroupLink } from "./GroupLink";
import { GUI3DManager } from "babylonjs-gui";
import { FieldItem } from "./FieldItem";

// TODO reuse link objects
export class LinkToStatePool {
    private linkAnimation: Animation;
    private links: LinkToState[] = [];
    private guiManager: GUI3DManager;
    // private timer: NodeJS.Timeout;

    constructor(
        private assetsManager: AssetsManager,
        private scene: Scene) {
        var animationBox = new Animation(
            "linkToStateAnimation",
            "rotation.y",
            15,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE);

        var keys = [
            {
                frame: 0,
                value: 0
            },
            {
                frame: 30,
                value: Math.PI
            },
            {
                frame: 60,
                value: Math.PI * 2
            }
        ];
        animationBox.setKeys(keys);
        this.linkAnimation = animationBox;

        this.guiManager = new GUI3DManager(scene);
    }

    public getLink(
        name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>): LinkToState {
        const link = new LinkToState(name, position, material, triggered, this.linkAnimation, this.scene);
        this.links.push(link);
        return link;
    }

    public getGroupLink(
        name: string,
        states: { title: string, id: string }[],
        position: Vector3,
        material: Material,
        triggered: (id: string) => Promise<void>): LinkToState {
        const link = new GroupLink(name, states, position, material, triggered, this.linkAnimation, this.guiManager, this.scene);
        this.links.push(link);
        return link;
    }

    public getFieldItem(
        name: string,
        fieldItemData: { vertex: Vector3[], imageUrl: string },
        material: StandardMaterial): LinkToState {
        const link = new FieldItem(
            name,
            fieldItemData,
            material.clone(name),
            this.assetsManager,
            this.scene);
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
