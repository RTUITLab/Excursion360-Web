import { Material, StandardMaterial, Color3, Texture, TransformNode, Vector4, BoxBuilder, AbstractMesh } from "@babylonjs/core/index";
import { Scene } from "@babylonjs/core/scene";
import { Nullable, int } from "@babylonjs/core/types";
import { AbstractButton3D, AdvancedDynamicTexture, Button3D, Control } from "@babylonjs/gui/index";

class L extends Button3D {
    
}

/**
 * Class used to create a button in 3D
 */
export class CustomButton3D extends AbstractButton3D {
    /** @hidden */
    protected _currentMaterial: Material;
    private _customFacadeTexture: Nullable<AdvancedDynamicTexture>;
    private _customContent: Control;
    private _customContentResolution = 512;
    private _customContentScaleRatio = 2;

    protected _width: number;
    protected _height: number;

    /**
     * Gets or sets the texture resolution used to render content (512 by default)
     */
    public get contentResolution(): int {
        return this._customContentResolution;
    }

    public set contentResolution(value: int) {
        if (this._customContentResolution === value) {
            return;
        }

        this._customContentResolution = value;
        this._resetContent();
    }

    /**
     * Gets or sets the texture scale ratio used to render content (2 by default)
     */
    public get contentScaleRatio(): number {
        return this._customContentScaleRatio;
    }

    public set contentScaleRatio(value: number) {
        if (this._customContentScaleRatio === value) {
            return;
        }

        this._customContentScaleRatio = value;
        this._resetContent();
    }

    protected _disposeFacadeTexture() {
        if (this._customFacadeTexture) {
            this._customFacadeTexture.dispose();
            this._customFacadeTexture = null;
        }
    }

    protected _resetContent() {
        this._disposeFacadeTexture();
        this.content = this._customContent;
    }

    /**
     * Creates a new button
     * @param name defines the control name
     */
    constructor(name?: string, width = 1, height = 1) { 
        super(name);
        this._width = width;
        this._height = height;
        // Default animations

        this.pointerEnterAnimation = () => {
            if (!this.mesh) {
                return;
            }
            (<StandardMaterial>this._currentMaterial).emissiveColor = Color3.Red();
        };

        this.pointerOutAnimation = () => {
            (<StandardMaterial>this._currentMaterial).emissiveColor = Color3.Black();
        };

        this.pointerDownAnimation = () => {
            if (!this.mesh) {
                return;
            }

            this.mesh.scaling.scaleInPlace(0.95);
        };

        this.pointerUpAnimation = () => {
            if (!this.mesh) {
                return;
            }

            this.mesh.scaling.scaleInPlace(1.0 / 0.95);
        };
    }

    /**
     * Gets or sets the GUI 2D content used to display the button's facade
     */
    public get content(): Control {
        return this._customContent;
    }

    public set content(value: Control) {
        this._customContent = value;

        if (!this._host || !this._host.utilityLayer) {
            return;
        }
        if (!this._customFacadeTexture) {
            this._customFacadeTexture = new AdvancedDynamicTexture("Facade",
                this._customContentResolution * this._width,
                this._customContentResolution * this._height,
                this._host.utilityLayer.utilityLayerScene, true, Texture.TRILINEAR_SAMPLINGMODE);
            this._customFacadeTexture.rootContainer.scaleX = this._customContentScaleRatio;
            this._customFacadeTexture.rootContainer.scaleY = this._customContentScaleRatio;
            this._customFacadeTexture.premulAlpha = true;
        }
        else {
            this._customFacadeTexture.rootContainer.clearControls();
        }

        this._customFacadeTexture.addControl(value);

        this._applyFacade(this._customFacadeTexture);
    }

    /**
     * Apply the facade texture (created from the content property).
     * This function can be overloaded by child classes
     * @param facadeTexture defines the AdvancedDynamicTexture to use
     */
    protected _applyFacade(facadeTexture: AdvancedDynamicTexture) {
        (<any>this._currentMaterial).emissiveTexture = facadeTexture;
    }

    protected _getTypeName(): string {
        return "Button3D";
    }

    // Mesh association
    protected _createNode(scene: Scene): TransformNode {
        var faceUV = new Array(6);

        for (var i = 0; i < 6; i++) {
            faceUV[i] = new Vector4(0, 0, 0, 0);
        }
        faceUV[1] = new Vector4(0, 0, 1, 1);

        let mesh = BoxBuilder.CreateBox(this.name + "_rootMesh", {
            width: this._width,
            height: this._height,
            depth: 0.08,
            faceUV: faceUV
        }, scene);

        return mesh;
    }

    protected _affectMaterial(mesh: AbstractMesh) {
        let material = new StandardMaterial(this.name + "Material", mesh.getScene());
        material.specularColor = Color3.Black();

        mesh.material = material;
        this._currentMaterial = material;

        this._resetContent();
    }

    /**
     * Releases all associated resources
     */
    public dispose() {
        super.dispose();

        this._disposeFacadeTexture();

        if (this._currentMaterial) {
            this._currentMaterial.dispose();
        }
    }
}