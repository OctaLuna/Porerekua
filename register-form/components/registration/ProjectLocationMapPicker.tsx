import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type Coordinates = {
  lng: number;
  lat: number;
};

type ProjectLocationMapPickerProps = {
  label?: string;
};

const MAPTILER_KEY = '4pzORIUq7MQTnO8YL3jl';
const MAP_STYLE_URL = `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_KEY}`;

const INITIAL_COORDS: Coordinates = {
  lng: -63.5887,
  lat: -16.2902,
};

const ProjectLocationMapPicker: React.FC<ProjectLocationMapPickerProps> = ({
  label = 'Ubicación geográfica del proyecto (selección visual)',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<Coordinates>(INITIAL_COORDS);

  const formattedCoords = useMemo(
    () => `${selectedCoords.lat.toFixed(5)}, ${selectedCoords.lng.toFixed(5)}`,
    [selectedCoords],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: [INITIAL_COORDS.lng, INITIAL_COORDS.lat],
      zoom: 5.2,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    const marker = new maplibregl.Marker({
      color: '#C9920A',
      draggable: false,
      scale: 1.05,
    })
      .setLngLat([INITIAL_COORDS.lng, INITIAL_COORDS.lat])
      .addTo(map);

    markerRef.current = marker;

    map.on('click', (event) => {
      const coords = {
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      };

      setSelectedCoords(coords);
      marker.setLngLat([coords.lng, coords.lat]);
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="form-field">
      <p className="form-label question-accent">{label}</p>
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(244,244,244,0.96) 100%)',
          border: '1px solid rgba(49,47,42,0.18)',
          borderRadius: '0.9rem',
          padding: '0.85rem',
          boxShadow: '0 10px 28px rgba(49,47,42,0.10)',
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '17rem',
            borderRadius: '0.7rem',
            border: '1px solid rgba(49,47,42,0.22)',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
          }}
        />
        <div
          style={{
            marginTop: '0.7rem',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '0.7rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '0.84rem',
              color: 'var(--theme-text-secondary)',
              letterSpacing: '0.01em',
            }}
          >
            Haz clic en el mapa para mover el pin.
          </span>
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--color-gris-piedra)',
              background: 'rgba(122,154,62,0.10)',
              border: '1px solid rgba(122,154,62,0.25)',
              borderRadius: '999px',
              padding: '0.25rem 0.65rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Coordenadas: {formattedCoords}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectLocationMapPicker;
