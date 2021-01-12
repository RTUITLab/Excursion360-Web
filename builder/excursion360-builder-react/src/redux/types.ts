import { ExcursionScene } from '../models/ExcursionScene';
export const CREATE_SCENE = "EDITOR/CREATE_SCENE";


export interface CreateSceneAction {
    type: typeof CREATE_SCENE,
    payload: ExcursionScene
}

export type MyReduxTypes = CreateSceneAction