import { Scene, Observable } from "@babylonjs/core/index";
import { AdvancedDynamicTexture, Button, Control, StackPanel, Vector2WithInfo } from "@babylonjs/gui/index";
import { ExcursionConstants } from "./ExcursionConstants";

export class FullScreenGUI {
  private renderTexture: AdvancedDynamicTexture;
  private playPauseBackgroundAudioButton: Button;
  private fastReturnToFirstStateButton: Button;

  constructor(private scene: Scene, returnToFirstStateAction: () => void) {
    this.renderTexture = AdvancedDynamicTexture.CreateFullscreenUI("full screen excursion ui");
    const button1 = Button.CreateSimpleButton("background audio control", ExcursionConstants.PlayIcon);
    button1.isVisible = false; // Скрыта по умолчанию
    button1.width = "70px"
    button1.height = "70px";
    button1.background = "#525f6b";
    button1.top = "-35px";
    button1.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.playPauseBackgroundAudioButton = button1;
    
    const button2 = Button.CreateSimpleButton("background audio control", "В начало экскурсии");
    button2.isVisible = false; // Скрыта по умолчанию
    button2.width = "140px"
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
  public setPauseIconOnOlayPauseButton() {
    this.playPauseBackgroundAudioButton.textBlock.text = ExcursionConstants.PauseIcon;
  }
  public setPlayIconOnOlayPauseButton() {
    this.playPauseBackgroundAudioButton.textBlock.text = ExcursionConstants.PlayIcon;
  }
  public setVisibleIconOnPlayPauseButton(isVisible: boolean) {
    this.playPauseBackgroundAudioButton.isVisible = isVisible;
  }

  public setFastReturnToFirstStateVisible(isVisible: boolean){
    this.fastReturnToFirstStateButton.isVisible = isVisible;
  }
}