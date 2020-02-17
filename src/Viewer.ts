import { Engine, Scene, ArcRotateCamera, HemisphericLight, Quaternion, SwitchBooleanAction, Action, DirectionalLight, FreeCamera } from "babylonjs";
import { AbstractMesh, PhotoDome, Mesh, ExecuteCodeAction, ActionManager, StandardMaterial, Vector3 } from "babylonjs";
import { Camera, Color3, MeshBuilder, Material, PointLight, AssetsManager, DefaultLoadingScreen, ViveController } from "babylonjs";
import { WebVRController, PickingInfo } from "babylonjs";

import { Excursion } from "./Models/ExcursionModels/Excursion";
import * as GUI from "babylonjs-gui";
import { AdvancedDynamicTexture } from "babylonjs-gui";
import { SceneNavigator } from "./SceneNavigator";
import { Configuration } from "./Configuration";
import { MathStuff } from "./Stuff/MathStuff";
import { LinkToStatePool } from "./Models/LinkToStatePool";
import { BuildConfiguration } from "./BuildConfiguration";


export class Viewer {

    private currentImage: PhotoDome = null;
    private scene: Scene;
    private viewScene: Excursion;
    private sceneNavigator?: SceneNavigator;

    private links: LinkToStatePool;

    private baseLinkSphereMaterial?: StandardMaterial;
    private linkSphereMaterials: StandardMaterial[] = [];

    private assetsManager: AssetsManager;

    private controllers: WebVRController[];
    private controllersRays: Mesh[];

    private groupLinkMaterial: Material;
    private fieldItemMaterial: StandardMaterial;

    constructor(private configuration: Configuration) { }

    public createScene() {
        const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        this.scene = scene;
        this.assetsManager = new AssetsManager(scene);
        this.links = new LinkToStatePool(this.assetsManager, scene);

        var glMaterial = new StandardMaterial("groupLinkMaterial", scene);
        glMaterial.diffuseColor = Color3.Blue();
        glMaterial.specularPower = 200;
        this.groupLinkMaterial = glMaterial;

        const fiMaterial = new StandardMaterial("field_item_material", scene);
        fiMaterial.diffuseColor = Color3.Gray();
        fiMaterial.alpha = 0.3;
        fiMaterial.emissiveColor = Color3.White();
        this.fieldItemMaterial = fiMaterial;

        ViveController.MODEL_BASE_URL = "models/vive";
        var camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);



        // const vrHelper = scene.createDefaultVRExperience({
        //     controllerMeshes: true,
        // });
        // vrHelper.webVRCamera.onControllersAttachedObservable.add((controllers, es2) => {
        //     this.controllers = controllers;
        //     for (const controller of controllers) {
        //         controller.onTriggerStateChangedObservable.add((d, s) => {
        //             if (d.value === 1) {
        //                 const pickedMesh = this.getVRMesh(controller);
        //                 if (pickedMesh) {
        //                     pickedMesh.actionManager.processTrigger(ActionManager.OnPickTrigger);
        //                 }
        //             }
        //         });
        //     }
        // });
        // vrHelper.deviceOrientationCamera.position = Vector3.Zero();
        // vrHelper.webVRCamera.position = Vector3.Zero();
        // vrHelper.vrDeviceOrientationCamera.position = Vector3.Zero();

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

