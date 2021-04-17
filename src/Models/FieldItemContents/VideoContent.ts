import { Material, TransformNode, AssetsManager, Scene, TextureAssetTask } from "babylonjs";
import { VideoTexture } from "babylonjs";
import { Mesh } from "babylonjs";
import { GUI3DManager } from "babylonjs-gui";
import { MeshBuilder } from "babylonjs";
import { StandardMaterial } from "babylonjs";
import { Color3 } from "babylonjs";
import { ActionManager } from "babylonjs";
import { ExecuteCodeAction } from "babylonjs";
import { CustomHolographicButton } from "../../Stuff/CustomHolographicButton";
import { TextBlock } from "babylonjs-gui";

export class VideoContent {

    private playIcon = '\u25B6';
    private pauseIcon = 'II';



    private videoPlane: Mesh;
    private videoMaterial: Material;
    private videoTexture: VideoTexture;

    private playPauseButton: CustomHolographicButton;
    private playPauseButtonText: TextBlock;
    constructor(
        private videoUrl: string,
        private parent: TransformNode,
        private contentWidth: number,
        private contentHeight: number,
        private gui3Dmanager: GUI3DManager,
        private assetsManager: AssetsManager,
        private scene: Scene) {
        this.loadVideoResources(videoUrl);
        this.playPauseButton = this.createPlayPauseButton();
    }


    setIsVisible(visible: boolean) {
        this.videoPlane.isVisible = visible;
        this.playPauseButton.isVisible = visible;
        if (!visible) {
            this.videoTexture.video.pause();
        }
    }

    private loadVideoResources(url: string): void {

        var textureSize = { width: 1920, height: 1080 };
        var maxSize = Math.max(textureSize.width, textureSize.height);

        var multipler = 10 / maxSize;
        const plane = MeshBuilder.CreatePlane(`image_content_image_${url}`, {
            width: textureSize.width * multipler,
            height: textureSize.height * multipler
        }, this.scene);
        plane.parent = this.parent;
        plane.position.z = -0.1;
        var material = new StandardMaterial("", this.scene);
        material.specularColor = Color3.Black();

        const videoTexture = new VideoTexture(`video-item-${url}`, url, this.scene);
        videoTexture.video.pause();


        material.diffuseTexture = videoTexture;
        plane.material = material;


        plane.isVisible = true;

        plane.actionManager = new ActionManager(this.scene);
        plane.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async (ev) => {
            this.toggleVideoPlay();
        }));

        this.videoPlane = plane;
        this.videoMaterial = material;
        this.videoTexture = videoTexture;
    }

    private createPlayPauseButton() {
        var button = new CustomHolographicButton(`video-content-play-pause-button`, 1, 1);
        this.gui3Dmanager.addControl(button);
        button.linkToTransformNode(this.parent);
        var buttonContent = new TextBlock();
        buttonContent.text = this.playIcon;
        buttonContent.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        buttonContent.resizeToFit = true;
        buttonContent.color = "white";
        buttonContent.fontSize = 250;
        this.playPauseButtonText = buttonContent;
        button.content = buttonContent;
        button.contentScaleRatio = 1;
        button.isVisible = true;
        button.position.x += this.contentWidth / 2.4;
        button.onPointerClickObservable.add(e => {
            this.toggleVideoPlay();
        })
        return button;
    }

    private toggleVideoPlay() {
        if (this.videoTexture.video.paused) {
            this.videoTexture.video.play();
            this.playPauseButtonText.text = this.pauseIcon;
        } else {
            this.videoTexture.video.pause();
            this.playPauseButtonText.text = this.playIcon;
        }
    }
    public dispose() {
        this.videoPlane.dispose();
        this.videoMaterial.dispose();
        this.playPauseButton.dispose();
        this.videoTexture.dispose();
    }
}