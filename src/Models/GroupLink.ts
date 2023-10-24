import { LinkToState } from "./LinkToState";
import { CustomHolographicButton } from "../Stuff/CustomHolographicButton"
import { AbstractMesh, Material, MeshBuilder, Scene, TransformNode, Vector3, Animation } from "@babylonjs/core/index";
import { AdvancedDynamicTexture, GUI3DManager, TextBlock, Rectangle, TextWrapping } from "@babylonjs/gui/index";
import { GroupConnectionViewMode } from "./ExcursionModels/GroupLink";

export class GroupLink extends LinkToState {
    private isOpened = false;
    private buttonsPoint: TransformNode;

    private buttons: CustomHolographicButton[] = [];
    private infoCards: { mesh: AbstractMesh, texture: AdvancedDynamicTexture }[] = [];
    itemsCount = 1;
    constructor(
        public name: string,
        private viewMode: GroupConnectionViewMode,
        states: { title: string, id: string }[],
        infos: string[],
        position: Vector3,
        minimizing: { scale: number },
        material: Material,
        private clickSphere: (gl: GroupLink) => Promise<void>,
        goToSceneTriggered: (id: string) => Promise<void>,
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
            scene,
            viewMode == GroupConnectionViewMode.AlwaysShowOnlyButtons
                ? (() => null)
                : null,
            minimizing);
        this.buttonsPoint = new TransformNode("buttons point", scene);
        this.buttonsPoint.parent = this.center;
        this.buttonsPoint.lookAt(this.center.position.scale(1.1));
        for (const state of states) {
            this.createButton(state.title, () => goToSceneTriggered(state.id));
        }
        for (const info of infos) {
            this.createTextCard(info);
        }
        if (viewMode == GroupConnectionViewMode.AlwaysShowOnlyButtons) {
            this.openLinks();
        }
    }


    private createButton(title: string, triggered: () => Promise<void>): void {

        const button = new CustomHolographicButton(`navigation-button`, 4);
        this.buttons.push(button);
        this.manager.addControl(button);
        button.linkToTransformNode(this.buttonsPoint);
        button.position.y -= this.itemsCount * 1.1;
        this.itemsCount++;
        var text1 = new TextBlock();
        text1.text = title;
        text1.textWrapping = TextWrapping.WordWrap;
        text1.resizeToFit = true;
        text1.color = "white";
        text1.fontSize = 140;
        button.content = text1;

        button.isVisible = false;
        button.onPointerClickObservable.add(() => triggered());
    }

    createTextCard(info: string) {
        const plane = MeshBuilder.CreatePlane(`group link info card`, { width: 4, height: 1 }, this.scene);
        const pixelsToOne = 512 / 2;

        const texture = AdvancedDynamicTexture.CreateForMesh(plane, 4 * pixelsToOne, 1 * pixelsToOne);
        this.infoCards.push({ mesh: plane, texture: texture });
        plane.parent = this.buttonsPoint;
        plane.position.y -= this.itemsCount * 1.1;
        this.itemsCount++;
        var text1 = new TextBlock();
        text1.text = info;
        text1.textWrapping = TextWrapping.WordWrap;
        text1.resizeToFit = true;
        text1.color = "white";
        text1.fontSize = 45;

        const background = new Rectangle("link text rectangle");
        background.background = "silver";
        background.alpha = 0.7;
        background.addControl(text1);
        texture.addControl(background);
        texture.scale(1);
        plane.isVisible = false;

    }

    private async triggerAction() {
        this.clickSphere(this);
        this.setLinksOpened(!this.isOpened);
    }

    public openLinks() {
        this.setLinksOpened(true);
        this.openGuiMesh();
    }

    public closeLinks() {
        if (this.viewMode == GroupConnectionViewMode.AlwaysShowOnlyButtons) {
            return;
        }
        this.setLinksOpened(false);
        this.hideGuiMesh();
    }

    private setLinksOpened(isOpened: boolean) {
        this.isOpened = isOpened;
        this.buttons.forEach(b => b.isVisible = this.isOpened);
        this.infoCards.forEach(b => b.mesh.isVisible = this.isOpened);
    }

    public dispose() {
        this.infoCards.forEach(c => {
            c.texture.dispose();
            c.mesh.dispose();
        });
        super.dispose();
    }

    protected hideGuiMesh() {
        if (!this.isOpened) {
            super.hideGuiMesh();
        }
    }
}