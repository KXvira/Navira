import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import type { OfflineMapPackage } from '../types/offlineMap';
import { parseOfflineMapPackage } from '../utils/offlineMapPackage';

export async function pickOfflineMapPackage(): Promise<OfflineMapPackage | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const file = new File(result.assets[0].uri);
  if (file.size > 5_000_000) throw new Error('Prototype map package exceeds 5 MB');
  return parseOfflineMapPackage(JSON.parse(await file.text()) as unknown);
}
