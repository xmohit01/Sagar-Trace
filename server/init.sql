-- Drop tables if they exist to allow re-initialization
DROP TABLE IF EXISTS vessel_positions;
DROP TABLE IF EXISTS vessels;
DROP TABLE IF EXISTS spill_data;

CREATE TABLE spill_data (
    id SERIAL PRIMARY KEY,
    area NUMERIC,
    perimeter NUMERIC,
    length NUMERIC,
    width NUMERIC,
    confidence INTEGER,
    satellite VARCHAR(255),
    band VARCHAR(255),
    origin_lat NUMERIC,
    origin_lon NUMERIC,
    origin_confidence INTEGER,
    release_start INTEGER,
    release_end INTEGER
);

CREATE TABLE vessels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(255),
    mmsi VARCHAR(255),
    flag VARCHAR(255),
    spatial_match BOOLEAN,
    time_match BOOLEAN,
    trajectory_match BOOLEAN,
    behavior_match BOOLEAN,
    ais_integrity BOOLEAN,
    score INTEGER
);

CREATE TABLE vessel_positions (
    id SERIAL PRIMARY KEY,
    vessel_id VARCHAR(50) REFERENCES vessels(id),
    time_offset INTEGER,
    lat NUMERIC,
    lon NUMERIC,
    speed NUMERIC,
    heading INTEGER,
    distance INTEGER
);

-- Insert Spill Data
INSERT INTO spill_data (area, perimeter, length, width, confidence, satellite, band, origin_lat, origin_lon, origin_confidence, release_start, release_end)
VALUES (42.6, 26.3, 11.4, 5.8, 91, 'Sentinel-1 SAR', 'C-Band (5.4 GHz)', 19.2, 70.0, 78, -8, -4);

-- Insert Vessels
INSERT INTO vessels (id, name, type, mmsi, flag, spatial_match, time_match, trajectory_match, behavior_match, ais_integrity, score) VALUES
('A', 'MT FAIRWAY', 'Oil Tanker', '419000123', 'India', true, true, true, false, false, 80),
('B', 'MV HORIZON', 'Bulk Carrier', '636012456', 'Liberia', false, true, false, true, true, 40),
('C', 'FV SEA HAWK', 'Fishing', '412345678', 'China', false, false, false, true, true, 0);

-- Insert Vessel Positions (A)
INSERT INTO vessel_positions (vessel_id, time_offset, lat, lon, speed, heading, distance) VALUES
('A', -8, 19.1, 69.85, 10.2, 42, 36),
('A', -6, 19.2, 70.0, 0.0, 42, 0),
('A', -4, 19.3, 70.15, 10.8, 46, 37),
('A', -2, 19.4, 70.3, 11.1, 50, 74),
('A', 0, 19.5, 70.45, 11.4, 52, 118),
('A', 2, 19.6, 70.6, 11.6, 54, 162),
('A', 4, 19.7, 70.75, 11.8, 56, 206);

-- Insert Vessel Positions (B)
INSERT INTO vessel_positions (vessel_id, time_offset, lat, lon, speed, heading, distance) VALUES
('B', -8, 19.6, 70.2, 9.1, 195, 97),
('B', -6, 19.5, 70.1, 9.3, 200, 72),
('B', -4, 19.4, 70.05, 9.5, 205, 56),
('B', -2, 19.35, 70.15, 9.7, 210, 57),
('B', 0, 19.4, 70.3, 9.8, 220, 93),
('B', 2, 19.5, 70.5, 10.0, 228, 138),
('B', 4, 19.6, 70.7, 10.1, 235, 186);

-- Insert Vessel Positions (C)
INSERT INTO vessel_positions (vessel_id, time_offset, lat, lon, speed, heading, distance) VALUES
('C', -8, 20.5, 71.5, 11.5, 220, 330),
('C', -6, 20.35, 71.35, 11.6, 222, 284),
('C', -4, 20.2, 71.2, 11.8, 224, 238),
('C', -2, 20.05, 71.05, 12.0, 226, 194),
('C', 0, 19.9, 70.9, 12.1, 228, 184),
('C', 2, 19.75, 70.75, 12.2, 230, 174),
('C', 4, 19.6, 70.6, 12.3, 232, 162);
