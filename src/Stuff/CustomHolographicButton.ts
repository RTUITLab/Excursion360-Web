import { FadeInOutBehavior } from "@babylonjs/core/Behaviors/Meshes/fadeInOutBehavior";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { IsDocumentAvailable } from "@babylonjs/core/Misc/domManagement";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Button3D } from "@babylonjs/gui/3D/controls/button3D";
import { Control3D } from "@babylonjs/gui/3D/controls/control3D";
import { FluentMaterial } from "@babylonjs/gui/3D/materials/fluent/fluentMaterial";
import { Image } from "@babylonjs/gui/2D/controls/image";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";

/**
 * Class used to create a holographic button in 3D
 */
export class CustomHolographicButton extends Button3D {
  private _backPlate: Mesh;
  private _textPlate: Mesh;
  private _frontPlate: Mesh;
  private _text: string;
  private _imageUrl: string;
  private _shareMaterials = true;
  private _frontMaterial: FluentMaterial;
  private _backMaterial: FluentMaterial;
  private _plateMaterial: StandardMaterial;
  private _pickedPointObserver: Nullable<Observer<Nullable<Vector3>>>;

  // Tooltip
  private _tooltipFade: Nullable<FadeInOutBehavior>;
  private _tooltipTextBlock: Nullable<TextBlock>;
  private _tooltipTexture: Nullable<AdvancedDynamicTexture>;
  private _tooltipMesh: Nullable<Mesh>;
  private _tooltipHoverObserver: Nullable<Observer<Control3D>>;
  private _tooltipOutObserver: Nullable<Observer<Control3D>>;

  private _disposeTooltip() {
    this._tooltipFade = null;
    if (this._tooltipTextBlock) {
      this._tooltipTextBlock.dispose();
    }
    if (this._tooltipTexture) {
      this._tooltipTexture.dispose();
    }
    if (this._tooltipMesh) {
      this._tooltipMesh.dispose();
    }
    this.onPointerEnterObservable.remove(this._tooltipHoverObserver);
    this.onPointerOutObservable.remove(this._tooltipOutObserver);
  }

  /**
   * Rendering ground id of all the mesh in the button
   */
  public set renderingGroupId(id: number) {
    this._backPlate.renderingGroupId = id;
    this._textPlate.renderingGroupId = id;
    this._frontPlate.renderingGroupId = id;

    if (this._tooltipMesh) {
      this._tooltipMesh.renderingGroupId = id;
    }
  }
  public get renderingGroupId(): number {
    return this._backPlate.renderingGroupId;
  }

  /**
   * Text to be displayed on the tooltip shown when hovering on the button. When set to null tooltip is disabled. (Default: null)
   */
  public set tooltipText(text: Nullable<string>) {
    if (!text) {
      this._disposeTooltip();
      return;
    }
    if (!this._tooltipFade) {
      const rightHandedScene = this._backPlate._scene.useRightHandedSystem;
      // Create tooltip with mesh and text
      this._tooltipMesh = CreatePlane("", { size: 1 }, this._backPlate._scene);
      const tooltipBackground = CreatePlane(
        "",
        { size: 1, sideOrientation: Mesh.DOUBLESIDE },
        this._backPlate._scene
      );
      const mat = new StandardMaterial("", this._backPlate._scene);
      mat.diffuseColor = Color3.FromHexString("#212121");
      tooltipBackground.material = mat;
      tooltipBackground.isPickable = false;
      this._tooltipMesh.addChild(tooltipBackground);
      tooltipBackground.position =
        Vector3.Forward(rightHandedScene).scale(0.05);
      this._tooltipMesh.scaling.y = 1 / 3;
      this._tooltipMesh.position = Vector3.Up()
        .scale(0.7)
        .add(Vector3.Forward(rightHandedScene).scale(-0.15));
      this._tooltipMesh.isPickable = false;
      this._tooltipMesh.parent = this._backPlate;

      // Create text texture for the tooltip
      this._tooltipTexture = AdvancedDynamicTexture.CreateForMesh(
        this._tooltipMesh
      );
      this._tooltipTextBlock = new TextBlock();
      this._tooltipTextBlock.scaleY = 3;
      this._tooltipTextBlock.color = "white";
      this._tooltipTextBlock.fontSize = 130;
      this._tooltipTexture.addControl(this._tooltipTextBlock);

      // Add hover action to tooltip
      this._tooltipFade = new FadeInOutBehavior();
      this._tooltipFade.delay = 500;
      this._tooltipMesh.addBehavior(this._tooltipFade);
      this._tooltipHoverObserver = this.onPointerEnterObservable.add(() => {
        if (this._tooltipFade) {
          this._tooltipFade.fadeIn(true);
        }
      });
      this._tooltipOutObserver = this.onPointerOutObservable.add(() => {
        if (this._tooltipFade) {
          this._tooltipFade.fadeIn(false);
        }
      });
    }
    if (this._tooltipTextBlock) {
      this._tooltipTextBlock.text = text;
    }
  }

