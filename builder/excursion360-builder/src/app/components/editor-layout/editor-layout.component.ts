import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Engine, Scene, MeshBuilder } from "babylonjs"
import { SceneComponent } from '../editor/scene/scene.component';
import { EngineService } from '../../services/editor/engine.service';

@Component({
  selector: 'app-editor-layout',
  templateUrl: './editor-layout.component.html',
  styleUrls: ['./editor-layout.component.scss'],
  providers: [ EngineService ]
})
export class EditorLayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('scene') sceneElement: SceneComponent;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }
}
