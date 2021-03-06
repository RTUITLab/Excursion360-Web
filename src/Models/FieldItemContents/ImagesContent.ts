import { CustomHolographicButton } from "../../Stuff/CustomHolographicButton";
import { Scene } from "babylonjs";
import { TransformNode } from "babylonjs";
import { GUI3DManager } from "babylonjs-gui";
import { TextBlock } from "babylonjs-gui";
import { ObjectsStackPanelHelper } from "../ObjectsStackPanelHelper";
import { AssetsManager } from "babylonjs";
import { MeshBuilder } from "babylonjs";
import { StandardMaterial } from "babylonjs";
import { Color3 } from "babylonjs";
import { ActionManager } from "babylonjs";
import { ExecuteCodeAction } from "babylonjs";
import { Material } from "babylonjs";
import { Texture } from "babylonjs";
import { TextureAssetTask } from "babylonjs/Misc/assetsManager";
import { Mesh } from "babylonjs";
import { Vector3 } from "babylonjs";
import { NavigationMenu } from "../NavigationMenu";
import { FieldItemContent } from "./FieldItemContent";

export class ImagesContent implements FieldItemContent {

    get type(): string {
        return "image";
    }

    private rightButton: CustomHolographicButton;
    private leftButton: CustomHolographicButton;
    private imageButtons: NavigationMenu;
    private currentImage: number = 0;

    private resources: {
        plane: Mesh,
        material: Material,
        texture: Texture,
        task: TextureAssetTask
    }[] = [];
    private isVisible: boolean;

    setIsVisible(visible: boolean) {
        this.isVisible = visible;
        this.rightButton && (this.rightButton.isVisible = visible);
        this.leftButton && (this.leftButton.isVisible = visible);
        this.imageButtons && this.imageButtons.setIsVisible(visible);
        for (const resource of this.resources) {
            if (resource && resource.plane) {
                resource.plane.isVisible = visible;
            }
        }
        if (visible) {
            this.openPicture(this.currentImage);
        }
    }

    constructor(
        private images: string[],
        private parent: TransformNode,
        private contentWidth: number,
        private contentHeight: number,
        private gui3Dmanager: GUI3DManager,
        private assetsManager: AssetsManager,
        private scene: Scene) {
        if (images.length > 1) {

            this.rightButton = this.createButton(">", contentWidth / 2.5);
            this.rightButton.onPointerClickObservable.add(ed => {
                this.openPicture(this.currentImage + 1);
            });
            this.leftButton = this.createButton("<", -contentWidth / 2.5);
            this.leftButton.onPointerClickObservable.add(ed => {
                this.openPicture(this.currentImage - 1);
            });

            this.imageButtons = new NavigationMenu(
                images.map((image, i) => i.toString()),
                contentWidth,
                - contentHeight / 2,
                parent,
                gui3Dmanager,
                (i) => ({ width: 1, height: 1 }),
                async (i) => { this.openPicture(i); });
        }
        this.resources = images.map(i => null);
        this.openPicture(this.currentImage);
    }

    private createButton(content: string, xPosition: number = 0, yPosition = 0): CustomHolographicButton {
        var button = new CustomHolographicButton(`image-content-button-right-${content}`, 1, 1);
        this.gui3Dmanager.addControl(button);
        button.linkToTransformNode(this.parent);
        var buttonContent = new TextBlock();
        buttonContent.text = content;
        buttonContent.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        buttonContent.resizeToFit = true;
        buttonContent.color = "white";
        buttonContent.fontSize = 140;
        button.content = buttonContent;
        button.position.x = xPosition;
        button.position.y = yPosition;

        return button;
    }

    private openPicture(index: number) {
        if (index < 0) {
            index = this.resources.length + index;
        }
        index = index % this.resources.length;
        this.imageButtons && this.imageButtons.setCurrentIndex(index);
        for (let i = 0; i < this.resources.length; i++) {
            const imageResource = this.resources[i];
            if (index == i) { // Target resource
                if (!imageResource) { // Not loaded yet
                    this.resources[i] =
                    {
                        texture: null,
                        material: null,
                        plane: null,
                        task: this.loadPictureResources(index, this.images[index]),
                    };
                } else if (imageResource.plane) { // Loaded
                    imageResource.plane.isVisible = true;
                } else { // In loading, just wait

                }
            } else {
                if (imageResource && imageResource.plane) { // Hide all loaded images
                    imageResource.plane.isVisible = false;
                }
            }
        }
        this.currentImage = index;
    }

    private loadPictureResources(index: number, url: string): TextureAssetTask {
        const task = this.assetsManager.addTextureTask("image task", url, null, true);
        this.assetsManager.load();
        task.onSuccess = t => {
            var textureSize = task.texture.getSize();
            var maxSize = Math.max(textureSize.width, textureSize.height);
            var localContentWith = this.contentWidth / 1.5;
            var localContentHeight = this.contentHeight / 1.3;

            let multipler: number = 1;
            if (textureSize.width > textureSize.height) { // horizontal
                multipler = localContentWith / textureSize.width;
            } else {
                multipler = localContentHeight / textureSize.height;
            }
            const imagePlane = MeshBuilder.CreatePlane(`image_content_image_${url}`, {
                width: textureSize.width * multipler,
                height: textureSize.height * multipler
            }, this.scene);
            imagePlane.parent = this.parent;
            imagePlane.position.z = -0.1;
            var material = new StandardMaterial("", this.scene);
            material.specularColor = Color3.Black();
            material.diffuseTexture = task.texture;

            imagePlane.material = material;
            this.resources[index].plane = imagePlane;
            this.resources[index].material = material;
            this.resources[index].texture = task.texture;


            imagePlane.isVisible = this.isVisible;
            if (this.images.length > 1) {

                imagePlane.actionManager = new ActionManager(this.scene);
                imagePlane.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async (ev) => {
                    this.openPicture(this.currentImage + 1);
                }));
            }
        };
        return task;
    }

    public dispose(): void {
        this.imageButtons && this.imageButtons.dispose();
        this.rightButton && this.rightButton.dispose();
        this.leftButton && this.leftButton.dispose();
        for (const resource of this.resources) {
            if (!resource) {
                continue;
            }
            if (resource.plane) {
                resource.plane.dispose();
            }
            if (resource.material) {
                resource.plane.dispose();
            }
            if (resource.texture) {
                resource.plane.dispose();
            }
        }
    }
}