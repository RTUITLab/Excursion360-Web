import { Engine, Scene, ArcRotateCamera, HemisphericLight, AbstractMesh, PhotoDome, BoxParticleEmitter, Mesh, ExecuteCodeAction, ActionManager, StandardMaterial, Plane } from "babylonjs";

import axios from 'axios';
import { Excursion } from "./Models/Excursion";
import * as GUI from "babylonjs-gui";
import { Rectangle } from "babylonjs-gui";
import { SceneNavigator } from "./SceneNavigator";


export class Viewer {

    private currentImage: PhotoDome = null;
    private scene: Scene;
    private boxMaterial: StandardMaterial;
    private currentLinks: AbstractMesh[] = [];
    private viewScene: Excursion;
    private labels: GUI.Rectangle[] = [];
    private sceneNavigator?: SceneNavigator;

    public createScene() {
        const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
        const engine = new BABYLON.Engine(canvas, true);
        const scene = new Scene(engine);
        const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 1, BABYLON.Vector3.Zero(), scene);
        const light1 = new HemisphericLight("light1", new BABYLON.Vector3(0, -1, 0), scene);
        const light2 = new HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light1.intensity = 0.5;
        light2.intensity = 0.5;
        camera.attachControl(canvas, true);
        camera.inputs.attached.mousewheel.detachControl(canvas);

        engine.runRenderLoop(function () {
            scene.render();
        });
        window.addEventListener("resize", function () {
            engine.resize();
        });
        this.scene = scene;

        this.boxMaterial = new BABYLON.StandardMaterial("mat1", scene);
        this.boxMaterial.diffuseColor = new BABYLON.Color3(0.5, 1, 0);
        this.boxMaterial.alpha = 1;
        this.createNavigatorButton();
    }

    public async show(scene: Excursion) {
        this.viewScene = scene;
        this.goToImage(this.viewScene.firstStateId);
    }

    private createNavigatorButton() {
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
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


    private goToImage(id: string) {

        const targetPicture = this.viewScene.states.find(p => p.id === id);
        this.drawImage(targetPicture.url);
        this.cleanLinks();
        this.cleanGUI();
        document.title = targetPicture.title;
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        console.warn("reuse advanced texture");//TODO reuse advanced texture
        for (let link of targetPicture.links) {
            var box = BABYLON.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.scene);
            this.currentLinks.push(box);
            box.material = this.boxMaterial;

            var rect = new GUI.Rectangle();
            advancedTexture.addControl(rect);
            rect.width = 0.15;
            rect.height = "40px";
            rect.cornerRadius = 15;
            rect.color = "black";
            rect.thickness = 1;
            rect.background = "white";
            var label = new GUI.TextBlock();
            this.getName(link.id, label);
            rect.addControl(label);
            rect.linkWithMesh(box);
            rect.linkOffsetY = -100;
            this.labels.push(rect);

            box.actionManager = new BABYLON.ActionManager(this.scene);
            box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, e => {
                this.goToImage(link.id);
            }));
            this.reposition(box, link.o, link.f);
        }
    }

    /**
     * Move mesh to new position
     * @param mesh Mesh to move
     * @param o Azimuthal angle in radians
     * @param f Polar angle in radians
     */
    private reposition(mesh: AbstractMesh, o: number, f: number) {
        o -= Math.PI / 2;
        const RR = Math.cos(f);
        mesh.position.y = 5 * Math.sin(f);
        mesh.position.x = RR * 5 * Math.cos(o);
        mesh.position.z = -RR * 5 * Math.sin(o);
    }

    private drawImage(url: string) {
        if (this.currentImage === null) {
            this.currentImage = new PhotoDome("background", url, { resolution: 32, size: 1000 }, this.scene);
        } else {
            this.currentImage.photoTexture.releaseInternalTexture();
            this.currentImage.photoTexture.url = null;
            this.currentImage.photoTexture.updateURL(url);
        }
    }

    private cleanLinks() {
        for (let link of this.currentLinks) {
            link.dispose();
        }
        this.currentLinks = [];
    }

    private cleanGUI() {
        for (let rect of this.labels) {
            rect.dispose();
        }
        this.labels = [];
    }
    private getName(id: string, label: GUI.TextBlock) {
        const name = this.viewScene.states.find(p => p.id === id);
        label.text = name.title;
    }
}

