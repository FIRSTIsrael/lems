'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useTheme } from '@mui/material';
import { Coordinates } from '@lems/types/api/coordinates';

export interface LocationMapProps {
  /** The marked location. */
  value: Coordinates | null;
  /** When provided, the map is editable: clicking or dragging the marker sets the location. */
  onChange?: (value: Coordinates) => void;
  /** When this changes, the map flies to it. Defaults to the initial value. */
  center?: Coordinates | null;
  /** Initial view when there is no value. */
  defaultCenter?: Coordinates;
  defaultZoom?: number;
  /** Zoom level used when focusing on a location. */
  focusZoom?: number;
  height?: number | string;
}

const COORDINATE_PRECISION = 6;

const round = (value: number) => Number(value.toFixed(COORDINATE_PRECISION));

const toCoordinates = (latLng: L.LatLng): Coordinates => ({
  latitude: round(latLng.lat),
  longitude: round(L.Util.wrapNum(latLng.lng, [-180, 180], true))
});

// Material `LocationOn` icon path
const PIN_PATH =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5';

const createPinIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"><path d="${PIN_PATH}" fill="${color}" stroke="white" stroke-width="1"/></svg>`,
    iconSize: [40, 40],
    iconAnchor: [20, 37]
  });

const FlyTo = ({ target, zoom }: { target: Coordinates | null | undefined; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    if (target) map.flyTo([target.latitude, target.longitude], zoom, { duration: 0.75 });
  }, [map, target, zoom]);

  return null;
};

const ClickHandler = ({ onClick }: { onClick: (value: Coordinates) => void }) => {
  useMapEvents({ click: e => onClick(toCoordinates(e.latlng)) });
  return null;
};

export const LocationMapInner: React.FC<LocationMapProps> = ({
  value,
  onChange,
  center,
  defaultCenter = { latitude: 20, longitude: 0 },
  defaultZoom = 2,
  focusZoom = 15
}) => {
  const theme = useTheme();
  const icon = useMemo(() => createPinIcon(theme.palette.primary.main), [theme]);
  const initialCenter = value ?? defaultCenter;
  const editable = !!onChange;

  return (
    <MapContainer
      center={[initialCenter.latitude, initialCenter.longitude]}
      zoom={value ? focusZoom : defaultZoom}
      scrollWheelZoom={editable}
      worldCopyJump
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {value && (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={icon}
          draggable={editable}
          eventHandlers={
            onChange
              ? { dragend: e => onChange(toCoordinates((e.target as L.Marker).getLatLng())) }
              : undefined
          }
        />
      )}
      {onChange && <ClickHandler onClick={onChange} />}
      <FlyTo target={center} zoom={focusZoom} />
    </MapContainer>
  );
};

export default LocationMapInner;
