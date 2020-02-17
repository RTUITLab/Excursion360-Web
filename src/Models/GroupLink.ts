import { LinkToState } from "./LinkToState";
import { Material, Vector3, Scene, Animation, TransformNode, ActionEvent, MeshBuilder } from "babylonjs";
import { GUI3DManager, CylinderPanel, HolographicButton, StackPanel3D, TextBlock, Rectangle, AbstractButton3D } from "babylonjs-gui";
import { CustomHolographicButton } from "../Stuff/CustomHolographicButton"

export class GroupLink extends LinkToState {

    private isOpened = false;
    private buttonsPoint: TransformNode;

    private buttons: AbstractButton3D[] = [];
    buttonsCount = 1;
    constructor(
        public name: string,
        states: { title: string, id: string }[],
        position: Vector3,
        material: Material,
        triggered: (id: string) => Promise<void>,
        animation: Animation,
        private manager: GUI3DManager,
        scene: Scene
    ) {
        super(
            name,
            position,
            material,
            () => this.triggerAction(),
            animation,
            scene);
        this.buttonsPoint = new TransformNode("buttons point", scene);
        this.buttonsPoint.parent = this.center;
        this.buttonsPoint.lookAt(this.center.position.scale(1.1));
        for (const state of states) {
            this.createButton(state.title, () => triggered(state.id));
        }
    }


    private createButton(title: string, triggered: () => Promise<void>): void {

        const button = new CustomHolographicButton(`navigation-button`, 4);
        this.buttons.push(button);
        this.manager.addControl(button);
        button.linkToTransformNode(this.buttonsPoint);
        button.position.y -= this.buttonsCount * 1.1;
        this.buttonsCount++;
        var text1 = new TextBlock();
        text1.text = title;
        text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        text1.resizeToFit = true;
        text1.color = "white";
        text1.fontSize = 90;
        button.content = text1;
        button.contentScaleRatio = 1;
        button.isVisible = false;
        button.onPointerClickObservable.add(d => triggered());
    }

    private async triggerAction() {
        this.isOpened = !this.isOpened;
        this.buttons.forEach(b => b.isVisible = this.isOpened);
    }

    public dispose(){
        super.dispose();
    }

    protected onPointerOutTrigger(event: ActionEvent) {
        if (!this.isOpened) {
            super.onPointerOutTrigger(event);
        }
    }
}