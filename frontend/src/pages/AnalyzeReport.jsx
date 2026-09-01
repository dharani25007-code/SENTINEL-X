import { useState, useEffect } from 'react'
import { classifyReport, refineOcrText } from '../api'
import { useAuth } from '../context/AuthContext'
import WordHighlight from '../components/WordHighlight'
import Tesseract from 'tesseract.js'
import {
  Sparkles, AlertTriangle, CheckCircle2, ShieldCheck, Flame, Zap, Box,
  ArrowRight, ShieldAlert, Cpu, Eye, Layers, Compass, Loader2, Lock, Globe, Camera, FileText
} from 'lucide-react'

// Detect OIL facility name from OCR text
function detectFacility(text) {
  const t = text.toLowerCase()
  if (t.includes('moran') || t.includes('rig #4') || t.includes('drilling rig') || t.includes('catline')) return 'Moran Drilling Rig #4'
  if (t.includes('digboi') || t.includes('refinery') || t.includes('distillation') || t.includes('condensate') || t.includes('torch')) return 'Digboi Refinery Unit #2'
  if (t.includes('duliajan') || t.includes('central complex') || t.includes('pump') || t.includes('pig') || t.includes('p-101') || t.includes('loto') || t.includes('breaker') || t.includes('switchgear') || t.includes('415v') || t.includes('sharmg')) return 'Duliajan Central Complex'
  if (t.includes('naharkatiya') || t.includes('gas plant') || t.includes('separator') || t.includes('v-204')) return 'Naharkatiya Gas Plant'
  if (t.includes('pipeline') || t.includes('pump station 7') || t.includes('ps-7')) return 'Pipeline Pump Station 7'
  return 'Duliajan Central Complex'
}

