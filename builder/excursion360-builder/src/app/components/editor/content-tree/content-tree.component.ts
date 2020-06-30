import { Component, OnInit, OnDestroy } from '@angular/core';
import { SceneStateService } from 'src/app/services/editor/scene-state.service';
import { Vector3 } from 'babylonjs';
import { Subscription } from 'rxjs';
import { ExcursionScene } from 'src/app/models/excursionScene';

@Component({
  selector: 'app-content-tree',
  templateUrl: './content-tree.component.html',
  styleUrls: ['./content-tree.component.scss']
})
export class ContentTreeComponent implements OnInit, OnDestroy {
  selectedSceneRef: Subscription;
  constructor(public sceneState: SceneStateService) { }
  

  ngOnInit(): void {
  }
  public createScene() {
    this.sceneState.createExcursionScene("New scene", Vector3.Zero());
  }
  public createDevScenes() {
    this.sceneState.createExcursionScene(
      "Right scene",
      Vector3.Right());

    this.sceneState.createExcursionScene(
      "Forward scene",
      Vector3.Forward());

    this.sceneState.createExcursionScene(
      "Up scene",
      Vector3.Up());
  }
  ngOnDestroy(): void {
    this.selectedSceneRef.unsubscribe();
  }
}
