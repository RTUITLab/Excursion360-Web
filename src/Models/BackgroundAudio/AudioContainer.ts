import { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { Scene, Sound } from "@babylonjs/core/index";

export class AudioContainer {
  private currentSound: Sound | null;
  private currentIndex: number = -1;

  private localState: boolean = false;

  constructor(
    private info: BackgroundAudioInfo,
    private scene: Scene,
    private sceneUrl: string,
    private isGestureDetected: () => boolean,
    private isPlayChange: (container: AudioContainer, isPlay: boolean) => void) {
  }

  public get id(): string {
    return this.info.id;
  }

  public getCurrentTime(): number {
    return this.currentSound.currentTime;
  }

  public play() {
    if (this.currentSound) {
      if (!this.currentSound.isPlaying) {
        this.currentSound.play();
      }
      this.localState = true;
    } else {
      this.playNext(true);
    }
  }

  public pause() {
    if (this.currentSound) {
      this.currentSound.pause();
    }
    this.localState = false;
  }
  public stop() {
    if (this.currentSound) {
      this.currentSound.stop();
    }
    this.localState = false;
  }

  private playSong(id: string, url: string): Sound {
    const newSound = new Sound(`background_audio_content_${id}`, url, this.scene, async () => {
      if (this.currentSound && this.currentSound != newSound) {
        this.currentSound.stop();
        this.currentSound.dispose();
      }
      this.currentSound = newSound;
      const playAfterResume = () => {
        setTimeout(async () => {
          if (this.isGestureDetected()) {
            await this.scene.getEngine().getAudioContext().resume();
            this.play();
          }
          if (newSound.isPlaying) {
            this.isPlayChange(this, true);
          } else {
            playAfterResume();
          }
        }, 500);
      }
      playAfterResume();
      newSound.onEndedObservable.add(() => {
        if (this.localState) {
          this.playNext(false);
        }
      });
    }, {
      loop: false,
      autoplay: false
    });
    return newSound;
  }
  /**
   * Запуск следующей композиции
   * @param force 
   * @returns 
   */
  public playNext(force: boolean): void {

    if (this.currentSound) {
      this.currentSound.dispose();
      this.currentSound = null;
    }
    let targetIndex = ++this.currentIndex;
    if (targetIndex < this.info.audios.length) {
      this.playSong(this.info.id, this.sceneUrl + this.info.audios[targetIndex]);
    } else {
      if (!this.info.loopAudios && !force) {
        this.isPlayChange(this, false);
        return;
      }
      targetIndex = this.currentIndex = 0;
      this.playSong(this.info.id, this.sceneUrl + this.info.audios[targetIndex]);
    }
  }

  public dispose() {
    if (this.currentSound) {
      this.currentSound.dispose();
    }
  }
}