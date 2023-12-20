import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { Scene } from "@babylonjs/core/scene";
import { Inspector } from "@babylonjs/inspector";

export class InspectorLogic {
  public static registerInspector(scene: Scene): void {
    console.log("deep debug");
    if (sessionStorage.getItem("show_debug_layer")) {
      Inspector.Show(scene, {});
    }
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger,
          parameter: "r",
        },
        () => {
          if (Inspector.IsVisible) {
            Inspector.Hide();
            sessionStorage.removeItem("show_debug_layer");
          } else {
            Inspector.Show(scene, {});
            sessionStorage.setItem("show_debug_layer", "yes");
          }
        }
      )
    );
  }
}
