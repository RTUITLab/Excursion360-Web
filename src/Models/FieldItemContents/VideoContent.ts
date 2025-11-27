import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import type { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { VideoTexture } from "@babylonjs/core/Materials/Textures/videoTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import type { Scene } from "@babylonjs/core/scene";
import { TextWrapping } from "@babylonjs/gui/2D/controls";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { CustomHolographicButton } from "../../Stuff/CustomHolographicButton";
import type { FieldItemContent } from "./FieldItemContent";

export class VideoContent implements FieldItemContent {
	static readonly CONTENT_TYPE: string = "video";

	get type(): string {
		return VideoContent.CONTENT_TYPE;
	}

	private playIcon = "\u25B6";
	private pauseIcon = "II";

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
		private onPlay: () => void,
		private gui3Dmanager: GUI3DManager,
		private assetsManager: AssetsManager,
		private scene: Scene,
	) {
		this.loadVideoResources(videoUrl);
		this.playPauseButton = this.createPlayPauseButton();
	}

	setIsVisible(visible: boolean) {
		this.videoPlane.isVisible = visible;
		this.playPauseButton.isVisible = visible;
		if (!visible) {
			this.videoTexture.video.pause();
			this.playPauseButtonText.text = this.playIcon;
		}
	}

	private loadVideoResources(url: string): void {
		var textureSize = { width: 1920, height: 1080 };
		var maxSize = Math.max(textureSize.width, textureSize.height);

		var multipler = 10 / maxSize;
		const plane = MeshBuilder.CreatePlane(
			`image_content_image_${url}`,
			{
				width: textureSize.width * multipler,
				height: textureSize.height * multipler,
			},
			this.scene,
		);
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
		plane.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnPickTrigger, async () => {
				this.toggleVideoPlay();
			}),
		);

		this.videoPlane = plane;
		this.videoMaterial = material;
		this.videoTexture = videoTexture;
	}

	private createPlayPauseButton() {
		var button = new CustomHolographicButton(
			`video-content-play-pause-button`,
			1,
			1,
		);
		this.gui3Dmanager.addControl(button);
		button.linkToTransformNode(this.parent);
		var buttonContent = new TextBlock();
		buttonContent.text = this.playIcon;
		buttonContent.textWrapping = TextWrapping.WordWrap;
		buttonContent.resizeToFit = true;
		buttonContent.color = "white";
		buttonContent.fontSize = 250;
		this.playPauseButtonText = buttonContent;
		button.content = buttonContent;

		button.isVisible = true;
		button.position.x += this.contentWidth / 2.4;
		button.onPointerClickObservable.add(() => {
			this.toggleVideoPlay();
		});
		return button;
	}

	public playVideo() {
		this.onPlay();
		this.videoTexture.video.play();
		this.playPauseButtonText.text = this.pauseIcon;
	}
	public pauseVideo() {
		this.videoTexture.video.pause();
		this.playPauseButtonText.text = this.playIcon;
	}

	private toggleVideoPlay() {
		if (this.videoTexture.video.paused) {
			this.playVideo();
		} else {
			this.pauseVideo();
		}
	}
	public dispose() {
		this.videoPlane.dispose();
		this.videoMaterial.dispose();
		this.playPauseButton.dispose();
		this.videoTexture.dispose();
	}
}
