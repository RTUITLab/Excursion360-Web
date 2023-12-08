import { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { AudioContainer } from "./AudioContainer";
import { FullScreenGUI } from "../ExcursionFullScreenGUI";
import { PointerEventTypes, Scene } from "@babylonjs/core/index";

export class BackgroundAudioView {
  private packs: Map<string, AudioContainer> = new Map();
  private currentAudioPack: AudioContainer | null = null;
  private currentAudioTime: number = 0;
  private isPlay: boolean = true;
  private gestureDetected: boolean;
  private timer: null | {start: number, end: number, functionStart: () => void, functionEnd: () => void}


  constructor(private scene: Scene, private sceneUrl: string, private fullStreenUI: FullScreenGUI) {
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

  private async functionTimer(){
    if (this.isPlay)
    {
      setTimeout(() => {
        this.currentAudioTime++;
        if (this.currentAudioTime === this.timer.start)
        {
          this.timer.functionStart();
          this.functionTimer();
        }
        else if(this.currentAudioTime === this.timer.end)
        {
          this.timer.functionEnd();
          this.functionTimer();
        }
        else
        {
          this.functionTimer();
        }
      }, 20);
    }
  }

  private async functionImage()
  {
    if (this.isPlay)
    {
      if (this.currentAudioTime === this.timer.start)
      {
        this.timer.functionStart();
        this.functionImage();
      }
      else if(this.currentAudioTime === this.timer.end)
      {
        this.timer.functionEnd();
        this.functionImage();
      }
      else
      {
        this.functionImage();
      }
    }
  }

  public play() {
    this.currentAudioPack && this.currentAudioPack.play();
    this.setPlayState();
  }

  private setPlayState() {
    this.isPlay = true;
    if (this.timer !== null)
    {
      this.functionTimer();
    }
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


  public setSound(audioInfo?: BackgroundAudioInfo, timer?: {start: number, end: number, functionStart: () => void, functionEnd: () => void}): void {
    this.fullStreenUI.setVisibleIconOnPlayPauseButton(!!audioInfo);
    if (audioInfo && audioInfo?.id === this.currentAudioPack?.id) {
      return;
    }

    if (audioInfo) {
      if (this.currentAudioPack) {
        this.currentAudioPack.stop();
      }
      if (timer)
      {
        this.timer = timer;
      }
      else
      {
        this.timer = null;
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