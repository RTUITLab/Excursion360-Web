import { Sound } from "@babylonjs/core/Audio/sound";
import { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";

export class AudioContainer {
  private sounds: Sound[];
  private currentIndex: number = -1;
  private timerItWorked: boolean = false;

  private get currentSound(): Sound | null {
    if (this.currentIndex === -1) {
      return null;
    }
    if (this.currentIndex >= this.sounds.length) {
      return null;
    }
    return this.sounds[this.currentIndex];
  }

  constructor(
    private info: BackgroundAudioInfo,
    private scene: Scene,
    private needToPlayThatContainer: (container: AudioContainer) => boolean,
    sceneUrl: string
  ) {
    this.sounds = info.audios.map((s, i) =>
      this.createSound(this.info.id, sceneUrl + s, i)
    );
  }

  public get id(): string {
    return this.info.id;
  }

  public getTimerItWorked(): boolean {
    return this.timerItWorked;
  }

  public isLoading(): boolean {
    return !this.currentSound?.isReady();
  }
  public isPlaying(): boolean {
    return this.currentSound?.isPlaying === true;
  }
  public isCanPlay(): boolean {
    return !this.isPlaying() && !this.isLoading();
  }

  public setTimerItWorked(timerItWorked: boolean): void {
    this.timerItWorked = timerItWorked;
  }

  public getCurrentTime(): number {
    return this.currentSound?.currentTime || 0;
  }

  public play() {
    if (this.currentSound?.isPaused) {
      this.currentSound.play();
      // Если не на паузе и не проигрывается одновременно - значит аудио кончилось
    } else if (!this.currentSound?.isPaused && !this.currentSound?.isPlaying) {
      this.playNext(true);
    }
  }

  public pause() {
    this.currentSound?.pause();
  }
  public stop() {
    this.currentSound?.stop();
  }

  private needToPlayThatSound(index: number): boolean {
    return this.needToPlayThatContainer(this) && this.currentIndex === index;
  }

  private createSound(id: string, url: string, index: number): Sound {
    const newSound = new Sound(
      `background_audio_content_${id}_${index}`,
      url,
      this.scene,
      async () => {
        if (!this.needToPlayThatSound(index)) {
          return;
        }
        if (Engine.audioEngine.unlocked) {
          newSound.play();
        } else {
          Engine.audioEngine.onAudioUnlockedObservable.addOnce(() => {
            if (!this.needToPlayThatSound(index)) {
              return;
            }
            newSound.play();
          });
        }
        newSound.onEndedObservable.add(() => {
          if (this.needToPlayThatContainer(this)) {
            this.playNext(false);
          }
        });
      },
      {
        loop: false,
        autoplay: false,
      }
    );
    return newSound;
  }

  /**
   * Запуск следующей композиции
   * @param forcePlayByStart
   * @returns
   */
  public playNext(forcePlayByStart: boolean): void {
    this.currentSound?.pause();
    this.currentIndex++;
    if (this.currentSound) {
      this.currentSound?.play();
      return;
    }
    this.currentIndex = 0;
    const needPlayByStart = this.info.loopAudios || forcePlayByStart;
    if (needPlayByStart) {
      this.currentSound?.play();
    }
  }

  public dispose() {
    for (const sound of this.sounds) {
      sound.dispose();
    }
  }
}
