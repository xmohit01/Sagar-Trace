const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Get spill data
app.get('/api/spill', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM spill_data LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No spill data found' });
    }
    const row = result.rows[0];
    res.json({
      area: parseFloat(row.area),
      perimeter: parseFloat(row.perimeter),
      length: parseFloat(row.length),
      width: parseFloat(row.width),
      confidence: row.confidence,
      satellite: row.satellite,
      band: row.band,
      origin: {
        lat: parseFloat(row.origin_lat),
        lon: parseFloat(row.origin_lon),
        confidence: row.origin_confidence,
        releaseStart: row.release_start,
        releaseEnd: row.release_end
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vessels
app.get('/api/vessels', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vessels ORDER BY score DESC');
    const vessels = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      mmsi: row.mmsi,
      flag: row.flag,
      evidence: {
        spatialMatch: row.spatial_match,
        timeMatch: row.time_match,
        trajectoryMatch: row.trajectory_match,
        behaviorMatch: row.behavior_match,
        aisIntegrity: row.ais_integrity
      },
      score: row.score
    }));
    res.json(vessels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vessel positions
app.get('/api/positions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vessel_positions ORDER BY vessel_id, time_offset');
    
    // Group by vessel ID then by time
    const positions = {};
    const data = {};
    
    result.rows.forEach(row => {
      const vId = row.vessel_id;
      const t = row.time_offset.toString();
      
      if (!positions[vId]) positions[vId] = {};
      if (!data[vId]) data[vId] = {};
      
      positions[vId][t] = [parseFloat(row.lat), parseFloat(row.lon)];
      data[vId][t] = {
        speed: parseFloat(row.speed),
        heading: row.heading,
        distance: row.distance
      };
    });
    
    res.json({ positions, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
