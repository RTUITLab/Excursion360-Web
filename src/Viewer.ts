import { Engine, Scene, ArcRotateCamera, HemisphericLight, AbstractMesh, PhotoDome, BoxParticleEmitter, Mesh, ExecuteCodeAction, ActionManager, StandardMaterial, Plane, FreeCamera, Vector3, Camera, UniversalCamera, Color3, MeshBuilder, Material, PointLight, Texture, AssetsManager, DefaultLoadingScreen, ViveController, WebVRController, LinesMesh, RayHelper, PickingInfo } from "babylonjs";

import axios from 'axios';
import { Excursion } from "./Models/Excursion";
import * as GUI from "babylonjs-gui";
import { Rectangle, GUI3DManager, HolographicButton, SpherePanel, TextBlock, AdvancedDynamicTexture } from "babylonjs-gui";
import { SceneNavigator } from "./SceneNavigator";
import { timingSafeEqual } from "crypto";
import { StateChangeLoadingScreen } from "./StateChangeLoadingScreen";
import { Configuration } from "./Configuration";


export class Viewer {

    private currentImage: PhotoDome = null;
    private scene: Scene;
    private viewScene: Excursion;
    private sceneNavigator?: SceneNavigator;
    private linkSpheres: Array<AbstractMesh> = [];
    private linkTexts: Array<AbstractMesh> = [];
    private linkSphereMaterial?: Material;
    private assetsManager: AssetsManager;

    private controllers: Array<WebVRController>;
    private controllersRays: Array<Mesh>;

