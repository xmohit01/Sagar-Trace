import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Marker,
  Circle,
  Polyline,
  Tooltip,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

function MapClickHandler({ setSelectedVessel }) {
  useMapEvents({
    click: () => {
      setSelectedVessel(null);
    }
  });

  return null;
}

function App() {

  const [time, setTime] = useState(0);

  // ── Coordinates: Arabian Sea near Mumbai coast (matching reference geography) ──
  // Origin: 19.2°N 70.0°E  |  Slick (T0): drifted NE to ~19.4°N 70.3°E
  const vesselPositions = {
    // Vessel A — top suspect; AT origin at T–6h
    A: {
      "-8": [19.1, 69.85],
      "-6": [19.2, 70.0],   // ← AT origin during release window
      "-4": [19.3, 70.15],
      "-2": [19.4, 70.3],
      "0":  [19.5, 70.45],
      "2":  [19.6, 70.6],
      "4":  [19.7, 70.75]
    },
    // Vessel B — secondary; passed nearby
    B: {
      "-8": [19.6, 70.2],
      "-6": [19.5, 70.1],
      "-4": [19.4, 70.05],
      "-2": [19.35, 70.15],
      "0":  [19.4, 70.3],
      "2":  [19.5, 70.5],
      "4":  [19.6, 70.7]
    },
    // Vessel C — low suspicion; approaching from NE
    C: {
      "-8": [20.5, 71.5],
      "-6": [20.35, 71.35],
      "-4": [20.2, 71.2],
      "-2": [20.05, 71.05],
      "0":  [19.9, 70.9],
      "2":  [19.75, 70.75],
      "4":  [19.6, 70.6]
    }
  };

  const vesselActiveTimes = {
    A: [-8, -6, -4, -2, 0, 2, 4],
    B: [-8, -6, -4, -2, 0, 2, 4],
    C: [-8, -6, -4, -2, 0, 2, 4]
  };

  const vesselData = {
    A: {
      "-8": { speed: 10.2, heading: 042, distance:  36 },
      "-6": { speed:  0.0, heading: 042, distance:   0 },  // stationary — AIS blackout
      "-4": { speed: 10.8, heading: 046, distance:  37 },
      "-2": { speed: 11.1, heading: 050, distance:  74 },
      "0":  { speed: 11.4, heading: 052, distance: 118 },
      "2":  { speed: 11.6, heading: 054, distance: 162 },
      "4":  { speed: 11.8, heading: 056, distance: 206 }
    },
    B: {
      "-8": { speed:  9.1, heading: 195, distance:  97 },
      "-6": { speed:  9.3, heading: 200, distance:  72 },
      "-4": { speed:  9.5, heading: 205, distance:  56 },
      "-2": { speed:  9.7, heading: 210, distance:  57 },
      "0":  { speed:  9.8, heading: 220, distance:  93 },
      "2":  { speed: 10.0, heading: 228, distance: 138 },
      "4":  { speed: 10.1, heading: 235, distance: 186 }
    },
    C: {
      "-8": { speed: 11.5, heading: 220, distance: 330 },
      "-6": { speed: 11.6, heading: 222, distance: 284 },
      "-4": { speed: 11.8, heading: 224, distance: 238 },
      "-2": { speed: 12.0, heading: 226, distance: 194 },
      "0":  { speed: 12.1, heading: 228, distance: 184 },
      "2":  { speed: 12.2, heading: 230, distance: 174 },
      "4":  { speed: 12.3, heading: 232, distance: 162 }
    }
  };

  const vesselEvidence = {
    A: {
      spatial: "Strong",
      time: "Strong",
      trajectory: "Strong",
      behaviour: "Moderate",
      integrity: "Review",
      reasons: [
        "Near probable origin at release time",
        "Within T-8h–T-4h release window",
        "Trajectory closely matches hindcast drift path",
        "2h AIS blackout during release window"
      ]
    },
    B: {
      spatial: "Moderate",
      time: "Moderate",
      trajectory: "Moderate",
      behaviour: "Moderate",
      integrity: "Clear",
      reasons: [
        "Moderate spatial proximity to origin",
        "Partial trajectory overlap with drift model",
        "Speed anomaly detected near release window"
      ]
    },
    C: {
      spatial: "Weak",
      time: "Weak",
      trajectory: "Weak",
      behaviour: "Weak",
      integrity: "Clear",
      reasons: [
        "More than 100 km from probable origin",
        "No trajectory overlap with drift model",
        "No AIS anomalies"
      ]
    }
  };

  // ── AIS Anomaly / Gap Detection data (Item 2) ─────────────────
  const aisAnomalies = {
    A: {
      gaps: [
        { from: "T‑6h", to: "T‑4h", duration: "2h", note: "Transponder switched off" }
      ],
      speedAnomalies: [
        { time: "T‑6h to T‑4h", observed: "0.0 kn", expected: "~10 kn", note: "Vessel stationary" }
      ],
      courseDeviations: [],
      integrityFlag: "SUSPICIOUS — AIS blackout during release window",
      flagColor: "#dc2626"
    },
    B: {
      gaps: [],
      speedAnomalies: [
        { time: "T‑3h", observed: "4.1 kn", expected: "~9.5 kn", note: "Significant speed reduction" }
      ],
      courseDeviations: [
        { time: "T‑2h", note: "12° deviation toward origin zone" }
      ],
      integrityFlag: "MONITOR — Speed and course anomalies",
      flagColor: "#f97316"
    },
    C: {
      gaps: [],
      speedAnomalies: [],
      courseDeviations: [],
      integrityFlag: "CLEAR — No anomalies detected",
      flagColor: "#16a34a"
    }
  };

  // ── Vessel Filter Pipeline data (Item 3) ──────────────────────
  const filterPipeline = [
    { stage: "AIS Raw Feed",       count: 247, note: "All vessels in 200 nm radius" },
    { stage: "Time Window Filter", count:  38, note: "Active T−12h → T+4h" },
    { stage: "Spatial Filter",     count:  12, note: "Within 150 km of origin" },
    { stage: "Trajectory Match",   count:   5, note: "Track crosses origin zone" },
    { stage: "Suspect Shortlist",  count:   3, note: "Spatio-temporal correlation ≥ threshold" }
  ];


  // Origin data — single source of truth for INVESTIGATION panel
  const originData = {
    lat: 19.2,
    lon: 70.0,
    confidence: 78,
    releaseStart: -8,
    releaseEnd: -4
  };

  // Distinct per-vessel track colors (also reinforce ranking visually)
  const vesselTrackColors = {
    A: "#f59e0b",   // amber  — top suspect
    B: "#3b82f6",   // blue   — secondary
    C: "#94a3b8"    // slate  — low suspicion
  };

  const getTrack = (vessel) => {
    const positions = vesselPositions[vessel];

    return Object.keys(positions)
      .map(Number)
      .filter((t) => t <= time)
      .sort((a, b) => a - b)
      .map((t) => positions[String(t)]);
  };

  const [showSlick, setShowSlick] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showDrift, setShowDrift] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);   // Item 5 — pipeline modal
  const selectedData = selectedVessel ? vesselData[selectedVessel][String(time)] : null;

  const getEvidenceClass = (value) => {
    if (value === "Strong") return "strong";
    if (value === "Moderate") return "moderate";
    if (value === "Weak") return "weak";
    if (value === "Review") return "review";
    if (value === "Clear") return "clear";

    return "";
  };
  const calculateSpatialMatch = (vessel) => {
    const position = vesselPositions[vessel][String(time)];

    const origin = [originData.lat, originData.lon];  // kept in sync with originData

    const latDiff = (position[0] - origin[0]) * 111;

    const lonDiff =
      (position[1] - origin[1]) *
      111 *
      Math.cos((origin[0] * Math.PI) / 180);

    const distance = Math.sqrt(
      latDiff * latDiff + lonDiff * lonDiff
    );

    if (distance <= 30) return "Strong";
    if (distance <= 80) return "Moderate";
    return "Weak";
  };
  const calculateTimeMatch = (vessel) => {
    const vesselTimes = vesselActiveTimes[vessel];

    const releaseStart = -8;
    const releaseEnd = -4;

    const hasActivityInWindow = vesselTimes.some(
      (t) => t >= releaseStart && t <= releaseEnd
    );

    if (hasActivityInWindow) return "Strong";

    const hasNearbyActivity = vesselTimes.some(
      (t) => t >= releaseStart - 2 && t <= releaseEnd + 2
    );

    if (hasNearbyActivity) return "Moderate";

    return "Weak";
  };
  // Converts a full evidence object into a numeric score (max 100)
  const calculateEvidenceScore = (evidence) => {
    if (!evidence) return 0;
    const points = { Strong: 20, Moderate: 12, Weak: 5, Review: 5, Clear: 20 };
    return (
      points[evidence.spatial] +
      points[evidence.time] +
      points[evidence.trajectory] +
      points[evidence.behaviour] +
      points[evidence.integrity]
    );
  };

  // ── Single source of truth for evidence ──────────────────────
  // Always applies dynamic spatial + time overrides for any vessel.
  // Both the ranked list and the evidence panel use this — they will never disagree.
  const getComputedEvidence = (vessel) => ({
    ...vesselEvidence[vessel],
    spatial:  calculateSpatialMatch(vessel),   // real-time distance to origin
    time:     calculateTimeMatch(vessel)        // activity vs release window
  });

  const getVesselScore   = (vessel) => calculateEvidenceScore(getComputedEvidence(vessel));
  const selectedEvidence = selectedVessel ? getComputedEvidence(selectedVessel) : null;
  const evidenceScore    = selectedVessel ? calculateEvidenceScore(selectedEvidence) : 0;

  const rankedVessels = ["A", "B", "C"]
    .map((vessel) => ({
      vessel,
      score: getVesselScore(vessel)
    }))
    .sort((a, b) => b.score - a.score);

  // ── Spill Geometry & Age ──────────────────────────────
  const spillData = {
    area:      42.6,         // km² from SAR polygon
    perimeter:  26.3,        // km
    length:     11.4,        // km (major axis)
    width:      5.8,         // km (minor axis)
    confidence: 91,      // % detection confidence
    satellite: "Sentinel-1 SAR",
    band: "C-Band (5.4 GHz)",
    releaseWindowStart: -8,  // hours relative to T0
    releaseWindowEnd: -4
  };

  // Age = how long ago the spill was released, relative to current investigation time
  const getSlickAge = () => {
    const minAge = Math.max(0, time - spillData.releaseWindowEnd);   // time + 4
    const maxAge = time - spillData.releaseWindowStart;              // time + 8
    if (maxAge <= 0) return "< 1h";
    if (minAge === 0) return `0\u2013${maxAge}h`;
    return `${minAge}\u2013${maxAge}h`;
  };

  const getAgeCategory = () => {
    const midAge = time + 6; // midpoint of release window (T-6h)
    if (midAge <= 2)  return { label: "Fresh",  color: "#dc2626" };
    if (midAge <= 6)  return { label: "Recent", color: "#f97316" };
    if (midAge <= 10) return { label: "Aging",  color: "#ca8a04" };
    return              { label: "Old",    color: "#78716c" };
  };

  // Age bar progress: 0% at T-8 (just formed), 100% at T+12
  const ageBarPct = Math.min(100, Math.max(0, ((time + 8) / 20) * 100));

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>SAGAR-TRACE</h1>
          <p>Evidence-Driven Maritime Oil Spill Attribution</p>
        </div>
        <div className="header-right">
          <button className="pipeline-btn" onClick={() => setShowPipeline(true)}>
            🔄 Pipeline
          </button>
          <div className="status">
            ● INVESTIGATION MODE
          </div>
        </div>
      </header>

      {/* ── Pipeline Modal (Item 5) ──────────────────────────── */}
      {showPipeline && (
        <div className="modal-overlay" onClick={() => setShowPipeline(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Automated Detection Pipeline</h2>
              <button className="modal-close" onClick={() => setShowPipeline(false)}>✕</button>
            </div>
            <p className="modal-sub">SIH26143 — NTRO — Space Technology</p>
            <div className="pipeline-steps">
              {[
                { icon: "🛠", label: "SAR / EO Input",      desc: "Sentinel-1 C-Band SAR image ingested",              status: "done" },
                { icon: "🧠", label: "Preprocessing",       desc: "Speckle filter, land masking, normalization",       status: "done" },
                { icon: "🟠", label: "Oil Detection",       desc: "ML classifier detects dark spots (CNN + threshold)", status: "done" },
                { icon: "🔵", label: "Geometry & Age",      desc: "Area, perimeter, age estimated via spectral model", status: "done" },
                { icon: "🌊", label: "Drift Modelling",     desc: "Lagrangian hindcast + forecast with HYCOM/ERA5",    status: "done" },
                { icon: "🛠", label: "AIS Correlation",     desc: "Historic AIS matched to origin window in space-time",status: "done" },
                { icon: "🎯", label: "Attribution Score",   desc: "Vessels ranked by spatio-temporal evidence score",  status: "done" }
              ].map((step, i, arr) => (
                <div key={i} className="pipeline-step">
                  <div className="pipeline-icon">{step.icon}</div>
                  <div className="pipeline-body">
                    <b>{step.label}</b>
                    <span>{step.desc}</span>
                  </div>
                  <div className="pipeline-status done">✓</div>
                  {i < arr.length - 1 && <div className="pipeline-arrow">↓</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="main">

        <aside className="sidebar">

          <h2>LAYERS</h2>
          <label className="toggle-label">
            <input type="checkbox" className="toggle-input" checked={showSlick}     onChange={(e) => setShowSlick(e.target.checked)} />
            <span className="toggle-switch"></span>
            <span className="toggle-layer-dot" style={{background:"#f97316"}}></span>
            Oil Slick
          </label>

          <label className="toggle-label">
            <input type="checkbox" className="toggle-input" checked={showVessels}   onChange={(e) => setShowVessels(e.target.checked)} />
            <span className="toggle-switch"></span>
            <span className="toggle-layer-dot" style={{background:"#f59e0b"}}></span>
            AIS Vessels
          </label>

          <label className="toggle-label">
            <input type="checkbox" className="toggle-input" checked={showDrift}     onChange={(e) => setShowDrift(e.target.checked)} />
            <span className="toggle-switch"></span>
            <span className="toggle-layer-dot" style={{background:"#2563eb"}}></span>
            Drift Path
          </label>

          <label className="toggle-label">
            <input type="checkbox" className="toggle-input" checked={showForecast}  onChange={(e) => setShowForecast(e.target.checked)} />
            <span className="toggle-switch"></span>
            <span className="toggle-layer-dot" style={{background:"#16a34a"}}></span>
            Forecast
          </label>

          <label className="toggle-label">
            <input type="checkbox" className="toggle-input" checked={showHistorical} onChange={(e) => setShowHistorical(e.target.checked)} />
            <span className="toggle-switch"></span>
            <span className="toggle-layer-dot" style={{background:"#94a3b8"}}></span>
            Historical AIS
          </label>

          <label className="toggle-label">
            <input type="checkbox" className="toggle-input" checked={showOrigin}    onChange={(e) => setShowOrigin(e.target.checked)} />
            <span className="toggle-switch"></span>
            <span className="toggle-layer-dot" style={{background:"#eab308"}}></span>
            Probable Origin
          </label>

          <hr />

          <h2>SPILL ANALYSIS</h2>

          <div className="spill-section">
            <div className="spill-stat">
              <span className="spill-label">🛰 Satellite</span>
              <span className="spill-value">{spillData.satellite}</span>
            </div>
            <div className="spill-stat">
              <span className="spill-label">📡 Band</span>
              <span className="spill-value">{spillData.band}</span>
            </div>
            <div className="spill-stat">
              <span className="spill-label">📐 Area</span>
              <span className="spill-value">{spillData.area} km²</span>
            </div>
            <div className="spill-stat">
              <span className="spill-label">📏 Perimeter</span>
              <span className="spill-value">{spillData.perimeter} km</span>
            </div>
            <div className="spill-stat">
              <span className="spill-label">↔ Est. Length</span>
              <span className="spill-value">{spillData.length} km</span>
            </div>
            <div className="spill-stat">
              <span className="spill-label">↕ Est. Width</span>
              <span className="spill-value">{spillData.width} km</span>
            </div>
            <div className="spill-stat">
              <span className="spill-label">🎯 Confidence</span>
              <span className="spill-value">{spillData.confidence}%</span>
            </div>
          </div>

          <div className="age-display">
            <div className="age-header">
              <span>⏱ Estimated Spill Age</span>
              <span
                className="age-badge"
                style={{ background: getAgeCategory().color }}
              >
                {getAgeCategory().label}
              </span>
            </div>
            <div className="age-value">{getSlickAge()}</div>
            <div className="age-bar">
              <div
                className="age-bar-fill"
                style={{
                  width: `${ageBarPct}%`,
                  background: getAgeCategory().color
                }}
              />
            </div>
            <div className="age-note">
              Release window: T{spillData.releaseWindowStart}h → T{spillData.releaseWindowEnd}h
            </div>
          </div>

          <hr />

          <h2>INVESTIGATION</h2>

          <div className="info-box">
            <span>Probable Origin</span>
            <strong>{originData.lat}°N, {originData.lon}°E</strong>
          </div>

          <div className="info-box">
            <span>Origin Confidence</span>
            <strong>{originData.confidence}%</strong>
          </div>

          <div className="info-box">
            <span>Release Window</span>
            <strong>T{originData.releaseStart}h → T{originData.releaseEnd}h</strong>
          </div>

          <hr />

          <h2>TOP VESSELS</h2>

          {rankedVessels.map((item, index) => (
            <div
              className="vessel"
              key={item.vessel}
              onClick={() => setSelectedVessel(item.vessel)}
              style={selectedVessel === item.vessel
                ? { background: "#eff6ff", borderColor: "#2563eb" }
                : {}}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={`vessel-rank rank-${index + 1}`}>#{index + 1}</span>
                <div>
                  <strong style={{ fontSize: "13px" }}>Vessel {item.vessel}</strong>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "1px" }}>
                    {item.vessel === "A" && "Spatial + Time + Trajectory"}
                    {item.vessel === "B" && "Partial Spatial + Speed Anomaly"}
                    {item.vessel === "C" && "Low correlation"}
                  </div>
                </div>
              </div>
              <b style={{ fontSize: "14px" }}>{item.score}%</b>
            </div>
          ))}

          <hr />

          <h2>EVIDENCE</h2>

          <div className="evidence">

            <div className={`evidence-item ${getEvidenceClass(selectedEvidence?.spatial)}`}>
              <span className="ev-icon">📍</span>
              <span>Spatial Match</span>
              <b>{selectedEvidence?.spatial ?? "—"}</b>
            </div>

            <div className={`evidence-item ${getEvidenceClass(selectedEvidence?.time)}`}>
              <span className="ev-icon">🕐</span>
              <span>Time Match</span>
              <b>{selectedEvidence?.time ?? "—"}</b>
            </div>

            <div className={`evidence-item ${getEvidenceClass(selectedEvidence?.trajectory)}`}>
              <span className="ev-icon">🛤</span>
              <span>Trajectory Match</span>
              <b>{selectedEvidence?.trajectory ?? "—"}</b>
            </div>

            <div className={`evidence-item ${getEvidenceClass(selectedEvidence?.behaviour)}`}>
              <span className="ev-icon">⚓</span>
              <span>Behaviour Match</span>
              <b>{selectedEvidence?.behaviour ?? "—"}</b>
            </div>

            <div className={`evidence-item ${getEvidenceClass(selectedEvidence?.integrity)}`}>
              <span className="ev-icon">📡</span>
              <span>AIS Integrity</span>
              <b>{selectedEvidence?.integrity ?? "—"}</b>
            </div>

          </div>
          {selectedVessel && (
            <div className="evidence-analysis">
              <h2>EVIDENCE ANALYSIS</h2>

              <p>
                <b>Selected Vessel:</b> Vessel {selectedVessel}
              </p>

              <p><b>Speed:</b> {selectedData?.speed} knots</p>
              <p><b>Heading:</b> {selectedData?.heading}°</p>
              <p><b>Distance from Origin:</b> {selectedData?.distance} km</p>



              <div className="score-section">
                <p><b>Evidence Score</b></p>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${evidenceScore}%` }}></div>
                </div>
                <p className="score-value">{evidenceScore}%</p>
              </div>

              {/* ── AIS Anomaly Panel (Item 2) ───────────────── */}
              {selectedVessel && aisAnomalies[selectedVessel] && (
                <div className="anomaly-panel">
                  <h3 className="anomaly-title">AIS ANOMALY REPORT</h3>
                  <div
                    className="anomaly-flag"
                    style={{ borderColor: aisAnomalies[selectedVessel].flagColor,
                             color:       aisAnomalies[selectedVessel].flagColor }}
                  >
                    {aisAnomalies[selectedVessel].integrityFlag}
                  </div>

                  {aisAnomalies[selectedVessel].gaps.length > 0 && (
                    <div className="anomaly-group">
                      <b>Signal Gaps</b>
                      {aisAnomalies[selectedVessel].gaps.map((g, i) => (
                        <div className="anomaly-row" key={i}>
                          <span className="anomaly-dot" style={{background:"#dc2626"}} />
                          {g.from} → {g.to} ({g.duration}) — {g.note}
                        </div>
                      ))}
                    </div>
                  )}

                  {aisAnomalies[selectedVessel].speedAnomalies.length > 0 && (
                    <div className="anomaly-group">
                      <b>Speed Anomalies</b>
                      {aisAnomalies[selectedVessel].speedAnomalies.map((s, i) => (
                        <div className="anomaly-row" key={i}>
                          <span className="anomaly-dot" style={{background:"#f97316"}} />
                          {s.time}: {s.observed} (expected {s.expected}) — {s.note}
                        </div>
                      ))}
                    </div>
                  )}

                  {aisAnomalies[selectedVessel].courseDeviations.length > 0 && (
                    <div className="anomaly-group">
                      <b>Course Deviations</b>
                      {aisAnomalies[selectedVessel].courseDeviations.map((c, i) => (
                        <div className="anomaly-row" key={i}>
                          <span className="anomaly-dot" style={{background:"#ca8a04"}} />
                          {c.time} — {c.note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="reason-codes">
                <p><b>Reason Codes</b></p>
                {selectedEvidence?.reasons?.map((reason, index) => (
                  <div className="reason-code" key={index}>• {reason}</div>
                ))}
              </div>
              <p><b>Assessment:</b> Candidate vessel requires investigator review.</p>
            </div>
          )}

          {/* ── Vessel Filter Pipeline Section (Item 3) ───────── */}
          <hr />
          <h2>VESSEL FILTER</h2>
          <div className="filter-pipeline">
            {filterPipeline.map((step, i) => (
              <div className="filter-step" key={i}>
                <div className="filter-bar">
                  <div
                    className="filter-fill"
                    style={{ width: `${(step.count / filterPipeline[0].count) * 100}%` }}
                  />
                </div>
                <div className="filter-info">
                  <span className="filter-stage">{step.stage}</span>
                  <span className="filter-count">{step.count}</span>
                </div>
                <div className="filter-note">{step.note}</div>
              </div>
            ))}
          </div>

        </aside>

        <main className="map-area">

          <MapContainer center={[19.5, 70.5]} zoom={7} className="map">

            <MapClickHandler setSelectedVessel={setSelectedVessel} />


            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Below code for Oil Slick */}
            {showSlick && (
              <Polygon
                positions={[
                  [19.35, 70.25],
                  [19.45, 70.28],
                  [19.48, 70.35],
                  [19.42, 70.38],
                  [19.38, 70.32]
                ]}
                pathOptions={{
                  color: "#dc2626",
                  fillColor: "#f97316",
                  fillOpacity: 0.65,
                  weight: 2
                }}
              >
                <Popup>
                  <div>
                    <h3>Oil Slick</h3>
                    <p><b>Detection:</b> Sentinel-1 SAR</p>
                    <p><b>Area:</b> 42.6 km²</p>
                    <p><b>Confidence:</b> 91%</p>
                    <p><b>Observed:</b> T0</p>
                    <p><b>Estimated Age:</b> 4–8 hours</p>
                  </div>
                </Popup>
              </Polygon>
            )}

            {showOrigin && (
              <>
                <Circle
                  center={[originData.lat, originData.lon]}
                  radius={25000}
                  pathOptions={{
                    color: "#eab308",
                    fillColor: "#facc15",
                    fillOpacity: 0.25,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div>
                      <h3>Probable Origin Region</h3>
                      <p><b>Confidence:</b> 78%</p>
                      <p><b>Release Window:</b> T-4h to T-8h</p>
                      <p><b>Method:</b> Lagrangian Backtracking</p>
                    </div>
                  </Popup>
                </Circle>

              </>
            )}


            {/* Below code for Backward Drift  */}
            {showDrift && (
              <Polyline
                positions={[
                  [19.1, 69.85],
                  [19.2, 70.0],
                  [19.3, 70.15],
                  [19.4, 70.3]
                ]}
                pathOptions={{
                  color: "#2563eb",
                  weight: 4,
                  dashArray: "8 8"
                }}
              >
                <Popup>
                  <div>
                    <h3>Backward Drift Path</h3>
                    <p><b>Simulation:</b> Lagrangian</p>
                    <p><b>Time Range:</b> T-8h → T0</p>
                    <p><b>Inputs:</b> Wind + Ocean Current</p>
                  </div>
                </Popup>
              </Polyline>
            )}

            {showVessels && (
              <>
                <Marker position={vesselPositions.A[String(time)]}
                  zIndexOffset={selectedVessel === "A" ? 1000 : 0}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();

                      setSelectedVessel(
                        selectedVessel === "A" ? null : "A"
                      );
                    }
                  }}>

                  <Tooltip>AIS Vessel A</Tooltip>

                  <Popup>
                    <div>
                      <h3>Vessel A</h3>
                      <p><b>MMSI:</b> 123456789</p>
                      <p><b>Speed:</b> {vesselData.A[String(time)].speed} knots</p>
                      <p><b>Heading:</b> {vesselData.A[String(time)].heading}°</p>
                      <p><b>Distance from Origin:</b> {vesselData.A[String(time)].distance} km</p>
                      <p><b>Evidence Score:</b><b>{getVesselScore("A")}%</b></p>
                    </div>
                  </Popup>
                </Marker>

                {selectedVessel === "A" && (
                  <Circle
                    center={vesselPositions.A[String(time)]}
                    radius={15000}
                    pathOptions={{
                      color: "#f59e0b",
                      fillColor: "#fbbf24",
                      fillOpacity: 0.25,
                      weight: 3
                    }}
                  />
                )}

                <Marker position={vesselPositions.B[String(time)]}
                  zIndexOffset={selectedVessel === "B" ? 1000 : 0}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();

                      setSelectedVessel(
                        selectedVessel === "B" ? null : "B"
                      );
                    }
                  }}>
                  <Tooltip>AIS Vessel B</Tooltip>

                  <Popup>
                    <div>
                      <h3>Vessel B</h3>
                      <p><b>MMSI:</b> 987654321</p>
                      <p><b>Speed:</b> {vesselData.B[String(time)].speed} knots</p>
                      <p><b>Heading:</b> {vesselData.B[String(time)].heading}°</p>
                      <p><b>Distance from Origin:</b> {vesselData.B[String(time)].distance} km</p>
                      <p><b>Evidence Score:</b><b>{getVesselScore("B")}%</b></p>
                    </div>
                  </Popup>
                </Marker>

                {selectedVessel === "B" && (
                  <Circle
                    center={vesselPositions.B[String(time)]}
                    radius={15000}
                    pathOptions={{
                      color: "#f59e0b",
                      fillColor: "#fbbf24",
                      fillOpacity: 0.25,
                      weight: 3
                    }}
                  />
                )}

                <Marker position={vesselPositions.C[String(time)]}
                  zIndexOffset={selectedVessel === "C" ? 1000 : 0}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();

                      setSelectedVessel(
                        selectedVessel === "C" ? null : "C"
                      );
                    }
                  }}>
                  <Tooltip>AIS Vessel C</Tooltip>

                  <Popup>
                    <div>
                      <h3>Vessel C</h3>
                      <p><b>MMSI:</b> 456789123</p>
                      <p><b>Speed:</b> {vesselData.C[String(time)].speed} knots</p>
                      <p><b>Heading:</b> {vesselData.C[String(time)].heading}°</p>
                      <p><b>Distance from Origin:</b> {vesselData.C[String(time)].distance} km</p>
                      <p><b>Evidence Score:</b><b>{getVesselScore("C")}%</b></p>
                    </div>
                  </Popup>
                </Marker>

                {selectedVessel === "C" && (
                  <Circle
                    center={vesselPositions.C[String(time)]}
                    radius={15000}
                    pathOptions={{
                      color: "#f59e0b",
                      fillColor: "#fbbf24",
                      fillOpacity: 0.25,
                      weight: 3
                    }}
                  />
                )}

              </>

            )}

            {showHistorical && (
              <>

                {/* Vessel A — amber (top suspect) */}
                <Polyline
                  positions={getTrack("A")}
                  pathOptions={{
                    color: vesselTrackColors.A,
                    weight: 2.5
                  }}
                >
                  <Popup>
                    <div>
                      <h3>Vessel A — AIS Track</h3>
                      <p><b>Period:</b> T-8h → T{time >= 0 ? `+${time}` : time}h</p>
                      <p><b>Source:</b> Historic AIS</p>
                      <p><b>Evidence Rank:</b> #1 Suspect</p>
                    </div>
                  </Popup>
                </Polyline>

                {/* Vessel B — blue (secondary) */}
                <Polyline
                  positions={getTrack("B")}
                  pathOptions={{
                    color: vesselTrackColors.B,
                    weight: 2.5
                  }}
                >
                  <Popup>
                    <div>
                      <h3>Vessel B — AIS Track</h3>
                      <p><b>Period:</b> T-2h → T{time >= 0 ? `+${time}` : time}h</p>
                      <p><b>Source:</b> Historic AIS</p>
                      <p><b>Evidence Rank:</b> #2 Suspect</p>
                    </div>
                  </Popup>
                </Polyline>

                {/* Vessel C — slate (low suspicion) */}
                <Polyline
                  positions={getTrack("C")}
                  pathOptions={{
                    color: vesselTrackColors.C,
                    weight: 2.5
                  }}
                >
                  <Popup>
                    <div>
                      <h3>Vessel C — AIS Track</h3>
                      <p><b>Period:</b> T0 → T{time >= 0 ? `+${time}` : time}h</p>
                      <p><b>Source:</b> Historic AIS</p>
                      <p><b>Evidence Rank:</b> #3 Suspect</p>
                    </div>
                  </Popup>
                </Polyline>

              </>
            )}


            {showForecast && (
              <>
                {/* Below code is for Forecast Forward Drift */}
                <Polyline
                  positions={[
                    [19.4, 70.3],
                    [19.5, 70.45],
                    [19.6, 70.6]
                  ]}
                  pathOptions={{
                    color: "#16a34a",
                    weight: 4,
                    dashArray: "6 6"
                  }}
                >
                  <Popup>
                    <div>
                      <h3>Forward Drift Forecast</h3>
                      <p><b>Forecast:</b> T0 → T+4h</p>
                      <p><b>Inputs:</b> Wind + Ocean Current</p>
                      <p><b>Method:</b> Lagrangian Simulation</p>
                    </div>
                  </Popup>
                </Polyline>

                {/* Below code is for Forecast con uncertainity region fro in future where oil slick moves probably */}
                <Circle
                  center={[19.6, 70.6]}
                  radius={30000}
                  pathOptions={{
                    color: "#16a34a",
                    fillColor: "#22c55e",
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: "6 6"
                  }}
                >
                  <Popup>
                    <div>
                      <h3>Forecast Uncertainty Region</h3>
                      <p><b>Forecast:</b> T0 → T+4h</p>
                      <p><b>Meaning:</b> Possible future slick region</p>
                      <p><b>Sources of Uncertainty:</b></p>
                      <ul>
                        <li>Wind variation</li>
                        <li>Ocean current uncertainty</li>
                        <li>Drift model uncertainty</li>
                      </ul>
                    </div>
                  </Popup>
                </Circle>

              </>
            )}

          </MapContainer>

        </main>

      </div>

      <div className="timeline">

        <span>T-8h</span>

        <input
          type="range"
          min="-8"
          max="4"
          step="2"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
        />

        <span>T+4h</span>

        <div className="time-label">
          Current Investigation Time:{" "}
          {time === 0 ? "T0" : time > 0 ? `T+${time}h` : `T${time}h`}
        </div>

      </div>

    </div>
  );
}

export default App;