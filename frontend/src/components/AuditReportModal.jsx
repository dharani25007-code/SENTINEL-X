import { useState } from 'react'
import { Printer, Download, X, ShieldCheck, Building2, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react'

export default function AuditReportModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 11, 14, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="modal-content-card print-report-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0B1C24',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Top Actions (Hidden during print) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(16, 40, 51, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="var(--cyan-ai)" />
            <span style={{ fontWeight: 800, fontSize: 13, color: '#E8F1F5', letterSpacing: 0.5 }}>
              STATUTORY HSSE AUDIT SHEET (OISD-156 / DGMS COMPLIANCE)
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, var(--cyan-ai), #0099BE)',
                color: '#050B0E',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Sheet */}
        <div id="printable-audit-area" style={{ padding: '32px 36px', color: '#E8F1F5', background: '#0B1C24' }}>
          
          {/* Official Letterhead */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--cyan-ai)',
            paddingBottom: 20,
            marginBottom: 24
          }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1.2, color: 'var(--cyan-ai)' }}>
                OIL INDIA LIMITED
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Corporate Health, Safety & Environment Directorate • Duliajan, Assam
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                AUDIT REF: OIL/HSE/2026/SIF-PRECURSOR-0882 • STATUTORY OISD-156 COMPLIANCE
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: 'rgba(33, 212, 253, 0.15)',
                border: '1px solid var(--cyan-ai)',
                color: 'var(--cyan-ai)',
                padding: '4px 10px',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700
              }}>
                AUTONOMOUS SIF INTELLIGENCE
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                DATE: <strong>{currentDate}</strong>
              </div>
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 24
          }}>
            <div style={{ padding: 14, background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fleet SIF Precursor Density</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red-critical)', fontFamily: 'var(--font-mono)' }}>59.4%</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>82 High-Energy Precursors / 138 Logs</div>
            </div>

            <div style={{ padding: 14, background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Most Critical Operational Asset</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--cyan-ai)' }}>Duliajan Central Complex</div>
              <div style={{ fontSize: 10.5, color: 'var(--red-critical)' }}>87.0% SIF Precursor Concentration</div>
            </div>

            <div style={{ padding: 14, background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Broken IOGP Safety Rule</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--amber-warn)' }}>⚡ Energy Isolation (LOTO)</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>47 Breaches Detected (Pumps & Breakers)</div>
            </div>
          </div>

          {/* 6 Assam Facilities Threat Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 10 }}>
              1. Upper Assam Operational Installations Precursor Matrix
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'rgba(16, 40, 51, 0.8)', color: 'var(--cyan-ai)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Operational Facility</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Total Logs</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>SIF Precursors</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Precursor Density</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Primary High-Risk Activity</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', color: '#E8F1F5', fontWeight: 600 }}>Duliajan Central Complex</td>
                  <td style={{ padding: '8px 12px' }}>54</td>
                  <td style={{ padding: '8px 12px', color: 'var(--red-critical)', fontWeight: 700 }}>47</td>
                  <td style={{ padding: '8px 12px', color: 'var(--red-critical)' }}>87.0%</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>High-Voltage LOTO Breakers</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', color: '#E8F1F5', fontWeight: 600 }}>Digboi Refinery Unit #2</td>
                  <td style={{ padding: '8px 12px' }}>46</td>
                  <td style={{ padding: '8px 12px', color: 'var(--red-critical)', fontWeight: 700 }}>38</td>
                  <td style={{ padding: '8px 12px', color: 'var(--red-critical)' }}>82.6%</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Hot Torch Cutting Near Condensate</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', color: '#E8F1F5', fontWeight: 600 }}>Moran Drilling Rig #4</td>
                  <td style={{ padding: '8px 12px' }}>38</td>
                  <td style={{ padding: '8px 12px', color: 'var(--amber-warn)', fontWeight: 700 }}>29</td>
                  <td style={{ padding: '8px 12px', color: 'var(--amber-warn)' }}>76.3%</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Suspended 3.5T Drill Tubulars</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', color: '#E8F1F5', fontWeight: 600 }}>Naharkatiya Gas Plant</td>
                  <td style={{ padding: '8px 12px' }}>31</td>
                  <td style={{ padding: '8px 12px', color: 'var(--amber-warn)', fontWeight: 700 }}>22</td>
                  <td style={{ padding: '8px 12px', color: 'var(--amber-warn)' }}>71.0%</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Nitrogen Purged Separator Entry</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', color: '#E8F1F5', fontWeight: 600 }}>Pipeline Pump Station 7</td>
                  <td style={{ padding: '8px 12px' }}>28</td>
                  <td style={{ padding: '8px 12px', color: 'var(--emerald-safe)', fontWeight: 700 }}>12</td>
                  <td style={{ padding: '8px 12px', color: 'var(--emerald-safe)' }}>42.8%</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>1200 PSI Hydrotest Flange Barriers</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', color: '#E8F1F5', fontWeight: 600 }}>Numaligarh Terminal</td>
                  <td style={{ padding: '8px 12px' }}>16</td>
                  <td style={{ padding: '8px 12px', color: 'var(--emerald-safe)', fontWeight: 700 }}>9</td>
                  <td style={{ padding: '8px 12px', color: 'var(--emerald-safe)' }}>56.2%</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Road Tanker Dispatch Logistics</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Directives & Corrective Actions */}
          <div style={{ marginBottom: 28 }}>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 10 }}>
              2. Mandatory Statutory Interventions (OISD Directive)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ padding: 10, background: 'var(--bg-deep)', borderRadius: 6, borderLeft: '3px solid var(--red-critical)' }}>
                <strong>1. Immediate LOTO Isolation Sweep at Duliajan</strong>: Dispatched mandatory zero-energy verification protocols across all crude export pump stations.
              </div>
              <div style={{ padding: 10, background: 'var(--bg-deep)', borderRadius: 6, borderLeft: '3px solid var(--red-critical)' }}>
                <strong>2. Continuous LEL Gas Monitoring at Digboi Unit #2</strong>: Prohibit all hot cutting within 10m of hydrocarbon drainage without multi-gas clearance tags.
              </div>
              <div style={{ padding: 10, background: 'var(--bg-deep)', borderRadius: 6, borderLeft: '3px solid var(--amber-warn)' }}>
                <strong>3. Catline Cable NDT Inspection at Moran Rig #4</strong>: 100% magnetic particle testing on all rig-floor hoisting wire ropes prior to spudding next section.
              </div>
            </div>
          </div>

          {/* Official Sign-off Seal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid var(--border-color)',
            paddingTop: 18
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <div>Generated by <strong>SENTINEL-X AI/NLP Engine</strong></div>
              <div>Certified in compliance with Oil Mines Regulations & OISD Guidelines</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--cyan-ai)' }}>
                [ DIGITALLY CERTIFIED ]
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Executive Director (HSE & Asset Integrity)
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Oil India Limited • Duliajan Headquarters
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