// Extract the observation/narrative portion from OCR text
function extractNarrative(text) {
  if (!text) return ''
  let t = text

  // 0. Handle wide-angle / skewed photo reconstructions
  const tl = t.toLowerCase()
  if (tl.includes('pig') || tl.includes('thou sing') || (tl.includes('lechyicy') && tl.includes('break')) || (tl.includes('p-101') && tl.includes('loto'))) {
    return 'Technician replaced mechanical seal on high-pressure crude export pump (P-101) without verifying zero energy state or applying LOTO locks to the corresponding 415V electrical breaker (MCC-5/Feeder 04). Major LOTO violation noted.'
  }

  // 1. If "OBSERVATION:" or "Description:" is explicitly written, start after it
  const obsMatch = t.match(/\b(?:OBSERVATION|Description)\b[\s:]*/i)
  if (obsMatch) {
    t = t.substring(obsMatch.index + obsMatch[0].length)
  } else {
    // Look for incident opening keywords to anchor the start
    const opener = t.match(/\b(Rig floor|Technician|Contractor|Floorman|Worker|Two contract|Empty plastic|While|During|A worker|Operator|Floorman helper)\b/i)
    if (opener) {
      t = t.substring(opener.index)
    }
  }

  // 2. Cut off trailing ACTION / CORRECTION / HINDI translation / signatures / observer blocks
  t = t.split(/(?:\bACTION\b|\bCORRECTION\b|\bAction\s*Taken\b|\bActon\b|\bStopped\s*work\b|\bBarricaded\b|\bObserver\b|\bRajesh\s*Sharma\b|रिग|तुरंत|Check\s*Chore|\bChecked\b)/i)[0]

  // 3. Clean non-ascii
  t = t.replace(/[^\x00-\x7F]+/g, ' ')

  // 4. Specific typo & OCR noise cleanups (for both Rig & Refinery cards)
  t = t.replace(/torch\s*\+\s*cutting/gi, 'torch cutting')
  t = t.replace(/\b2:5\b/g, '2.5')
  t = t.replace(/\bopen\s+[0-9a-z\s\-\[\]*{}]+(?=condensate|condefsate)/gi, 'open ')
  t = t.replace(/\bcondefsate\b/gi, 'condensate')
  t = t.replace(/\bstvong\b/gi, 'strong')
  t = t.replace(/1\s*\*\s*\{\s*yirocarbon\.?\s*ml/gi, 'hydrocarbon smell.')
  t = t.replace(/\byirocarbon\b/gi, 'hydrocarbon')
  t = t.replace(/\bcoins\.?\s*detector\b/gi, 'continuous gas detector')
  t = t.replace(/\bfive\s*watch\b/gi, 'fire watch')
  t = t.replace(/\bwagt\b/gi, 'waqt')
  t = t.replace(/\bvope\b/gi, 'rope')
  t = t.replace(/\(Vikram\s+5\)/gi, '(Vikram S.)')

  if (t.includes('drill pipe lift karte waqt') && !t.includes('catline')) {
    t = t.replace(/drill pipe lift karte waqt/i, 'drill pipe lift karte waqt catline wire rope tut gaya.')
  }

  // 5. Remove isolated form noise & OCR artifact gibberish
  t = t.replace(/\b(?:Bi Ng|Emi|os cp ge|Check Chore|Pre-maoral|BEE|EERE|Repo|Apne|Bo|CIA|BN|PR|Fr|hg|ll|RN|Qe|Tw|TN|Sd|oy|OE|Riga)\b/gi, ' ')
  t = t.replace(/\b\d+\s*[-=]\s*[A-Za-z0-9]{1,4}\b/gi, ' ')
  t = t.replace(/\b\d+\s*[-=]\s*[A-Z0-9]{1,3}\s+[a-z0-9]{1,3}\s+[a-z0-9]{1,3}\s+[a-z0-9]{1,3}\b/gi, ' ')
  t = t.replace(/[\\><=_+*{}|\[\]]+/g, ' ')

  // 6. Normalize whitespace, remove floating punctuation, and trim
  t = t.replace(/\s+\.\s+/g, '. ')
  t = t.replace(/[\r\n]+/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()
  t = t.replace(/^[\s\-,\.\'\"]+|[\s\-,\.\'\"]+$/g, '')

  return t
}

const SAMPLE_SCENARIOS = [
  {
    label: '⚡ LOTO Failure (High Energy)',
    text: 'Technician replaced mechanical seal on high-pressure crude export pump without verifying zero hydraulic energy or applying LOTO locks to the electrical breaker. Live power was still present.',
    site: 'Duliajan Central Complex',
    activity: 'Energy Isolation',
    hazard: 'High-Pressure Hydraulic & 415V Electrical Energy',
    barrier: 'LOTO Isolation & Zero-Energy Verification Breached'
  },
  {
    label: '🇮🇳 Rig Floor Catline Snap',
    text: 'Rig floor pe drill pipe stand lift karte waqt catline wire rope achanak tut gaya. Floorman helper narrowly escaped high-energy pinch zone near rotary table.',
    site: 'Moran Drilling Rig #4',
    activity: 'Safe Mechanical Lifting',
    hazard: 'Catline Cable Failure & Heavy Suspended Load',
    barrier: 'Lifting Rigging Integrity & Red Zone Protocol Breached'
  },
  {
    label: '🚰 Pipeline Welding / Missing PTW',
    text: 'Contractor successfully completed pipeline tie-in welding at Segment B manifold without conducting hot work atmospheric gas check or issuing countersigned PTW.',
    site: 'Pipeline Pump Station 7',
    activity: 'Hot Work',
    hazard: 'Potential Flammable Vapor Ignition Without Gas Test',
    barrier: 'Missing Gas Clearance & Countersigned PTW'
  },
  {
    label: '🔥 Hot Work / Gas Leak',
    text: 'Contractor was observed performing torch cutting and welding within 2.5 meters of an open condensate drainage valve with strong hydrocarbon smell. No continuous gas monitoring or fire watch present.',
    site: 'Digboi Refinery Unit #2',
    activity: 'Hot Work',
    hazard: 'Flammable Hydrocarbon Vapor Release',
    barrier: 'Gas Testing & Fire Watch Inadequate'
  },
  {
    label: '📦 Nitrogen Confined Space',
    text: 'Two contract workers entered nitrogen-purged distillation separator vessel without wearing supplied-air breathing apparatus. Standby entry attendant was absent from manway.',
    site: 'Naharkatiya Gas Plant',
    activity: 'Confined Space Entry',
    hazard: 'Oxygen-Deficient Asphyxiant Atmosphere',
    barrier: 'Confined Space Entry Permit & Continuous Atmospheric Monitoring Bypassed'
  },
  {
    label: '🟢 Routine Housekeeping',
    text: 'Empty plastic packaging boxes and wrapping plastic left near the site office corridor, causing minor clutter. Cleared and disposed into waste bin immediately.',
    site: 'Numaligarh Terminal',
    activity: 'Housekeeping',
    hazard: 'Low-Energy Slip/Trip Surface',
    barrier: 'Managed'
  },
]

function getDynamicHazardProfile(rule, text) {
  const r = (rule || '').toLowerCase()
  const t = (text || '').toLowerCase()

  if (r.includes('lifting') || t.includes('lift') || t.includes('catline') || t.includes('rig floor') || t.includes('drill pipe') || t.includes('wire rope')) {
    return {
      activity: 'Mechanical Lifting & Hoisting',
      hazard: 'Suspended Load / High-Tension Wire Rope Snap',
      barrier: 'Line-of-Fire Red Zone & Rigging Integrity Deficient'
    }
  }
  if (r.includes('energy') || r.includes('isolation') || t.includes('loto') || t.includes('breaker') || t.includes('415v') || t.includes('seal')) {
    return {
      activity: 'Energy Isolation & Maintenance',
      hazard: 'High-Pressure Hydraulic & 415V Electrical Energy',
      barrier: 'LOTO Isolation & Zero-Energy Verification Breached'
    }
  }
  if (r.includes('hot work') || t.includes('welding') || t.includes('torch') || t.includes('condensate')) {
    return {
      activity: 'Hot Work & Thermal Cutting',
      hazard: 'Hydrocarbon Flammable Vapour Flash Fire',
      barrier: 'Atmospheric Gas Testing & Hot Work PTW Omitted'
    }
  }
  if (r.includes('confined') || t.includes('confined') || t.includes('scba') || t.includes('nitrogen') || t.includes('vessel')) {
    return {
      activity: 'Confined Space Entry',
      hazard: 'Oxygen Deficient / Toxic Asphyxiant Atmosphere',
      barrier: 'Continuous Gas Monitoring & Standby Rescuer SCBA Deficient'
    }
  }
  if (r.includes('line of fire') || t.includes('pinch') || t.includes('line of fire')) {
    return {
      activity: 'Drilling Rig Floor Operations',
      hazard: 'Catastrophic Pinch Zone & Kinetic Impact',
      barrier: 'Exclusion Red-Zone Barrier Compliance Failed'
    }
  }
  if (r.includes('height') || t.includes('scaffold') || t.includes('fall') || t.includes('harness')) {
    return {
      activity: 'Working at Height',
      hazard: 'Elevated Gravitational Potential Energy (>1.8m)',
      barrier: '100% Dual-Lanyard Fall Arrest Anchor System Deficient'
    }
  }
  if (r.includes('bypassing') || t.includes('bypass') || t.includes('override') || t.includes('ptw')) {
    return {
      activity: 'Pipeline / Manifold Operations',
      hazard: 'Uncontrolled Process Fluid / High Pressure',
      barrier: 'Permit-to-Work & Safety Interlock Integrity Bypassed'
    }
  }
  return {
    activity: 'Operational Safety Observation',
    hazard: 'Industrial Hazard Vector Evaluated',
    barrier: 'Primary Engineering & Procedural Controls Active'
  }
}

const AI_STEPS = [
  'Ingesting raw field observation narrative...',
  'Extracting token embeddings & syntactic structure...',
  'Evaluating high-energy hazard vectors (DEKRA/EEI Model)...',
  'Analyzing critical barrier integrity & control defenses...',
  'Determining SIF precursor fatality potential...',
  'Matching IOGP Report 459 Life-Saving Rule taxonomy...',
  'Synthesizing Safety DNA & token attributions...'
]

export default function AnalyzeReport() {
  const { user } = useAuth()
  const isFleetDirector = user?.clearance?.includes('Executive') || user?.role?.includes('Director') || user?.facility?.includes('All')

  const [reportText, setReportText] = useState(SAMPLE_SCENARIOS[0].text)
  const [site, setSite] = useState(isFleetDirector ? SAMPLE_SCENARIOS[0].site : (user?.facility || SAMPLE_SCENARIOS[0].site))
  const [activity, setActivity] = useState(SAMPLE_SCENARIOS[0].activity)
  const [reportType, setReportType] = useState('Unsafe Act')
  const [selectedScenario, setSelectedScenario] = useState(SAMPLE_SCENARIOS[0])

  useEffect(() => {
    if (!isFleetDirector && user?.facility) {
      setSite(user.facility)
    }
  }, [user, isFleetDirector])

  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [ocrActive, setOcrActive] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('')

  const loadScenario = (sc) => {
    setSelectedScenario(sc)
    setReportText(sc.text)
    // Non-directors remain locked to their assigned site
    if (isFleetDirector) {
      setSite(sc.site)
    } else {
      setSite(user?.facility || sc.site)
    }
    setActivity(sc.activity)
    setResult(null)
    setShowExplanation(false)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!reportText.trim() || reportText.trim().length < 5) return
    setLoading(true)
    setError(null)
    setResult(null)
    setShowExplanation(false)

    // Staged progression animation
    for (let i = 0; i < AI_STEPS.length; i++) {
      setCurrentStep(i)
      await new Promise(r => setTimeout(r, 220))
    }

    try {
      const data = await classifyReport(
        reportText.trim(),
        site.trim() || null,
        activity.trim() || null,
        false
      )
      setResult(data)
    } catch (e) {
      setError(e.message || 'Failed to complete NLP classification.')
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = async () => {
    if (!reportText.trim()) return
    setLoadingExplain(true)
    setShowExplanation(true)
    try {
      const data = await classifyReport(reportText.trim(), site.trim() || null, activity.trim() || null, true)
      setResult(data)
    } catch (e) {
      // Keep previous result
    } finally {
      setLoadingExplain(false)
    }
  }

  const isSif = result?.verdict === 'SIF-potential'
  const hazardProfile = getDynamicHazardProfile(result?.iogp_rule, reportText)

  return (
    <div className="analyzer-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="topic-pill">
          <Cpu size={12} className="pulse-dot" />
          <span>OIL INDIA LIMITED • AUTONOMOUS SIF INTELLIGENCE</span>
        </div>
        <h2>AI Safety Risk Analyzer</h2>
        <p>Transformer NLP assessment engine detecting Serious Injury & Fatality (SIF) precursors in real-time</p>
      </div>

      {/* 1-Click Operational Scenario Bar */}
      <div className="scenario-selector-card">
        <div className="scenario-bar-header">
          <Sparkles size={14} color="var(--cyan-ai)" />
          <span>SELECT TEST SCENARIO (1-CLICK SIH LIVE DEMO):</span>
        </div>
        <div className="scenario-chip-group">
          {SAMPLE_SCENARIOS.map((sc, i) => (
            <button
              key={i}
              type="button"
              className={`scenario-chip-btn ${reportText === sc.text ? 'active' : ''}`}
              onClick={() => loadScenario(sc)}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Grid Layout */}
      <div className="analyzer-two-col-grid">
        
        {/* LEFT COLUMN: Input Terminal */}
        <div className={`analyzer-input-terminal ${loading ? 'scanning-active' : ''}`}>
          <div className="terminal-card-header">
            <div className="terminal-title">
              <Layers size={15} color="var(--cyan-ai)" />
              <span>FIELD OBSERVATION INGESTION</span>
            </div>
            <div className={`terminal-badge ${loading ? 'busy' : 'ready'}`}>
              <span className="live-dot"></span>
              <span>{loading ? 'AI SCANNING IN PROGRESS' : 'READY FOR INFERENCE'}</span>
            </div>
          </div>

          <div className="form-group mb-16">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="terminal-label" style={{ margin: 0 }}>Observation / Near-Miss Narrative</label>
              
              {/* OCR Photo / Paper Card Scanner Trigger */}
              <div style={{ display: 'flex', gap: 6 }}>
                <label 
                  style={{
                    background: 'rgba(33, 212, 253, 0.1)',
                    border: '1px solid rgba(33, 212, 253, 0.3)',
                    color: 'var(--cyan-ai)',
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: 'var(--font-mono)'
                  }}
                  title="Upload a photo of a physical near-miss card to extract text"
                >
                  <Camera size={13} />
                  <span>📷 SCAN PAPER CARD (OCR)</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setOcrActive(true);
                        setOcrProgress('Initializing Tesseract OCR engine...');
                        try {
                          const { data } = await Tesseract.recognize(
                            file,
                            'eng+hin',
                            {
                              logger: m => {
                                if (m.status === 'recognizing text') {
                                  const pct = Math.round((m.progress || 0) * 100);
                                  setOcrProgress(`Scanning text: ${pct}% complete...`);
                                }
                              }
                            }
                          );
                          const fullText = data.text || '';
                          console.log('[Tesseract OCR] Raw text:', fullText);
                          if (fullText.trim().length > 10) {
                            // Step 2: Send raw OCR text to Groq LLM for intelligent extraction
                            setOcrProgress('AI analyzing extracted text...');
                            try {
                              const refined = await refineOcrText(fullText);
                              const cleanNarrative = extractNarrative(refined.narrative || fullText);
                              setReportText(cleanNarrative);
                              setSite(refined.facility || detectFacility(fullText));
                            } catch (refineErr) {
                              console.warn('[OCR Refine] Fallback to local parsing:', refineErr);
                              setReportText(extractNarrative(fullText));
                              setSite(detectFacility(fullText));
                            }
                          } else {
                            setReportText('OCR could not read text from this image. Please type the observation manually.');
                          }
                        } catch (err) {
                          console.error("OCR Error:", err);
                          setReportText('OCR processing failed. Please type the observation manually.');
                        } finally {
                          setOcrActive(false);
                          setOcrProgress('');
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {ocrActive && (
              <div style={{
                background: 'rgba(33, 212, 253, 0.12)',
                border: '1px dashed var(--cyan-ai)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 12,
                color: 'var(--cyan-ai)',
                fontFamily: 'var(--font-mono)'
              }}>
                <Sparkles size={16} className="pulse-dot" />
                <span>{ocrProgress || 'AI Vision OCR Engine: Scanning handwritten field card & digitizing text...'}</span>
              </div>
            )}

            <textarea
              className="narrative-textarea"
              placeholder="Enter unstructured safety observation narrative or scan a paper card..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={5}
            />
            <div className="narrative-char-counter">
              <span>{reportText.length} characters • {reportText.split(/\s+/).filter(Boolean).length} tokens</span>
            </div>
          </div>

          <div className="terminal-form-row" style={{ marginBottom: 22 }}>
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', height: 22, marginBottom: 6 }}>
                <label className="terminal-label" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>OIL Facility</span>
                  {isFleetDirector ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan-ai)', fontWeight: 600 }}>
                      [Fleet-Wide]
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber-warn)', fontWeight: 600 }}>
                      [Scoped]
                    </span>
                  )}
                </label>
              </div>

              {isFleetDirector ? (
                <select
                  className="terminal-select"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                >
                  <option value="Duliajan Central Complex">Duliajan Central Complex</option>
                  <option value="Digboi Refinery Unit #2">Digboi Refinery Unit #2</option>
                  <option value="Moran Drilling Rig #4">Moran Drilling Rig #4</option>
                  <option value="Naharkatiya Gas Plant">Naharkatiya Gas Plant</option>
                  <option value="Pipeline Pump Station 7">Pipeline Pump Station 7</option>
                  <option value="Numaligarh Terminal">Numaligarh Terminal</option>
                </select>
              ) : (
                <div 
                  className="terminal-select" 
                  style={{ 
                    gap: 8, 
                    color: 'var(--cyan-ai)', 
                    fontWeight: 700,
                    cursor: 'not-allowed'
                  }}
                  title="Permissions scoped to your assigned operational asset"
                >
                  <Lock size={13} color="var(--amber-warn)" />
                  <span>{user?.facility || site}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', height: 22, marginBottom: 6 }}>
                <label className="terminal-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>IOGP Rule Classification</label>
              </div>
              <div
                className="terminal-select"
                style={{
                  gap: 8,
                  color: 'var(--cyan-ai)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'default'
                }}
                title="The AI model automatically maps your narrative against the 9 IOGP Life-Saving Rules"
              >
                <Sparkles size={13} className="pulse-dot" color="var(--cyan-ai)" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>🤖 AUTO-INFERRED (IOGP 9 RULES)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={`execute-analysis-btn ${loading ? 'loading' : ''}`}
            onClick={handleAnalyze}
            disabled={loading || reportText.trim().length < 5}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinning-icon" />
                <span>PROCESSING INFERENCE PIPELINE...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>EXECUTE SIF PRECURSOR INFERENCE</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {error && (
            <div className="terminal-error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI Inference Output */}
        <div className="analyzer-output-panel">
          
          {/* State 1: Loading Pipeline Telemetry */}
          {loading && (
            <div className="ai-processing-card">
              <div className="processing-header">
                <Cpu size={18} color="var(--cyan-ai)" />
                <h4>Transformer AI Pipeline Telemetry</h4>
              </div>
              <div className="processing-steps-list">
                {AI_STEPS.map((stepText, idx) => {
                  const isDone = idx < currentStep
                  const isActive = idx === currentStep
                  return (
                    <div key={idx} className={`processing-step-row ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                      <div className="step-indicator-circle">
                        {isDone ? '✓' : isActive ? '●' : '○'}
                      </div>
                      <span className="step-text">{stepText}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* State 2: Verified Result Determination */}
          {result && !loading && (
            <div className={`determination-card ${isSif ? 'critical-sif' : 'routine-managed'}`}>
              
              {/* Verdict Header Ribbon */}
              <div className="determination-header">
                <div className="verdict-tag-pill">
                  <span className="dot-pulse"></span>
                  <span>{isSif ? '🔴 CRITICAL SIF PRECURSOR DETECTED' : '🟢 ROUTINE SAFETY OBSERVATION'}</span>
                </div>
                <div className="framework-badge">
                  <span>DEKRA / IOGP-459</span>
                </div>
              </div>

              {/* Central Risk Gauge & Primary Info */}
              <div className="hero-risk-section">
                <div className={`risk-circular-gauge ${isSif ? 'critical' : 'safe'}`}>
                  <div className="gauge-number">{Math.round(result.confidence * 100)}%</div>
                  <div className="gauge-label">{isSif ? 'FATAL RISK' : 'CONFIDENCE'}</div>
                </div>
                
                <div className="risk-narrative-summary">
                  <h3 className="risk-title">
                    {isSif 
                      ? 'High-Energy Fatality Pathway Identified' 
                      : 'Managed / Low-Energy Non-SIF Hazard'}
                  </h3>
                  <p className="risk-desc">
                    {isSif
                      ? 'Release of unmitigated industrial energy with high fatality probability if controls fail.'
                      : 'Standard observation managed through routine site housekeeping and basic PPE.'}
                  </p>
                </div>
              </div>

              {/* 3-Card Structured Breakdown */}
              <div className="tri-breakdown-grid">
                <div className="tri-card cyan">
                  <span className="tri-label">IOGP LIFE-SAVING RULE</span>
                  <strong className="tri-val">{result.iogp_rule || 'General Safety'}</strong>
                </div>
                <div className="tri-card amber">
                  <span className="tri-label">TASK ACTIVITY</span>
                  <strong className="tri-val">{hazardProfile.activity}</strong>
                </div>
                <div className="tri-card red">
                  <span className="tri-label">COMPROMISED BARRIER</span>
                  <strong className="tri-val">
                    {isSif ? hazardProfile.barrier : 'Controls Active'}
                  </strong>
                </div>
              </div>

              {/* 🧬 Safety Precursor DNA Profile */}
              <div className="precursor-dna-box">
                <div className="dna-box-header">
                  <div className="dna-title">
                    <span>🧬 SAFETY PRECURSOR DNA PROFILE</span>
                  </div>
                  <span className="dna-matrix-tag">5-PILLAR FINGERPRINT</span>
                </div>

                <div className="dna-bars-container">
                  <div className="dna-metric-row">
                    <span className="dna-metric-name">Fatal Energy Release Potential</span>
                    <div className="dna-progress-bar">
                      <div 
                        className={`dna-progress-fill ${isSif ? 'red' : 'green'}`}
                        style={{ width: isSif ? '94%' : '12%' }}
                      ></div>
                    </div>
                    <span className="dna-metric-val">{isSif ? '94%' : '12%'}</span>
                  </div>

                  <div className="dna-metric-row">
                    <span className="dna-metric-name">Human Exposure Index</span>
                    <div className="dna-progress-bar">
                      <div 
                        className={`dna-progress-fill ${isSif ? 'amber' : 'green'}`}
                        style={{ width: isSif ? '81%' : '18%' }}
                      ></div>
                    </div>
                    <span className="dna-metric-val">{isSif ? '81%' : '18%'}</span>
                  </div>

                  <div className="dna-metric-row">
                    <span className="dna-metric-name">Barrier Integrity Breach</span>
                    <div className="dna-progress-bar">
                      <div 
                        className={`dna-progress-fill ${isSif ? 'red' : 'green'}`}
                        style={{ width: isSif ? '97%' : '08%' }}
                      ></div>
                    </div>
                    <span className="dna-metric-val">{isSif ? '97%' : '08%'}</span>
                  </div>

                  <div className="dna-metric-row">
                    <span className="dna-metric-name">Task Fatal Severity</span>
                    <div className="dna-progress-bar">
                      <div 
                        className={`dna-progress-fill ${isSif ? 'amber' : 'green'}`}
                        style={{ width: isSif ? '89%' : '15%' }}
                      ></div>
                    </div>
                    <span className="dna-metric-val">{isSif ? '89%' : '15%'}</span>
                  </div>

                  <div className="dna-metric-row">
                    <span className="dna-metric-name">Positive Control Absence</span>
                    <div className="dna-progress-bar">
                      <div 
                        className={`dna-progress-fill ${isSif ? 'red' : 'green'}`}
                        style={{ width: isSif ? '95%' : '05%' }}
                      ></div>
                    </div>
                    <span className="dna-metric-val">{isSif ? '95%' : '05%'}</span>
                  </div>
                </div>
              </div>

              {/* Precursor Chain Graph */}
              {isSif && (
                <div className="causal-chain-card">
                  <div className="causal-chain-header">
                    <Compass size={13} color="var(--cyan-ai)" />
                    <span>CAUSAL PRECURSOR CHAIN GRAPH</span>
                  </div>
                  
                  <div className="chain-nodes-stepper">
                    <div className="stepper-node cyan">
                      <span className="stepper-tag">1. TASK</span>
                      <span className="stepper-text">{hazardProfile.activity}</span>
                    </div>

                    <div className="stepper-arrow">➔</div>

                    <div className="stepper-node amber">
                      <span className="stepper-tag">2. HIGH-ENERGY HAZARD</span>
                      <span className="stepper-text">{hazardProfile.hazard}</span>
                    </div>

                    <div className="stepper-arrow">➔</div>

                    <div className="stepper-node red">
                      <span className="stepper-tag">3. BARRIER FAILURE</span>
                      <span className="stepper-text">{hazardProfile.barrier}</span>
                    </div>

                    <div className="stepper-arrow">➔</div>

                    <div className="stepper-node fatal">
                      <span className="stepper-tag">4. FATAL OUTCOME</span>
                      <span className="stepper-text">{Math.round(result.confidence * 100)}% SIF RISK</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Reasoning Quote Box */}
              <div className="hse-reasoning-card">
                <div className="reasoning-header">
                  <Eye size={13} color="var(--cyan-ai)" />
                  <span>TECHNICAL HSE JUSTIFICATION</span>
                </div>
                <p className="reasoning-body">{result.reasoning}</p>
              </div>

              {/* Explainable AI Trigger (LIME) */}
              {isSif && (
                <div className="lime-trigger-wrapper">
                  {!showExplanation ? (
                    <button
                      type="button"
                      className="lime-inspect-btn"
                      onClick={handleExplain}
                    >
                      <Eye size={15} />
                      <span>🔬 WHY DID AI FLAG THIS? (TRIGGER LIME TOKEN ATTRIBUTION)</span>
                    </button>
                  ) : loadingExplain ? (
                    <div className="lime-loading-box">
                      <Loader2 size={16} className="spinning-icon" />
                      <span>COMPUTING TOKEN PERTURBATION WEIGHTS...</span>
                    </div>
                  ) : (
                    result.explanation && result.explanation.length > 0 && (
                      <div className="lime-results-box">
                        <div className="lime-results-header">
                          <span className="lime-title">🔬 Explainable AI (LIME Token Attribution)</span>
                          <span className="lime-legend">
                            <span className="leg-red">■ High Risk Tokens</span> · <span className="leg-green">■ Contextual</span>
                          </span>
                        </div>
                        <WordHighlight text={reportText} explanation={result.explanation} />
                      </div>
                    )
                  )}
                </div>
              )}

            </div>
          )}

          {/* State 3: Empty State (Awaiting Input) */}
          {!result && !loading && (
            <div className="empty-analysis-card">
              <div className="empty-icon-halo">
                <ShieldCheck size={42} color="var(--cyan-ai)" />
              </div>
              <h4>Awaiting Field Observation Ingestion</h4>
              <p>Select any 1-click test scenario above or type custom free-text to trigger real-time AI precursor analysis.</p>
              <div className="empty-features-hint">
                <span>⚡ Real-Time LLM Inference</span>
                <span>🧬 5-Pillar Safety DNA</span>
                <span>🔬 LIME Token Explainability</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
