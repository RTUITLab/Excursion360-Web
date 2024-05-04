import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import {
  ArrayTrigger,
  IBackgroundAudioEventTrigger,
  IntervalBackgroundAudioEventTrigger,
} from "./Models/BackgroundAudio/IBackgroundAudioEventTrigger";
import {
  BackgroundAudioInfo,
  TempTimer,
} from "./Models/ExcursionModels/BackgroundAudioInfo";
import { ImageContentItem } from "./Models/ImageContentItem";
import { Scene } from "@babylonjs/core/scene";
import { Animation } from "@babylonjs/core/Animations/animation";
import { IAnimationKey } from "@babylonjs/core/Animations/animationKey";
import { PrefetchResourcesManager } from "./Models/PrefetchResourcesManager";

/**
 * Временная обработка логики показа фотографии только на определенный момент времени воспроизводимого аудио-сопровождения
 * Не заложено в формат экскурсии, наполняется в ручном режиме
 */
export class TempTimerLogic {
  public static handleTempTimer(
    backgroundAudio: BackgroundAudioInfo | undefined,
    sceneUrl: string,
    assetsManager: AssetsManager,
    scene: Scene,
    prefetchResourcesManager: PrefetchResourcesManager,
    onContentCreated: (content: ImageContentItem) => void
  ): IBackgroundAudioEventTrigger | null {
    if (!backgroundAudio?.tempTimers?.length) {
      return null;
    }
    const arr = [];
    for (const tempTimer of backgroundAudio.tempTimers) {
      arr.push(
        this.handleOneImage(
          sceneUrl,
          tempTimer,
          assetsManager,
          scene,
          prefetchResourcesManager,
          onContentCreated
        )
      );
    }
    return new ArrayTrigger(arr);
  }

  private static handleOneImage(
    sceneUrl: string,
    tempTimer: TempTimer,
    assetsManager: AssetsManager,
    scene: Scene,
    prefetchResourcesManager: PrefetchResourcesManager,
    onContentCreated: (content: ImageContentItem) => void
  ): IBackgroundAudioEventTrigger {
    let imageToShow: ImageContentItem | null = null;
    const imageLink = sceneUrl + tempTimer.content.image;

    // предзагружаем изображение, чтобы оно показывалось моментально
    prefetchResourcesManager.addResource(imageLink);

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
      tempTimer.start,
      tempTimer.end,
      async () => {
        imageToShow = new ImageContentItem(
          {
            ...tempTimer.content,
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
        onContentCreated(imageToShow);
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
