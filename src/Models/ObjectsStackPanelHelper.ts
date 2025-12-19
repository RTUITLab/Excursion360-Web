import type { Vector3 } from "@babylonjs/core/Maths/math.vector";

interface ItemWithPosition {
	position: Vector3;
}

export function placeAsHorizontalStack(
	objects: ItemWithPosition[],
	containerSize: number,
) {
	// Stack emulation
	const size = containerSize / (objects.length + 1);
	for (let i = 0; i < objects.length; i++) {
		const currentButton = objects[i];
		const position =
			-containerSize / 2 + // left point
			size * (i + 1); // offset
		currentButton.position.x = position;
	}
}
