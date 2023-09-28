import { PointerEventTypes, Scene, Sound } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { ExcursionConstants } from "../ExcursionConstants";
import { AudioContainer } from "./AudioContainer";

export class BackgroundAudioView {
  private packs: Map<string, AudioContainer> = new Map();
  private currentAudioPack: AudioContainer | null = null;
  private renderTexture: AdvancedDynamicTexture;

  private isPlay: boolean = true;
  private gestureDetected: boolean;

  private controlButton: Button;

  constructor(private scene: Scene, private sceneUrl: string) {
    scene.onPointerObservable.add((d, s) => {
      if (!this.gestureDetected && d.type == PointerEventTypes.POINTERDOWN) {
        setTimeout(() => {
          this.gestureDetected = true;
        }, 300);
      }
    });

    this.renderTexture = AdvancedDynamicTexture.CreateFullscreenUI("background audio ui");
    const button1 = Button.CreateSimpleButton("background audio control", ExcursionConstants.PlayIcon);
    button1.isVisible = false; // Скрыта по умолчанию
    button1.width = "70px"
    button1.height = "70px";
    button1.top = "-35px";
    button1.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    button1.background = "#525f6b";
    button1.onPointerClickObservable.add(() => {
      this.gestureDetected = true;
      if (this.currentAudioPack) {
        if (this.isPlay) {
          this.pause();
        } else {
          this.play();
        }
      }
    });
    this.renderTexture.addControl(button1);
    this.controlButton = button1;
  }

  public play() {
    this.currentAudioPack && this.currentAudioPack.play();
    this.setPlayState();
  }

  private setPlayState(){
    this.isPlay = true;
    this.controlButton.textBlock.text = ExcursionConstants.PauseIcon;
  }

  public pause() {
    this.currentAudioPack && this.currentAudioPack.pause();
    this.setPauseState();
  }

  private setPauseState(){
    this.isPlay = false;
    this.controlButton.textBlock.text = ExcursionConstants.PlayIcon;
  }


  public setSound(audioInfo?: BackgroundAudioInfo): void {
    this.controlButton.isVisible = !!audioInfo;
    if (audioInfo && audioInfo?.id === this.currentAudioPack?.id) {
      return;
    }

    if (audioInfo) {
      if (this.currentAudioPack) {
        this.currentAudioPack.stop();
      }
      if (this.packs.has(audioInfo.id)) {
        this.currentAudioPack = this.packs.get(audioInfo.id);
      } else {
        this.currentAudioPack = new AudioContainer(
          audioInfo,
          this.scene,
          this.sceneUrl,
          () => {
            return this.gestureDetected
          },
          (isPlay) => isPlay ? this.setPlayState() : this.setPauseState(),
          () => {
            return this.isPlay;
          });
        this.packs.set(audioInfo.id, this.currentAudioPack);
      }
      this.isPlay = true;
      this.currentAudioPack.playNext(false);
    } else {
      if (this.currentAudioPack) {
        this.currentAudioPack.stop();
      }
    }
  }
}