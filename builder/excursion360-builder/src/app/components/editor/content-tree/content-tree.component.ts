import { Component, OnInit, OnDestroy } from '@angular/core';
import { SceneStateService } from 'src/app/services/editor/scene-state.service';
import { Vector3 } from 'babylonjs';
import { Subscription } from 'rxjs';
import { LogsService } from 'src/app/services/logs.service';
import { Logger } from 'src/app/models/logs/logger';

@Component({
  selector: 'app-content-tree',
  templateUrl: './content-tree.component.html',
  styleUrls: ['./content-tree.component.scss']
})
export class ContentTreeComponent implements OnInit, OnDestroy {
  selectedSceneRef: Subscription;
  logger: Logger;

  private id = 0;
  constructor(
    public sceneState: SceneStateService,
    logsService: LogsService) {
      this.logger = logsService.createLogger("ContentTreeComponent");
     }
  

  ngOnInit(): void {
  }

  public addLog() {
    this.logger.logDebug(`LogMessage ${this.id++}`);
  }
  public createScene() {
    this.sceneState.createExcursionScene("New scene", Vector3.Zero());
    this.logger.logDebug("Created scene");
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
