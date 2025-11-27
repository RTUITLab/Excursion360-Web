/** Part of original image */
export interface CroppedImagePart {
	/** X start position of rectangle */
	x: number;
	/** Y start position of rectangle */
	y: number;
	/** Width position of rectangle */
	width: number;
	/** Height position of rectangle */
	height: number;
	/** Route to image part file */
	route: string;
	/** Size of image part file in bytes */
	size: number;
}
