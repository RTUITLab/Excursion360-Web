import { TransformNode, Vector3, Scene, MeshBuilder, Material, AbstractMesh, ActionManager, ExecuteCodeAction, StandardMaterial, Color3, Animation } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock, Control, Rectangle, ScrollViewer } from "babylonjs-gui";
import { LinkMeshes } from "../Meshes/LinkMeshes";

export class LinkToState {
    private static linkModel: AbstractMesh;

    protected center: TransformNode;
    private linkObject: AbstractMesh;
    protected guiMesh: AbstractMesh;
    private guiTexture: AdvancedDynamicTexture;
    private textBlock: TextBlock;

    constructor(
        public name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>,
        animation: Animation,
        private scene: Scene) {
        this.center = new TransformNode(name, scene);
        this.center.position = position;

        if (!LinkToState.linkModel) {
            LinkToState.linkModel = MeshBuilder.CreatePolyhedron(`link_to_state_polyhedron`,
                {
                    custom: LinkMeshes.snubCuboctahedron,
                    size: 0.25
                }, scene).convertToFlatShadedMesh();
            LinkToState.linkModel.position.y = -100;
        }

        this.linkObject = LinkToState.linkModel.clone(`l${name}_polyhedron`, this.center);
        this.linkObject.position = Vector3.Zero();
        this.linkObject.material = material;
        this.linkObject.actionManager = new ActionManager(this.scene);
        this.linkObject.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async (ev) => {
            await triggered();
        }));
        this.linkObject.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, (ev) => {
                this.guiMesh.isVisible = true;
            }));
        this.linkObject.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, (ev) => {
                this.guiMesh.isVisible = false;
            }));
        this.guiMesh = MeshBuilder.CreatePlane(name, { width: 7, height: 2 }, scene);
        this.guiMesh.parent = this.center;
        this.guiMesh.lookAt(this.center.position.scale(1.1));
        this.guiMesh.position.y += 2;
        this.guiMesh.isVisible = true;

        const pixelsToOne = 512 / 2;

        this.guiTexture = AdvancedDynamicTexture.CreateForMesh(this.guiMesh, 7 * pixelsToOne, 2 * pixelsToOne);

        const background = new Rectangle("link text rectangle");
        background.background = "silver";
        background.alpha = 0.7;
        
        const tb = new TextBlock();
        tb.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        tb.resizeToFit = true;
        tb.color = "white";
        // tb.paddingTop = "5%";
        // tb.paddingLeft = "30px";
        // tb.paddingRight = "20px"
        // tb.paddingBottom = "5%";
        tb.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        tb.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        tb.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        tb.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        tb.text = name;
        tb.fontSize = "80px";
        
        this.guiTexture.addControl(background);
        
        background.addControl(tb);
        // this.guiTexture.addControl(sv);
        // sv.addControl(tb);
        this.linkObject.animations.push(animation);
        scene.beginAnimation(this.linkObject, 0, 60, true);
    }

    public rotate(axis: Vector3, angle: number): void {
        this.linkObject.rotate(axis, angle);
    }

    public dispose(): void {
        this.center.dispose();
        this.guiTexture.dispose();
    }
    public isLinkMesh(mesh: AbstractMesh): boolean {
        return this.linkObject == mesh;
    }
}
