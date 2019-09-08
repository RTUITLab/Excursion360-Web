import { StateType } from "./StateType";
import { SphericalPoint } from "./Points/SphericalPoint";
import { CartesianPoint } from "./Points/CartesianPoint";
import { Link } from "./Link";

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
    /** Default gaze direction */
    viewDirection: SphericalPoint;
    /** Resource rotation for crooked resources */
    rotation: CartesianPoint;
    /** Picture Quaternion rotation */
    pictureRotation: any;
    /** Array of links from current state */
    links: Link[];
}