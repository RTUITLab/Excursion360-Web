import { LinkToState } from "./LinkToState";
import { FieldItemInfo } from "./FieldItemInfo";
import { Vector3, Material, Scene, Animation, AbstractMesh, MeshBuilder, Mesh, TransformNode, VertexData, ActionEvent, StandardMaterial, AssetsManager, Texture, BackgroundMaterial, Color3, ActionManager, ExecuteCodeAction } from "babylonjs";
import { runInThisContext } from "vm";

export class FieldItem extends LinkToState {

    private pictureTexture: Texture;
    private pictureMaterial: Material;
    private picturePlane: AbstractMesh;

    private static containerSize: number = 10;

    constructor(
        name: string,
        private fieldItemInfo: FieldItemInfo,
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
        var longPosition = fieldItemInfo.vertex[0].add(fieldItemInfo.vertex[1]).scale(0.5);
        var correctPosition = longPosition.normalize().scale(fieldItemInfo.distance);
        this.guiMesh.position = correctPosition;
        this.guiMesh.position.y += 0.6;
        this.guiMesh.lookAt(this.guiMesh.position.scale(1.1));
    }

    protected async onTrigger() {
        this.linkObject.isVisible = false;
        if (this.pictureMaterial == null) {
            await this.createBackgdroundPlane();
            await this.loadPictureResources();
        }
        if (this.picturePlane) {
            this.picturePlane.isVisible = true;
        }
    }
    private async createBackgdroundPlane() {
        console.error("TODO debug mode, just creating");
        const backgroundPlane = MeshBuilder.CreatePlane(`${this.name}_background_plane`, {
            width: FieldItem.containerSize * 1.2,
            height: FieldItem.containerSize * 1.2
        }, this.scene);
        backgroundPlane.parent = this.center;
        const centerPosition = this.fieldItemInfo
            .vertex
            .reduce((prev, curr) => prev.add(curr))
            .normalize()
            .scale(this.fieldItemInfo.distance * 1.1);
        backgroundPlane.position = centerPosition;
        backgroundPlane.lookAt(centerPosition.scale(1.4));

        backgroundPlane.material = this.material;
    }

    private async loadPictureResources() {
        const task = this.assetsManager.addTextureTask("image task", this.fieldItemInfo.images[0], null, true);
        this.assetsManager.load();

        const centerPosition = this.fieldItemInfo
            .vertex
            .reduce((prev, curr) => prev.add(curr))
            .normalize()
            .scale(this.fieldItemInfo.distance);

        task.onSuccess = t => {
            var textureSize = task.texture.getSize();
            var maxSize = Math.max(textureSize.width, textureSize.height);
            var multipler = 10 / maxSize;
            this.picturePlane = MeshBuilder.CreatePlane(`${this.name}_plane`, {
                width: textureSize.width * multipler,
                height: textureSize.height * multipler
            }, this.scene);
            this.picturePlane.parent = this.center;
            this.picturePlane.position = centerPosition;
            this.picturePlane.lookAt(centerPosition.scale(1.1));
            var material = new StandardMaterial("", this.scene);
            material.specularColor = Color3.Black();
            material.diffuseTexture = task.texture;

            this.picturePlane.material = material;
            this.pictureMaterial = material;
            this.pictureTexture = task.texture;

            this.picturePlane.isVisible = true;

            this.picturePlane.actionManager = new ActionManager(this.scene);
            this.picturePlane.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async (ev) => {
                this.picturePlane.isVisible = false;
                this.linkObject.isVisible = true;
            }));
        };
    }


    protected openGuiMesh() {
        super.openGuiMesh();
        this.material.alpha += 0.3;
    }
    protected hideGuiMesh() {
        super.hideGuiMesh();
        this.material.alpha -= 0.3;
    }

    public dispose() {
        super.dispose();
        this.material.dispose();
        if (this.pictureTexture) {
            this.pictureTexture.dispose();
        }
        if (this.pictureMaterial) {
            this.pictureMaterial.dispose();
        }
    }
}