import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.sass']
})
export class SceneComponent implements OnInit, AfterViewInit {
  @ViewChild('scene_canvas') 
  public canvas: ElementRef<HTMLCanvasElement>;
  constructor() { }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

}
