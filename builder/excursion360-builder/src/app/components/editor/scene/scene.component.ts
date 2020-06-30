import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { EngineService } from 'src/app/services/editor/engine.service';
import { Scene, MeshBuilder } from 'babylonjs';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, AfterViewInit {
  @ViewChild('scene_canvas') 
  public canvas: ElementRef<HTMLCanvasElement>;
  constructor(private engineService: EngineService) { }
  ngAfterViewInit(): void {
    this.engineService.initEngine(this.canvas.nativeElement);
    const scene = new Scene(this.engineService.engine);
    const box = MeshBuilder.CreateBox("box", {});
    scene.createDefaultCameraOrLight(true, true, true);
    scene.createDefaultEnvironment();
    this.engineService.registerScene(scene);
  }

  ngOnInit(): void {
  }

}
