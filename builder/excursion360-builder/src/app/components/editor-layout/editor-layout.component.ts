import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Engine, Scene, MeshBuilder } from "babylonjs"
import { SceneComponent } from '../editor/scene/scene.component';

@Component({
  selector: 'app-editor-layout',
  templateUrl: './editor-layout.component.html',
  styleUrls: ['./editor-layout.component.scss']
})
export class EditorLayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('scene') sceneElement: SceneComponent;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const engine = new Engine(this.sceneElement.canvas.nativeElement);
    const scene = new Scene(engine);
    const box = MeshBuilder.CreateBox("box", {});
    scene.createDefaultCameraOrLight(true, true, true);
    scene.createDefaultEnvironment();
    engine.runRenderLoop(() => {
      scene.render();
    });
  }

}
