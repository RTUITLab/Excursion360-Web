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
import DynamicPhotoDome from "./Models/DymanicPhotoDome";
import { BackgroundAudioView } from "./Models/BackgroundAudio/BackgroundAudioView";
import { FullScreenGUI } from "./Models/ExcursionFullScreenGUI";
import { IconBottom } from "./Models/IconBottom";
import {
  StandardMaterial,
  AssetsManager,
  Material,
  Engine,
  Color3,
  FreeCamera,
  Vector3,
  DefaultLoadingScreen,
  ActionManager,
  ExecuteCodeAction,
  PointLight,
  Angle,
} from "@babylonjs/core/index";
import { Scene } from "@babylonjs/core/scene";
import { GUI3DManager } from "@babylonjs/gui/index";
import { WebXRDefaultExperience } from "@babylonjs/core/index";

import "@babylonjs/loaders/glTF";
import { ImageContentItem } from "./Models/ImageContentItem";
import { ContentItemType } from "./Models/ExcursionModels/ContentItemModel";
import { Inspector } from "@babylonjs/inspector";
import { TempTimerLogic } from "./TempTimerLogic";

export class Viewer {
  private currentImage: DynamicPhotoDome = null;
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private viewScene: Excursion;
  private links: LinkToStatePool;

  private linkSphereMaterials: StandardMaterial[] = [];
  /** Врвменный список контента изображений, не вынесен в отдельный класс из-за спешки */
  private imageContents: ImageContentItem[] = [];
  private assetsManager: AssetsManager;

  private groupLinkMaterial: Material;
  private fieldItemMaterial: StandardMaterial;
  private backgroundAudio: BackgroundAudioView;
  currentPicture: State;
  fullScreenGUI: FullScreenGUI;
  iconBottom: IconBottom | null = null;
  xrHelper: WebXRDefaultExperience;
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

    var glMaterial = new StandardMaterial("groupLinkMaterial", scene);
    glMaterial.diffuseColor = Color3.Blue();
    glMaterial.specularPower = 200;
    this.groupLinkMaterial = glMaterial;

    const fiMaterial = new StandardMaterial("field_item_material", scene);
    fiMaterial.diffuseColor = Color3.Gray();
    fiMaterial.alpha = 0.3;
    fiMaterial.emissiveColor = Color3.White();
    this.fieldItemMaterial = fiMaterial;

    window.addEventListener("hashchange", () => {
      this.goToImage(this.currentPicture.id, () => {}, false);
    });

    const camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    this.freeCamera = camera;

    try {
      WebXRDefaultExperience.CreateAsync(scene, {
        disableTeleportation: false,
        inputOptions: {
          disableOnlineControllerRepository: false,
        },
      })
        .then((xr) => {
          this.xrHelper = xr;
          xr.input.onControllerAddedObservable.add((controller) => {
            controller.onMotionControllerInitObservable.add((mc) => {
              const aButton = mc.getComponent("a-button");
              if (aButton) {
                aButton.onButtonStateChangedObservable.add((e) => {
                  if (e.pressed) {
                    this.backgroundAudio.togglePlayPause();
                  }
                });
              }
              const bButton = mc.getComponent("b-button");
              if (bButton) {
                bButton.onButtonStateChangedObservable.add((e) => {
                  if (
                    e.pressed &&
                    this.viewScene.fastReturnToFirstStateEnabled
                  ) {
                    this.goToFirstState();
                  }
                });
              }
            });
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
    DefaultLoadingScreen.DefaultLogoUrl = this.configuration.logoUrl;
    if (this.configuration.bottomImage) {
      this.iconBottom = new IconBottom(scene, this.configuration.bottomImage);
    }
    engine.loadingUIBackgroundColor = "transparent";

    scene.actionManager = new ActionManager(scene);

    if (BuildConfiguration.NeedDebugLayer) {
      console.log("deep debug");
      if (sessionStorage.getItem("show_debug_layer")) {
        Inspector.Show(scene, {});
      }
      scene.actionManager.registerAction(
        new ExecuteCodeAction(
          {
            trigger: ActionManager.OnKeyUpTrigger,
            parameter: "r",
          },
          () => {
            if (Inspector.IsVisible) {
              Inspector.Hide();
              sessionStorage.removeItem("show_debug_layer");
            } else {
              Inspector.Show(scene, {});
              sessionStorage.setItem("show_debug_layer", "yes");
            }
          }
        )
      );
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
      () => {
        this.rotateCamToAngle(180); // TODO: Временное решение, у каждой сцены должен быть прописан угол поворота для корректного открытия
      },
      true
    );
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

    let targetId = this.viewScene.firstStateId;
    const tryId = location.hash.substr(1);
    if (this.viewScene.states.some((p) => p.id === tryId)) {
      targetId = tryId;
    }

    await this.goToImage(targetId, null, true);
  }

  private rotateCamToAngle(angle: number) {
    const yAngle = Angle.FromDegrees(angle).radians() + Math.PI;
    this.freeCamera.rotation.y = yAngle;
    this.xrHelper &&
      this.xrHelper.input.xrSessionManager.runInXRFrame(() => {
        this.xrHelper.input.xrCamera.setTransformationFromNonVRCamera(
          this.freeCamera
        );
      });
  }

  private async goToImage(
    id: string,
    actionBeforeChange: () => void = null,
    forceReload = false
  ) {
    if (!forceReload && this.currentPicture && this.currentPicture.id == id) {
      return;
    }
    location.hash = id;
    const targetPicture = this.viewScene.states.find((p) => p.id === id);
    this.currentPicture = targetPicture;
    this.cleanLinks();
    await this.drawImage(targetPicture, actionBeforeChange);

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
      this.scene
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

  private cleanLinks() {
    this.links.clean();
    this.imageContents.forEach((imageContent) => {
      imageContent.dispose();
    });
    this.imageContents = [];
  }

  private getName(id: string): string {
    return this.viewScene.states.find((p) => p.id === id).title;
  }
}
