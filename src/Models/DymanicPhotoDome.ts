import { DynamicTexture, MeshBuilder, PhotoDome, PickingInfo, Quaternion, Scene, Texture } from "babylonjs";
import { Vector3 } from "babylonjs/Maths/math.vector";
import { CroppedImage } from "./ExcursionModels/CroppedImage";
import { CroppedImagePart } from "./ExcursionModels/CroppedImagePart";

export default class DynamicPhotoDome {


  private texture: DynamicTexture;
  private drawContext: CanvasRenderingContext2D;
  private photoDome: PhotoDome;

  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  private findRectangleStepW: number = 0;
  private findRectangleStepH: number = 0;



  private imagePartsToLoad: CroppedImagePart[];
  private baseRoute: string;
  private loadedImageParts: Set<CroppedImagePart> = new Set();

  constructor(size: number, scene: Scene) {
    this.texture = new DynamicTexture("photodome dynamic texture", { width: 0, height: 0 }, scene, false);
    this.drawContext = this.texture.getContext();
    this.photoDome = new PhotoDome("photodome", null, { resolution: 32, size }, scene);
    this.photoDome.photoTexture.dispose();
    this.photoDome.photoTexture = this.texture;

  }

  private lastActiveCameraRotation: Quaternion;

  private timeFromStart = -500;
  private lastUpdateTime = 0;
  private triggerFindImageParts = false;

  public trackImageParts(scene: Scene) {
    this.timeFromStart += scene.deltaTime;
    if (!scene.activeCamera.absoluteRotation.equals(this.lastActiveCameraRotation) && this.timeFromStart - this.lastUpdateTime > 200) {
      this.lastUpdateTime = this.timeFromStart;
      this.lastActiveCameraRotation = scene.activeCamera.absoluteRotation.clone();
      this.triggerFindImageParts = true;
    }
    if (this.triggerFindImageParts) {
      this.findImageParts(scene);
      this.triggerFindImageParts = false;
    }
  }
  findImageParts(scene: Scene) {
    if (!this.imagePartsToLoad
      || this.imagePartsToLoad.length == 0
      || this.imagePartsToLoad.length == this.loadedImageParts.size) {
      return;
    }

    for (let x = 0; x < this.canvasWidth; x += this.findRectangleStepW) {
      for (let y = 0; y < this.canvasHeight; y += this.findRectangleStepH) {
        const pickInfo = scene.pick(x, y, m => m === this.photoDome.mesh);
        const part = this.findPart(pickInfo);
        if (part && !this.loadedImageParts.has(part)) {
          this.loadedImageParts.add(part);
          const image = new Image();
          image.crossOrigin = "anonymous";
          const drawContext = this.drawContext;
          const texture = this.texture;
          image.onload = function (this: HTMLImageElement) {
            drawContext.drawImage(this, 0, 0, part.width, part.height, part.x, part.y, part.width, part.height);
            texture.update(false);
          }
          image.src = `${this.baseRoute}/${part.route}`;
        }
      }
    }
  }

  findPart(pickInfo: PickingInfo): CroppedImagePart {
    const textureSize = this.texture.getSize();
    const { x, y } = pickInfo.getTextureCoordinates().multiplyByFloats(textureSize.width, textureSize.height);
    const target = this.imagePartsToLoad.find(r => x >= r.x && y >= r.y && x <= r.x + r.width && y <= r.y + r.height);
    if (!target) {
      return null;
    }
    return target;
  }

  public setRotation(pictureRotation: any) {
    this.photoDome.rotationQuaternion = pictureRotation;
  }

  public setByImage(image: HTMLImageElement, size?: { width: number, height: number }) {
    this.imagePartsToLoad = null;
    this.loadedImageParts.clear();
    const { width, height } = size || { width: image.width, height: image.height };
    this.texture.scaleTo(width, height);
    this.drawContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    this.texture.update(false);
  }

  public setImageParts(baseRoute: string, newParts: CroppedImagePart[]) {
    this.baseRoute = baseRoute;
    this.imagePartsToLoad = newParts;
    this.loadedImageParts.clear();
  }

  public setCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;

    const pointsInRow = 5;

    this.findRectangleStepW = (this.canvasWidth / pointsInRow) * 0.9;
    this.findRectangleStepH = (this.canvasHeight / pointsInRow) * 0.9;
    this.triggerFindImageParts = true;
  }
}