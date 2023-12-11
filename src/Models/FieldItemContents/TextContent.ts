import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { FieldItemContent } from "./FieldItemContent";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { ScrollViewer } from "@babylonjs/gui/2D/controls/scrollViewers/scrollViewer";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Scene } from "@babylonjs/core/scene";
import {
  PointerEventTypes,
  PointerInfo,
} from "@babylonjs/core/Events/pointerEvents";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";

export class TextContent implements FieldItemContent {
  static readonly CONTENT_TYPE: string = "text";

  get type(): string {
    return TextContent.CONTENT_TYPE;
  }

  private textPlane: Mesh;
  private textTexture: AdvancedDynamicTexture;

  private scrollView: ScrollViewer;

  private wheelHandler: any;

  constructor(
    private text: string,
    private parent: TransformNode,
    private contentWidth: number,
    private contentHeight: number,
    private gui3Dmanager: GUI3DManager,
    private assetsManager: AssetsManager,
    private scene: Scene
  ) {
    // this.loadVideoResources(videoUrl);
    // this.playPauseButton = this.createPlayPauseButton();
    this.createTextPanel();
    this.wheelHandler = (event: PointerInfo) => {
      if (event.pickInfo.pickedMesh === this.textPlane) {
        if (event.type == PointerEventTypes.POINTERWHEEL) {
          let delta = (event.event as any).deltaY;
          delta = delta > 0 ? 1 : -1;
          this.scrollView.verticalBar.value +=
            this.scrollView.wheelPrecision * delta;
        }
      }
    };
    scene.onPointerObservable.add(this.wheelHandler);
  }

  setIsVisible(visible: boolean) {
    this.textPlane.isVisible = visible;
  }

  createTextPanel() {
    const plane = CreatePlane(
      `text_content_plane`,
      {
        width: this.contentWidth,
        height: this.contentHeight,
      },
      this.scene
    );
    plane.parent = this.parent;
    plane.position.z = -0.1;
    var texture = AdvancedDynamicTexture.CreateForMesh(plane);
    var sv = new ScrollViewer();
    sv.thickness = 7;
    sv.color = "gray";
    sv.width = 1;
    sv.height = 1;
    sv.background = "#dedede";
    texture.addControl(sv);
    var tb = new TextBlock();
    tb.textWrapping = TextWrapping.WordWrap;
    tb.resizeToFit = true;
    tb.paddingTop = "5%";
    tb.paddingLeft = "30px";
    tb.paddingRight = "20px";
    tb.paddingBottom = "5%";
    tb.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    tb.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    tb.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    tb.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    tb.color = "black";
    tb.text = this.text;
    tb.fontSize = "32px";

    sv.addControl(tb);
    //TODO: вернуть поведение скролла на текстовом контенте
    // sv.verticalBar.onPointerDownObservable.add(e =>{
    //     this.scene.activeCamera.inputs.attached.mouse.detachControl(this.scene.activeCamera.inputs.attachedElement);
    // });
    // sv.verticalBar.onPointerUpObservable.add(e => {
    //     this.scene.activeCamera.inputs.attachInput(this.scene.activeCamera.inputs.attached.mouse);
    // });

    this.textPlane = plane;
    this.textTexture = texture;
    this.scrollView = sv;
  }

  public dispose() {
    this.textPlane.dispose();
    this.textPlane.material.dispose();
    this.textTexture.dispose();
    this.scene.onPointerObservable.remove(this.wheelHandler);
  }
}
