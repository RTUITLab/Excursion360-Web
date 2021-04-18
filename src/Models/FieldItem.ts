import { LinkToState } from "./LinkToState";
import { FieldItemInfo } from "./FieldItemInfo";
import { Vector3, Material, Scene, Animation, AbstractMesh, MeshBuilder, Mesh, TransformNode, VertexData, ActionEvent, StandardMaterial, AssetsManager, Texture, BackgroundMaterial, Color3, ActionManager, ExecuteCodeAction } from "babylonjs";
import { runInThisContext } from "vm";
import { CustomHolographicButton } from "../Stuff/CustomHolographicButton";
import { GUI3DManager, TextBlock } from "babylonjs-gui";
import { StackPanel3D } from "babylonjs-gui";
import { ImagesContent } from "./FieldItemContents/ImagesContent";
import { ObjectsStackPanelHelper } from "./ObjectsStackPanelHelper";
import { NavigationMenu } from "./NavigationMenu";
import { VideoContent } from "./FieldItemContents/VideoContent";
import { TextConten as TextContent } from "./FieldItemContents/TextContent";
import { AudioContent } from "./FieldItemContents/AudioContent";

export class FieldItem extends LinkToState {

    private static containerSize: number = 10;

    private currentContentIndex: number = 0;

    private closeButton: CustomHolographicButton;
    private navigationButtons: NavigationMenu;
    private imageContent: ImagesContent;
    private videoContent: VideoContent;
    private textContent: TextContent;
    private audioContent: AudioContent;
    private contentBackground: Mesh;
    private showContent: boolean = false;
    constructor(
        name: string,
        private fieldItemInfo: FieldItemInfo,
        private onOpen: (fi: FieldItem) => Promise<void>,
        private material: StandardMaterial,
        private assetsManager: AssetsManager,
        private gui3Dmanager: GUI3DManager,
        scene: Scene) {
        super(
            name,
            Vector3.Zero(),
            material,
            async () => { await this.onTrigger(); await onOpen(this); },
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
        this.hideGuiMesh();
        this.setShowContent(true);
    }

    public setShowContent(showContent: boolean) {
        this.showContent = showContent;
        this.linkObject.isVisible = !this.showContent;
        if (!showContent && !this.contentBackground) { // Not opened yet
            return;
        }
        if (!this.contentBackground) {
            this.createContent();
        }
        this.contentBackground.isVisible = this.showContent;
        this.closeButton.isVisible = this.showContent;
        this.navigationButtons.setIsVisible(this.showContent);
        this.imageContent && this.imageContent.setIsVisible(this.showContent);
        this.videoContent && this.videoContent.setIsVisible(this.showContent);
        this.textContent && this.textContent.setIsVisible(this.showContent);
        this.audioContent && this.audioContent.setIsVisible(this.showContent);
        if (this.showContent) {
            this.changeContent(this.currentContentIndex);
        }
    }
    private createContent() {
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



        const closeButton = this.createButton('X', backgroundPlane, 1, 1);
        closeButton.position.x = FieldItem.containerSize / 1.4;
        closeButton.position.y = FieldItem.containerSize / 2;
        closeButton.onPointerClickObservable.add(e => {
            this.setShowContent(false);
        });
        this.closeButton = closeButton;

        const navMenuItems = [];

        if (this.fieldItemInfo.images && this.fieldItemInfo.images.length > 0) {
            this.imageContent = new ImagesContent(this.fieldItemInfo.images,
                backgroundPlane,
                FieldItem.containerSize * 1.6,
                FieldItem.containerSize,
                this.gui3Dmanager,
                this.assetsManager,
                this.scene);
            navMenuItems.push("Фотографии");
        }
        if (this.fieldItemInfo.videos && this.fieldItemInfo.videos.length > 0) {
            this.videoContent = new VideoContent(this.fieldItemInfo.videos[0], // TODO: handle all videos
                backgroundPlane,
                FieldItem.containerSize * 1.6,
                FieldItem.containerSize,
                () => this.audioContent && this.audioContent.pauseAudio(),
                this.gui3Dmanager,
                this.assetsManager,
                this.scene);
            navMenuItems.push("Видео");
        }

        if (this.fieldItemInfo.text && this.fieldItemInfo.text.length > 0) {
            this.textContent = new TextContent(this.fieldItemInfo.text,
                backgroundPlane,
                FieldItem.containerSize * 1,
                FieldItem.containerSize * 0.8,
                this.gui3Dmanager,
                this.assetsManager,
                this.scene);
            navMenuItems.push("Текст");
        }


        this.navigationButtons = new NavigationMenu(
            navMenuItems,
            FieldItem.containerSize * 1.6,
            FieldItem.containerSize / 2,
            backgroundPlane,
            this.gui3Dmanager,
            () => ({ width: 2, height: 1 }),
            async (i) => { this.changeContent(i); }
        );

        if (this.fieldItemInfo.audios && this.fieldItemInfo.audios.length > 0) {
            this.audioContent = new AudioContent(this.fieldItemInfo.audios[0], backgroundPlane,
                FieldItem.containerSize * 1.6,
                FieldItem.containerSize / 2,
                () => this.videoContent && this.videoContent.pauseVideo(),
                this.gui3Dmanager, this.assetsManager, this.scene);

        }
        this.contentBackground = backgroundPlane;
        this.changeContent(0);
    }

    private changeContent(contentIndex: number) {
        this.navigationButtons.setCurrentIndex(contentIndex);

        this.imageContent && this.imageContent.setIsVisible(false);
        this.videoContent && this.videoContent.setIsVisible(false);
        this.textContent && this.textContent.setIsVisible(false);
        switch (contentIndex) {
            case 0:
                this.imageContent.setIsVisible(true);
                break;
            case 1:
                this.videoContent.setIsVisible(true);
                break;
            case 2:
                this.textContent.setIsVisible(true);
            default: break;
        }
    }


    private createButton(title: string, parent: TransformNode, width = 2, height = 1): CustomHolographicButton {
        var button = new CustomHolographicButton(`field-item-button-${title}`, width, height);
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
        button.position.y += FieldItem.containerSize / 2; // top bar
        return button;
    }


    protected openGuiMesh() {
        super.openGuiMesh();
        this.material.alpha = 0.6;
    }
    protected hideGuiMesh() {
        super.hideGuiMesh();
        this.material.alpha = 0.3;
    }

    public dispose() {
        super.dispose();
        if (this.contentBackground) {
            this.contentBackground.dispose();
            this.material.dispose();
            this.imageContent && this.imageContent.dispose();
            this.videoContent && this.videoContent.dispose();
            this.textContent && this.textContent.dispose();
            this.audioContent && this.audioContent.dispose();
            this.navigationButtons.dispose();
        }
    }
}