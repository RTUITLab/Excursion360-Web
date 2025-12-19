import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import type { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type {
	AssetsManager,
	TextureAssetTask,
} from "@babylonjs/core/Misc/assetsManager";
import type { Scene } from "@babylonjs/core/scene";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import type { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { CustomHolographicButton } from "../../Stuff/CustomHolographicButton";
import type { FieldItemImageContent } from "../ExcursionModels/FieldItemImageContent";
import { NavigationMenu } from "../NavigationMenu";
import type { AudioContent } from "./AudioContent";
import type { FieldItemContent } from "./FieldItemContent";

export class ImagesContent implements FieldItemContent {
	get type(): string {
		return "image";
	}

	private rightButton: CustomHolographicButton;
	private leftButton: CustomHolographicButton;
	private imageButtons: NavigationMenu;
	private currentImage: number = 0;

	private resources: {
		plane: Mesh;
		material: Material;
		texture: Texture;
		task: TextureAssetTask;
	}[] = [];
	private isVisible: boolean;

	setIsVisible(visible: boolean) {
		this.isVisible = visible;
		if (this.rightButton) {
			this.rightButton.isVisible = visible;
		}
		if (this.leftButton) {
			this.leftButton.isVisible = visible;
		}
		this.imageButtons?.setIsVisible(visible);
		for (const resource of this.resources) {
			if (resource?.plane) {
				resource.plane.isVisible = visible;
			}
		}
		if (visible) {
			this.openPicture(this.currentImage);
		}
	}

	constructor(
		private images: FieldItemImageContent[],
		private parent: TransformNode,
		private contentWidth: number,
		private contentHeight: number,
		private gui3DManager: GUI3DManager,
		private assetsManager: AssetsManager,
		private scene: Scene,
		private parentAudioContent: AudioContent,
	) {
		if (images.length > 1) {
			this.rightButton = this.createButton(">", contentWidth / 2.5);
			this.rightButton.onPointerClickObservable.add(() => {
				this.openPicture(this.currentImage + 1);
			});
			this.leftButton = this.createButton("<", -contentWidth / 2.5);
			this.leftButton.onPointerClickObservable.add(() => {
				this.openPicture(this.currentImage - 1);
			});

			this.imageButtons = new NavigationMenu(
				images.map((_, i) => (i + 1).toString()),
				contentWidth,
				-contentHeight / 2,
				parent,
				gui3DManager,
				(_) => ({ width: 1, height: 1 }),
				async (i) => {
					this.openPicture(i);
				},
			);
		}
		this.resources = images.map(() => null as any);
		this.openPicture(this.currentImage);
	}

	private createButton(
		content: string,
		xPosition: number = 0,
		yPosition = 0,
	): CustomHolographicButton {
		var button = new CustomHolographicButton(
			`image-content-button-right-${content}`,
			1,
			1,
		);
		this.gui3DManager.addControl(button);
		button.linkToTransformNode(this.parent);
		var buttonContent = new TextBlock();
		buttonContent.text = content;
		buttonContent.textWrapping = TextWrapping.WordWrap;
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
		this.imageButtons?.setCurrentIndex(index);
		for (let i = 0; i < this.resources.length; i++) {
			const imageResource = this.resources[i];
			if (index === i) {
				// Target resource
				if (!imageResource) {
					// Not loaded yet
					this.resources[i] = {
						texture: null,
						material: null,
						plane: null,
						task: this.loadPictureResources(index, this.images[index].imageSrc),
					};
				} else if (imageResource.plane) {
					// Loaded
					imageResource.plane.isVisible = true;
				} else {
					// In loading, just wait
				}
			} else {
				if (imageResource?.plane) {
					// Hide all loaded images
					imageResource.plane.isVisible = false;
				}
			}
		}
		this.currentImage = index;
		if (this.images[index].audio) {
			this.parentAudioContent?.setAudioContent(this.images[index].audio);
		} else {
			this.parentAudioContent?.setIsVisible(false);
		}
	}

	private loadPictureResources(index: number, url: string): TextureAssetTask {
		const task = this.assetsManager.addTextureTask(
			"image task",
			url,
			null,
			true,
		);
		this.assetsManager.load();
		task.onSuccess = () => {
			const textureSize = task.texture.getSize();
			const localContentWith = this.contentWidth / 1.5;
			const localContentHeight = this.contentHeight / 1.3;

			let multipler: number = 1;
			if (textureSize.width > textureSize.height) {
				// horizontal
				multipler = localContentWith / textureSize.width;
			} else {
				multipler = localContentHeight / textureSize.height;
			}
			const imagePlane = CreatePlane(
				`image_content_image_${url}`,
				{
					width: textureSize.width * multipler,
					height: textureSize.height * multipler,
				},
				this.scene,
			);
			imagePlane.parent = this.parent;
			imagePlane.position.z = -0.1;
			imagePlane.position.y = 0.8; // TODO: https://github.com/RTUITLab/Excursion360-Web/issues/81
			const material = new StandardMaterial("", this.scene);
			material.specularColor = Color3.Black();
			material.diffuseTexture = task.texture;

			imagePlane.material = material;
			this.resources[index].plane = imagePlane;
			this.resources[index].material = material;
			this.resources[index].texture = task.texture;

			imagePlane.isVisible = this.isVisible;
			if (this.images.length > 1) {
				imagePlane.actionManager = new ActionManager(this.scene);
				imagePlane.actionManager.registerAction(
					new ExecuteCodeAction(ActionManager.OnPickTrigger, async () => {
						this.openPicture(this.currentImage + 1);
					}),
				);
			}
		};
		return task;
	}

	public dispose(): void {
		this.imageButtons?.dispose();
		this.rightButton?.dispose();
		this.leftButton?.dispose();
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
