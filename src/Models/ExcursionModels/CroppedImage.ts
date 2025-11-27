import type { CroppedImagePart } from "./CroppedImagePart";

/**
 * Describe cropped image data
 */
export interface CroppedImage {
	/** Width of original image */
	width: number;
	/** Height of original image */
	height: number;
	/** Info about low quality image */
	lowQualityImage: CroppedImagePart;
	/** All rectangles from original image */
	rectangles: CroppedImagePart[];
	/** Size of original image, in bytes */
	originalSize: number;
}
