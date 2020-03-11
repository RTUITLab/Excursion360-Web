import { TableOfContentRow } from "./ExcursionModels/TableOfContentRow";
import { AdvancedDynamicTexture, Button, GUI3DManager } from "babylonjs-gui";
import { Scene, BabylonFileLoaderConfiguration, Color3, Vector3, MeshBuilder } from "babylonjs";
import { TreePanel } from "./TreePanel";
import { CustomHolographicButton } from "../Stuff/CustomHolographicButton";

export class TableOfContentViewer {

    private show = false;
    private rows: { title: string, states: { title: string, id: string }[] }[];
    private goStateCallback: (stateId: string) => Promise<void>;

    private panel: TreePanel;

    private buttons: { button: CustomHolographicButton, inUse: boolean }[] = [];
    constructor(
        private guiManager: GUI3DManager,
        private scene: Scene) {
    }

    public init(
        rows: { title: string, states: { title: string, id: string }[] }[],
        goStateCallback: (stateId: string) => Promise<void>
    ) {
        this.rows = rows;
        this.goStateCallback = goStateCallback;
        this.panel = new TreePanel();
        this.panel.isVisible = this.show;
        this.panel.margin = 0.04;
        this.panel.columns = 2;
        this.guiManager.addControl(this.panel);
        this.renderRoot();
    }



    private renderRoot() {
        const closeButton = this.getButton(false);
        closeButton.button.text = "Закрыть";
        closeButton.button.backMaterial.albedoColor = Color3.Black();
        // button.button.shareMaterials;
        closeButton.button.onPointerClickObservable.add(event => {
            this.toggleView();
        });
        closeButton.button.isVisible = true;
        for (const row of this.rows) {
            var button = this.getButton();
            button.button.text = row.title;
            button.button.onPointerClickObservable.add(event => {
                this.cleanButtons();
                this.renderSection(row.states);
            });
            button.button.isVisible = true;
        }
        this.updateVisible();
    }


    private renderSection(states: { title: string, id: string }[]) {
        const backButton = this.getButton(false);
        console.log(backButton.button.backMaterial.albedoColor);
        console.log(backButton.button.backMaterial.hoverColor);
        backButton.button.backMaterial.albedoColor = new Color3(102 / 255, 89/ 255, 77 / 255);
        backButton.button.backMaterial.hoverColor = new Color3(102 / 255, 89/ 255, 77 / 255).toColor4();
        backButton.button.backMaterial.hoverRadius /= 5;
        backButton.button.text = "Назад";
        backButton.button.onPointerClickObservable.add(event => {
            this.cleanButtons();
            this.renderRoot();
        });
        backButton.button.isVisible = true;
        for (const state of states) {
            var button = this.getButton();
            button.button.text = state.title;
            button.button.onPointerClickObservable.add(event => {
                this.toggleView();
                this.goStateCallback(state.id);
            });
            button.button.isVisible = true;
        }
        this.updateVisible();
    }

    private cleanButtons() {
        for (const button of this.buttons) {
            button.inUse = false;
            button.button.isVisible = false;
            button.button.onPointerClickObservable.clear();
            this.panel.removeControl(button.button);
        }
    }

    private getButton(shareMaterials: boolean = true): { button: CustomHolographicButton, inUse: boolean } {
        var targetButton = this.buttons.find(b => !b.inUse && b.button.shareMaterials == shareMaterials);
        if (targetButton) {
            targetButton.inUse = true;
        } else {
            targetButton = this.addButton(shareMaterials);
        }
        this.panel.addControl(targetButton.button);
        return targetButton;
    }


    private addButton(shareMaterials: boolean = true): { button: CustomHolographicButton, inUse: boolean } {
        const button = new CustomHolographicButton(`navigation-button-${this.buttons.length}`, 2, 0.5, shareMaterials);

        button.text = name;
        button.isVisible = false;
        var buttonRecord = {
            button,
            inUse: true
        };
        this.buttons.push(buttonRecord);
        return buttonRecord;
    }

    public toggleView() {
        if (this.show) {
            console.log("hide");
        } else {
            console.log("show");
            const ray = this.scene.activeCamera.getForwardRay();
            ray.direction
            // this.panel.node.rotation = ray.direction;
            // this.panel.node.rotation.y = ray.direction.y;
            // MeshBuilder.CreateLines("debug line", {
            //     points: [
            //         new Vector3(0, 0, 0),
            //         ray.direction.scale(10)]
            // }, this.scene);
            const viewPoint = ray.direction.scale(2);
            const backPoint = viewPoint.scale(-1);
            var axis1 = (viewPoint).subtract(backPoint);
            var axis3 = Vector3.Cross(viewPoint, axis1);
            var axis2 = Vector3.Cross(axis3, axis1);
            this.panel.node.rotation = Vector3.RotationFromAxis(axis2, axis3, axis1);
            this.panel.node.rotation.x = 0;
            this.panel.node.rotation.z = 0;

            this.scene.activeCamera
            console.log(ray.direction.y);
        }

        this.show = !this.show;
        this.updateVisible();
    }

    updateVisible() {
        for (const button of this.buttons) {
            button.button.isVisible = this.show;
        }
    }
}