import { Injectable } from '@angular/core';
import { ExcursionScene } from '../../models/excursionScene';
import { Vector3, GizmoManager, Scene, UniversalCamera } from 'babylonjs';
import { EngineService } from './engine.service';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class SceneStateService {

  public scenes: ExcursionScene[] = [];

  private addSceneSource = new Subject<ExcursionScene>();
  public addScene$ = this.addSceneSource.asObservable();

  private selectedSceneSource = new BehaviorSubject<ExcursionScene[]>([]);
  public selectedScenes$ = this.selectedSceneSource.asObservable();
  public get selectedScenes() {
    return this.selectedSceneSource.value;
  }

  constructor() { }


  public createExcursionScene(sceneName: string, position: Vector3) {
    const newScene = new ExcursionScene(
      sceneName,
      position || Vector3.Zero());
    this.scenes.push(newScene);
    this.addSceneSource.next(newScene);
  }

  public selectionChanged(scenes: ExcursionScene[]) {
    if ((this.selectedScenes.length === 0 && scenes.length === 0) ||
      this.selectedScenes === scenes) {
        return;
      }
      this.selectedSceneSource.next(scenes);
  }
}
