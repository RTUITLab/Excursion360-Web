import { Injectable } from '@angular/core';
import { Engine, Scene } from 'babylonjs';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  engine?: Engine;

  constructor() { }

  public initEngine(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas);
    window.onresize = (a) => {
      this.engine.resize();
    }
  }
  
  public registerScene(scene: Scene) { // run engine in initEngine
    this.engine.runRenderLoop(() => { scene.render(); });
  }
}
