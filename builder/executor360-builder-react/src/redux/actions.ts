import { ExcursionScene } from '../models/ExcursionScene';
import { CreateSceneAction, CREATE_SCENE } from "./types";

export function createScene(scene: ExcursionScene): CreateSceneAction {
    return {
        type: CREATE_SCENE,
        payload: scene
    }
}   

export {};