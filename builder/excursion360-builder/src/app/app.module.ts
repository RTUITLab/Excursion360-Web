import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorLayoutComponent } from './components/editor-layout/editor-layout.component';
import { SceneComponent } from './components/editor/scene/scene.component';
import { ToolbarComponent } from './components/editor/toolbar/toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorLayoutComponent,
    SceneComponent,
    ToolbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
