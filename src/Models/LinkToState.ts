import { TransformNode, Vector3, Scene, MeshBuilder, Material, AbstractMesh, ActionManager, ExecuteCodeAction, StandardMaterial, Color3, Animation, ActionEvent } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock, Control, Rectangle, ScrollViewer } from "babylonjs-gui";
import { LinkMeshes } from "../Meshes/LinkMeshes";

export class LinkToState {
    private static linkModel: AbstractMesh;

    protected center: TransformNode;
    protected linkObject: AbstractMesh;
    protected guiMesh: AbstractMesh;
    private guiTexture: AdvancedDynamicTexture;
    private textBlock: TextBlock;

    constructor(
        public name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>,
        animation: Animation,
        protected scene: Scene,
        linkMeshCreating?: (parent: TransformNode) => AbstractMesh,
        minimizing: { scale: number } = { scale: 1 }) {
        this.center = new TransformNode(name, scene);
        this.center.position = position;

        if (linkMeshCreating) {
            this.linkObject = linkMeshCreating(this.center);
        }
        else {
            this.linkObject = this.createLinkObject(`l${name}_polyhedron`, this.center, scene);
        }
        this.linkObject.position = Vector3.Zero();
        this.linkObject.material = material;
        this.linkObject.actionManager = new ActionManager(this.scene);
        this.linkObject.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async (ev) => {
            await triggered();
        }));
        this.linkObject.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, (ev) => {
                this.openGuiMesh();
            }));
        this.linkObject.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, (ev) => {
                this.hideGuiMesh();
            }));
        this.guiMesh = MeshBuilder.CreatePlane(name, {
            width: 7 / minimizing.scale,
            height: 2 / minimizing.scale
        }, scene);
        this.guiMesh.parent = this.center;
        this.guiMesh.lookAt(this.center.position.scale(1.1));
        this.guiMesh.position.y += 2;
        this.guiMesh.isVisible = false;
        this.guiMesh.isPickable = false;

        const pixelsToOne = 512 / 2;

        this.guiTexture = AdvancedDynamicTexture.CreateForMesh(this.guiMesh,
            7 * pixelsToOne / minimizing.scale,
            2 * pixelsToOne / minimizing.scale);

        const background = new Rectangle("link text rectangle");
        background.background = "silver";
        background.alpha = 0.7;

        const tb = new TextBlock();
        tb.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        tb.resizeToFit = true;
        tb.color = "white";
        tb.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        tb.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        tb.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        tb.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        tb.text = name;
        tb.fontSize = "80px";

        this.guiTexture.addControl(background);

        background.addControl(tb);
        if (animation) {
            this.linkObject.animations.push(animation);
            scene.beginAnimation(this.linkObject, 0, 60, true);
        }
    }

    public rotate(axis: Vector3, angle: number): void {
        this.linkObject.rotate(axis, angle);
    }

    public dispose(): void {
        this.guiMesh.material.dispose();
        this.center.dispose();
        this.guiTexture.dispose();
    }
    public isLinkMesh(mesh: AbstractMesh): boolean {
        return this.linkObject == mesh;
    }

    protected createLinkObject(name: string, parent: TransformNode, scene: Scene): AbstractMesh {
        if (!LinkToState.linkModel) {
            LinkToState.linkModel = MeshBuilder.CreatePolyhedron(`link_to_state_polyhedron`,
                {
                    custom: LinkMeshes.snubCuboctahedron,
                    size: 0.3
                }, scene).convertToFlatShadedMesh();
            LinkToState.linkModel.position.y = -100;
        }

        return LinkToState.linkModel.clone(`l${name}_polyhedron`, this.center);
    }
    protected openGuiMesh() {
        if (this.name) {
            this.guiMesh.isVisible = true;
        }
    }
    protected hideGuiMesh() {
        this.guiMesh.isVisible = false;
    }
}
