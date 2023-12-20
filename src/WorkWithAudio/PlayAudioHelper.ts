import { Sound } from "@babylonjs/core/Audio/sound";
import { Engine } from "@babylonjs/core/Engines/engine";

declare global {
  interface Window {
    showApproveAudioModal(
      approvedCallback: () => void,
      cancelledCallback: () => void
    ): void;
  }
}

export class PlayAudioHelper {
  public static subscribeToAudioLockEvent() {
    Engine.audioEngine.onAudioLockedObservable.add((audioEngine) => {
      window.showApproveAudioModal(
        () => {
          audioEngine.unlock();
        },
        () => {}
      );
    });
  }
  private static showModalAlreadyOpened = false;
  /** Запускает аудио, при необходимости спрашивает разрешения у пользователя на его запуск
   * Если вызвано с forceShowModal не true - окно покажется единожды
   */
  public static playSound(
    sound: Sound | null,
    options?: {
      /** Функция проверки, нужно ли еще запускать это аудио на момент подтверждения работы аудио */
      ensureToPlay?: () => boolean;
      /** Если передано - модальное окно с запросом разрешения покажется если аудио контекст заблокирован */
      forceShowModal?: boolean;
      playSuccess?: () => void;
    }
  ) {
    if (!sound) {
      return;
    }
    if (!sound.isReady()) {
      return;
    }
    if (Engine.audioEngine.unlocked) {
      sound.play();
      options?.playSuccess?.call(null);
      return;
    }
    if (this.showModalAlreadyOpened && !options?.forceShowModal) {
      return;
    }
    const playIfNeedCallback = () => {
      if (!options?.ensureToPlay) {
        sound.play();
        options?.playSuccess?.call(null);
      } else if (options.ensureToPlay()) {
        sound.play();
        options?.playSuccess?.call(null);
      }
    };
    Engine.audioEngine.onAudioUnlockedObservable.addOnce(playIfNeedCallback);
    window.showApproveAudioModal(
      () => Engine.audioEngine.unlock(),
      () =>
        Engine.audioEngine.onAudioUnlockedObservable.removeCallback(
          playIfNeedCallback
        )
    );
    this.showModalAlreadyOpened = true;
  }
}
