import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRInterface } from "./AsyncModuleInterfaces";
import { Scene } from "@babylonjs/core/scene";
import { Camera } from "@babylonjs/core/Cameras/camera";

export class WebXRLogic {
  public static async CreateXR(
    scene: Scene,
    callbacks: {
      aButtonPressed: () => void;
      bButtonPressed: () => void;
      xButtonPressed: () => void;
    }
  ): Promise<WebXRInterface | null> {
    try {
      const xr = await WebXRDefaultExperience.CreateAsync(scene, {
        disableTeleportation: false,
        inputOptions: {
          disableOnlineControllerRepository: false,
        },
      });

      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((mc) => {
          const aButton = mc.getComponent("a-button");
          if (aButton) {
            aButton.onButtonStateChangedObservable.add((e) => {
              if (e.pressed) {
                callbacks.aButtonPressed();
              }
            });
          }
          const bButton = mc.getComponent("b-button");
          if (bButton) {
            bButton.onButtonStateChangedObservable.add((e) => {
              if (e.pressed) {
                callbacks.bButtonPressed();
              }
            });
          }
          const xButton = mc.getComponent("x-button");
          if (xButton) {
            xButton.onButtonStateChangedObservable.add((e) => {
              if (e.pressed) {
                callbacks.xButtonPressed();
              }
            });
          }
        });
      });
      return new WebXRDefaultExperienceXRLogic(xr);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

class WebXRDefaultExperienceXRLogic implements WebXRInterface {
  constructor(private xr: WebXRDefaultExperience) {}
  rotateXrCameraFromPlainCamera(camera: Camera): void {
    this.xr.input.xrSessionManager.runInXRFrame(() => {
      this.xr.input.xrCamera.setTransformationFromNonVRCamera(camera);
    });
  }
}
