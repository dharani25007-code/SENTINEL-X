import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Printer, X, FileText } from 'lucide-react'

export default function AuditReportModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const location = useLocation()
  const { user } = useAuth()

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  // Dynamic audit title based on active page route
  const getPageAuditTitle = () => {
    switch (location.pathname) {
      case '/analyze':
        return 'NLP FIELD REPORT INCIDENT TEXT EXTRACT AUDIT'
      case '/universe':
        return 'RISK UNIVERSE GRAPH DEPENDENCY & ASSET NETWORK AUDIT'
      case '/timeline':
        return 'SAFETY TIME MACHINE HISTORICAL PRECURSOR TRAJECTORY AUDIT'
      case '/simulator':
        return 'INTERVENTION SIMULATOR COUNTERFACTUAL BARRIER RELIABILITY AUDIT'
      case '/rules':
        return 'IOGP REPORT 459 LIFE-SAVING RULES COMPLIANCE AUDIT'
      case '/':
      default:
        return 'SENTINEL-X SAFETY INTELLIGENCE TELEMETRY COMMAND AUDIT'
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(2, 22, 79, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        className="modal-content-card print-report-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '0px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header Actions (Hidden during browser print / PDF export) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 24px',
            borderBottom: '1px solid #cbd5e1',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="#02164F" />
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: '#02164F',
                fontFamily: 'Times New Roman, serif'
              }}
            >
              STATUTORY HSSE AUDIT SHEET (OISD-156 / DGMS COMPLIANCE)
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#02164F',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '0px',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'Times New Roman, serif'
              }}
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '6px 10px',
                borderRadius: '0px',
                cursor: 'pointer',
                fontFamily: 'Times New Roman, serif'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Statutory Document Area */}
        <div
          id="printable-audit-area"
          style={{
            padding: '32px 36px',
            color: '#000000',
            background: '#ffffff',
            fontFamily: 'Times New Roman, serif'
          }}
        >
          {/* Letterhead Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #02164F',
              paddingBottom: 16,
              marginBottom: 20
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 1,
                  color: '#02164F',
                  textTransform: 'uppercase'
                }}
              >
                OIL INDIA LIMITED
              </div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 600, marginTop: 2 }}>
                Corporate Health, Safety & Environment Directorate • Duliajan, Assam
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                AUDIT REF: OIL/HSE/2026/SIF-PRECURSOR-0882 • STATUTORY OISD-156 COMPLIANCE
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #02164F',
                  color: '#02164F',
                  padding: '4px 10px',
                  borderRadius: 0,
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                AUTONOMOUS SIF INTELLIGENCE
              </span>
              <div style={{ fontSize: 11, color: '#334155', marginTop: 8 }}>
                DATE: <strong>{currentDate}</strong>
              </div>
            </div>
          </div>

          {/* Active Context Audit Sub-Title */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: '#02164F',
              marginBottom: 20,
              textTransform: 'uppercase'
            }}
          >
            DOCUMENT SCOPE: {getPageAuditTitle()} | ASSET: {user?.facility || 'Duliajan Central Complex'}
          </div>

          {/* Executive Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
              marginBottom: 24
            }}
          >
            <div
              style={{
                padding: 12,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderTop: '4px solid #F37022'
              }}
            >
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Field Observations
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#000000', margin: '4px 0' }}>
                147 Logs
              </div>
              <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                ↑ 12.4% Ingested this month
              </div>
            </div>

            <div
              style={{
                padding: 12,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderTop: '4px solid #F37022'
              }}
            >
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>
                SIF Precursors (PSIF)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#b91c1c', margin: '4px 0' }}>
                96 Precursors
              </div>
              <div style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600 }}>
                High Fatal Energy Potential
              </div>
            </div>

            <div
              style={{
                padding: 12,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderTop: '4px solid #02164F'
              }}
            >
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>
                Fleet Precursor Density
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#02164F', margin: '4px 0' }}>
                65.3%
              </div>
              <div style={{ fontSize: 11, color: '#475569' }}>
                Target Threshold: &lt; 15.0%
              </div>
            </div>
          </div>

          {/* Operational Precursor Matrix Table */}
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#02164F',
                marginBottom: 8,
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: 4
              }}
            >
              1. Upper Assam Operational Installations Precursor Matrix
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#000000', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Operational Facility</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Total Logs</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>SIF Precursors</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Precursor Density</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Primary High-Risk Activity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Duliajan Central Complex</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>54</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#b91c1c', fontWeight: 700 }}>47</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#b91c1c', fontWeight: 700 }}>87.0%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>High-Voltage LOTO Breakers</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Digboi Refinery Unit #2</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>46</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#b91c1c', fontWeight: 700 }}>38</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#b91c1c', fontWeight: 700 }}>82.6%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Hot Torch Cutting Near Condensate</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Moran Drilling Rig #4</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>38</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#c2410c', fontWeight: 700 }}>29</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#c2410c', fontWeight: 700 }}>76.3%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Suspended 3.5T Drill Tubulars</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Naharkatiya Gas Plant</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>31</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#c2410c', fontWeight: 700 }}>22</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#c2410c', fontWeight: 700 }}>71.0%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Nitrogen Purged Separator Entry</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Pipeline Pump Station 7</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>28</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#15803d', fontWeight: 700 }}>12</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#15803d', fontWeight: 700 }}>42.8%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>1200 PSI Hydrotest Flange Barriers</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Numaligarh Terminal</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>16</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#15803d', fontWeight: 700 }}>9</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#15803d', fontWeight: 700 }}>56.2%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Road Tanker Dispatch Logistics</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mandatory Statutory Interventions (OISD Directive) */}
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#02164F',
                marginBottom: 8,
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: 4
              }}
            >
              2. Mandatory Statutory Interventions (OISD Directive)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderLeft: '4px solid #b91c1c', borderTop: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                <strong>1. Immediate LOTO Isolation Sweep at Duliajan</strong>: Dispatched mandatory zero-energy verification protocols across all crude export pump stations.
              </div>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderLeft: '4px solid #b91c1c', borderTop: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                <strong>2. Continuous LEL Gas Monitoring at Digboi Unit #2</strong>: Prohibit all hot cutting within 10m of hydrocarbon drainage without multi-gas clearance tags.
              </div>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderLeft: '4px solid #c2410c', borderTop: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                <strong>3. Catline Cable NDT Inspection at Moran Rig #4</strong>: 100% magnetic particle testing on all rig-floor hoisting wire ropes prior to spudding next section.
              </div>
            </div>
          </div>

          {/* Official Sign-off Seal */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid #cbd5e1',
              paddingTop: 16
            }}
          >
            <div style={{ fontSize: 11, color: '#475569' }}>
              <div>Generated by <strong>SENTINEL-X AI/NLP Engine</strong></div>
              <div>Certified in compliance with Oil Mines Regulations &amp; OISD Guidelines</div>
              <div>Auditor Badge: <strong>{user?.badge || 'RB-88412'} ({user?.name || 'Rajesh Barua'})</strong></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#02164F' }}>
                [ DIGITALLY CERTIFIED ]
              </div>
              <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>
                Executive Director (HSE &amp; Asset Integrity)
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                Oil India Limited • Duliajan Headquarters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
