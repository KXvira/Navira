import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map, type CameraRef, type StyleSpecification } from '@maplibre/maplibre-react-native';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { RoutePoint } from '../types/route';
import type { Waypoint } from '../types/waypoint';
import { coordinateBounds, routeGeometry, waypointGeometry } from '../utils/spatialGeometry';

// No source, URL, sprite, glyph, or tile request is part of this bundled style.
const LOCAL_STYLE: StyleSpecification = { version: 8, name: 'Navira local canvas', sources: {}, layers: [{ id: 'canvas', type: 'background', paint: { 'background-color': '#102a39' } }] };

export type SpatialMapControls = { fitRoute: () => void; recenter: () => void };
export function SpatialMap({ waypoints, pointsByRoute, routeId, waypointId, current, controls }: { waypoints: Waypoint[]; pointsByRoute: Record<string, RoutePoint[]>; routeId?: string; waypointId?: string; current: [number, number] | null; controls: React.RefObject<SpatialMapControls | null> }) {
  const camera = useRef<CameraRef>(null);
  const routeParts = useMemo(() => Object.entries(pointsByRoute).map(([id, points]) => ({ id, ...routeGeometry(points) })), [pointsByRoute]);
  const lines = useMemo<FeatureCollection<LineString>>(() => ({ type: 'FeatureCollection', features: routeParts.flatMap((part) => part.lines.features) }), [routeParts]);
  const anchors = useMemo<FeatureCollection<Point>>(() => ({ type: 'FeatureCollection', features: routeParts.flatMap((part) => part.anchors.features) }), [routeParts]);
  const waypointData = useMemo(() => waypointGeometry(waypoints), [waypoints]);
  const currentData = useMemo<FeatureCollection<Point>>(() => ({ type: 'FeatureCollection', features: current ? [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: current } }] : [] }), [current]);
  const selectedRoute = routeParts.find((part) => part.id === routeId);
  const fitCoordinates = selectedRoute ? selectedRoute.coordinates : routeParts.flatMap((part) => part.coordinates);
  const fitRoute = () => {
    const bounds = coordinateBounds(fitCoordinates);
    if (!bounds) return;
    if (bounds[0] === bounds[2] && bounds[1] === bounds[3]) camera.current?.easeTo({ center: [bounds[0], bounds[1]], zoom: 15, duration: 350 });
    else camera.current?.fitBounds(bounds, { padding: { top: 60, right: 40, bottom: 60, left: 40 }, duration: 350 });
  };
  const recenter = () => { if (current) camera.current?.easeTo({ center: current, zoom: 15, duration: 350 }); };
  useImperativeHandle(controls, () => ({ fitRoute, recenter }));
  useEffect(() => {
    const selectedWaypoint = waypoints.find((point) => point.id === waypointId);
    if (selectedWaypoint) camera.current?.jumpTo({ center: [selectedWaypoint.longitude, selectedWaypoint.latitude], zoom: 15 });
    else if (routeId && selectedRoute) fitRoute();
    else if (current) camera.current?.jumpTo({ center: current, zoom: 13 });
    else if (fitCoordinates.length) fitRoute();
  // Initial focus only; changing readings must not move a map the user is panning.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, waypointId, !!selectedRoute, routeParts.length, waypoints.length]);
  return <View style={styles.container}><Map style={styles.map} mapStyle={LOCAL_STYLE} dragPan touchZoom doubleTapZoom touchRotate={false} touchPitch={false} logo={false} attribution={false}>
    <Camera ref={camera} initialViewState={{ center: [0, 0], zoom: 1 }} />
    <GeoJSONSource id="routes" data={lines}><Layer id="route-lines" type="line" paint={{ 'line-color': '#67d9e8', 'line-width': 4 }} /></GeoJSONSource>
    <GeoJSONSource id="route-anchors" data={anchors}><Layer id="route-anchor-dots" type="circle" paint={{ 'circle-color': '#67d9e8', 'circle-radius': 5 }} /></GeoJSONSource>
    <GeoJSONSource id="waypoints" data={waypointData}><Layer id="waypoint-dots" type="circle" paint={{ 'circle-color': '#ffd166', 'circle-radius': 7, 'circle-stroke-color': '#102a39', 'circle-stroke-width': 2 }} /></GeoJSONSource>
    <GeoJSONSource id="current-location" data={currentData}><Layer id="current-dot" type="circle" paint={{ 'circle-color': '#74a9ff', 'circle-radius': 8, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 }} /></GeoJSONSource>
  </Map></View>;
}
const styles = StyleSheet.create({ container: { flex: 1 }, map: { flex: 1 } });
