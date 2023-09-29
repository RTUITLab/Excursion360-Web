import { PointerEventTypes, Scene, Sound } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { ExcursionConstants } from "../ExcursionConstants";
import { AudioContainer } from "./AudioContainer";
import { FullScreenGUI } from "../ExcursionFullScreenGUI";

export class BackgroundAudioView {
  private packs: Map<string, AudioContainer> = new Map();
  private currentAudioPack: AudioContainer | null = null;

  private isPlay: boolean = true;
  private gestureDetected: boolean;


  constructor(private scene: Scene, private sceneUrl: string, private fullStreenUI: FullScreenGUI) {
    scene.onPointerObservable.add((d, s) => {
      if (!this.gestureDetected && d.type == PointerEventTypes.POINTERDOWN) {
        setTimeout(() => {
          this.gestureDetected = true;
        }, 300);
      }
      fullStreenUI.onPlayPauseBackgroundAudioClickObservable.add(() => {
        this.gestureDetected = true;
        if (this.currentAudioPack) {
          if (this.isPlay) {
            this.pause();
          } else {
            this.play();
          }
        }
      });
    });


  }

  public play() {
    this.currentAudioPack && this.currentAudioPack.play();
    this.setPlayState();
  }

  private setPlayState() {
    this.isPlay = true;
    this.fullStreenUI.setPauseIconOnOlayPauseButton();
  }

  public pause() {
    this.currentAudioPack && this.currentAudioPack.pause();
    this.setPauseState();
  }

  private setPauseState() {
    this.isPlay = false;
    this.fullStreenUI.setPlayIconOnOlayPauseButton();
  }


  public setSound(audioInfo?: BackgroundAudioInfo): void {
    this.fullStreenUI.setVisibleIconOnOlayPauseButton(!!audioInfo);
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