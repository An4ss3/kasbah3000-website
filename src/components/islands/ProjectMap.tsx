import 'maplibre-gl/dist/maplibre-gl.css';
import './ProjectMap.css';

import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Map as MapLibreMap, Marker as MapLibreMarker, Popup } from 'maplibre-gl';
import type { ProjectMapProps } from '../../types/components';

const DEFAULT_CENTER: [number, number] = [-9.6, 30.4];
const DEFAULT_ZOOM = 12;
const MAP_LOAD_TIMEOUT = 15_000;

const interfaceCopy = {
  fr: {
    ariaLabel: 'Carte interactive des équipements du projet Kasbah3000',
    fallback: 'La carte interactive est momentanément indisponible.',
    loading: 'Chargement de la carte…',
  },
  en: {
    ariaLabel: 'Interactive map of Kasbah3000 project facilities',
    fallback: 'The interactive map is temporarily unavailable.',
    loading: 'Loading map…',
  },
} as const;

type PrincipleType = 'architecture' | 'energy' | 'water' | 'food' | 'community' | 'mobility';

type MapStatus = 'loading' | 'ready' | 'fallback';

interface ProjectFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    name: { fr: string; en: string };
    type: PrincipleType;
    description: { fr: string; en: string };
  };
}

interface ProjectFeatureCollection {
  type: 'FeatureCollection';
  features: ProjectFeature[];
}

function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

function isProjectFeatureCollection(value: unknown): value is ProjectFeatureCollection {
  if (!value || typeof value !== 'object') return false;

  const collection = value as Partial<ProjectFeatureCollection>;
  return (
    collection.type === 'FeatureCollection' &&
    Array.isArray(collection.features) &&
    collection.features.every(
      (feature) =>
        feature?.type === 'Feature' &&
        feature.geometry?.type === 'Point' &&
        Array.isArray(feature.geometry.coordinates) &&
        feature.geometry.coordinates.length === 2 &&
        typeof feature.properties?.name?.fr === 'string' &&
        typeof feature.properties?.name?.en === 'string' &&
        typeof feature.properties?.description?.fr === 'string' &&
        typeof feature.properties?.description?.en === 'string'
    )
  );
}

function createPopupContent(feature: ProjectFeature, lang: ProjectMapProps['lang']): HTMLElement {
  const content = document.createElement('article');
  content.className = 'project-map__popup-content';

  const title = document.createElement('h3');
  title.className = 'project-map__popup-title';
  title.textContent = feature.properties.name[lang];

  const description = document.createElement('p');
  description.className = 'project-map__popup-description';
  description.textContent = feature.properties.description[lang];

  content.append(title, description);
  return content;
}

export default function ProjectMap({
  featuresUrl,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  lang,
  ariaLabel,
  fallbackText,
}: ProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [status, setStatus] = useState<MapStatus>('loading');
  const copy = interfaceCopy[lang];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const abortController = new AbortController();
    const markers: MapLibreMarker[] = [];
    let activePopup: Popup | null = null;
    let map: MapLibreMap | null = null;
    let cancelled = false;
    let styleLoaded = false;
    let loadTimer: ReturnType<typeof setTimeout> | undefined;

    const showFallback = () => {
      if (cancelled) return;
      if (loadTimer) clearTimeout(loadTimer);
      map?.remove();
      map = null;
      mapRef.current = null;
      setStatus('fallback');
    };

    const initializeMap = async () => {
      const mapTilerKey = import.meta.env.PUBLIC_MAPTILER_KEY?.trim();
      if (!mapTilerKey) {
        showFallback();
        return;
      }

      try {
        const maplibregl = await import('maplibre-gl');
        if (cancelled) return;

        if (!hasWebGLSupport()) {
          showFallback();
          return;
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const localizedAriaLabel = ariaLabel ?? copy.ariaLabel;

        map = new maplibregl.Map({
          container,
          style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(mapTilerKey)}`,
          center,
          zoom,
          interactive: !reducedMotion,
          keyboard: !reducedMotion,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.getCanvas().setAttribute('aria-label', localizedAriaLabel);

        if (!reducedMotion) {
          map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        }

        const handleMapError = () => {
          if (!styleLoaded) showFallback();
        };

        map.on('error', handleMapError);
        loadTimer = setTimeout(showFallback, MAP_LOAD_TIMEOUT);

        map.once('load', async () => {
          styleLoaded = true;
          if (loadTimer) clearTimeout(loadTimer);

          try {
            const response = await fetch(featuresUrl, { signal: abortController.signal });
            if (!response.ok) throw new Error(`Feature request failed: ${response.status}`);

            const data: unknown = await response.json();
            if (!isProjectFeatureCollection(data)) throw new Error('Invalid project feature data');
            if (cancelled || !map) return;

            data.features.forEach((feature) => {
              const markerButton = document.createElement('button');
              markerButton.type = 'button';
              markerButton.className = `project-map__marker project-map__marker--${feature.properties.type}`;
              markerButton.setAttribute('aria-label', feature.properties.name[lang]);

              const marker = new maplibregl.Marker({ element: markerButton, anchor: 'center' })
                .setLngLat(feature.geometry.coordinates)
                .addTo(map as MapLibreMap);

              markerButton.addEventListener('click', () => {
                activePopup?.remove();
                activePopup = new maplibregl.Popup({
                  className: 'project-map-popup',
                  closeButton: true,
                  closeOnClick: true,
                  offset: 20,
                })
                  .setLngLat(feature.geometry.coordinates)
                  .setDOMContent(createPopupContent(feature, lang))
                  .addTo(map as MapLibreMap);

                if (reducedMotion) {
                  map?.jumpTo({ center: feature.geometry.coordinates });
                } else {
                  map?.flyTo({
                    center: feature.geometry.coordinates,
                    zoom: Math.max(map.getZoom(), 14),
                    duration: 700,
                    essential: false,
                  });
                }
              });

              markers.push(marker);
            });

            setStatus('ready');
          } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) showFallback();
          }
        });
      } catch {
        showFallback();
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;
      abortController.abort();
      if (loadTimer) clearTimeout(loadTimer);
      activePopup?.remove();
      markers.forEach((marker) => marker.remove());
      map?.remove();
      mapRef.current = null;
    };
  }, [ariaLabel, center, copy.ariaLabel, featuresUrl, lang, zoom]);

  if (status === 'fallback') {
    return h(
      'div',
      {
        class: 'project-map project-map--fallback',
        role: 'img',
        'aria-label': fallbackText ?? copy.fallback,
      },
      h('p', { class: 'project-map__fallback-text' }, fallbackText ?? copy.fallback)
    );
  }

  return h(
    'div',
    { class: 'project-map' },
    h('div', {
      ref: containerRef,
      class: 'project-map__viewport',
      role: 'application',
      tabIndex: 0,
      'aria-label': ariaLabel ?? copy.ariaLabel,
    }),
    status === 'loading'
      ? h(
          'p',
          { class: 'project-map__loading', role: 'status', 'aria-live': 'polite' },
          copy.loading
        )
      : null
  );
}
