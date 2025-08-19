declare module 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js' {
  import { DivIcon } from 'leaflet';

  interface ExtraMarkerOptions {
    icon?: string;
    markerColor?: string;
    shape?: string;
    prefix?: string;
    iconColor?: string;
  }

  export function makeIcon(options: ExtraMarkerOptions): DivIcon;

  const ExtraMarkers: {
    makeIcon: (options: ExtraMarkerOptions) => DivIcon;
  };

  export default ExtraMarkers;
}
