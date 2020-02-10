import { LinkToState } from "./LinkToState";
import { Material, Vector3, Scene, Animation } from "babylonjs";
import { GUI3DManager, CylinderPanel, HolographicButton } from "babylonjs-gui";

export class GroupLink extends LinkToState {
    private manager: GUI3DManager;
    private panel: CylinderPanel;

    private isOpened = false;

    constructor(
        public name: string,
        position: Vector3,
        material: Material,
        triggered: () => Promise<void>,
        scene: Scene
    ) {
        super(name, position, material, () => this.triggerAction(), scene);
        const manager = new GUI3DManager(scene);
        const panel = new CylinderPanel();
        panel.margin = 0.2;
        panel.columns = 4;
        manager.addControl(panel);
        this.manager = manager;
        this.panel = panel;
        const button = new HolographicButton(`navigation-button`);
        // button.text = name;
        this.panel.addControl(button);
        var text1 = new BABYLON.GUI.TextBlock();
        text1.text = name;
        text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        text1.resizeToFit = true;
        text1.color = "Red";
        text1.fontSize = 48;
        button.content = text1 as any;
    }

    private async triggerAction() {
        this.isOpened = !this.isOpened;
    }
}