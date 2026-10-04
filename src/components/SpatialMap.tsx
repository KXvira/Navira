import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map, Marker, type CameraRef, type MapRef, type StyleSpecification } from '@maplibre/maplibre-react-native';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { RoutePoint } from '../types/route';
import type { Waypoint } from '../types/waypoint';
import { accuracyGeometry, displaySegments } from '../utils/mapCues';
import { coordinateBounds, routeGeometry, visibleRoutePoints } from '../utils/spatialGeometry';

const LOCAL_STYLE: StyleSpecification = { version: 8, name: 'Navira local canvas', sources: {}, layers: [{ id: 'canvas', type: 'background', paint: { 'background-color': '#102a39' } }] };
export type SpatialMapControls = { fitRoute: () => void; recenter: () => void };
type Cue = { key: string; coordinate: [number, number]; title: string; detail: string; waypointId?: string; kind: 'waypoint' | 'start' | 'finish' | 'sample' | 'you' };

export function SpatialMap({ waypoints, pointsByRoute, routeId, waypointId, current, accuracy, controls, onWaypointDetails }: { waypoints: Waypoint[]; pointsByRoute: Record<string, RoutePoint[]>; routeId?: string; waypointId?: string; current: [number, number] | null; accuracy: number | null | undefined; controls: React.RefObject<SpatialMapControls | null>; onWaypointDetails: (id: string) => void }) {
  const camera = useRef<CameraRef>(null);
  const map = useRef<MapRef>(null);
  const [selectionKeys, setSelectionKeys] = useState<string[]>([]);
  const [mode, setMode] = useState<'line' | 'points'>('line');
  const routeParts = useMemo(() => Object.entries(visibleRoutePoints(pointsByRoute, routeId)).map(([id, points]) => ({ id, points, geometry: routeGeometry(points), segments: displaySegments(points) })), [pointsByRoute, routeId]);
  const lines = useMemo<FeatureCollection<LineString>>(() => ({ type: 'FeatureCollection', features: routeParts.flatMap((part) => part.geometry.lines.features) }), [routeParts]);
  const anchors = useMemo<FeatureCollection<Point>>(() => ({ type: 'FeatureCollection', features: routeParts.flatMap((part) => part.geometry.anchors.features) }), [routeParts]);
  const accuracyData = useMemo(() => accuracyGeometry(current, accuracy), [current, accuracy]);
  const selectedRoute = routeParts.find((part) => part.id === routeId);
  const fitCoordinates = selectedRoute ? selectedRoute.geometry.coordinates : routeParts.flatMap((part) => part.geometry.coordinates);
  const cues = useMemo<Cue[]>(() => {
    const items: Cue[] = waypoints.filter((point) => Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90 && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180).map((point) => ({ key: `w-${point.id}`, coordinate: [point.longitude, point.latitude], title: point.name, detail: 'Saved waypoint', waypointId: point.id, kind: 'waypoint' }));
    for (const part of routeParts) {
      const multiple = part.segments.length > 1;
      for (const segment of part.segments) {
        const start: [number, number] = [segment.start.longitude, segment.start.latitude];
        const finish: [number, number] = [segment.finish.longitude, segment.finish.latitude];
        const prefix = multiple ? `Segment ${segment.index} ` : '';
        if (mode === 'line') {
          items.push({ key: `${part.id}-${segment.index}-start`, coordinate: start, title: `${prefix}${segment.points.length === 1 ? 'Start / Finish' : 'Start'}`, detail: `Stored segment ${segment.start.segmentIndex + 1} · ${segment.points.length === 1 ? 'Only' : 'First'} eligible sample · ${new Date(segment.start.capturedAt).toLocaleString()}`, kind: 'start' });
          if (segment.points.length > 1) items.push({ key: `${part.id}-${segment.index}-finish`, coordinate: finish, title: `${prefix}Finish`, detail: `Stored segment ${segment.finish.segmentIndex + 1} · Last eligible sample · ${new Date(segment.finish.capturedAt).toLocaleString()}`, kind: 'finish' });
        }
      }
      if (mode === 'points') for (const point of part.points) items.push({ key: `${part.id}-sample-${point.id}`, coordinate: [point.longitude, point.latitude], title: `Sample · segment ${point.segmentIndex + 1}`, detail: `${new Date(point.capturedAt).toLocaleString()} · ${point.distanceStatus.replace('-', ' ')} · reported accuracy ${point.horizontalAccuracy === null ? 'unavailable' : `${point.horizontalAccuracy.toFixed(1)} m`}`, kind: 'sample' });
    }
    if (current) items.push({ key: 'you', coordinate: current, title: 'You', detail: 'Fresh reported location', kind: 'you' });
    return items;
  }, [waypoints, routeParts, current, mode]);
  const selection = cues.filter((cue) => selectionKeys.includes(cue.key));
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
  const showCue = async (cue: Cue) => {
    try {
      const pressed = await map.current?.project(cue.coordinate);
      if (!pressed) throw new Error('Map projection unavailable');
      const projected = await Promise.all(cues.map(async (item) => ({ key: item.key, pixel: await map.current!.project(item.coordinate) })));
      setSelectionKeys(projected.filter((item) => Math.hypot(item.pixel[0] - pressed[0], item.pixel[1] - pressed[1]) <= 32).map((item) => item.key));
    } catch {
      setSelectionKeys(cues.filter((item) => item.coordinate[0] === cue.coordinate[0] && item.coordinate[1] === cue.coordinate[1]).map((item) => item.key));
    }
  };
  return <View style={styles.container}><View style={styles.modeSwitch}>{(['line', 'points'] as const).map((option) => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: mode === option }} accessibilityLabel={`${option === 'line' ? 'Line' : 'Points'} route display`} onPress={() => { setMode(option); setSelectionKeys([]); }} style={[styles.modeButton, mode === option && styles.modeSelected]}><Text style={styles.modeText}>{option === 'line' ? 'Line' : 'Points'}</Text></Pressable>)}</View><Map ref={map} style={styles.map} mapStyle={LOCAL_STYLE} dragPan touchZoom doubleTapZoom touchRotate={false} touchPitch={false} logo={false} attribution={false} scaleBar scaleBarPosition={{ top: 8, left: 8 }}>
    <Camera ref={camera} initialViewState={{ center: [0, 0], zoom: 1 }} />
    <GeoJSONSource id="accuracy" data={accuracyData}><Layer id="accuracy-fill" type="fill" paint={{ 'fill-color': '#74a9ff', 'fill-opacity': 0.13 }} /><Layer id="accuracy-outline" type="line" paint={{ 'line-color': '#a9c8ff', 'line-width': 1.5 }} /></GeoJSONSource>
    {mode === 'line' && <GeoJSONSource id="routes" data={lines}><Layer id="route-lines" type="line" paint={{ 'line-color': '#67d9e8', 'line-width': 2 }} /></GeoJSONSource>}
    {mode === 'line' && <GeoJSONSource id="route-anchors" data={anchors}><Layer id="route-anchor-dots" type="circle" paint={{ 'circle-color': '#67d9e8', 'circle-radius': 3 }} /></GeoJSONSource>}
    {cues.map((cue) => <Marker key={cue.key} id={cue.key} lngLat={cue.coordinate} onPress={() => { void showCue(cue); }}><Pressable accessibilityRole="button" accessibilityLabel={`${cue.title}. ${cue.detail}`} hitSlop={cue.kind === 'sample' ? 12 : 6} onPress={() => { void showCue(cue); }} style={[styles.marker, cue.kind === 'waypoint' ? styles.pin : cue.kind === 'you' ? styles.you : cue.kind === 'sample' ? styles.sample : cue.kind === 'finish' ? styles.finish : styles.start]}><Text style={styles.markerText}>{cue.kind === 'waypoint' ? 'W' : cue.kind === 'you' ? 'You' : cue.kind === 'sample' ? '•' : cue.kind === 'finish' ? 'F' : cue.title.includes('Start / Finish') ? 'S/F' : 'S'}</Text>{cue.kind === 'waypoint' && <View style={styles.pinTip} />}</Pressable></Marker>)}
  </Map>{selection.length > 0 && <View style={styles.card}><Text style={styles.cardHeading}>{selection.length > 1 ? `${selection.length} markers here` : selection[0].title}</Text>{selection.map((cue) => <View key={cue.key} style={styles.cardRow}><Text style={styles.cardText}>{cue.title} · {cue.detail}</Text>{cue.waypointId && <Pressable accessibilityRole="button" accessibilityLabel={`Open ${cue.title} details`} onPress={() => onWaypointDetails(cue.waypointId!)}><Text style={styles.link}>Open details</Text></Pressable>}</View>)}<Pressable accessibilityRole="button" accessibilityLabel="Close map marker details" onPress={() => setSelectionKeys([])}><Text style={styles.link}>Close</Text></Pressable></View>}</View>;
}
const styles = StyleSheet.create({ container: { flex: 1 }, map: { flex: 1 }, modeSwitch: { flexDirection: 'row', alignSelf: 'flex-start', margin: 6, gap: 4 }, modeButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: '#67d9e8' }, modeSelected: { backgroundColor: '#286176' }, modeText: { color: '#fff', fontWeight: '700' }, marker: { minWidth: 20, minHeight: 20, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' }, markerText: { color: '#08131f', fontSize: 10, fontWeight: '800' }, pin: { minWidth: 30, minHeight: 30, borderRadius: 18, backgroundColor: '#ffd166' }, pinTip: { position: 'absolute', bottom: -9, width: 9, height: 9, backgroundColor: '#ffd166', transform: [{ rotate: '45deg' }] }, you: { minWidth: 30, minHeight: 30, borderRadius: 18, backgroundColor: '#74a9ff' }, sample: { width: 14, height: 14, minWidth: 14, minHeight: 14, borderRadius: 7, backgroundColor: '#67d9e8' }, start: { backgroundColor: '#67d9e8', borderRadius: 4 }, finish: { backgroundColor: '#67d9e8', borderRadius: 18 }, card: { position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: '#193748', padding: 12, borderRadius: 8, maxHeight: 190 }, cardHeading: { color: '#fff', fontWeight: '700' }, cardRow: { paddingTop: 6 }, cardText: { color: '#fff' }, link: { color: '#a7e8ca', fontWeight: '700', paddingVertical: 5 } });
