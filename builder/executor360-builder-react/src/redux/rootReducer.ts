import { combineReducers } from 'redux'
import { scenesReducer } from './scenesReducer'
export const rootReduser = combineReducers({
    scenes: scenesReducer
})
export type RootState = ReturnType<typeof rootReduser>
