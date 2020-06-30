import { Behavior, Mesh } from 'babylonjs';
import { ExcursionScene } from './excursionScene';

export class FillModelBehavior implements Behavior<Mesh> {
    public get name(): string {
        return "FillModelBehavior";
    }

    constructor(private scene: ExcursionScene) {
    }

    init(): void {
        console.log("init");

    }
    attach(target: Mesh): void {
        console.log("attach");
        target.getScene().registerAfterRender(() => {
            this.scene.position.copyFrom(target.getAbsolutePosition());
        });
    }
    detach(): void {
        console.log("detach");
    }

}