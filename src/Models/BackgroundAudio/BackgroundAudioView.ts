import { PointerEventTypes, Scene, Sound } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { ExcursionConstants } from "../ExcursionConstants";

export class BackgroundAudioView {

  private currentSound: Sound | null;
  private currentAudioPack: BackgroundAudioInfo;
  private renderTexture: AdvancedDynamicTexture;



  private isPlay: boolean = true;
  private currentIndex: number;
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
      if (this.currentSound) {
        if (this.isPlay) {
          this.pause();
        } else {
          this.isPlay = true;
          this.currentSound.play();
          this.controlButton.textBlock.text = ExcursionConstants.PauseIcon;
        }
      }
    });
    this.renderTexture.addControl(button1);
    this.controlButton = button1;
  }

  public pause() {
    this.isPlay = false;
    this.currentSound && this.currentSound.pause();
    this.controlButton.textBlock.text = ExcursionConstants.PlayIcon;
  }

  public setSound(audioInfo?: BackgroundAudioInfo): void {
    this.controlButton.isVisible = !!audioInfo;
    if (audioInfo && audioInfo?.id === this.currentAudioPack?.id) {
      return;
    }
    this.currentAudioPack = audioInfo;
    this.currentIndex = -1;

    if (audioInfo) {
      this.playNext();
    } else {
      if (this.currentSound) {
        this.currentSound.stop();
        this.currentSound.dispose();
      }
    }
  }

  private playNext(): void {
    if (this.currentSound) {
      this.currentSound.dispose();
    }
    this.playSong(this.currentAudioPack.id, this.sceneUrl + this.currentAudioPack.audios[++this.currentIndex % this.currentAudioPack.audios.length]);
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
          if (this.gestureDetected && this.isPlay) {
            await this.scene.getEngine().getAudioContext().resume();
            newSound.play();
          }
          if (newSound.isPlaying) {
            this.controlButton.textBlock.text = ExcursionConstants.PauseIcon;
          } else {
            playAfterResume();
          }
        }, 500);
      }
      playAfterResume();
      newSound.onEndedObservable.add(() => {

        this.playNext();

      });
      // this.audio = audio;
      // this.playPauseButtonText.text = this.playIcon;
      // this.currentPositionTimer = setInterval(() => this.currentPositionText.text = this.getCurrentPositionText(), 500);
    }, {
      loop: false,
      autoplay: false
    });
    return newSound;
  }

}