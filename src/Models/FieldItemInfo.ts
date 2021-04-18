import { Vector3 } from "babylonjs"
import { FieldItemAudioContent } from "./ExcursionModels/FieldItemAudioContent";

export class FieldItemInfo {
    constructor(
        public vertex: Vector3[],
        public images: string[],
        public videos: string[],
        public text: string,
        public audios: FieldItemAudioContent[],
        public distance: number
    ) { }
}
