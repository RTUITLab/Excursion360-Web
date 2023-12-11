import {
  IBackgroundAudioEventTrigger,
  IntervalBackgroundAudioEventTrigger,
} from "./Models/BackgroundAudio/IBackgroundAudioEventTrigger";
import { BackgroundAudioInfo } from "./Models/ExcursionModels/BackgroundAudioInfo";
import { ImageContentItem } from "./Models/ImageContentItem";
import {
  Animation,
  AssetsManager,
  IAnimationKey,
  Scene,
} from "@babylonjs/core/index";

/**
 * Временная обработка логики показа фотографии только на определенный момент времени воспроизводимого аудио-сопровождения
 * Не заложено в формат экскурсии, наполняется в ручном режиме
 */
export class TempTimerLogic {
  public static handleTempTimer(
    backgroundAudio: BackgroundAudioInfo,
    sceneUrl: string,
    assetsManager: AssetsManager,
    scene: Scene
  ): IBackgroundAudioEventTrigger | null {
    if (!backgroundAudio.tempTimer) {
      return;
    }
    let imageToShow: ImageContentItem | null = null;
    const imageLink = sceneUrl + backgroundAudio.tempTimer.content.image;

    // предзагружаем изображение, чтобы оно показывалось моментально
    const preloadLink = window.document.createElement("link");
    preloadLink["rel"] = "prefetch";
    preloadLink["as"] = "fetch";
    preloadLink["href"] = imageLink;
    window.document.body.appendChild(preloadLink);

    const frameRate = 10;
    // анимация изменения видимости с 0 до 1
    const showAnimation = new Animation(
      "show image animation",
      "visibility",
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const frames: IAnimationKey[] = [];
    frames.push({
      frame: 0,
      value: 0,
    });
    frames.push({
      frame: frameRate,
      value: 1,
    });
    showAnimation.setKeys(frames);

    return new IntervalBackgroundAudioEventTrigger(
      backgroundAudio.tempTimer.start,
      backgroundAudio.tempTimer.end,
      async () => {
        imageToShow = new ImageContentItem(
          {
            ...backgroundAudio.tempTimer.content,
            image: imageLink,
          },
          assetsManager,
          scene,
          0,
          () => {
            imageToShow!.imagePlane.animations.push(showAnimation);
            scene.beginAnimation(imageToShow!.imagePlane, 0, frameRate, true);
          }
        );
        await assetsManager.loadAsync();
      },
      async () => {
        scene.beginAnimation(imageToShow!.imagePlane, frameRate, 0, true);
        setTimeout(() => {
          imageToShow.dispose();
        }, 1500);
      }
    );
  }
}
