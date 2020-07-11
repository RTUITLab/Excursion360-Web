import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SceneComponent } from './components/editor/scene/scene.component';
import { ToolbarComponent } from './components/editor/toolbar/toolbar.component';
import { EditorLayoutComponent } from './components/editor/editor-layout/editor-layout.component';
import { ContentTreeComponent } from './components/editor/content-tree/content-tree.component';
import { LogsViewerComponent } from './components/logs-viewer/logs-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    ToolbarComponent,
    EditorLayoutComponent,
    ContentTreeComponent,
    LogsViewerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
