import { Excursion } from "./Models/ExcursionModels/Excursion";
import { Configuration } from "./Configuration/Configuration";
import { MathStuff } from "./Stuff/MathStuff";
import { LinkToStatePool } from "./Models/LinkToStatePool";
import { BuildConfiguration } from "./Configuration/BuildConfiguration";
import { State } from "./Models/ExcursionModels/State";
import { GroupLink } from "./Models/GroupLink";
import { FieldItemInfo } from "./Models/FieldItemInfo";
import { FieldItem } from "./Models/FieldItem";
import { CroppedImage } from "./Models/ExcursionModels/CroppedImage";
import { DynamicPhotoDome } from "./Models/DymanicPhotoDome";
import { BackgroundAudioView } from "./Models/BackgroundAudio/BackgroundAudioView";
import { FullScreenGUI } from "./Models/ExcursionFullScreenGUI";
import { IconBottom } from "./Models/IconBottom";
import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Material } from "@babylonjs/core/Materials/material";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { ImageContentItem } from "./Models/ImageContentItem";
import { ContentItemType } from "./Models/ExcursionModels/ContentItemModel";
import { TempTimerLogic } from "./TempTimerLogic";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { DefaultLoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Angle } from "@babylonjs/core/Maths/math.path";

// Необходимые импорты для корректной работы. Еще не все подтягивается через tree-shake
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Audio/audioSceneComponent";
import "@babylonjs/core/Animations/animatable";
import "@babylonjs/core/Culling/ray"; // нужно для работы кликов на iOS

import { PrefetchResourcesManager } from "./Models/PrefetchResourcesManager";
import { WebXRInterface } from "./AsyncModules/AsyncModuleInterfaces";

export class Viewer {
  private currentImage: DynamicPhotoDome = null;
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private viewScene: Excursion;
  private links: LinkToStatePool;

  private linkSphereMaterials: StandardMaterial[] = [];
  /** Временный список контента изображений, не вынесен в отдельный класс из-за спешки */
  private imageContents: ImageContentItem[] = [];
  private assetsManager: AssetsManager;

  private groupLinkMaterial: Material;
  private fieldItemMaterial: StandardMaterial;
  private backgroundAudio: BackgroundAudioView;
  private prefetchResourcesManager: PrefetchResourcesManager =
    new PrefetchResourcesManager();
  currentPicture: State;
  fullScreenGUI: FullScreenGUI;
  iconBottom: IconBottom | null = null;
  xrHelper: WebXRInterface;

  freeCamera: FreeCamera;

  constructor(private configuration: Configuration) {}

  private backgroundRadius = 500;

