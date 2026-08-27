import { useState } from 'react'
import { Orbit, Sparkles, AlertTriangle, Shield, ArrowRight, Zap, Flame, Mountain, Box, Car } from 'lucide-react'

const UNIVERSE_NODES = [
  { id: 'center', type: 'center', label: 'OIL SAFETY CORE', sub: 'Surveillance Hub', x: 45, y: 45, size: 80, color: 'var(--cyan-ai)' },
  { id: 'loto', type: 'critical', label: '⚡ Energy Isolation', sub: '47 SIF Precursors • +31% Momentum', x: 18, y: 22, size: 68, color: 'var(--red-critical)', site: 'Duliajan Complex', activity: 'Maintenance' },
  { id: 'hotwork', type: 'critical', label: '🔥 Hot Work Gas Release', sub: '38 SIF Precursors • +18% Momentum', x: 72, y: 20, size: 64, color: 'var(--red-critical)', site: 'Digboi Refinery', activity: 'Hot Work' },
  { id: 'lifting', type: 'warning', label: '🏗️ Suspended Load (Lifting)', sub: '29 Precursors • Steady', x: 20, y: 72, size: 58, color: 'var(--amber-warn)', site: 'Moran Rig #4', activity: 'Lifting' },
  { id: 'confined', type: 'warning', label: '📦 Confined Space Atmosphere', sub: '22 Precursors • +8% Momentum', x: 74, y: 70, size: 56, color: 'var(--amber-warn)', site: 'Naharkatiya Plant', activity: 'Tank Cleaning' },
  { id: 'driving', type: 'simulated', label: '🚗 Fleet Journey Risk', sub: '12 Precursors • Controlled', x: 46, y: 84, size: 50, color: 'var(--emerald-safe)', site: 'Pipeline Station 7', activity: 'Transport' },
]

export default function RiskUniverse() {
  const [selectedNode, setSelectedNode] = useState(UNIVERSE_NODES[1])

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <Orbit size={12} />
          <span>OIL INDIA LIMITED • RISK UNIVERSE</span>
        </div>
        <h2>Risk Universe (Convergence Graph)</h2>
        <p>Interactive multi-variable topology showing how precursor chains, facilities, and barrier failures converge</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
        {/* Interactive Universe Canvas */}
        <div className="universe-container">
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Draw Convergence Lines to Center */}
            <line x1="45%" y1="45%" x2="25%" y2="28%" stroke="rgba(255, 70, 85, 0.4)" strokeWidth="2" strokeDasharray="4" />
            <line x1="45%" y1="45%" x2="72%" y2="25%" stroke="rgba(255, 70, 85, 0.4)" strokeWidth="2" strokeDasharray="4" />
            <line x1="45%" y1="45%" x2="25%" y2="72%" stroke="rgba(255, 176, 32, 0.4)" strokeWidth="1.5" />
            <line x1="45%" y1="45%" x2="72%" y2="70%" stroke="rgba(255, 176, 32, 0.4)" strokeWidth="1.5" />
            <line x1="45%" y1="45%" x2="48%" y2="82%" stroke="rgba(39, 209, 127, 0.4)" strokeWidth="1" />
            {/* Cross Connection between High Risks */}
            <line x1="25%" y1="28%" x2="72%" y2="25%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1.5" strokeDasharray="2" />
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
              <div style={{ fontSize: 13, fontWeight: 800, color: '#E8F1F5' }}>{node.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: node.color, marginTop: 4 }}>
                {node.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Precursor Intelligence Drawer */}
        {selectedNode && (
          <div className="card-elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span className="topic-pill" style={{ margin: 0 }}>PRECURSOR INTELLIGENCE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-ai)' }}>NODE #{selectedNode.id.toUpperCase()}</span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#E8F1F5', marginBottom: 6 }}>{selectedNode.label}</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: selectedNode.color, marginBottom: 18 }}>
              {selectedNode.sub}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: 'var(--bg-deep)', borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Operational Facility:</span>
                <strong style={{ color: 'var(--cyan-ai)' }}>{selectedNode.site || 'Multi-Asset'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>High-Risk Task Vector:</span>
                <strong style={{ color: '#E8F1F5' }}>{selectedNode.activity || 'Surveillance Telemetry'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Acceleration Momentum:</span>
                <strong style={{ color: 'var(--red-critical)', fontFamily: 'var(--font-mono)' }}>+31.4% (ACCELERATING)</strong>
              </div>
            </div>

            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Autonomous Safety Insight
            </h4>
            <p style={{ fontSize: 13.5, color: '#E8F1F5', lineHeight: 1.6, marginBottom: 20 }}>
              "Multiple near-miss observations report workers bypassing positive physical isolation on pumps during shift handovers at {selectedNode.site || 'OIL facilities'}. This chain indicates an imminent fatal energy release pathway."
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <a href="/simulator" className="analyze-btn" style={{ textDecoration: 'none', textAlign: 'center', background: 'linear-gradient(135deg, var(--violet-sim), #7C3AED)', color: '#fff' }}>
                Simulate Intervention →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
