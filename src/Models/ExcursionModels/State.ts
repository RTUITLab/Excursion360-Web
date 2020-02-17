import { StateType } from "./StateType";
import { Link } from "./Link";
import { GroupLink } from "./GroupLink";
import { FieldItem } from "./FieldItem";

/**
 * State of excursion, present person environment
 */
export interface State {
    /** Unique id of state */
    id: string;
    /** Title, show it on links and page title */
    title: string;
    /** URL of resource */
    url: string;
    /** Type of state */
    type: StateType;
    /** Picture Quaternion rotation */
    pictureRotation: any;
    /** Links from current state */
    links: Link[];
    /** Group links from current state */
    groupLinks : GroupLink[];
    fieldItems : FieldItem[];
}
