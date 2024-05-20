import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRInterface } from "./AsyncModuleInterfaces";
import { Scene } from "@babylonjs/core/scene";
import { Camera } from "@babylonjs/core/Cameras/camera";

export class WebXRLogic {
  public static async CreateXR(
    scene: Scene,
    forceInputProfileWebXr: string | null,
    callbacks: {
      audioButtonPressed: () => void;
      goFirstStateButtonPressed: () => void;
      historyBackButtonPressed: () => void;
    }
  ): Promise<WebXRInterface | null> {
    try {
      // WebXRHTCViveMotionController.MODEL_BASE_URL = "/xrmodels/vive/";
      // WebXRHTCViveMotionController.MODEL_FILENAME = "none.glb";
      const xr = await WebXRDefaultExperience.CreateAsync(scene, {
        disableTeleportation: false,
        inputOptions: {
          disableOnlineControllerRepository: false,
          customControllersRepositoryURL: "/xrrepo",
          forceInputProfile: forceInputProfileWebXr || undefined
        },
      });

      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((mc) => {
          const aButton = mc.getComponent("a-button");
          if (aButton) {
            aButton.onButtonStateChangedObservable.add((e) => {
              if (e.hasChanges && e.pressed) {
                callbacks.audioButtonPressed();
              }
            });
          }
          const squeezeButton = mc.getComponent("xr-standard-squeeze");
          if (squeezeButton) {
            squeezeButton.onButtonStateChangedObservable.add((e) => {
              if (e.hasChanges && e.pressed && e.value === 1) {
                callbacks.audioButtonPressed();
              }
            });
          }

          const touchpadButton = mc.getComponent("xr-standard-touchpad");
          if (touchpadButton) {
            touchpadButton.onButtonStateChangedObservable.add((e) => {
              if (e.hasChanges && e.pressed) {
                callbacks.goFirstStateButtonPressed();
              }
            });
          }
          const bButton = mc.getComponent("b-button");
          if (bButton) {
            bButton.onButtonStateChangedObservable.add((e) => {
              if (e.hasChanges && e.pressed) {
                callbacks.goFirstStateButtonPressed();
              }
            });
          }
          const xButton = mc.getComponent("x-button");
          if (xButton) {
            xButton.onButtonStateChangedObservable.add((e) => {
              if (e.hasChanges && e.pressed) {
                callbacks.historyBackButtonPressed();
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
