import type { FeatureCollection, Geometry } from 'geojson';

export type OfflineMapPackage = {
  format: 'navira-geojson-v1';
  name: string;
  bounds: [number, number, number, number];
  attribution: string;
  source: string;
  features: FeatureCollection<Geometry, { kind: 'road' | 'building' | 'water' | 'land'; class: string; name: string }>;
};

export type StoredOfflineMap = {
  id: string;
  name: string;
  bounds: OfflineMapPackage['bounds'];
  attribution: string;
  source: string;
  sizeBytes: number;
};
