import { Engine, Scene, ArcRotateCamera, HemisphericLight, AbstractMesh, PhotoDome, BoxParticleEmitter, Mesh, ExecuteCodeAction, ActionManager, StandardMaterial, Plane } from "babylonjs";

import axios from 'axios';
import { ViewScene } from "./Models/ViewScene";
import * as GUI from "babylonjs-gui";
import { Rectangle } from "babylonjs-gui";


export class Viewer {

    private currentImage: PhotoDome = null;
    private scene: Scene;
    private boxMaterial: StandardMaterial;
    private currentLinks: AbstractMesh[] = [];
    private viewScene: ViewScene;
    private lables: GUI.Rectangle[] = [];

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
        this.cleanGUI();
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
       
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
            this.getname(link.id,label);
            rect.addControl(label);
            rect.linkWithMesh(box);   
            rect.linkOffsetY = -100;
            this.lables.push(rect);

            box.actionManager = new BABYLON.ActionManager(this.scene);
            box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, e => {
                this.goToImage(link.id);                
            }));
            this.reposition(box, link.f, link.o);           
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

    private cleanGUI() {
        for (let rect of this.lables) {
            rect.dispose();
        }
        this.lables = [];
    }
    private getname(id: string, label: GUI.TextBlock){
        const name = this.viewScene.pictures.find(p => p.id === id);
        label.text = name.title;
    }
}