    private SnubCuboctahedron = {
        name: "Snub Cuboctahedron",
        category: ["Archimedean Solid"],
        vertex: [[0, 0, 1.077364], [0.7442063, 0, 0.7790187], [0.3123013, 0.6755079, 0.7790187], [-0.482096, 0.5669449, 0.7790187], [-0.7169181, -0.1996786, 0.7790187], [-0.1196038, -0.7345325, 0.7790187], [0.6246025, -0.7345325, 0.4806734], [1.056508, -0.1996786, 0.06806912], [0.8867128, 0.5669449, 0.2302762], [0.2621103, 1.042774, 0.06806912], [-0.532287, 0.9342111, 0.06806912], [-1.006317, 0.3082417, 0.2302762], [-0.7020817, -0.784071, 0.2302762], [0.02728827, -1.074865, 0.06806912], [0.6667271, -0.784071, -0.3184664], [0.8216855, -0.09111555, -0.6908285], [0.6518908, 0.6755079, -0.5286215], [-0.1196038, 0.8751866, -0.6168117], [-0.8092336, 0.4758293, -0.5286215], [-0.9914803, -0.2761507, -0.3184664], [-0.4467414, -0.825648, -0.5286215], [0.1926974, -0.5348539, -0.915157], [0.1846311, 0.2587032, -1.029416], [-0.5049987, -0.1406541, -0.9412258]],
        face: [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5], [1, 6, 7], [1, 7, 8], [1, 8, 2], [2, 8, 9], [3, 10, 11], [3, 11, 4], [4, 12, 5], [5, 12, 13], [5, 13, 6], [6, 13, 14], [6, 14, 7], [7, 14, 15], [8, 16, 9], [9, 16, 17], [9, 17, 10], [10, 17, 18], [10, 18, 11], [11, 18, 19], [12, 19, 20], [12, 20, 13], [14, 21, 15], [15, 21, 22], [15, 22, 16], [16, 22, 17], [18, 23, 19], [19, 23, 20], [20, 23, 21], [21, 23, 22], [0, 5, 6, 1], [2, 9, 10, 3], [4, 11, 19, 12], [7, 15, 16, 8], [13, 20, 21, 14], [17, 22, 23, 18]]
    }

    public createScene() {
        const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        ViveController.MODEL_BASE_URL = Configuration.ViveControllerModelBaseUrl;
        scene.registerAfterRender(() => this.pickLink());
        var vrHelper = scene.createDefaultVRExperience({
            controllerMeshes: true,
        });
        ViveController.MODEL_BASE_URL = Configuration.ViveControllerModelBaseUrl;
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
        vrHelper.onAfterEnteringVRObservable.add((d, s) => {
            setTimeout(() => {
                vrHelper.webVRCamera.leftCamera.attachControl(canvas, true);
                
            }, 1000);
            console.log("HQQWQ")
        })
        DefaultLoadingScreen.DefaultLogoUrl = Configuration.LogoURL;
        this.assetsManager = new AssetsManager(scene);
        engine.loadingUIBackgroundColor = "transparent";
        //scene.debugLayer.show();
        const camera: Camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 1, Vector3.Zero(), scene);
        const light1 = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
        var light2 = new PointLight("light2", new Vector3(0, 0, 0), scene);
        light2.intensity = 0.5;
        light1.intensity = 0.5;
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
        this.linkSphereMaterial = material;

        this.createNavigatorButton();
        setInterval(() => {
            for (const linkMesh of this.linkSpheres) {
                linkMesh.rotate(Vector3.Up(), Math.PI / 180);
            }
        }, 10);
    }
    getVRMesh(controller: WebVRController) {
        const ray = controller.getForwardRay(30);
        const pick = this.scene.pickWithRay(ray, m => this.linkSpheres.some(m2 => m2 == m));
        return pick.pickedMesh;
    }
    renderControllersRays() {
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
                const pick = this.scene.pickWithRay(ray, m => this.linkSpheres.some(m2 => m2 == m));
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
                    radius: radius,
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
                    radius: radius,
                    instance: this.controllersRays[index]
                });
            }
        }
    }
    private pickLink(): void {
        const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY,
            m => this.linkSpheres.some(m2 => m2 == m));
        this.pickLinkFromInfo(pick);
    }

    private pickLinkFromInfo(pickInfo: PickingInfo) {
        if (pickInfo.hit) {
            console.log(pickInfo.pickedMesh.name);
            this.linkTexts[this.linkSpheres.indexOf(pickInfo.pickedMesh)].isVisible = true;
        } else {
            this.linkTexts.filter(lt => lt.isVisible).forEach(m => m.isVisible = false);
        }
    }

    public async show(scene: Excursion) {
        this.viewScene = scene;
        await this.goToImage(this.viewScene.firstStateId);
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
        const targetPicture = this.viewScene.states.find(p => p.id === id);
        this.cleanLinks();
        await this.drawImage(targetPicture.url, targetPicture.pictureRotation);
        document.title = targetPicture.title;
        for (let link of targetPicture.links) {
            const name = this.getName(link.id);
            // TODO: dont recreate object, clone it
            console.warn("recreating link mesh");
            const polygon = MeshBuilder.CreatePolyhedron(name, { custom: this.SnubCuboctahedron, size: 0.5 }, this.scene);

            const guiPlane = MeshBuilder.CreatePlane(name, { size: 20 }, this.scene);
            // guiPlane.parent = polygon;
            const texture = AdvancedDynamicTexture.CreateForMesh(guiPlane);

            const textBlock = new GUI.TextBlock();
            // textBlock.height = "150px";
            textBlock.fontSize = 30;
            textBlock.color = "white";
            textBlock.text = name;
            textBlock.shadowOffsetX = 1;
            textBlock.shadowOffsetY = 1;
            texture.addControl(textBlock);


            polygon.convertToFlatShadedMesh();
            const sphere =
                polygon;
            sphere.material = this.linkSphereMaterial;
            const position = Viewer.GetPositionForMarker(link.rotation, 20);
            sphere.position = position;
            guiPlane.position = position.clone();
            guiPlane.position.y += 1;
            guiPlane.lookAt(guiPlane.position.scale(1.1));
            guiPlane.isVisible = false;
            sphere.actionManager = new ActionManager(this.scene);
            sphere.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, async ev => {
                await this.goToImage(link.id);
            }));
            this.linkSpheres.push(sphere);
            this.linkTexts.push(guiPlane);
        }
    }


    private async drawImage(url: string, pictureRotation: any) {

        if (this.currentImage === null) {
            this.currentImage = new PhotoDome("background", null, { resolution: 32, size: 1000 }, this.scene);
        }
        const task = this.assetsManager.addTextureTask("image task", url, null, false);
        task.onSuccess = t => {
            this.currentImage.photoTexture = t.texture;
            this.currentImage.rotationQuaternion = pictureRotation;
        };
        this.assetsManager.load();// Hack for start loading
        await this.assetsManager.loadAsync();
    }

    private cleanLinks() {
        for (let link of this.linkSpheres) {
            link.dispose();
        }
        for (let link of this.linkTexts) {
            link.dispose();
        }
        this.linkSpheres = [];
        this.linkTexts = [];
    }

    private getName(id: string): string {
        return this.viewScene.states.find(p => p.id === id).title;
    }

    /**
     * Getposition by quaternion rotation
     * Copied from Unity sources
     * @param rotation Rotation quaternion
     * @param multipler Position multipler
     */
    private static GetPositionForMarker(rotation: any, multipler: number): Vector3 {
        const forward = Vector3.Forward().multiplyByFloats(multipler, multipler, multipler);
        const num = rotation.x * 2;
        const num2 = rotation.y * 2;
        const num3 = rotation.z * 2;
        const num4 = rotation.x * num;
        const num5 = rotation.y * num2;
        const num6 = rotation.z * num3;
        const num7 = rotation.x * num2;
        const num8 = rotation.x * num3;
        const num9 = rotation.y * num3;
        const num10 = rotation.w * num;
        const num11 = rotation.w * num2;
        const num12 = rotation.w * num3;
        const result = new Vector3();
        result.x = (1 - (num5 + num6)) * forward.x + (num7 - num12) * forward.y + (num8 + num11) * forward.z;
        result.y = (num7 + num12) * forward.x + (1 - (num4 + num6)) * forward.y + (num9 - num10) * forward.z;
        result.z = (num8 - num11) * forward.x + (num9 + num10) * forward.y + (1 - (num4 + num5)) * forward.z;
        // Hack for incorrect quaternion position
        result.x = -result.x;
        result.z = -result.z;
        return result;
    }
}

