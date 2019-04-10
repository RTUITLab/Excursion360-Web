import { Scene, Vector3 } from "babylonjs";
import { ViewScene } from "./Models/ViewScene";
import { GUI3DManager, HolographicButton, CylinderPanel } from "babylonjs-gui";

export class SceneNavigator {
    manager: GUI3DManager;
    panel: CylinderPanel;

    constructor(
        private scene: Scene,
        private viewScene: ViewScene,
        private goToPicture: (id: string) => void) {
        const manager = new GUI3DManager(this.scene);
        const panel = new CylinderPanel();
        panel.margin = 0.2;
        panel.columns = 4;                
        manager.addControl(panel);
        this.manager = manager;
        this.panel = panel;
        this.construct();
    }

    private construct() {
        for (const picture of this.viewScene.pictures) {
            this.addButton(picture.title, picture.id);
        }
    }

    private addButton(name: string, id: string) {
        var button = new HolographicButton(`navigation-button-${id}`);
        button.text = name;
        this.panel.addControl(button);
        button.onPointerClickObservable.add(() => {
            this.dispose();
            this.goToPicture(id);
        });
    }

    public dispose(): void {
        this.manager.dispose();
    }
}
