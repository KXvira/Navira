from pathlib import Path
import ast
import sqlite3

source = Path('src/services/routeMigration.ts').read_text()
body = source.split('ROUTE_MIGRATION_2 = [', 1)[1].split('] as const', 1)[0]
statements = [ast.literal_eval(line.strip().rstrip(',')) for line in body.splitlines() if line.strip()]
assert len(statements) == 6

db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE routes (id TEXT PRIMARY KEY NOT NULL, name TEXT, status TEXT NOT NULL,
 pause_reason TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
 active_elapsed_ms INTEGER NOT NULL, active_since_ms INTEGER, segment_index INTEGER NOT NULL,
 point_count INTEGER NOT NULL, distance_meters REAL NOT NULL);
CREATE TABLE route_points (id INTEGER PRIMARY KEY AUTOINCREMENT, route_id TEXT NOT NULL,
 segment_index INTEGER NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL,
 altitude REAL, horizontal_accuracy REAL, captured_at INTEGER NOT NULL);
INSERT INTO routes VALUES ('old', 'Existing', 'saved', NULL, 100, 200, 300, NULL, 0, 1, 72.1);
INSERT INTO route_points (route_id, segment_index, latitude, longitude, altitude, horizontal_accuracy, captured_at)
 VALUES ('old', 0, 1, 2, NULL, 150, 100);
''')
with db:
    for statement in statements:
        db.execute(statement)
    db.execute('PRAGMA user_version = 2')
assert db.execute('PRAGMA user_version').fetchone()[0] == 2
route = db.execute('SELECT point_count, distance_meters, policy_version, distance_point_count, excluded_duration_ms FROM routes WHERE id = ?', ('old',)).fetchone()
point = db.execute('SELECT latitude, longitude, horizontal_accuracy, distance_status FROM route_points WHERE route_id = ?', ('old',)).fetchone()
assert route == (1, 72.1, 1, None, 0), route
assert point == (1.0, 2.0, 150.0, 'legacy'), point
assert db.execute('SELECT COUNT(*) FROM routes').fetchone()[0] == 1
