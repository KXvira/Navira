import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import type { OfflineMapPackage, StoredOfflineMap } from '../types/offlineMap';
import { parseOfflineMapPackage } from '../utils/offlineMapPackage';

const MAX_PACKAGE_BYTES = 5_000_000;
const MAX_TOTAL_BYTES = 50_000_000;
const MAX_PACKAGES = 10;
const FILE_PATTERN = /^package-([0-9a-f-]{36})\.json$/;

function storage() {
  const directory = new Directory(Paths.document, 'navira-maps');
  if (!directory.exists) directory.create({ idempotent: true });
  return directory;
}

function packageFile(directory: Directory, id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Invalid package ID');
  return new File(directory, `package-${id}.json`);
}

function selectionFile(directory: Directory) {
  return new File(directory, 'selected.txt');
}

async function writeSelection(directory: Directory, id: string | null) {
  const staged = new File(directory, `selection-${randomUUID()}.tmp`);
  let moved = false;
  try {
    staged.create();
    staged.write(id ?? '');
    await staged.move(selectionFile(directory), { overwrite: true });
    moved = true;
  } finally {
    if (!moved && staged.exists) staged.delete();
  }
}

export async function listOfflineMaps(): Promise<{ packages: StoredOfflineMap[]; selectedId: string | null; selectedMap: OfflineMapPackage | null; invalidCount: number; storageBytes: number }> {
  const directory = storage();
  const packages: StoredOfflineMap[] = [];
  const selectedFile = selectionFile(directory);
  const storedId = selectedFile.exists ? (await selectedFile.text()).trim() : '';
  let selectedMap: OfflineMapPackage | null = null;
  let invalidCount = 0;
  let storageBytes = 0;
  for (const item of directory.list()) {
    if (!(item instanceof File)) continue;
    const match = FILE_PATTERN.exec(item.name);
    if (!match) continue;
    storageBytes += item.size ?? 0;
    try {
      if (item.size === null || item.size > MAX_PACKAGE_BYTES) throw new Error('Invalid package size');
      const pack = parseOfflineMapPackage(JSON.parse(await item.text()) as unknown);
      packages.push({ id: match[1], name: pack.name, bounds: pack.bounds, attribution: pack.attribution, source: pack.source, sizeBytes: item.size });
      if (match[1] === storedId) selectedMap = pack;
    } catch {
      invalidCount += 1;
    }
  }
  packages.sort((a, b) => a.name.localeCompare(b.name));
  return { packages, selectedId: selectedMap ? storedId : null, selectedMap, invalidCount, storageBytes };
}

export async function installOfflineMap(pack: OfflineMapPackage): Promise<void> {
  const valid = parseOfflineMapPackage(pack);
  const directory = storage();
  const current = await listOfflineMaps();
  if (current.packages.length >= MAX_PACKAGES) throw new Error(`Limit of ${MAX_PACKAGES} map packages reached`);
  const id = randomUUID();
  const staged = new File(directory, `staged-${id}.tmp`);
  let moved = false;
  try {
    staged.create();
    staged.write(JSON.stringify(valid));
    const size = staged.size;
    if (size === null || size > MAX_PACKAGE_BYTES) throw new Error('Map package exceeds 5 MB');
    if (current.storageBytes + size > MAX_TOTAL_BYTES) throw new Error('Map storage limit of 50 MB reached');
    await staged.move(packageFile(directory, id));
    moved = true;
    await writeSelection(directory, id);
  } finally {
    if (!moved && staged.exists) staged.delete();
  }
}

export async function installBundledKabarakMap(): Promise<void> {
  const sample = parseOfflineMapPackage(require('../../assets/maps/kabarak-prototype.navmap.json') as unknown);
  await installOfflineMap(sample);
}

export async function selectOfflineMap(id: string | null): Promise<void> {
  const directory = storage();
  if (id && !packageFile(directory, id).exists) throw new Error('Map package is missing');
  await writeSelection(directory, id);
}

export async function removeOfflineMap(id: string): Promise<void> {
  const directory = storage();
  const file = packageFile(directory, id);
  if (!file.exists) throw new Error('Map package is missing');
  file.delete();
  const selected = selectionFile(directory);
  if (selected.exists && (await selected.text()).trim() === id) await writeSelection(directory, null);
}
