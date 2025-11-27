import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class MathStuff {
	/**
	 * Getposition by quaternion rotation
	 * Copied from Unity sources
	 * @param rotation Rotation quaternion
	 * @param multipler Position multipler
	 */
	public static GetPositionForMarker(
		rotation: any,
		multipler: number,
	): Vector3 {
		const forward = Vector3.Forward().multiplyByFloats(
			multipler,
			multipler,
			multipler,
		);
		const num = rotation.x * 2;
		const num2 = rotation.y * 2;
		const num3 = rotation.z * 2;
		const num4 = rotation.x * num;
		const num5 = rotation.y * num2;
		const num6 = rotation.z * num3;
		const num7 = rotation.x * num2;
		const num8 = rotation.x * num3;
		const num9 = rotation.y * num3;
		const num10 = rotation.w * num;
		const num11 = rotation.w * num2;
		const num12 = rotation.w * num3;
		const result = new Vector3();
		result.x =
			(1 - (num5 + num6)) * forward.x +
			(num7 - num12) * forward.y +
			(num8 + num11) * forward.z;
		result.y =
			(num7 + num12) * forward.x +
			(1 - (num4 + num6)) * forward.y +
			(num9 - num10) * forward.z;
		result.z =
			(num8 - num11) * forward.x +
			(num9 + num10) * forward.y +
			(1 - (num4 + num5)) * forward.z;
		// Hack for incorrect quaternion position
		result.x = -result.x;
		result.z = -result.z;
		return result;
	}
}
