import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { FieldItemAudioContent } from "./ExcursionModels/FieldItemAudioContent";
import type { FieldItemImageContent } from "./ExcursionModels/FieldItemImageContent";

export class FieldItemInfo {
	constructor(
		public vertex: Vector3[],
		public images: FieldItemImageContent[],
		public videos: string[],
		public text: string,
		public audios: FieldItemAudioContent[],
		public distance: number,
	) {}
}
