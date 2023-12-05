import { StateType } from "./StateType";
import { Link } from "./Link";
import { GroupLink } from "./GroupLink";
import { FieldItem } from "./FieldItem";
import { ContentItemModel } from "./ContentItemModel";

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
}
