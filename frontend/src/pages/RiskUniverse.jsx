import { useState } from 'react'
import { Orbit, Sparkles, AlertTriangle, Shield, ArrowRight, Zap, Flame, Mountain, Box, Car, Building2, MapPin } from 'lucide-react'

const UNIVERSE_NODES = [
  { 
    id: 'center', 
    type: 'center', 
    label: '🏛️ OIL ASSAM HQ', 
    sub: 'Duliajan Surveillance Core', 
    x: 50, 
    y: 50, 
    size: 80, 
    color: 'var(--cyan-ai)',
    site: 'All 6 Oil India Assam Assets',
    activity: 'Centralized Precursor Telemetry',
    momentum: 'Surveillance Active (138 Records)',
    insight: 'Central surveillance hub tracking high-energy precursor convergence across all 6 Oil India operational assets in Upper Assam.'
  },
  { 
    id: 'duliajan', 
    type: 'critical', 
    label: '⚡ Duliajan Central Complex', 
    sub: 'Energy Isolation • 47 SIF Precursors', 
    x: 25, 
    y: 18, 
    size: 68, 
    color: 'var(--red-critical)', 
    site: 'Duliajan Central Complex', 
    activity: 'High-Voltage Electrical & Pump Isolation',
    momentum: '+31.4% (CRITICAL ACCELERATION)',
    insight: 'Recurring reports of technicians bypassing electrical LOTO breaker locks during crude export pump seal maintenance. 47 SIF precursors detected.'
  },
  { 
    id: 'digboi', 
    type: 'critical', 
    label: '🔥 Digboi Refinery Unit #2', 
    sub: 'Hot Work & Leaks • 38 SIF Precursors', 
    x: 75, 
    y: 18, 
    size: 64, 
    color: 'var(--red-critical)', 
    site: 'Digboi Refinery Unit #2', 
    activity: 'Torch Cutting Near Hydrocarbon Lines',
    momentum: '+18.2% (HIGH SEVERITY)',
    insight: 'Hot torch cutting observed within 2.5m of open condensate drainage with strong hydrocarbon smell. High risk of flammable vapor cloud ignition.'
  },
  { 
    id: 'moran', 
    type: 'warning', 
    label: '🏗️ Moran Drilling Rig #4', 
    sub: 'Suspended Tubulars • 29 Precursors', 
    x: 18, 
    y: 52, 
    size: 58, 
    color: 'var(--amber-warn)', 
    site: 'Moran Drilling Rig #4', 
    activity: 'Tripping & Heavy Tubular Hoisting',
    momentum: 'Steady (+4.1%)',
    insight: 'Roughnecks observed crossing red exclusion zones directly underneath suspended 3.5-ton drill pipe stands during tripping operations.'
  },
  { 
    id: 'naharkatiya', 
    type: 'warning', 
    label: '📦 Naharkatiya Gas Plant', 
    sub: 'Confined Space • 22 Precursors', 
    x: 82, 
    y: 52, 
    size: 56, 
    color: 'var(--amber-warn)', 
    site: 'Naharkatiya Gas Plant', 
    activity: 'Vessel Entry & Nitrogen Atmosphere',
    momentum: '+8.5% (ELEVATED)',
    insight: 'Contract personnel entered nitrogen-purged separator vessel without continuous atmospheric oxygen monitoring or active standby rescue attendant.'
  },
  { 
    id: 'pipeline', 
    type: 'simulated', 
    label: '🚰 Pipeline Pump Station 7', 
    sub: 'Hydrotesting • 12 Precursors', 
    x: 28, 
    y: 84, 
    size: 50, 
    color: 'var(--emerald-safe)', 
    site: 'Pipeline Pump Station 7', 
    activity: 'High-Pressure Transmission Lines',
    momentum: 'Controlled (-12.0%)',
    insight: '1200 PSI hydrostatic test flange barriers verified. Minor excavation soil shoring near-misses corrected immediately.'
  },
  { 
    id: 'numaligarh', 
    type: 'simulated', 
    label: '🚛 Numaligarh Terminal', 
    sub: 'Logistics • 9 Precursors', 
    x: 72, 
    y: 84, 
    size: 50, 
    color: 'var(--emerald-safe)', 
    site: 'Numaligarh Terminal', 
    activity: 'Bulk Crude Road Tanker Dispatch',
    momentum: 'Controlled (-18.4%)',
    insight: 'Road tanker speed governing protocols verified at terminal gantry. Bottom-loading arm emergency breakaway couplers fully certified.'
  },
]

export default function RiskUniverse() {
  const [selectedNode, setSelectedNode] = useState(UNIVERSE_NODES[1])

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <Orbit size={12} />
          <span>OIL INDIA LIMITED • 6 ASSAM ASSETS RISK UNIVERSE</span>
        </div>
        <h2>Assam Oilfields Risk Universe (Convergence Graph)</h2>
        <p>Interactive spatial topology showing how precursor chains converge across all 6 Oil India installations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
        {/* Interactive Universe Canvas */}
        <div className="universe-container">
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Draw Convergence Lines to Center */}
            <line x1="50%" y1="50%" x2="25%" y2="18%" stroke="rgba(255, 70, 85, 0.4)" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="75%" y2="18%" stroke="rgba(255, 70, 85, 0.4)" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="18%" y2="52%" stroke="rgba(255, 176, 32, 0.4)" strokeWidth="1.5" />
            <line x1="50%" y1="50%" x2="82%" y2="52%" stroke="rgba(255, 176, 32, 0.4)" strokeWidth="1.5" />
            <line x1="50%" y1="50%" x2="28%" y2="84%" stroke="rgba(39, 209, 127, 0.4)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="72%" y2="84%" stroke="rgba(39, 209, 127, 0.4)" strokeWidth="1" />
            {/* Cross Connection between High Risks */}
            <line x1="25%" y1="18%" x2="75%" y2="18%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1.5" strokeDasharray="2" />
          </svg>

          {UNIVERSE_NODES.map((node) => (
            <div
              key={node.id}
              className={`universe-node ${node.type}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                borderColor: selectedNode.id === node.id ? 'var(--cyan-ai)' : undefined,
                boxShadow: selectedNode.id === node.id ? '0 0 28px var(--cyan-glow)' : undefined,
              }}
              onClick={() => setSelectedNode(node)}
            >
              <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{node.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: node.color, marginTop: 4, whiteSpace: 'nowrap' }}>
                {node.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Precursor Intelligence Drawer */}
        {selectedNode && (
          <div className="card-elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span className="topic-pill" style={{ margin: 0 }}>FACILITY INTELLIGENCE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-ai)' }}>NODE #{selectedNode.id.toUpperCase()}</span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{selectedNode.label}</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: selectedNode.color, marginBottom: 18 }}>
              {selectedNode.sub}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--bg-deep)', borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Assam Operational Facility:</span>
                <strong style={{ color: 'var(--cyan-ai)' }}>{selectedNode.site}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>High-Risk Task Vector:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.activity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Precursor Momentum:</span>
                <strong style={{ color: selectedNode.color, fontFamily: 'var(--font-mono)' }}>{selectedNode.momentum}</strong>
              </div>
            </div>

            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Autonomous Safety Assessment
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 20 }}>
              "{selectedNode.insight}"
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <a href="/simulator" className="analyze-btn" style={{ textDecoration: 'none', textAlign: 'center', background: 'linear-gradient(135deg, var(--violet-sim), #7C3AED)', color: '#fff' }}>
                Simulate Safety Intervention →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
