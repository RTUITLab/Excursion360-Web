import { Engine, Scene, ArcRotateCamera, HemisphericLight, Quaternion, SwitchBooleanAction, Action } from "babylonjs";
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

    private linkSpheres: AbstractMesh[] = [];
    private linkTexts: AbstractMesh[] = [];

    private links: LinkToStatePool;

    private baseLinkSphereMaterial?: StandardMaterial;
    private linkSphereMaterials: StandardMaterial[] = [];

    private assetsManager: AssetsManager;

    private controllers: WebVRController[];
    private controllersRays: Mesh[];



    private snubCuboctahedron = {
        name: "Snub Cuboctahedron",
        category: ["Archimedean Solid"],
        // tslint:disable-next-line: max-line-length
        vertex: [[0, 0, 1.077364], [0.7442063, 0, 0.7790187], [0.3123013, 0.6755079, 0.7790187], [-0.482096, 0.5669449, 0.7790187], [-0.7169181, -0.1996786, 0.7790187], [-0.1196038, -0.7345325, 0.7790187], [0.6246025, -0.7345325, 0.4806734], [1.056508, -0.1996786, 0.06806912], [0.8867128, 0.5669449, 0.2302762], [0.2621103, 1.042774, 0.06806912], [-0.532287, 0.9342111, 0.06806912], [-1.006317, 0.3082417, 0.2302762], [-0.7020817, -0.784071, 0.2302762], [0.02728827, -1.074865, 0.06806912], [0.6667271, -0.784071, -0.3184664], [0.8216855, -0.09111555, -0.6908285], [0.6518908, 0.6755079, -0.5286215], [-0.1196038, 0.8751866, -0.6168117], [-0.8092336, 0.4758293, -0.5286215], [-0.9914803, -0.2761507, -0.3184664], [-0.4467414, -0.825648, -0.5286215], [0.1926974, -0.5348539, -0.915157], [0.1846311, 0.2587032, -1.029416], [-0.5049987, -0.1406541, -0.9412258]],
        // tslint:disable-next-line: max-line-length
        face: [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5], [1, 6, 7], [1, 7, 8], [1, 8, 2], [2, 8, 9], [3, 10, 11], [3, 11, 4], [4, 12, 5], [5, 12, 13], [5, 13, 6], [6, 13, 14], [6, 14, 7], [7, 14, 15], [8, 16, 9], [9, 16, 17], [9, 17, 10], [10, 17, 18], [10, 18, 11], [11, 18, 19], [12, 19, 20], [12, 20, 13], [14, 21, 15], [15, 21, 22], [15, 22, 16], [16, 22, 17], [18, 23, 19], [19, 23, 20], [20, 23, 21], [21, 23, 22], [0, 5, 6, 1], [2, 9, 10, 3], [4, 11, 19, 12], [7, 15, 16, 8], [13, 20, 21, 14], [17, 22, 23, 18]]
    };

    constructor(private configuration: Configuration) { }

    public createScene() {
        const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        this.links = new LinkToStatePool(scene);
        ViveController.MODEL_BASE_URL = this.configuration.viveControllerModelBaseUrl;
        const vrHelper = scene.createDefaultVRExperience({
            controllerMeshes: true,
        });
        vrHelper.webVRCamera.onControllersAttachedObservable.add((controllers, es2) => {
            this.controllers = controllers;
            for (const controller of controllers) {
                controller.onTriggerStateChangedObservable.add((d, s) => {
                    if (d.value === 1) {
                        const pickedMesh = this.getVRMesh(controller);
                        if (pickedMesh) {
                            pickedMesh.actionManager.processTrigger(ActionManager.OnPickTrigger);
                        }
                    }
                });
            }
        });
        DefaultLoadingScreen.DefaultLogoUrl = this.configuration.logoURL;
        this.assetsManager = new AssetsManager(scene);
        engine.loadingUIBackgroundColor = "transparent";

        scene.actionManager = new ActionManager(scene);

        if (BuildConfiguration.NeedDebugLayer) {
            console.log("deeb debug");
            scene.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnKeyUpTrigger,
                        parameter: 'r'
                    },
                    function () { console.log('r button was pressed'); }
                )
            );
            scene.actionManager.registerAction(
                new SwitchBooleanAction({
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: "r"
                }, scene.debugLayer, "isVisible"));
        }
        const camera: Camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 1, Vector3.Zero(), scene);
        const light2 = new PointLight("light2", new Vector3(0, 0, 0), scene);
        light2.intensity = 1;
        camera.attachControl(canvas, true);
        // camera.inputs.attached.mousewheel.detachControl(canvas);



        engine.runRenderLoop(() => {
            scene.render();
        });
        window.addEventListener("resize", () => {
            engine.resize();
        });
        this.scene = scene;

        scene.registerBeforeRender(() => {
            this.renderControllersRays();
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
        const pick = this.scene.pickWithRay(ray, (m) => this.linkSpheres.some((m2) => m2 === m));
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
                const pick = this.scene.pickWithRay(ray, (m) => this.linkSpheres.some((m2) => m2 === m));
                if (pick.hit) {
                    console.log(pick.pickedMesh.name);
                    needHit = false;
                }
                this.pickLinkFromInfo(pick);
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

    private pickLinkFromInfo(pickInfo: PickingInfo) {
        if (pickInfo.hit) {
            console.log(pickInfo.pickedMesh.name);
            this.linkTexts[this.linkSpheres.indexOf(pickInfo.pickedMesh)].isVisible = true;
        } else {
            this.linkTexts.filter((lt) => lt.isVisible).forEach((m) => m.isVisible = false);
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
        await this.drawImage(this.configuration.sceneURL + targetPicture.url, targetPicture.pictureRotation);
        document.title = targetPicture.title;
        for (const link of targetPicture.links) {
            const name = this.getName(link.id);
            const position = MathStuff.GetPositionForMarker(link.rotation, 20);
            const material = this.linkSphereMaterials[link.colorScheme];

            const linkToState = this.links.getLink(name, position, material, () => this.goToImage(link.id));
        }
    }


    private async drawImage(url: string, pictureRotation: any) {

        if (this.currentImage === null) {
            this.currentImage = new PhotoDome("background", null, { resolution: 32, size: 1000 }, this.scene);
        }
        const task = this.assetsManager.addTextureTask("image task", url, null, false);
        task.onSuccess = (t) => {
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

