import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { LinkMeshes } from "../Meshes/LinkMeshes";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Material } from "@babylonjs/core/Materials/material";
import { Scene } from "@babylonjs/core/scene";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Animation } from "@babylonjs/core/Animations/animation";

export class LinkToState {
    private static linkModel: AbstractMesh;

    protected center: TransformNode;
    protected linkObject: AbstractMesh | null;
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
        linkMeshCreating?: (parent: TransformNode) => AbstractMesh | null,
        positionDetails: { scale: number, titleYPosition: number } = { scale: 1, titleYPosition: 2 }) {
        this.center = new TransformNode(name, scene);
        this.center.position = position;

        if (linkMeshCreating) {
            this.linkObject = linkMeshCreating(this.center);
        }
        else {
            this.linkObject = this.createLinkObject(`l${name}_polyhedron`, this.center, scene);
        }
        if (this.linkObject) {
            this.linkObject.position = Vector3.Zero();
            this.linkObject.material = material;
            this.linkObject.actionManager = new ActionManager(this.scene);
            this.linkObject.actionManager.registerAction(
                new ExecuteCodeAction(ActionManager.OnPickTrigger, async () => {
                    await triggered();
                }));
            this.linkObject.actionManager.registerAction(
                new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
                    this.openGuiMesh();
                }));
            this.linkObject.actionManager.registerAction(
                new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
                    this.hideGuiMesh();
                }));
        }
        this.guiMesh = MeshBuilder.CreatePlane(name, {
            width: 7 / positionDetails.scale,
            height: 2 / positionDetails.scale
        }, scene);
        this.guiMesh.parent = this.center;
        this.guiMesh.lookAt(this.center.position.scale(1.1));
        this.guiMesh.position.y += positionDetails.titleYPosition;
        this.guiMesh.isVisible = false;
        this.guiMesh.isPickable = false;

        const pixelsToOne = 512 / 2;

        this.guiTexture = AdvancedDynamicTexture.CreateForMesh(this.guiMesh,
            7 * pixelsToOne / positionDetails.scale,
            2 * pixelsToOne / positionDetails.scale);

        const background = new Rectangle("link text rectangle");
        background.background = "silver";
        background.alpha = 0.7;

        const tb = new TextBlock();
        tb.textWrapping = TextWrapping.WordWrap;
        tb.resizeToFit = true;
        tb.color = "white";
        tb.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        tb.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        tb.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        tb.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        tb.text = name;
        tb.fontSize = "80px";

        this.guiTexture.addControl(background);

        background.addControl(tb);
        if (animation && this.linkObject) {
            this.linkObject.animations.push(animation);
            scene.beginAnimation(this.linkObject, 0, 60, true);
        }
    }

    public rotate(axis: Vector3, angle: number): void {
        this.linkObject && this.linkObject.rotate(axis, angle);
    }

    public dispose(): void {
        this.guiMesh.material.dispose();
        this.center.dispose();
        this.linkObject && this.guiTexture.dispose();
    }
    public isLinkMesh(mesh: AbstractMesh): boolean {
        return this.linkObject && this.linkObject == mesh;
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
