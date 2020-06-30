import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { EngineService } from 'src/app/services/editor/engine.service';
import { Scene, MeshBuilder, ActionManager, ExecuteCodeAction, UniversalCamera, Vector3, AxesViewer, GizmoManager, AbstractMesh, PointerEventTypes } from 'babylonjs';
import { SceneStateService } from 'src/app/services/editor/scene-state.service';
import { grainPixelShader } from 'babylonjs/Shaders/grain.fragment';
import { Subscribable, Subscription } from 'rxjs';
import { ExcursionScene } from 'src/app/models/excursionScene';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, AfterViewInit, OnDestroy {
  private _scene: Scene;
  private _gizmoManager: GizmoManager;
  private _gizmomiddlePoint: AbstractMesh;

  private _sceneWrappers: Map<ExcursionScene, AbstractMesh> = new Map();

  @ViewChild('scene_canvas')
  public canvas: ElementRef<HTMLCanvasElement>;

  addSceneRef: Subscription;
  selectedSceneRef: Subscription;
  gizmoAttachRef: any;

  constructor(
    private engineService: EngineService,
    private sceneState: SceneStateService) { }

  ngAfterViewInit(): void {
    this.engineService.initEngine(this.canvas.nativeElement);
    this._scene = new Scene(this.engineService.engine);
    this.setupGizmo();
    this.setupCamera(this.canvas.nativeElement);

    this._scene.createDefaultLight();
    this._scene.createDefaultEnvironment({
      skyboxSize: 1000
    });

    this.addSceneRef = this.sceneState.addScene$.subscribe(
      (excScene) => this.addScene(excScene)
    );

    this.selectedSceneRef = this.sceneState.selectedScenes$.subscribe(
      (excScenes) => {
        this.unpackFromGizmo();
        if (excScenes.length === 0) {
          this._gizmoManager.attachToMesh(null);
        } else {
          this._gizmoManager.attachToMesh(this._gizmomiddlePoint);
          const meshes = excScenes
            .map(sc => this._sceneWrappers.get(sc));
            
          this._gizmomiddlePoint.position = meshes
            .map(m => m.getAbsolutePosition())
            .reduce((v1, v2) => v1.add(v2))
            .scale(1/excScenes.length);

          meshes.forEach(m => {
            var newPosition = m.absolutePosition.subtract(this._gizmomiddlePoint.getAbsolutePosition());
            console.log(newPosition);
            
            m.setParent(this._gizmomiddlePoint);
            m.position = newPosition
          });
        }
      }
    );

    this.engineService.registerScene(this._scene);
  }

  private unpackFromGizmo()
  {
    this._gizmomiddlePoint.getChildMeshes().forEach(m => {
      var newPosition = m.absolutePosition.subtract(this._gizmomiddlePoint.getAbsolutePosition());
      console.log(newPosition);
      
      m.setParent(null);
      m.position = newPosition.add(this._gizmomiddlePoint.position);
    });
  }

  private setupCamera(canvas: HTMLCanvasElement) {
    var camera = new UniversalCamera("UniversalCamera", new Vector3(5, 5, 10), this._scene);
    camera.keysUp.push(87); // "w"
    camera.keysLeft.push(65); // "a"
    camera.keysDown.push(83); // "s"
    camera.keysRight.push(68); // "d"
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
  }

  private setupGizmo() {
    const gizmoManager = new GizmoManager(this._scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = false;
    gizmoManager.scaleGizmoEnabled = false;
    gizmoManager.boundingBoxGizmoEnabled = false;
    gizmoManager.usePointerToAttachGizmos = false;
    gizmoManager.clearGizmoOnEmptyPointerEvent = false;
    gizmoManager.attachableMeshes = [];
    this._scene.onPointerObservable.add(ed => {
      if (ed.type != PointerEventTypes.POINTERDOWN)
        return;
      if (!Array.from(this._sceneWrappers.values()).includes(ed.pickInfo.pickedMesh)) {
        this.sceneState.selectionChanged([]);
      }
    });
    this._gizmoManager = gizmoManager;
    this._gizmomiddlePoint = MeshBuilder.CreateBox("gizmo middle box", { size: 0.1 });
  }

  private addScene(excScene: ExcursionScene) {
    const sphere = MeshBuilder.CreateSphere(`scene-${excScene.title}`, {});
    sphere.position = excScene.position;
    sphere.actionManager = new ActionManager(this._scene);
    sphere.actionManager.registerAction(new ExecuteCodeAction(
      ActionManager.OnPickTrigger,
      (ev) => {
        if (ev.sourceEvent.ctrlKey) {
          this.sceneState.selectionChanged(this.sceneState.selectedScenes.concat([excScene]));
        } else {
          this.sceneState.selectionChanged([excScene]);
        }
      }
    ));
    this._sceneWrappers.set(excScene, sphere);
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.addSceneRef.unsubscribe();
    this.selectedSceneRef.unsubscribe();
  }
}
