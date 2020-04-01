import { Engine, Scene, ArcRotateCamera, HemisphericLight, Quaternion, SwitchBooleanAction, Action, DirectionalLight, FreeCamera, TargetCamera, Angle } from "babylonjs";
import { AbstractMesh, PhotoDome, Mesh, ExecuteCodeAction, ActionManager, StandardMaterial, Vector3 } from "babylonjs";
import { Camera, Color3, MeshBuilder, Material, PointLight, AssetsManager, DefaultLoadingScreen, ViveController } from "babylonjs";
import { WebVRController, PickingInfo } from "babylonjs";

import { Excursion } from "./Models/ExcursionModels/Excursion";
import * as GUI from "babylonjs-gui";
import { AdvancedDynamicTexture, Button, GUI3DManager } from "babylonjs-gui";
import { SceneNavigator } from "./SceneNavigator";
import { Configuration } from "./Configuration";
import { MathStuff } from "./Stuff/MathStuff";
import { LinkToStatePool } from "./Models/LinkToStatePool";
import { BuildConfiguration } from "./BuildConfiguration";
import { TableOfContentViewer } from "./Models/TableOfContentViewer";


export class Viewer {

    private currentImage: PhotoDome = null;
    private scene: Scene;
    private viewScene: Excursion;
    private tableOfContentViewer: TableOfContentViewer;
    private tableOfContentButton: Button;
    private links: LinkToStatePool;

    private baseLinkSphereMaterial?: StandardMaterial;
    private linkSphereMaterials: StandardMaterial[] = [];

    private assetsManager: AssetsManager;

    private groupLinkMaterial: Material;
    private fieldItemMaterial: StandardMaterial;

    constructor(private configuration: Configuration) { }

    private backgroundRadius = 500;

    public createScene() {
        const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        this.scene = scene;
        this.assetsManager = new AssetsManager(scene);
        const guiManager = new GUI3DManager(scene);
        this.links = new LinkToStatePool(this.assetsManager, guiManager, scene);
        this.tableOfContentViewer = new TableOfContentViewer(guiManager, scene);

        var glMaterial = new StandardMaterial("groupLinkMaterial", scene);
        glMaterial.diffuseColor = Color3.Blue();
        glMaterial.specularPower = 200;
        this.groupLinkMaterial = glMaterial;

        const fiMaterial = new StandardMaterial("field_item_material", scene);
        fiMaterial.diffuseColor = Color3.Gray();
        fiMaterial.alpha = 0.3;
        fiMaterial.emissiveColor = Color3.White();
        this.fieldItemMaterial = fiMaterial;

        ViveController.MODEL_BASE_URL = "models/vive/";


        const supportsVR = 'getVRDisplays' in navigator;
        var camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);
        if (supportsVR) {
            navigator.getVRDisplays().then(function (displays) {
                const vrHelper = scene.createDefaultVRExperience({
                    controllerMeshes: true,
                    rayLength: 500
                });

                vrHelper.enableInteractions();
                vrHelper.displayGaze = true;
                vrHelper.deviceOrientationCamera.position = Vector3.Zero();
                vrHelper.webVRCamera.position = Vector3.Zero();
                vrHelper.vrDeviceOrientationCamera.position = Vector3.Zero();
                camera.dispose();
            });
        }

        scene.registerBeforeRender(() => {
            // scene.activeCamera.position = Vector3.Zero();
        });


        DefaultLoadingScreen.DefaultLogoUrl = this.configuration.logoUrl;
        engine.loadingUIBackgroundColor = "transparent";

        scene.actionManager = new ActionManager(scene);

