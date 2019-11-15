/**
 * Point in spherical coordinate system
 */
export interface SphericalPoint {
    /** Radial distance */
    r: number;
    /** Azimuthal angle in radians */
    o: number;
    /** Polar angle in radians */
    f: number;
}
