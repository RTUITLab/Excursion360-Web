import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, OnChanges, OnDestroy, AfterViewInit, SimpleChanges } from '@angular/core';
import * as React from "react"
import * as ReactDOM from "react-dom"

const reactContainerElementName = "myReactSceneContainer";
@Component({
  selector: 'app-react-scene',
  template: `<span #${reactContainerElementName}></span>`,
  styleUrls: ['./react-scene.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReactSceneComponent implements OnChanges, OnDestroy, AfterViewInit {

  @ViewChild(reactContainerElementName, { static: false }) reactContainerRef: ElementRef;
  constructor() { }
  ngOnDestroy(): void {
    ReactDOM.unmountComponentAtNode(this.reactContainerRef.nativeElement);
  }
  ngAfterViewInit(): void {
    this.render();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  private render() {
    ReactDOM.render(<div>Hello, react</div>, this.reactContainerRef.nativeElement);
  }

}
