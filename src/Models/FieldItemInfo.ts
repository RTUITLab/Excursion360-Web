import { Vector3 } from "babylonjs"

export class FieldItemInfo {
    constructor(
        public vertex: Vector3[],
        public images: string[],
        public videos: string[],
        public text: string,
        public audios: string[],
        public distance: number
    ) { }
}
