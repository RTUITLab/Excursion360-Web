import { Color3, MeshBuilder, Scene, StandardMaterial, Texture } from "@babylonjs/core/index";
import { BottomImageConfiguration } from "../Configuration/Configuration";

export class IconBottom {

  constructor(private _scene: Scene, config: BottomImageConfiguration) {
    const bottomPlane = MeshBuilder.CreatePlane(`background_image_plane`, {
      width: config.size,
      height: config.size,
    }, _scene);
    bottomPlane.position.y = -10;
    const yMaterial = new StandardMaterial("background_image_plane_texture", _scene);
    yMaterial.diffuseTexture = new Texture(config.url, _scene);
    yMaterial.diffuseTexture.hasAlpha = true;
    yMaterial.specularColor = Color3.Black();
    bottomPlane.material = yMaterial;
    bottomPlane.lookAt(bottomPlane.position.scale(1.1));
    _scene.onBeforeRenderObservable.add(() => {
      bottomPlane.rotation.y = _scene.activeCamera.absoluteRotation.toEulerAngles().y;
    })
  }
}