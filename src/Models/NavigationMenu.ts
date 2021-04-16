import { CustomHolographicButton } from "../Stuff/CustomHolographicButton";
import { TransformNode } from "babylonjs";
import { GUI3DManager, TextBlock } from "babylonjs-gui";
import { Vector3 } from "babylonjs";
import { ObjectsStackPanelHelper } from "./ObjectsStackPanelHelper";

export class NavigationMenu {

    private buttons: CustomHolographicButton[] = [];


    constructor(
        private labels: string[],
        private menuWitdh: number,
        private positionY: number,
        private parent: TransformNode,
        private gui3Dmanager: GUI3DManager,
        private buttonSizeGetter: (index: number) => { width: number, height: number },
        private selectionChanged: (index: number) => Promise<void>
    ) {
        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            const { width, height } = buttonSizeGetter(i);
            var button = this.createButton(label, parent, i, width, height);
            this.buttons.push(button);
        }
        ObjectsStackPanelHelper.placeAsHorizontalStack(this.buttons, menuWitdh);
    }
    
    public setCurrentIndex(index: number) {
        if (index < 0) {
            index = this.buttons.length - index;
        }
        index = index % this.buttons.length;
        for (let i = 0; i < this.buttons.length; i++) {
            const button = this.buttons[i];
            button.scaling = i == index ? Vector3.One().scale(1.1) : Vector3.One();
        }
    }

    public setIsVisible(visible: boolean) {
        for (const imageButton of this.buttons) {
            imageButton.isVisible = visible;
        }
    }

    private createButton(
        title: string,
        parent: TransformNode,
        index: number,
        width = 2,
        height = 1): CustomHolographicButton {
        var button = new CustomHolographicButton(`field-item-button-${title}`, width, height);
        this.gui3Dmanager.addControl(button);
        button.linkToTransformNode(parent);
        var buttonContent = new TextBlock();
        buttonContent.text = title;
        buttonContent.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        buttonContent.resizeToFit = true;
        buttonContent.color = "white";
        buttonContent.fontSize = 140;
        button.content = buttonContent;
        button.contentScaleRatio = 1;
        button.isVisible = true;
        button.position.y += this.positionY
        button.onPointerClickObservable.add(ev => {
            this.setCurrentIndex(index);
            this.selectionChanged(index);
        } );
        return button;
    }

    public dispose(): void {
        for (const button of this.buttons) {
            button.dispose();
        }
    }

}