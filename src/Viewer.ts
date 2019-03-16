import { Engine, Scene, ArcRotateCamera, HemisphericLight, AbstractMesh, PhotoDome, BoxParticleEmitter, Mesh, ExecuteCodeAction, ActionManager, StandardMaterial } from "babylonjs";

import axios from 'axios';
import { ViewScene } from "./Models/ViewScene";
import * as GUI from 'babylonjs-gui'


export class Viewer {

    private currentImage: PhotoDome = null;
    private scene: Scene;
    private boxMaterial: StandardMaterial;
    private currentLinks: AbstractMesh[] = [];
    private viewScene: ViewScene;

    public createScene() {
        const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;
        const engine = new BABYLON.Engine(canvas, true);
        const scene = new Scene(engine);
        const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 1, BABYLON.Vector3.Zero(), scene);
        const light1 = new HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
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
    }

    public async load(sceneUrl: string) {
        const response = await axios.get<ViewScene>(sceneUrl);
        if (response.status != 200) {
            console.warn("Can't get scene description");
            return;
        }
        this.viewScene = response.data;
        this.goToImage(this.viewScene.mainId);
    }

    
    private goToImage(id: string) {

        const targetPicture = this.viewScene.pictures.find(p => p.id === id);
        this.drawImage(targetPicture.image);
        this.cleanLinks();

        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        for (let link of targetPicture.links) {
            var box = BABYLON.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.scene);
            this.currentLinks.push(box);
            box.material = this.boxMaterial;
            box.actionManager = new BABYLON.ActionManager(this.scene);
            box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, e => {
                this.goToImage(link.id);
            }));
            this.reposition(box, link.f, link.o);           

            var rect1 = new BABYLON.GUI.Rectangle();
            rect1.width = 0.2;
            rect1.height = "40px";
            rect1.cornerRadius = 20;
            rect1.color = "Orange";
            rect1.thickness = 4;
            rect1.background = "green";
            advancedTexture.addControl(rect1);

            var label = new BABYLON.GUI.TextBlock();
            label.text = "test";
            rect1.addControl(label);

            rect1.linkWithMesh(box);   
            rect1.linkOffsetY = -50;
            
        }
    }

    private reposition(mesh: AbstractMesh, f: number, o: number) {
        const angl1 = (f - 90) * Math.PI / 180;
        const angl2 = o * Math.PI / 180;
        const RR = Math.cos(angl2);
        mesh.position.y = 5 * Math.sin(angl2);
        mesh.position.x = RR * 5 * Math.cos(angl1);
        mesh.position.z = -RR * 5 * Math.sin(angl1);
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
}