  public get tooltipText() {
    if (this._tooltipTextBlock) {
      return this._tooltipTextBlock.text;
    }
    return null;
  }

  /**
   * Gets or sets text for the button
   */
  public get text(): string {
    return this._text;
  }

  public set text(value: string) {
    if (this._text === value) {
      return;
    }

    this._text = value;
    this._rebuildContent();
  }

  /**
   * Gets or sets the image url for the button
   */
  public get imageUrl(): string {
    return this._imageUrl;
  }

  public set imageUrl(value: string) {
    if (this._imageUrl === value) {
      return;
    }

    this._imageUrl = value;
    this._rebuildContent();
  }

  /**
   * Gets the back material used by this button
   */
  public get backMaterial(): FluentMaterial {
    return this._backMaterial;
  }

  /**
   * Gets the front material used by this button
   */
  public get frontMaterial(): FluentMaterial {
    return this._frontMaterial;
  }

  /**
   * Gets the plate material used by this button
   */
  public get plateMaterial(): StandardMaterial {
    return this._plateMaterial;
  }

  /**
   * Gets a boolean indicating if this button shares its material with other HolographicButtons
   */
  public get shareMaterials(): boolean {
    return this._shareMaterials;
  }

  /**
   * Creates a new button
   * @param name defines the control name
   * @param shareMaterials
   */
  constructor(name?: string, width = 1, height = 1, shareMaterials = true) {
    super(name, { width: width, height: height });
    this._shareMaterials = shareMaterials;

    // Default animations
    this.pointerEnterAnimation = () => {
      if (!this.mesh) {
        return;
      }
      this._frontPlate.setEnabled(true);
    };

    this.pointerOutAnimation = () => {
      if (!this.mesh) {
        return;
      }
      this._frontPlate.setEnabled(false);
    };
  }

  protected _getTypeName(): string {
    return "HolographicButton";
  }

  private _rebuildContent(): void {
    this._disposeFacadeTexture();

    const panel = new StackPanel();
    panel.isVertical = true;

    if (IsDocumentAvailable() && !!document.createElement) {
      if (this._imageUrl) {
        const image = new Image();
        image.source = this._imageUrl;
        image.paddingTop = "40px";
        image.height = "180px";
        image.width = "100px";
        image.paddingBottom = "40px";
        panel.addControl(image);
      }
    }

    if (this._text) {
      const text = new TextBlock();
      text.text = this._text;
      text.color = "white";
      text.height = "30px";
      text.fontSize = 24;
      panel.addControl(text);
    }

    if (this._frontPlate) {
      this.content = panel;
    }
  }

