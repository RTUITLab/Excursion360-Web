import { CREATE_SCENE, MyReduxTypes } from "./types";
import { ExcursionScene } from '../models/ExcursionScene';

const initialState = {
    scenes: [] as ExcursionScene[]
}

export const scenesReducer = (state = initialState, action: MyReduxTypes) => {
    switch (action.type) {
        case CREATE_SCENE:
            return {
                ...state,
                scenes: [...state.scenes, action.payload]
            }
        default:
            return state;
    }
}