  public createScene() {
    const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
    this.canvas = canvas;
    const engine = new Engine(canvas, true, {
      audioEngineOptions: {
        audioContext: new AudioContext(),
      },
    });
    Engine.audioEngine.onAudioLockedObservable.add(() => {
      console.log("locked! we can show button!");
    })
    const scene = new Scene(engine);
    this.scene = scene;
    this.assetsManager = new AssetsManager(scene);
    const guiManager = new GUI3DManager(scene);
    this.links = new LinkToStatePool(this.assetsManager, guiManager, scene);

    this.fullScreenGUI = new FullScreenGUI(scene, () => this.goToFirstState());
    this.backgroundAudio = new BackgroundAudioView(
      scene,
      this.configuration.sceneUrl,
      this.fullScreenGUI
    );
    // по умолчанию на android аудио не ставится на паузу при блокировке телефона
    window.addEventListener("blur", () => {
      this.backgroundAudio.pause();
      this.links.pauseAllAudios();
    });

    var glMaterial = new StandardMaterial("groupLinkMaterial", scene);
    glMaterial.diffuseColor = Color3.Blue();
    glMaterial.specularPower = 200;
    this.groupLinkMaterial = glMaterial;

    const fiMaterial = new StandardMaterial("field_item_material", scene);
    fiMaterial.diffuseColor = Color3.Gray();
    fiMaterial.alpha = 0.3;
    fiMaterial.emissiveColor = Color3.White();
    this.fieldItemMaterial = fiMaterial;

    window.addEventListener("hashchange", async () => {
      const targetId = this.getIdFromHash();
      if (targetId) {
        await this.goToImage(
          targetId,
          (targetState) => {
            this.rotateCamToAngle(targetState.ifFirstStateRotationAngle || 0);
          },
          false
        );
      }
    });

    const camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    // Для имитации поведения, как будто хватаем за панораму и тянем. 10К выбрано эмпирически
    camera.angularSensibility = -10000;
    camera.attachControl(canvas, true);

    this.freeCamera = camera;

    if ("xr" in window.navigator) {
      import("./AsyncModules/WebXRLogic").then((module) => {
        module.WebXRLogic.CreateXR(scene, {
          aButtonPressed: () => {
            this.backgroundAudio.togglePlayPause();
          },
          bButtonPressed: () => {
            if (this.viewScene.fastReturnToFirstStateEnabled) {
              this.goToFirstState();
            }
          },
          xButtonPressed: () => {
            window?.history?.back();
          },
        }).then((xr) => (this.xrHelper = xr));
      });
    }

    DefaultLoadingScreen.DefaultLogoUrl = this.configuration.logoUrl;
    if (this.configuration.bottomImage) {
      this.iconBottom = new IconBottom(scene, this.configuration.bottomImage);
    }
    engine.loadingUIBackgroundColor = "transparent";

    scene.actionManager = new ActionManager(scene);

    if (BuildConfiguration.NeedDebugLayer) {
      import("./AsyncModules/InspectorLogic").then((module) => {
        module.InspectorLogic.registerInspector(scene);
      });
    } else {
      scene.activeCamera.inputs.remove(
        scene.activeCamera.inputs.attached["keyboard"]
      );
    }

    const light2 = new PointLight("light2", new Vector3(0, 2, 0), scene);

    engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      engine.resize();
      this.currentImage.setCanvasSize(canvas.width, canvas.height);
    });
  }

  private goToFirstState() {
    this.goToImage(
      this.viewScene.firstStateId,
      (targetState) => {
        this.rotateCamToAngle(targetState.ifFirstStateRotationAngle || 0);
      },
      true
    );
  }
  private getIdFromHash(): string | null {
    const tryId = location.hash.substring(1);
    if (this.viewScene.states.some((p) => p.id === tryId)) {
      return tryId;
    }
    return null;
  }
  public async show(scene: Excursion) {
    this.viewScene = scene;
    for (const material of this.linkSphereMaterials) {
      material.dispose();
    }
    this.linkSphereMaterials = [];
    const baseMaterial = new StandardMaterial("link material", this.scene);
    baseMaterial.diffuseColor = Color3.Red();
    baseMaterial.specularPower = 200;
    for (const color of scene.colorSchemes) {
      const newMaterial = baseMaterial.clone("link material");
      newMaterial.diffuseColor = new Color3(color.r, color.g, color.b);
      this.linkSphereMaterials.push(newMaterial);
    }

    const targetId = this.getIdFromHash() || this.viewScene.firstStateId;
    await this.goToImage(
      targetId,
      (targetState) => {
        this.rotateCamToAngle(targetState.ifFirstStateRotationAngle || 0);
      },
      true
    );
  }

  private rotateCamToAngle(angle: number) {
    const yAngle = Angle.FromDegrees(angle).radians() + Math.PI;
    this.freeCamera.rotation.y = yAngle;
    this.xrHelper?.rotateXrCameraFromPlainCamera(this.freeCamera);
  }

  private async goToImage(
    id: string,
    actionBeforeChange: (targetState: State) => void = null,
    forceReload = false
  ) {
    if (!forceReload && this.currentPicture && this.currentPicture.id == id) {
      return;
    }
    location.hash = id;
    const targetPicture = this.viewScene.states.find((p) => p.id === id);
    this.currentPicture = targetPicture;
    this.cleanResources();
    this.prefetchAudio(targetPicture);
    await this.drawImage(
      targetPicture,
      () => actionBeforeChange && actionBeforeChange(targetPicture)
    );

    this.fullScreenGUI.setFastReturnToFirstStateVisible(
      id !== this.viewScene.firstStateId &&
        this.viewScene.fastReturnToFirstStateEnabled
    );

    document.title = targetPicture.title || this.viewScene.title;

    const backgroundAudio = this.viewScene.backgroundAudios.find(
      (b) => b.id === targetPicture.backgroundAudioId
    );
    const triggerForBackgroundAudio = TempTimerLogic.handleTempTimer(
      backgroundAudio,
      this.configuration.sceneUrl,
      this.assetsManager,
      this.scene,
      this.prefetchResourcesManager,
      (content) => this.imageContents.push(content)
    );
    this.backgroundAudio.setSound(backgroundAudio, triggerForBackgroundAudio);

    const distanceToLinks = 15;
    for (const link of targetPicture.links) {
      const name = this.getName(link.id);
      const position = MathStuff.GetPositionForMarker(
        link.rotation,
        distanceToLinks
      );
      const material = this.linkSphereMaterials[link.colorScheme];

      const linkToState = this.links.getLink(name, position, material, () => {
        let rotateCam = () => {};
        if (link.rotationAfterStepAngleOverridden) {
          rotateCam = () => {
            this.rotateCamToAngle(link.rotationAfterStepAngle);
          };
        }
        return this.goToImage(link.id, rotateCam);
      });
    }
    const groupLinks: GroupLink[] = [];
    for (const groupLink of targetPicture.groupLinks) {
      let name = groupLink.title;
      if (!name) {
        name = "NO TITLE";
      }
      const position = MathStuff.GetPositionForMarker(
        groupLink.rotation,
        distanceToLinks
      );
      const material = this.groupLinkMaterial;

      const linkToState = this.links.getGroupLink(
        name,
        groupLink.viewMode,
        groupLink.stateIds.map((stateId) => {
          return { id: stateId, title: this.getName(stateId) };
        }),
        groupLink.infos,
        position,
        {
          scale: groupLink.minimizeScale,
          titleYPosition: groupLink.titleYPosition,
        },
        material,
        async (gl) => {
          groupLinks.filter((l) => l !== gl).forEach((l) => l.closeLinks());
        },
        async (selectedId) => {
          let rotateCam = () => {};
          var overridePair = groupLink.groupStateRotationOverrides.find(
            (p) => p.stateId == selectedId
          );
          if (overridePair) {
            rotateCam = () => {
              this.rotateCamToAngle(overridePair.rotationAfterStepAngle);
            };
          }
          return this.goToImage(selectedId, rotateCam);
        }
      );
      groupLinks.push(linkToState);
    }

    const fieldItems: FieldItem[] = [];
    for (const fieldItem of targetPicture.fieldItems) {
      const fieldItemInfo = new FieldItemInfo(
        fieldItem.vertices.map((q) =>
          MathStuff.GetPositionForMarker(q, this.backgroundRadius * 0.99)
        ),
        fieldItem.images.map((i) => this.configuration.sceneUrl + i),
        fieldItem.videos.map((v) => this.configuration.sceneUrl + v),
        fieldItem.text,
        fieldItem.audios.map((a) => ({
          ...a,
          src: this.configuration.sceneUrl + a.src,
        })),
        distanceToLinks
      );
      const material = this.fieldItemMaterial;

      const createdFieldItem = this.links.getFieldItem(
        fieldItem.title,
        fieldItemInfo,
        async (fi) =>
          fieldItems
            .filter((i) => i !== fi)
            .forEach((i) => i.setShowContent(false)),
        () => this.backgroundAudio.pause(),
        material
      );
      fieldItems.push(createdFieldItem);
    }
    for (const contentItem of targetPicture.contentItems.filter(
      (ci) => ci.contentType === ContentItemType.Image
    )) {
      const imageContent = new ImageContentItem(
        {
          ...contentItem,
          image: this.configuration.sceneUrl + contentItem.image,
        },
        this.assetsManager,
        this.scene
      );
      this.imageContents.push(imageContent);
    }
    await this.assetsManager.loadAsync();
  }
  private prefetchAudio(state: State) {
    this.loadAudioForState(state);
    state.links.forEach((l) =>
      this.loadAudioForState(this.viewScene.states.find((s) => s.id === l.id))
    );
    state.groupLinks.forEach((gl) =>
      gl.stateIds.forEach((stateId) =>
        this.loadAudioForState(
          this.viewScene.states.find((s) => s.id === stateId)
        )
      )
    );
  }

  private loadAudioForState(state?: State) {
    if (!state) {
      return;
    }
    const audios =
      this.viewScene.backgroundAudios.find(
        (b) => b.id === state.backgroundAudioId
      )?.audios || [];
    audios.forEach((a) =>
      this.prefetchResourcesManager.addResource(this.configuration.sceneUrl + a)
    );
    state.fieldItems.forEach((fi) =>
      fi.audios.forEach((a) =>
        this.prefetchResourcesManager.addResource(
          this.configuration.sceneUrl + a.src
        )
      )
    );
  }

  private async drawImage(
    targetPicture: State,
    actionBeforeChange: () => void = null
  ): Promise<void> {
    if (this.currentImage === null) {
      this.currentImage = new DynamicPhotoDome(
        this.backgroundRadius * 2,
        this.scene
      );
      this.currentImage.setCanvasSize(this.canvas.width, this.canvas.height);
      this.scene.onAfterRenderObservable.add((scene, event) =>
        this.currentImage.trackImageParts(scene)
      );
    }

    this.currentImage.stopCurrentLoadings();

    let imageUrl: string;
    let postAction: (image: HTMLImageElement) => void;
    if (targetPicture.croppedImageUrl) {
      const imageRoot =
        this.configuration.sceneUrl + targetPicture.croppedImageUrl;

      const metaInfoLocation = imageRoot + "/meta.json";
      const meta = (await (
        await fetch(metaInfoLocation)
      ).json()) as CroppedImage;

      imageUrl = imageRoot + "/" + meta.lowQualityImage.route;

      postAction = (image) => {
        this.currentImage.setByImage(image, meta);
        this.currentImage.setImageParts(imageRoot, meta.rectangles);
      };
    } else if (targetPicture.url) {
      imageUrl = this.configuration.sceneUrl + targetPicture.url;
      postAction = (image) => {
        this.currentImage.setByImage(image);
      };
    } else {
      throw new Error(
        "Incorrect state image url! Specify url or croppedImageUrl"
      );
    }

    const task = this.assetsManager.addImageTask("image task", imageUrl);
    var promise = new Promise<void>(async (resolve, error) => {
      task.onSuccess = (t) => {
        if (actionBeforeChange) {
          actionBeforeChange();
        }
        this.currentImage.setRotation(targetPicture.pictureRotation);
        postAction(t.image);
        resolve();
      };
      task.onError = (task, message, exception) => {
        error({ message, exception });
      };
      // TODO: assets manager loading
      this.assetsManager.load();
      await this.assetsManager.loadAsync();
    });
    await promise;
  }

  private cleanResources() {
    this.links.clean();
    this.imageContents.forEach((imageContent) => {
      imageContent.dispose();
    });
    this.imageContents = [];
    this.prefetchResourcesManager.clear();
  }

  private getName(id: string): string {
    return this.viewScene.states.find((p) => p.id === id).title;
  }
}