  // Mesh association
  protected _createNode(scene: Scene): TransformNode {
    this._backPlate = CreateBox(
      this.name + "BackMesh",
      {
        width: this._options.width,
        height: this._options.height,
        depth: 0.08,
      },
      scene
    );

    this._frontPlate = CreateBox(
      this.name + "FrontMesh",
      {
        width: this._options.width,
        height: this._options.height,
        depth: 0.08,
      },
      scene
    );

    this._frontPlate.parent = this._backPlate;
    this._frontPlate.position = Vector3.Forward(
      scene.useRightHandedSystem
    ).scale(-0.08);
    this._frontPlate.isPickable = false;
    this._frontPlate.setEnabled(false);

    this._textPlate = <Mesh>super._createNode(scene);
    this._textPlate.parent = this._backPlate;
    this._textPlate.position = Vector3.Forward(
      scene.useRightHandedSystem
    ).scale(-0.08);
    this._textPlate.isPickable = false;

    return this._backPlate;
  }

  protected _applyFacade(facadeTexture: AdvancedDynamicTexture) {
    facadeTexture.scaleTo(
      this._options.width * this.contentResolution,
      this._options.height * this.contentResolution
    );
    facadeTexture._rootContainer.scaleX = 1;
    facadeTexture._rootContainer.scaleY = 1;
    this._plateMaterial.emissiveTexture =
      facadeTexture as unknown as BaseTexture;
    this._plateMaterial.opacityTexture =
      facadeTexture as unknown as BaseTexture;
  }

  private _createBackMaterial(mesh: Mesh) {
    this._backMaterial = new FluentMaterial(
      this.name + "Back Material",
      mesh.getScene()
    );
    this._backMaterial.renderHoverLight = true;
    this._pickedPointObserver = this._host.onPickedPointChangedObservable.add(
      (pickedPoint: Vector3) => {
        if (pickedPoint) {
          this._backMaterial.hoverPosition = pickedPoint;
          this._backMaterial.hoverColor.a = 1.0;
        } else {
          this._backMaterial.hoverColor.a = 0;
        }
      }
    );
  }

  private _createFrontMaterial(mesh: Mesh) {
    this._frontMaterial = new FluentMaterial(
      this.name + "Front Material",
      mesh.getScene()
    );
    this._frontMaterial.innerGlowColorIntensity = 0; // No inner glow
    (this._frontMaterial as unknown as Material).alpha = 0.5; // Additive
    this._frontMaterial.renderBorders = true;
  }

  private _createPlateMaterial(mesh: Mesh) {
    this._plateMaterial = new StandardMaterial(
      this.name + "Plate Material",
      mesh.getScene()
    );
    this._plateMaterial.specularColor = Color3.Black();
  }

  protected _affectMaterial(mesh: Mesh) {
    // Back
    if (this._shareMaterials) {
      if (!this._host._sharedMaterials["backFluentMaterial"]) {
        this._createBackMaterial(mesh);
        this._host._sharedMaterials["backFluentMaterial"] = this._backMaterial;
      } else {
        this._backMaterial = this._host._sharedMaterials[
          "backFluentMaterial"
        ] as FluentMaterial;
      }

      // Front
      if (!this._host._sharedMaterials["frontFluentMaterial"]) {
        this._createFrontMaterial(mesh);
        this._host._sharedMaterials["frontFluentMaterial"] =
          this._frontMaterial;
      } else {
        this._frontMaterial = this._host._sharedMaterials[
          "frontFluentMaterial"
        ] as FluentMaterial;
      }
    } else {
      this._createBackMaterial(mesh);
      this._createFrontMaterial(mesh);
    }

    this._createPlateMaterial(mesh);
    this._backPlate.material = this._backMaterial as unknown as Material;
    this._frontPlate.material = this._frontMaterial as unknown as Material;
    this._textPlate.material = this._plateMaterial;

    this._rebuildContent();
  }

  /**
   * Releases all associated resources
   */
  public dispose() {
    super.dispose(); // will dispose main mesh ie. back plate

    this._disposeTooltip();

    if (!this.shareMaterials) {
      this._backMaterial.dispose();
      this._frontMaterial.dispose();
      this._plateMaterial.dispose();

      if (this._pickedPointObserver) {
        this._host.onPickedPointChangedObservable.remove(
          this._pickedPointObserver
        );
        this._pickedPointObserver = null;
      }
    }
  }
}
