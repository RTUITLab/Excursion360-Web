import type { IWheelEvent, Observer } from "@babylonjs/core";
import {
	PointerEventTypes,
	type PointerInfo,
} from "@babylonjs/core/Events/pointerEvents";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { ScrollViewer } from "@babylonjs/gui/2D/controls/scrollViewers/scrollViewer";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import type { FieldItemContent } from "./FieldItemContent";

export class TextContent implements FieldItemContent {
	static readonly CONTENT_TYPE: string = "text";

	get type(): string {
		return TextContent.CONTENT_TYPE;
	}

	private textPlane: Mesh;
	private textTexture: AdvancedDynamicTexture;

	private scrollView: ScrollViewer;

	private wheelHandlerObserver: Observer<PointerInfo>;

	constructor(
		private text: string,
		private parent: TransformNode,
		private contentWidth: number,
		private contentHeight: number,
		private scene: Scene,
	) {
		// this.loadVideoResources(videoUrl);
		// this.playPauseButton = this.createPlayPauseButton();
		this.createTextPanel();
		this.wheelHandlerObserver = scene.onPointerObservable.add(
			(event: PointerInfo) => {
				if (event.pickInfo.pickedMesh === this.textPlane) {
					if (event.type === PointerEventTypes.POINTERWHEEL) {
						let delta = (event.event as IWheelEvent).deltaY;
						delta = delta > 0 ? 1 : -1;
						this.scrollView.verticalBar.value +=
							this.scrollView.wheelPrecision * delta;
					}
				}
			},
		);
	}

	setIsVisible(visible: boolean) {
		this.textPlane.isVisible = visible;
	}

	createTextPanel() {
		const plane = CreatePlane(
			`text_content_plane`,
			{
				width: this.contentWidth,
				height: this.contentHeight,
			},
			this.scene,
		);
		plane.parent = this.parent;
		plane.position.z = -0.1;
		var texture = AdvancedDynamicTexture.CreateForMesh(plane);
		var sv = new ScrollViewer();
		sv.thickness = 7;
		sv.color = "gray";
		sv.width = 1;
		sv.height = 1;
		sv.background = "#dedede";
		texture.addControl(sv);
		var tb = new TextBlock();
		tb.textWrapping = TextWrapping.WordWrap;
		tb.resizeToFit = true;
		tb.paddingTop = "5%";
		tb.paddingLeft = "30px";
		tb.paddingRight = "20px";
		tb.paddingBottom = "5%";
		tb.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		tb.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
		tb.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		tb.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
		tb.color = "black";
		tb.text = this.text;
		tb.fontSize = "32px";

		sv.addControl(tb);
		//TODO: вернуть поведение скролла на текстовом контенте
		// sv.verticalBar.onPointerDownObservable.add(e =>{
		//     this.scene.activeCamera.inputs.attached.mouse.detachControl(this.scene.activeCamera.inputs.attachedElement);
		// });
		// sv.verticalBar.onPointerUpObservable.add(e => {
		//     this.scene.activeCamera.inputs.attachInput(this.scene.activeCamera.inputs.attached.mouse);
		// });

		this.textPlane = plane;
		this.textTexture = texture;
		this.scrollView = sv;
	}

	public dispose() {
		this.textPlane.dispose();
		this.textPlane.material.dispose();
		this.textTexture.dispose();
		this.scene.onPointerObservable.remove(this.wheelHandlerObserver);
	}
}