        if (BuildConfiguration.NeedDebugLayer) {
            console.log("deep debug");

            scene.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnKeyUpTrigger,
                        parameter: 'r'
                    },
                    () => {
                        if (scene.debugLayer.isVisible()) {
                            scene.debugLayer.hide();
                        } else {
                            scene.debugLayer.show();
                        }
                    }
                )
            );
        } else {
            // scene.activeCamera.inputs.remove(scene.activeCamera.inputs.attached["keyboard"]);
        }

        const light2 = new PointLight("light2", new Vector3(0, 2, 0), scene);

        engine.runRenderLoop(() => {
            scene.render();
        });
        window.addEventListener("resize", () => {
            engine.resize();
        });

        const material = new StandardMaterial("link material", scene);

        material.diffuseColor = Color3.Red();
        material.specularPower = 200;
        this.baseLinkSphereMaterial = material;

        this.createNavigatorButton();
    }

    public async show(scene: Excursion) {
        this.viewScene = scene;
        for (const color of scene.colorSchemes) {
            const newMaterial = this.baseLinkSphereMaterial.clone("link material");
            newMaterial.diffuseColor = new Color3(color.r, color.g, color.b);
            this.linkSphereMaterials.push(newMaterial);
        }

        if (scene.tableOfContent) {
            var info = scene.tableOfContent.map(r => {
                return {
                    title: r.title,
                    states: r.stateIds.map(sid => {
                        return {
                            title: this.getName(sid),
                            id: sid
                        }
                    })
                }
            });

            this.tableOfContentViewer.init(info, (id) => this.goToImage(id));
        }
        await this.goToImage(this.viewScene.firstStateId);
    }

    private createNavigatorButton() {
        console.warn("Table of content Desktop UI!!!");
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("Menu UI");
        const button = Button.CreateSimpleButton("but", "Menu");
        button.width = 0.09;
        button.height = "40px";
        button.color = "black";
        button.background = "white";
        button.top = "-45%";
        button.left = "-45%";
        button.onPointerClickObservable.add(() => {
            this.tableOfContentViewer.toggleView();
        });
        advancedTexture.addControl(button);
        this.tableOfContentButton = button;
    }


    private async goToImage(id: string, actionBeforeChange: () => void = null) {
        const targetPicture = this.viewScene.states.find((p) => p.id === id);
        this.cleanLinks();
        await this.drawImage(this.configuration.sceneUrl + targetPicture.url, targetPicture.pictureRotation, actionBeforeChange);
        document.title = targetPicture.title;
        const distanceToLinks = 10;
        for (const link of targetPicture.links) {
            const name = this.getName(link.id);
            const position = MathStuff.GetPositionForMarker(link.rotation, distanceToLinks);
            const material = this.linkSphereMaterials[link.colorScheme];

            const linkToState = this.links.getLink(name, position, material, () => {
                let rotateCam = () => {};
                if (link.rotationAfterStepAngleOverridden) {
                    rotateCam = () => {
                        var targetCamera = this.scene.activeCamera as TargetCamera;
                        targetCamera.rotation.y = Angle.FromDegrees(link.rotationAfterStepAngle).radians() + Math.PI;
                    }
                }
                return this.goToImage(link.id, rotateCam);
            });
        }
        for (const groupLink of targetPicture.groupLinks) {
            let name = groupLink.title;
            if (!name) {
                name = "NO TITLE";
            }
            const position = MathStuff.GetPositionForMarker(groupLink.rotation, distanceToLinks);
            const material = this.groupLinkMaterial

            const linkToState = this.links.getGroupLink(name,
                groupLink.stateIds.map(stateId => { return { id: stateId, title: this.getName(stateId) } }),
                groupLink.infos,
                position,
                material,
                async (selectedId) => {
                    let rotateCam = () => {};
                    var overridePair = groupLink.groupStateRotationOverrides.find(p => p.stateId == selectedId);
                    if (overridePair) {
                        rotateCam = () => {
                            var targetCamera = this.scene.activeCamera as TargetCamera;
                            targetCamera.rotation.y = Angle.FromDegrees(overridePair.rotationAfterStepAngle).radians() + Math.PI;
                        };
                    }
                    return this.goToImage(selectedId, rotateCam);
                });
        }

        for (const fieldItem of targetPicture.fieldItems) {
            const fieldItemInfo = {
                vertex: fieldItem.vertices.map(q => MathStuff.GetPositionForMarker(q, this.backgroundRadius)),
                imageUrl: this.configuration.sceneUrl + fieldItem.imageUrl,
                distance: distanceToLinks
            }
            const material = this.fieldItemMaterial

            const linkToState = this.links.getFieldItem(
                fieldItem.title,
                fieldItemInfo,
                material);
        }
    }


    private drawImage(url: string, pictureRotation: any, actionBeforeChange: () => void = null): Promise<void> {

        if (this.currentImage === null) {
            this.currentImage = new PhotoDome("background", null, { resolution: 32, size: this.backgroundRadius * 2 }, this.scene);
        } else {
        }
        const task = this.assetsManager.addTextureTask("image task", url, null, false);

        var promise = new Promise<void>(async (resolve, error) => {
            this.assetsManager.load();
            await this.assetsManager.loadAsync();

            task.onSuccess = t => {
                if (actionBeforeChange) {
                    actionBeforeChange();
                }
                this.currentImage.photoTexture.dispose();
                this.currentImage.photoTexture = t.texture;
                this.currentImage.rotationQuaternion = pictureRotation;
                resolve();
            }
        })
        return promise;
    }

    private cleanLinks() {
        this.links.clean();
    }

    private getName(id: string): string {
        return this.viewScene.states.find((p) => p.id === id).title;
    }
}

