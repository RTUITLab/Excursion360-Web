import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import type { Scene } from "@babylonjs/core/scene";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { CustomHolographicButton } from "../Stuff/CustomHolographicButton";
import { AudioContent } from "./FieldItemContents/AudioContent";
import type { FieldItemContent } from "./FieldItemContents/FieldItemContent";
import { ImagesContent } from "./FieldItemContents/ImagesContent";
import { TextContent } from "./FieldItemContents/TextContent";
import { VideoContent } from "./FieldItemContents/VideoContent";
import type { FieldItemInfo } from "./FieldItemInfo";
import { LinkToState } from "./LinkToState";
import { NavigationMenu } from "./NavigationMenu";

export class FieldItem extends LinkToState {
	private static containerSize: number = 10;

	private currentContentIndex: number = 0;

	private closeButton: CustomHolographicButton;
	private navigationButtons: NavigationMenu;

	private contentList: FieldItemContent[] = [];
	private get audioContent(): AudioContent {
		return this.contentList.find(
			(i) => i.type === AudioContent.CONTENT_TYPE,
		) as AudioContent;
	}

	private get videoContent(): VideoContent {
		return this.contentList.find(
			(i) => i.type === VideoContent.CONTENT_TYPE,
		) as VideoContent;
	}

	private contentBackground: Mesh;
	private showContent: boolean = false;
	constructor(
		name: string,
		private fieldItemInfo: FieldItemInfo,
		private onOpen: (fi: FieldItem) => Promise<void>,
		private onPlayMedia: () => void,
		private material: StandardMaterial,
		private assetsManager: AssetsManager,
		private gui3Dmanager: GUI3DManager,
		scene: Scene,
	) {
		super(
			name,
			Vector3.Zero(),
			material,
			async () => {
				await this.onTrigger();
				await this.onOpen(this);
			},
			null,
			scene,
			(p) => {
				const customMesh = new Mesh(name, scene, p);
				const vertexData = new VertexData();
				vertexData.positions = fieldItemInfo.vertex
					.map((v) => [v.x, v.y, v.z])
					.reduce((a, b) => a.concat(b));
				vertexData.indices = [2, 1, 0, 3, 2, 0];
				vertexData.applyToMesh(customMesh);
				return customMesh;
			},
		);

		var longPosition = fieldItemInfo.vertex[0]
			.add(fieldItemInfo.vertex[1])
			.scale(0.5);
		var correctPosition = longPosition
			.normalize()
			.scale(fieldItemInfo.distance);
		this.guiMesh.position = correctPosition;
		this.guiMesh.position.y += 0.6;
		this.guiMesh.lookAt(this.guiMesh.position.scale(1.1));
	}

	protected async onTrigger() {
		this.hideGuiMesh();
		this.setShowContent(true);
	}

	/** Останавливает аудио, если оно есть */
	public pauseAudio(): void {
		this.audioContent?.pauseAudio();
	}

