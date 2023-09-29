import { Observable, Scene } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, Vector2WithInfo } from "babylonjs-gui";
import { ExcursionConstants } from "./ExcursionConstants";

export class FullScreenGUI {
  private renderTexture: AdvancedDynamicTexture;
  private playPauseBackgroundAudioButton: Button;

  constructor(private scene: Scene) {
    this.renderTexture = AdvancedDynamicTexture.CreateFullscreenUI("full screen excursion ui");
    const button1 = Button.CreateSimpleButton("background audio control", ExcursionConstants.PlayIcon);
    button1.isVisible = false; // Скрыта по умолчанию
    button1.width = "70px"
    button1.height = "70px";
    button1.top = "-35px";
    button1.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    button1.background = "#525f6b";
    this.renderTexture.addControl(button1);
    this.playPauseBackgroundAudioButton = button1;
  }

  public get onPlayPauseBackgroundAudioClickObservable(): Observable<Vector2WithInfo> {
    return this.playPauseBackgroundAudioButton.onPointerClickObservable;
  }
  public setPauseIconOnOlayPauseButton() {
    this.playPauseBackgroundAudioButton.textBlock.text = ExcursionConstants.PauseIcon;
  }
  public setPlayIconOnOlayPauseButton() {
    this.playPauseBackgroundAudioButton.textBlock.text = ExcursionConstants.PlayIcon;
  }
  public setVisibleIconOnOlayPauseButton(isVisible: boolean) {
    this.playPauseBackgroundAudioButton.isVisible = isVisible;
  }
}