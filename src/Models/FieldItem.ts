import { LinkToState } from "./LinkToState";
import { FieldItemInfo } from "./FieldItemInfo";
import { Vector3, Material, Scene, Animation, AbstractMesh, MeshBuilder, Mesh, TransformNode, VertexData, ActionEvent, StandardMaterial, AssetsManager, Texture, BackgroundMaterial, Color3, ActionManager, ExecuteCodeAction } from "babylonjs";
import { runInThisContext } from "vm";
import { CustomHolographicButton } from "../Stuff/CustomHolographicButton";
import { GUI3DManager, TextBlock } from "babylonjs-gui";
import { StackPanel3D } from "babylonjs-gui";

export class FieldItem extends LinkToState {

    private pictureTexture: Texture;
    private pictureMaterial: Material;
    private picturePlane: AbstractMesh;

    private navigationButtons: CustomHolographicButton[] = [];

    private static containerSize: number = 10;

    constructor(
        name: string,
        private fieldItemInfo: FieldItemInfo,
        private material: StandardMaterial,
        private assetsManager: AssetsManager,
        private gui3Dmanager: GUI3DManager,
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
            width: FieldItem.containerSize * 1.6,
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


        this.createButton('Фотографии', backgroundPlane);
        this.createButton('Видео', backgroundPlane);
        this.createButton('Текст', backgroundPlane);
        this.createButton('Аудио', backgroundPlane);

    }

    private createButton(title: string, parent: TransformNode) {
        var button = new CustomHolographicButton(`field-item-button-${title}`, 2, 1);
        this.navigationButtons.push(button);
        this.gui3Dmanager.addControl(button);
        button.linkToTransformNode(parent);
        var buttonContent = new TextBlock();
        buttonContent.text = title;
        buttonContent.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        buttonContent.resizeToFit = true;
        buttonContent.color = "white";
        buttonContent.fontSize = 140;
        button.content = buttonContent;
        button.contentScaleRatio = 1;
        button.isVisible = true;
        button.position.y += FieldItem.containerSize / 2; // All on one line
        button.onPointerClickObservable.add(d => this.updateSelectedButton(button));

        // Stack emulation
        const containerSize = FieldItem.containerSize * 1.4
        const size = containerSize / (this.navigationButtons.length + 1);
        console.log(`count ${this.navigationButtons.length}`);
        console.log(`size ${size}`);
        for (let i = 0; i < this.navigationButtons.length; i++) {
            const currentButton = this.navigationButtons[i];
            const position = 
                -containerSize / 2 // left point
                + size * (i + 1); // offset
            console.log(`button ${i} position ${position}`);
            currentButton.position.x = position;
        }
    }

    private updateSelectedButton(targetButton: CustomHolographicButton) {
        for (const button of this.navigationButtons) {
            button.scaling = button === targetButton ? Vector3.One().scale(1.2) : Vector3.One();
        }
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