import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { FieldItemAudioContent } from "./ExcursionModels/FieldItemAudioContent";

export class FieldItemInfo {
	constructor(
		public vertex: Vector3[],
		public images: string[],
		public videos: string[],
		public text: string,
		public audios: FieldItemAudioContent[],
		public distance: number,
	) {}
}
