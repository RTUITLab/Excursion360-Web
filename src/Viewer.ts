import { Engine, Scene, ArcRotateCamera, HemisphericLight, Quaternion, SwitchBooleanAction, Action, DirectionalLight, FreeCamera, TargetCamera, Angle, Logger } from "babylonjs";
import { AbstractMesh, PhotoDome, Mesh, ExecuteCodeAction, ActionManager, StandardMaterial, Vector3 } from "babylonjs";
import { Camera, Color3, MeshBuilder, Material, PointLight, AssetsManager, DefaultLoadingScreen, ViveController } from "babylonjs";
import { WebVRController, PickingInfo } from "babylonjs";

import { Excursion } from "./Models/ExcursionModels/Excursion";
import * as GUI from "babylonjs-gui";
import { AdvancedDynamicTexture, Button, GUI3DManager } from "babylonjs-gui";
import { Configuration } from "./Configuration/Configuration";
import { MathStuff } from "./Stuff/MathStuff";
import { LinkToStatePool } from "./Models/LinkToStatePool";
import { BuildConfiguration } from "./Configuration/BuildConfiguration";
import { State } from "./Models/ExcursionModels/State";
import { GroupLink } from "./Models/GroupLink";
import { FieldItemInfo } from "./Models/FieldItemInfo";
import { LinkToState } from "./Models/LinkToState";
import { FieldItem } from "./Models/FieldItem";


export class Viewer {

    private currentImage: PhotoDome = null;
    private scene: Scene;
    private viewScene: Excursion;
    private links: LinkToStatePool;

    private linkSphereMaterials: StandardMaterial[] = [];

    private assetsManager: AssetsManager;

    private groupLinkMaterial: Material;
    private fieldItemMaterial: StandardMaterial;
    currentPicture: State;

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
        window.addEventListener('hashchange', () => {
            this.goToImage(this.currentPicture.id, () => { }, false);
        });

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
            scene.activeCamera.inputs.remove(scene.activeCamera.inputs.attached["keyboard"]);
        }

        const light2 = new PointLight("light2", new Vector3(0, 2, 0), scene);

        engine.runRenderLoop(() => {
            scene.render();
        });
        window.addEventListener("resize", () => {
            engine.resize();
        });
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

    public rotateCameraToQuaternion(rotation: any): void {
        const targetPosition = MathStuff.GetPositionForMarker(rotation, 100);
        const targetCamera = this.scene.activeCamera as TargetCamera;
        targetCamera.setTarget(targetPosition);
    }


    private async goToImage(id: string, actionBeforeChange: () => void = null, forceReload = false) {

        if (!forceReload && this.currentPicture && this.currentPicture.id == id) {
            return;
        }
        location.hash = id;
        const targetPicture = this.viewScene.states.find((p) => p.id === id);
        this.currentPicture = targetPicture;
        this.cleanLinks();
        await this.drawImage(this.configuration.sceneUrl + targetPicture.url, targetPicture.pictureRotation, actionBeforeChange);
        document.title = targetPicture.title;
        const distanceToLinks = 10;
        for (const link of targetPicture.links) {
            const name = this.getName(link.id);
            const position = MathStuff.GetPositionForMarker(link.rotation, distanceToLinks);
            const material = this.linkSphereMaterials[link.colorScheme];

            const linkToState = this.links.getLink(name, position, material, () => {
                let rotateCam = () => { };
                if (link.rotationAfterStepAngleOverridden) {
                    rotateCam = () => {
                        var targetCamera = this.scene.activeCamera as TargetCamera;
                        targetCamera.rotation.y = Angle.FromDegrees(link.rotationAfterStepAngle).radians() + Math.PI;
                    }
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
            const position = MathStuff.GetPositionForMarker(groupLink.rotation, distanceToLinks);
            const material = this.groupLinkMaterial;

            const linkToState = this.links.getGroupLink(name,
                groupLink.stateIds.map(stateId => { return { id: stateId, title: this.getName(stateId) } }),
                groupLink.infos,
                position,
                { scale: groupLink.minimizeScale },
                material,
                async (gl) => {
                    groupLinks.filter(l => l !== gl).forEach(l => l.closeLinks());
                },
                async (selectedId) => {
                    let rotateCam = () => { };
                    var overridePair = groupLink.groupStateRotationOverrides.find(p => p.stateId == selectedId);
                    if (overridePair) {
                        rotateCam = () => {
                            var targetCamera = this.scene.activeCamera as TargetCamera;
                            targetCamera.rotation.y = Angle.FromDegrees(overridePair.rotationAfterStepAngle).radians() + Math.PI;
                        };
                    }
                    return this.goToImage(selectedId, rotateCam);
                });
            groupLinks.push(linkToState);
        }

        const fieldItems: FieldItem[] = [];
        for (const fieldItem of targetPicture.fieldItems) {
            const fieldItemInfo = new FieldItemInfo(
                fieldItem.vertices.map(q => MathStuff.GetPositionForMarker(q, this.backgroundRadius)),
                fieldItem.images.map(i => this.configuration.sceneUrl + i),
                fieldItem.videos.map(v => this.configuration.sceneUrl + v),
                fieldItem.text,
                fieldItem.audios.map(a => ({ ...a, src: this.configuration.sceneUrl + a.src })),
                distanceToLinks
            );
            const material = this.fieldItemMaterial;

            const createdFieldItem = this.links.getFieldItem(
                fieldItem.title,
                fieldItemInfo,
                async fi => fieldItems.filter(i => i !== fi).forEach(i => i.setShowContent(false)),
                material);
            fieldItems.push(createdFieldItem);
        }
    }


    private drawImage(url: string, pictureRotation: any, actionBeforeChange: () => void = null): Promise<void> {

        if (this.currentImage === null) {
            this.currentImage = new PhotoDome("background", null, { resolution: 32, size: this.backgroundRadius * 2 }, this.scene);
        }
        const task = this.assetsManager.addTextureTask("image task", url, null, false);
        var promise = new Promise<void>(async (resolve, error) => {
            task.onSuccess = t => {
                if (actionBeforeChange) {
                    actionBeforeChange();
                }
                this.currentImage.photoTexture.dispose();
                this.currentImage.photoTexture = t.texture;
                this.currentImage.rotationQuaternion = pictureRotation;
                resolve();
            };
            this.assetsManager.load();
            await this.assetsManager.loadAsync();
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

