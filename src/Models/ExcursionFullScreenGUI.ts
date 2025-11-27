import type { Observable } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls/control";
import type { Vector2WithInfo } from "@babylonjs/gui/2D/math2D";
import { ExcursionConstants } from "./ExcursionConstants";

export class FullScreenGUI {
	private renderTexture: AdvancedDynamicTexture;
	private playPauseBackgroundAudioButton: Button;
	private fastReturnToFirstStateButton: Button;

	constructor(scene: Scene, returnToFirstStateAction: () => void) {
		this.renderTexture = AdvancedDynamicTexture.CreateFullscreenUI(
			"full screen excursion ui",
			undefined,
			scene,
		);
		const button1 = Button.CreateSimpleButton(
			"background audio control",
			ExcursionConstants.PlayIcon,
		);
		button1.isVisible = false; // Скрыта по умолчанию
		button1.width = "70px";
		button1.height = "70px";
		button1.background = "#525f6b";
		button1.top = "-35px";
		button1.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		this.playPauseBackgroundAudioButton = button1;

		const button2 = Button.CreateSimpleButton(
			"background audio control",
			"В начало экскурсии",
		);
		button2.isVisible = false; // Скрыта по умолчанию
		button2.width = "140px";
		button2.height = "70px";
		button2.background = "#525f6b";
		button2.paddingLeft = "12px";
		button2.top = "-35px";
		button2.left = "35px";
		button2.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		button2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		button2.onPointerUpObservable.add(() => returnToFirstStateAction());
		this.fastReturnToFirstStateButton = button2;

		this.renderTexture.addControl(button1);
		this.renderTexture.addControl(button2);
	}

	public get onPlayPauseBackgroundAudioClickObservable(): Observable<Vector2WithInfo> {
		return this.playPauseBackgroundAudioButton.onPointerClickObservable;
	}
	public setPauseIconOnPlayPauseButton() {
		this.playPauseBackgroundAudioButton.textBlock.text =
			ExcursionConstants.PauseIcon;
	}
	public setPlayIconOnPlayPauseButton() {
		this.playPauseBackgroundAudioButton.textBlock.text =
			ExcursionConstants.PlayIcon;
	}

	public setVisibleIconOnPlayPauseButton(isVisible: boolean) {
		this.playPauseBackgroundAudioButton.isVisible = isVisible;
	}
	public setFastReturnToFirstStateVisible(isVisible: boolean) {
		this.fastReturnToFirstStateButton.isVisible = isVisible;
	}
}
