import { LinkToState } from "./LinkToState";
import { Vector3, Material, Scene, Animation, AbstractMesh, MeshBuilder, Mesh, TransformNode, VertexData, ActionEvent, StandardMaterial, AssetsManager, Texture, BackgroundMaterial, Color3, ActionManager, ExecuteCodeAction } from "babylonjs";
import { runInThisContext } from "vm";

export class FieldItem extends LinkToState {

    private pictureTexture: Texture;
    private pictureMaterial: Material;
    private picturePlane: AbstractMesh;

    constructor(
        name: string,
        private fieldItemInfo: { vertex: Vector3[], imageUrl: string },
        private material: StandardMaterial,
        private assetsManager: AssetsManager,
        scene: Scene) {
        super(
            name,
            Vector3.Zero(),
            material,
            () => this.onTrigger(),
            null,
            scene,
            (p) => {
                const customMesh = new Mesh(name, scene, p);
                const vertexData = new VertexData();
                vertexData.positions = fieldItemInfo.vertex.map(v => [v.x, v.y, v.z]).reduce((a, b) => a.concat(b));
                vertexData.indices = [2, 1, 0, 3, 2, 0];
                vertexData.applyToMesh(customMesh);
                return customMesh;
            });
        this.guiMesh.position = fieldItemInfo.vertex[0].add(fieldItemInfo.vertex[1]).scale(0.5);
        this.guiMesh.position.y += 0.6;
        this.guiMesh.lookAt(this.guiMesh.position.scale(1.1));
    }

    protected async onTrigger() {
        this.linkObject.isVisible = false;
        if (this.pictureMaterial == null) {
            await this.loadPictureResources();
        }
        this.picturePlane.isVisible = true;
    }


    private async loadPictureResources() {
        const task = this.assetsManager.addTextureTask("image task", this.fieldItemInfo.imageUrl, null, true);
        this.assetsManager.load();
        await this.assetsManager.loadAsync();

        var centerPosition = this.fieldItemInfo.vertex.reduce((prev, curr) => prev.add(curr));
        centerPosition = centerPosition.scale(1 / this.fieldItemInfo.vertex.length);

        var textureSize = task.texture.getSize();
        var maxSize = Math.max(textureSize.width, textureSize.height);
        var multipler = 10 / maxSize;
        this.picturePlane = MeshBuilder.CreatePlane(`${this.name}_plane`, { width: textureSize.width * multipler, height: textureSize.height * multipler }, this.scene);

        this.picturePlane.parent = this.center;
        this.picturePlane.position = centerPosition;
        this.picturePlane.lookAt(centerPosition.scale(1.1));

        var material = new StandardMaterial("", this.scene);
        material.specularColor = Color3.Black();
        material.diffuseTexture = task.texture;

        this.picturePlane.material = material;
        this.pictureMaterial = material;
        this.pictureTexture = task.texture;

        this.picturePlane.isVisible = false;

        this.picturePlane.actionManager = new ActionManager(this.scene);
        this.picturePlane.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async (ev) => {
            this.picturePlane.isVisible = false;
            this.linkObject.isVisible = true;
        }));

    }


    protected onPointerOverTrigger(event: ActionEvent) {
        super.onPointerOverTrigger(event);
        this.material.alpha += 0.3;
    }
    protected onPointerOutTrigger(event: ActionEvent) {
        super.onPointerOutTrigger(event);
        this.material.alpha -= 0.3;
    }

    public dispose() {
        super.dispose();
        this.material.dispose();
        if (this.pictureTexture) {
            this.pictureTexture.dispose();
        }
        if (this.pictureMaterial)
        {
            this.pictureMaterial.dispose();
        }
    }
}