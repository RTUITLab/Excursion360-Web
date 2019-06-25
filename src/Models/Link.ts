import { SphericalPoint } from "./Points/SphericalPoint";

/**
 * Link to another state
 */
export interface Link extends SphericalPoint {
    /** State id */
    id: string;
}