	public setShowContent(showContent: boolean) {
		this.showContent = showContent;
		this.linkObject.isVisible = !this.showContent;
		if (!showContent && !this.contentBackground) {
			// Not opened yet
			return;
		}
		if (!this.contentBackground) {
			this.createContent();
		}
		this.contentBackground.isVisible = this.showContent;
		this.closeButton.isVisible = this.showContent;
		this.navigationButtons?.setIsVisible(this.showContent);

		for (const content of this.contentList) {
			content.setIsVisible(this.showContent);
		}

		if (this.showContent) {
			this.changeContent(this.currentContentIndex);
		}
	}
	private createContent() {
		const backgroundPlane = MeshBuilder.CreatePlane(
			`${this.name}_background_plane`,
			{
				width: FieldItem.containerSize * 1.6,
				height: FieldItem.containerSize * 1.2,
			},
			this.scene,
		);
		backgroundPlane.actionManager = new ActionManager(this.scene);
		backgroundPlane.parent = this.center;
		const centerPosition = this.fieldItemInfo.vertex
			.reduce((prev, curr) => prev.add(curr))
			.normalize()
			.scale(this.fieldItemInfo.distance * 0.9);
		backgroundPlane.position = centerPosition;
		backgroundPlane.lookAt(centerPosition.scale(1.4));

		backgroundPlane.material = this.material;

		const closeButton = this.createButton("X", backgroundPlane, 1, 1);
		closeButton.position.x = FieldItem.containerSize / 1.4;
		closeButton.position.y = FieldItem.containerSize / 2;
		closeButton.onPointerClickObservable.add(() => {
			this.setShowContent(false);
		});
		this.closeButton = closeButton;

		const navMenuItems = [];

		/** Как временное решение - изображения включают свое звуковое сопровождение через глобальный проигрыватель аудио на интерактивном компоненте. Если он занят - просто audio на компоненте включить не поулчится */
		const audioContentUsedByImageContent = this.fieldItemInfo.images.some(
			(i) => !!i.audio,
		);

		if (this.fieldItemInfo.images && this.fieldItemInfo.images.length > 0) {
			let audioContent: AudioContent | null = null;
			if (audioContentUsedByImageContent) {
				// если в фотографиях есть необходимость в аудио - создаем его
				audioContent = this.createEmptyAudioContent(backgroundPlane);
			}
			const imageContent = new ImagesContent(
				this.fieldItemInfo.images,
				backgroundPlane,
				FieldItem.containerSize * 1.6,
				FieldItem.containerSize,
				this.gui3Dmanager,
				this.assetsManager,
				this.scene,
				audioContent,
			);
			this.contentList.push(imageContent);
			navMenuItems.push("Фотографии");
		}
		if (this.fieldItemInfo.videos && this.fieldItemInfo.videos.length > 0) {
			const videoContent = new VideoContent(
				this.fieldItemInfo.videos[0], // TODO: handle all videos
				backgroundPlane,
				FieldItem.containerSize * 1.6,
				FieldItem.containerSize,
				() => {
					this.onPlayMedia();
					this.audioContent?.pauseAudio();
				},
				this.gui3Dmanager,
				this.assetsManager,
				this.scene,
			);
			this.contentList.push(videoContent);
			navMenuItems.push("Видео");
		}

		if (this.fieldItemInfo.text && this.fieldItemInfo.text.length > 0) {
			const textContent = new TextContent(
				this.fieldItemInfo.text,
				backgroundPlane,
				FieldItem.containerSize * 1,
				FieldItem.containerSize * 0.8,
				this.scene,
			);
			this.contentList.push(textContent);
			navMenuItems.push("Текст");
		}

		if (navMenuItems.length > 1) {
			this.navigationButtons = new NavigationMenu(
				navMenuItems,
				FieldItem.containerSize * 1.6,
				FieldItem.containerSize / 2,
				backgroundPlane,
				this.gui3Dmanager,
				() => ({ width: 2, height: 1 }),
				async (i) => {
					this.changeContent(i);
				},
			);
		}

		if (this.fieldItemInfo.audios && this.fieldItemInfo.audios.length > 0) {
			if (audioContentUsedByImageContent) {
				console.warn(
					`На элементе ${this.name} есть audio, хотя оно уже занято изображениями, потому пропускается`,
				);
			} else {
				this.createEmptyAudioContent(backgroundPlane).setAudioContent(
					this.fieldItemInfo.audios[0],
				);
			}
		}
		this.contentBackground = backgroundPlane;
		this.changeContent(0);
	}
	private createEmptyAudioContent(backgroundPlane: Mesh) {
		const audioContent = new AudioContent(
			backgroundPlane,
			FieldItem.containerSize * 1.6,
			FieldItem.containerSize / 2,
			() => {
				this.onPlayMedia();
				this.videoContent?.pauseVideo();
			},
			this.gui3Dmanager,
			this.scene,
		);
		this.contentList.push(audioContent);
		return audioContent;
	}

	private changeContent(contentIndex: number) {
		const withoutAudio = this.contentList.filter(
			(c) => c.type !== AudioContent.CONTENT_TYPE,
		);

		for (let i = 0; i < withoutAudio.length; i++) {
			const content = withoutAudio[i];
			content.setIsVisible(i === contentIndex);
		}
	}

	private createButton(
		title: string,
		parent: TransformNode,
		width = 2,
		height = 1,
	): CustomHolographicButton {
		var button = new CustomHolographicButton(
			`field-item-button-${title}`,
			width,
			height,
		);
		this.gui3Dmanager.addControl(button);
		button.linkToTransformNode(parent);
		var buttonContent = new TextBlock();
		buttonContent.text = title;
		buttonContent.textWrapping = TextWrapping.WordWrap;
		buttonContent.resizeToFit = true;
		buttonContent.color = "white";
		buttonContent.fontSize = 140;
		button.content = buttonContent;

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
			for (const content of this.contentList) {
				content.dispose();
			}
		}
		if (this.closeButton) {
			this.closeButton.dispose();
		}
		if (this.navigationButtons) {
			this.navigationButtons.dispose();
		}
	}
}
