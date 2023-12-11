import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MathStuff } from "../../src/Stuff/MathStuff";
import { ContentItemModel } from "./ExcursionModels/ContentItemModel";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

const distanceToContent = 20;

export class ImageContentItem {
  private _imagePlane?: Mesh;
  public get imagePlane(): Mesh | null {
    return this._imagePlane || null;
  }
  constructor(
    private contentItemInfo: ContentItemModel,
    private assetsManager: AssetsManager,
    private scene: Scene,
    private startVisibility = 1,
    private onImageLoad: () => void = () => {}
  ) {
    const position = MathStuff.GetPositionForMarker(
      contentItemInfo.orientation,
      distanceToContent
    );

    this.createContent(position);
  }
  private createContent(position: Vector3) {
    const task = this.assetsManager.addTextureTask(
      `image task ${this.contentItemInfo.image}`,
      this.contentItemInfo.image,
      null,
      true
    );
    task.onSuccess = () => {
      var textureSize = task.texture.getSize();
      this._imagePlane = MeshBuilder.CreatePlane(
        `image_content_image_${this.contentItemInfo.image}`,
        {
          width: textureSize.width * this.contentItemInfo.multipler,
          height: textureSize.height * this.contentItemInfo.multipler,
        },
        this.scene
      );
      this._imagePlane.visibility = this.startVisibility;
      const imageMaterial = new StandardMaterial("", this.scene);
      imageMaterial.specularColor = Color3.Black();
      imageMaterial.diffuseTexture = task.texture;
      this._imagePlane.material = imageMaterial;
      this._imagePlane.position = position;
      this._imagePlane.lookAt(position.scale(1.1));
      this.onImageLoad();
    };
  }

  public dispose() {
    if (this._imagePlane) {
      this._imagePlane.dispose();
      this._imagePlane.material.dispose();
    }
  }
}
