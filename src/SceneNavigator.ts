import { Scene, Vector3 } from "babylonjs";
import { Excursion } from "./Models/ExcursionModels/Excursion";
import { GUI3DManager, HolographicButton, CylinderPanel } from "babylonjs-gui";

/**
 * All excusrion all menu
 */
export class SceneNavigator {
    private manager: GUI3DManager;
    private panel: CylinderPanel;

    constructor(
        private scene: Scene,
        private viewScene: Excursion,
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

    public dispose(): void {
        this.manager.dispose();
    }

    private construct() {
        for (const picture of this.viewScene.states) {
            this.addButton(picture.title, picture.id);
        }
    }

    private addButton(name: string, id: string) {
        const button = new HolographicButton(`navigation-button-${id}`);
        button.text = name;
        this.panel.addControl(button);
        button.onPointerClickObservable.add(() => {
            this.dispose();
            this.goToPicture(id);
        });
    }
}
