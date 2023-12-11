import { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { AudioContainer } from "./AudioContainer";
import { FullScreenGUI } from "../ExcursionFullScreenGUI";
import { PointerEventTypes, Scene } from "@babylonjs/core/index";
import { IBackgroundAudioEventTrigger } from "./IBackgroundAudioEventTrigger";

/**
 * Компонент фонового аудио, отвечает за воспроизведение и логику его работы
 * TODO: dispose и высвобождение ресурсов
 */
export class BackgroundAudioView {
  private packs: Map<string, AudioContainer> = new Map();
  private currentAudioPack: AudioContainer | null = null;
  private isPlay: boolean = true;
  private gestureDetected: boolean;
  private eventTrigger: IBackgroundAudioEventTrigger | null = null;
  private triggerInterval: any;

  constructor(
    private scene: Scene,
    private sceneUrl: string,
    private fullStreenUI: FullScreenGUI
  ) {
    scene.onPointerObservable.add((d, s) => {
      if (!this.gestureDetected && d.type == PointerEventTypes.POINTERDOWN) {
        setTimeout(() => {
          this.gestureDetected = true;
        }, 300);
      }
    });
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
    this.triggerInterval = setInterval(async () => {
      if (!this.eventTrigger) {
        return;
      }
      if (!this.currentAudioPack) {
        return;
      }
      await this.eventTrigger.audioPositionChanged(
        this.currentAudioPack.getCurrentTime()
      );
    }, 200);
  }

  public togglePlayPause() {
    if (!this.currentAudioPack) {
      return;
    }
    if (this.isPlay) {
      this.pause();
    } else {
      this.play();
    }
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

  public setSound(
    audioInfo: BackgroundAudioInfo | null,
    trigger: IBackgroundAudioEventTrigger | null
  ): void {
    this.fullStreenUI.setVisibleIconOnPlayPauseButton(!!audioInfo);
    if (audioInfo && audioInfo?.id === this.currentAudioPack?.id) {
      return;
    }

    if (audioInfo) {
      if (this.currentAudioPack) {
        this.currentAudioPack.stop();
      }
      this.eventTrigger = trigger || null;
      if (this.packs.has(audioInfo.id)) {
        this.currentAudioPack = this.packs.get(audioInfo.id);
      } else {
        this.currentAudioPack = new AudioContainer(
          audioInfo,
          this.scene,
          this.sceneUrl,
          () => {
            return this.gestureDetected;
          },
          (container, isPlay) => {
            if (container.id === this.currentAudioPack.id) {
              if (isPlay) {
                for (const ac of this.packs.values()) {
                  if (ac.id !== container.id) {
                    ac.pause();
                  }
                }
                this.setPlayState();
              } else {
                for (const ac of this.packs.values()) {
                  ac.pause();
                }
                this.setPlayState();
              }
            } else {
              if (isPlay) {
                container.pause();
              }
            }
            return isPlay ? this.setPlayState() : this.setPauseState();
          }
        );
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
