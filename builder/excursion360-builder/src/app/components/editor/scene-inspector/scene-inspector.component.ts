import { Component, OnInit } from '@angular/core';
import { SceneStateService } from 'src/app/services/editor/scene-state.service';
import { ExcursionScene } from 'src/app/models/excursionScene';

@Component({
  selector: 'app-scene-inspector',
  templateUrl: './scene-inspector.component.html',
  styleUrls: ['./scene-inspector.component.scss']
})
export class SceneInspectorComponent implements OnInit {

  constructor(private sceneState: SceneStateService) { }

  public selectedScene: ExcursionScene;

  ngOnInit(): void {
    this.sceneState.selectedScenes$.subscribe(scenes => {
      if (scenes.length != 1) {
        this.selectedScene = null;
      } else {
        this.selectedScene = scenes[0];
      }
    });
  }

}
