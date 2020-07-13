import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, OnChanges, OnDestroy, AfterViewInit, SimpleChanges } from '@angular/core';
import * as React from "react"
import * as ReactDOM from "react-dom"
import App from "./scene"
import { Store, select } from '@ngrx/store';

const reactContainerElementName = "myReactSceneContainer";
@Component({
  selector: 'app-react-scene',
  template: `<div class="sceneContainer" #${reactContainerElementName}></div>`,
  styleUrls: ['./react-scene.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReactSceneComponent implements OnChanges, OnDestroy, AfterViewInit {

  private position: number;
  @ViewChild(reactContainerElementName, { static: false }) reactContainerRef: ElementRef;
  constructor(private store: Store<{ position: number }>) {

  }
  ngOnDestroy(): void {
    ReactDOM.unmountComponentAtNode(this.reactContainerRef.nativeElement);
  }
  ngAfterViewInit(): void {
    this.render();
    this.store.pipe(select("position")).subscribe(position => {
      this.position = position;
      this.render();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  private render() {
    const { position } = this;
    ReactDOM.render(<App position={position}></App>, this.reactContainerRef.nativeElement);
  }

}
