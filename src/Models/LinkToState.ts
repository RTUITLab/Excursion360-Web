import { TransformNode, Vector3, Scene, MeshBuilder, Material, AbstractMesh, ActionManager, ExecuteCodeAction } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
import { LinkMeshes } from "../Meshes/LinkMeshes";

export class LinkToState {
    private static linkModel: AbstractMesh;

    private center: TransformNode;
    private linkObject: AbstractMesh;
    private guiMesh: AbstractMesh;
    private guiTexture: AdvancedDynamicTexture;
    private textBlock: TextBlock;

    constructor(
        public name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>,
        private scene: Scene) {
        this.center = new TransformNode(name, scene);
        this.center.position = position;

        if (!LinkToState.linkModel) {
            LinkToState.linkModel = MeshBuilder.CreatePolyhedron(`link_to_state_polyhedron`,
                {
                    custom: LinkMeshes.snubCuboctahedron,
                    size: 0.5
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

        this.guiMesh = MeshBuilder.CreatePlane(name, { size: 20 }, scene);
        this.guiMesh.parent = this.center;
        this.guiMesh.position.y += 1.5;
        this.guiMesh.lookAt(this.center.position.scale(1.1));
        this.guiMesh.isVisible = false;

        this.guiTexture = AdvancedDynamicTexture.CreateForMesh(this.guiMesh);
        this.textBlock = new TextBlock(`${name}_text_block`, name);
        this.textBlock.fontSize = 50;
        this.textBlock.color = "white";
        this.textBlock.text = name;
        this.textBlock.shadowOffsetX = 1;
        this.textBlock.shadowOffsetY = 1;
        this.guiTexture.addControl(this.textBlock);
    }

    public rotate(axis: Vector3, angle: number): void {
        this.linkObject.rotate(axis, angle);
    }

    public dispose(): void {
        this.textBlock.dispose();
        this.guiTexture.dispose();
        this.guiMesh.dispose();
        this.linkObject.dispose();
        this.center.dispose();
    }
}
