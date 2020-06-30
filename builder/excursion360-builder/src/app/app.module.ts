import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SceneComponent } from './components/editor/scene/scene.component';
import { ToolbarComponent } from './components/editor/toolbar/toolbar.component';
import { EditorLayoutComponent } from './components/editor/editor-layout/editor-layout.component';
import { ContentTreeComponent } from './components/editor/content-tree/content-tree.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    ToolbarComponent,
    EditorLayoutComponent,
    ContentTreeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