        scene.registerBeforeRender(() => {
            this.renderControllersRays();
            light2.position = scene.activeCamera.position;
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
        await this.goToImage(this.viewScene.firstStateId);
    }


    private getVRMesh(controller: WebVRController) {
        const ray = controller.getForwardRay(30);
        const pick = this.scene.pickWithRay(ray, (m) => this.links.isLinkMesh(m));
        return pick.pickedMesh;
    }
    private renderControllersRays() {
        if (!this.controllers) {
            return;
        }
        if (!this.controllersRays) {
            this.controllersRays = [];
        }
        const radius = 0.005;
        let needHit = true;
        for (let index = 0; index < this.controllers.length; index++) {
            const controller = this.controllers[index];
            const ray = controller.getForwardRay(30);
            if (needHit) {
                const pick = this.scene.pickWithRay(ray, (m) => this.links.isLinkMesh(m));
                if (pick.hit) {
                    pick.pickedMesh.actionManager.processTrigger(ActionManager.OnPointerOverTrigger); // TODO Extract controller to another class
                }
            }
            if (!this.controllersRays[index]) {
                this.controllersRays[index] = MeshBuilder.CreateTube("controller ray", {
                    path: [
                        ray.origin,
                        ray.origin.add(ray.direction.scale(ray.length))
                    ],
                    radius,
                    sideOrientation: BABYLON.Mesh.FRONTSIDE,
                    updatable: true
                }, this.scene);
            } else {
                this.controllersRays[index] = MeshBuilder.CreateTube("controller ray", {
                    path: [
                        ray.origin,
                        ray.origin.add(ray.direction.scale(ray.length))
                    ],
                    sideOrientation: BABYLON.Mesh.FRONTSIDE,
                    radius,
                    instance: this.controllersRays[index]
                });
            }
        }
    }

    private createNavigatorButton() {
        console.warn("don't render menu");
        return;
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("Menu UI");
        const button = GUI.Button.CreateSimpleButton("but", "Menu");
        button.width = 0.09;
        button.height = "40px";
        button.color = "black";
        button.background = "white";
        button.top = "-45%";
        button.left = "-45%";
        button.onPointerClickObservable.add(() => {
            if (this.sceneNavigator) {
                return;
            } else {
                this.sceneNavigator = new SceneNavigator(
                    this.scene,
                    this.viewScene,
                    (id) => {
                        this.goToImage(id);
                        this.sceneNavigator = null;
                    });
            }

        });
        advancedTexture.addControl(button);
        console.warn("reuse advanced texture");
    }


    private async goToImage(id: string) {
        const targetPicture = this.viewScene.states.find((p) => p.id === id);
        this.cleanLinks();
        await this.drawImage(this.configuration.sceneUrl + targetPicture.url, targetPicture.pictureRotation);
        document.title = targetPicture.title;
        const distanceToLinks = 10;
        for (const link of targetPicture.links) {
            const name = this.getName(link.id);
            const position = MathStuff.GetPositionForMarker(link.rotation, distanceToLinks);
            const material = this.linkSphereMaterials[link.colorScheme];

            const linkToState = this.links.getLink(name, position, material, () => this.goToImage(link.id));
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
                position, material,
                async (selectedId) => {
                    this.goToImage(selectedId)
                });
        }

        for (const fieldItem of targetPicture.fieldItems) {
            const fieldItemInfo = {
                vertex: fieldItem.vertices.map(q => MathStuff.GetPositionForMarker(q, distanceToLinks)),
                imageUrl: this.configuration.sceneUrl + fieldItem.imageUrl
            }
            const material = this.fieldItemMaterial

            const linkToState = this.links.getFieldItem(
                fieldItem.title,
                fieldItemInfo,
                material);
        }
    }


    private async drawImage(url: string, pictureRotation: any) {
        
        if (this.currentImage === null) {
            this.currentImage = new PhotoDome("background", null, { resolution: 32, size: 1000 }, this.scene);
        } else {
        }
        const task = this.assetsManager.addTextureTask("image task", url, null, false);
        task.onSuccess = (t) => {
            this.currentImage.photoTexture.dispose();
            this.currentImage.photoTexture = t.texture;
            this.currentImage.rotationQuaternion = pictureRotation;
        };
        this.assetsManager.load(); // Hack for start loading
        await this.assetsManager.loadAsync();
    }

    private cleanLinks() {
        this.links.clean();
    }

    private getName(id: string): string {
        return this.viewScene.states.find((p) => p.id === id).title;
    }
}

