import {
  Mesh,
  StandardMaterial,
  AssetsManager,
  Scene,
  Vector3,
  MeshBuilder,
  Color3,
} from "@babylonjs/core/index";
import { MathStuff } from "../../src/Stuff/MathStuff";
import { ContentItemModel } from "./ExcursionModels/ContentItemModel";

const distanceToContent = 20;

export class ImageContentItem {
  private imagePlane?: Mesh;

  constructor(
    private contentItemInfo: ContentItemModel,
    private assetsManager: AssetsManager,
    private scene: Scene
  ) {
    console.log(contentItemInfo);
    const position = MathStuff.GetPositionForMarker(
      contentItemInfo.orientation,
      distanceToContent
    );
    console.log(position);

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
      this.imagePlane = MeshBuilder.CreatePlane(
        `image_content_image_${this.contentItemInfo.image}`,
        {
          width: textureSize.width * this.contentItemInfo.multipler,
          height: textureSize.height * this.contentItemInfo.multipler,
        },
        this.scene
      );
      const imageMaterial = new StandardMaterial("", this.scene);
      imageMaterial.specularColor = Color3.Black();
      imageMaterial.diffuseTexture = task.texture;
      this.imagePlane.material = imageMaterial;
      this.imagePlane.position = position;
      this.imagePlane.lookAt(position.scale(1.1));
    };
  }

  public dispose() {
    if (this.imagePlane) {
      this.imagePlane.dispose();
      this.imagePlane.material.dispose();
    }
  }
}
