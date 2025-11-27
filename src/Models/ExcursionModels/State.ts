import type { ContentItemModel } from "./ContentItemModel";
import type { FieldItem } from "./FieldItem";
import type { GroupLink } from "./GroupLink";
import type { Link } from "./Link";
import type { StateType } from "./StateType";

/**
 * State of excursion, present person environment
 */
export interface State {
	/** Unique id of state */
	id: string;
	/** Title, show it on links and page title */
	title: string;
	/** URL of full state image */
	url: string;
	/** URL of cropped image location */
	croppedImageUrl: string;
	/** Type of state */
	type: StateType;
	/** Picture Quaternion rotation */
	pictureRotation: any;
	/** Links from current state */
	links: Link[];
	/** Group links from current state */
	groupLinks: GroupLink[];
	fieldItems: FieldItem[];
	contentItems: ContentItemModel[];
	/** Id of tour background audio */
	backgroundAudioId?: string;
	/** Угол, на который нужно повернуть камеру, если к этому состоянию перешли по ссылке */
	ifFirstStateRotationAngle?: number;
}
