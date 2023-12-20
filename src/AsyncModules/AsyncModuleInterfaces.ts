import { Camera } from "@babylonjs/core/Cameras/camera";

export interface WebXRInterface {
  rotateXrCameraFromPlainCamera(camera: Camera): void;
}
