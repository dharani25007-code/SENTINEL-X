# 🛡️ SENTINEL-X — Autonomous Safety Precursor Intelligence Engine

### Smart India Hackathon 2026 • Problem Statement ID: 26165 (SIH26165)
**AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors in OIL's Unsafe-Act/Unsafe-Condition and Near-Miss Reports**  
*Organization: Oil India Limited (OIL) • Ministry of Petroleum & Natural Gas (MoPNG) • Theme: Smart Automation*

---

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![IOGP](https://img.shields.io/badge/Safety_Standard-IOGP_Report_459-E65100.svg?style=flat)](https://www.iogp.org/life-savingrules/)
[![Indian Standard](https://img.shields.io/badge/Indian_Regulatory-OISD_%26_DGMS_(OMR_2017)-FF9933.svg?style=flat)](https://www.oisd.gov.in/)
[![XAI](https://img.shields.io/badge/Explainability-LIME_Attribution-9C27B0.svg?style=flat)](https://github.com/marcotcr/lime)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

> **“Traditional industrial safety systems passively categorize accidents after they happen. Sentinel-X deconstructs raw, unstructured field observations into high-energy causal chains, tracks temporal precursor momentum, and simulates counterfactual interventions to stop fatalities before energy is released.”**

---

## 🏷️ Official SIH Problem Statement Details (PS ID: 26165)

| Parameter | Official Specification |
|:---|:---|
| **Hackathon** | **Smart India Hackathon 2026 (SIH 2026)** |
| **Problem Statement ID** | **26165** (SIH26165) |
| **Problem Statement Title** | **AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors in OIL's Unsafe-Act/Unsafe-Condition and Near-Miss Reports** |
| **Organization** | **Oil India Limited (OIL)** |
| **Department** | **Oil India Limited (Ministry of Petroleum & Natural Gas - MoPNG)** |
| **Category / Theme** | **Software / Smart Automation** |
| **Relevant Data** | OIL's UA/UC observations, near-miss and incident reports |
| **Project Solution** | **SENTINEL-X** *(Autonomous Safety Precursor Intelligence & Interception Platform)* |
| **Team Name** | **XYZ** |

---

### 📜 Problem Statement Background & Industry Context
> **Background Provided by Oil India Limited:**  
> *"OIL collects large volumes of Unsafe-Act / Unsafe-Condition (UA/UC) observations, near-miss, and incident reports through its HSSE platform, but these are triaged manually after certain time intervals such as monthly, quarterly, etc.*  
> *However, global best practice (**DEKRA Martin & Black 2015; EEI SIF Precursor model; VelocityEHS 2024 PSIF classifier**) has established that low-severity incidents do not share the same causes as fatalities — non-fatal US accidents fell 51% over 15 years while fatalities fell only 25.5%. Leading operators therefore separately flag the ~20–25% of reports carrying genuine fatal potential."*

---

### 🎯 Core Problem Requirements & How SENTINEL-X Delivers:

| Official Problem Mandate | How SENTINEL-X Solves It | Technical Implementation |
|:---|:---|:---|
| **a) Classify SIF vs. Non-SIF Potential** | Ingests free-text safety reports in real-time ($< 800\text{ms}$) and isolates life-threatening precursors with **96%+ model confidence**. | **Groq LLM Zero-Shot Inference + LIME Token Attribution** separating high-energy release from minor slips. |
| **b) Tag to IOGP Life-Saving Rules** | Automatically tags each report to the relevant **IOGP Report 459 standard** (*Energy Isolation, Hot Work, Confined Space, Line of Fire, Mechanical Lifting, etc.*). | **Cosine Semantic Vector Embeddings (`all-MiniLM-L6-v2`)** matched against international 9 Life-Saving Rules. |
| **c) Surface Recurring Precursor Patterns** | Automatically extracts and correlates **Activity, Location/Asset, and Barrier Failure** chains across all operational installations. | **Interactive Causal Chain Graph & Safety DNA Profile** (Energy, Exposure, Barrier, Severity, Controls). |
| **Expected Outcome: Interactive HSE Dashboard** | Multi-facility command center ranking OIL sites by **SIF Precursor Density** and auto-mapping Life-Saving Rules to prioritize interventions where fatal potential is highest. | **Command Center, Risk Universe, 30-Day Safety Time Machine, and Counterfactual Intervention Simulator**. |

---

### 🛡️ Why the Name "SENTINEL-X"? (Origin & Meaning)

The name **SENTINEL-X** embodies the shift from passive industrial safety logging to **Autonomous Fatal Precursor Interception**:

```
             ┌────────────────────────────────────────────────────────┐
             │                     SENTINEL-X                         │
             │  "The Autonomous Watchman for Hidden Fatal Precursors" │
             └───────────────┬────────────────────────┬───────────────┘
                             │                        │
             ┌───────────────┴────────┐      ┌────────┴───────────────┐
             │       SENTINEL         │      │           X            │
             │ - 24/7 Safety Guardian │      │ - Variable X (Precursor│
             │ - Proactive Look-Out   │      │ - Explainable AI (XAI) │
             │ - Real-Time Interception│     │ - 'X' Out Fatalities   │
             └────────────────────────┘      └────────────────────────┘
```

1. **🛡️ SENTINEL (The Autonomous 24/7 Guardian)**:
   * A *Sentinel* is an unwavering, continuous lookout stationed to detect threats before they breach safety perimeters.
   * Traditional industrial safety systems act as passive *recorders* (counting injuries after workers are hurt). **SENTINEL** acts as an active, 24/7 intelligent watchman that monitors thousands of raw text cards in real-time, detecting high-energy danger before energy is released.

2. **⚡ X (The 4 Core Dimensions)**:
   * **Variable $X$ (The Hidden Precursor)**: In mathematics and science, '$X$' represents the unknown, invisible variable. In oilfield safety, fatal SIF precursors are the invisible '$X$' factor buried under thousands of routine near-misses.
   * **XAI (Explainable Artificial Intelligence)**: Represents transparent, auditable 

---

### 6. 🎯 Line of Fire
* **Core Rule**: *"Keep yourself and others out of the line of fire."*
* **Simple Explanation**: Position yourself so that if equipment fails, pressure releases, tensioned cables snap, or heavy objects swing, you will not be in the direct flight path of injury.
* **Real Oilfield Scenario**: At *Pipeline Pump Station 7*, a technician stands directly in front of a 100-bar hydrostatic test blind flange while tightening bolts under pressure. The gasket blows out, propelling the steel flange directly into the operator's chest.
* **Key Mandatory Safeguards**:
  * Never position body parts directly in line with pressurized blinds, relief exhausts, or tensioned winch lines.
  * Red Line-of-Fire Barricading and physical exclusion zones around hydrostatic test manifolds.
  * Securement of whip-checks on high-pressure air and hydraulic hoses.
* **Sentinel-X AI Detection**: Identifies terms like *"stood in front of flange", "winch wire tension", "snapped air line", "rebounding pipe", "blind blowout"*.

---

### 7. 🏗️ Safe Mechanical Lifting
* **Core Rule**: *"Plan lifting operations and control the area."*
* **Simple Explanation**: When cranes, hoists, or forklifts move heavy equipment, the load can swing, cables can snap, or rigging hardware can fail. Never exceed crane load limits, never walk under a suspended load, and maintain strict barricaded exclusion zones.
* **Real Oilfield Scenario**: On the rig floor at *Moran Drilling Rig #4*, a crane lifts a 4-ton Blowout Preventer (BOP) stack without securing tag lines. A roughneck steps into the red exclusion zone directly underneath the swinging 4-ton load to adjust a guide rope by hand.
* **Key Mandatory Safeguards**:
  * Rigorous Lift Plan calculating center of gravity, boom radius, and Safe Working Load (SWL).
  * Color-coded certified slings, shackles, and lifting lugs inspected prior to hoisting.
  * 100% barricaded **Red Exclusion Zones** with physical barriers and tag-line guidance (zero workers under loads).
* **Sentinel-X AI Detection**: Identifies terms like *"suspended drill pipe", "walked under crane boom", "uninspected sling", "overloaded hoist", "swung load"*.

---

### 8. 📝 Work Authorisation (Permit to Work - PTW)
* **Core Rule**: *"Work with a valid permit when required."*
* **Simple Explanation**: Hazardous tasks require an authorized Permit to Work (PTW) that identifies all simultaneous operations (SIMOPS), confirms risk controls, and ensures cross-department communication before any tool touches metal.
* **Real Oilfield Scenario**: An electrical contractor begins replacing lighting fixtures inside a classified hazardous compressor building without a valid Cold Work Permit. Meanwhile, operations teams start gas purging in the adjacent line, creating an uncoordinated explosive hazard.
* **Key Mandatory Safeguards**:
  * Joint Job Safety Analysis (JSA) conducted and signed by Performing and Issuing Authorities.
  * Tool-Box Talk (TBT) communicating hazards and emergency escape routes to all crew members.
  * Deconfliction of Simultaneous Operations (SIMOPS) across adjacent plant zones.
* **Sentinel-X AI Detection**: Identifies terms like *"worked without PTW", "expired permit", "no JSA signed", "SIMOPS clash", "unauthorized work"*.

---

### 9. 🧗 Working at Height
* **Core Rule**: *"Protect yourself against a fall when working at height."*
* **Simple Explanation**: Falls from heights greater than 1.8 meters (6 feet) are a leading cause of industrial fatalities. Always wear a full-body harness, maintain 100% tie-off with dual lanyards, ensure certified scaffolding with green inspection tags, and prevent tools from falling.
* **Real Oilfield Scenario**: At *Digboi Refinery Unit #2*, an insulation technician climbs a 12-meter tube-and-coupler scaffold lacking guardrails and mid-rails. The worker disconnects his harness lanyard to walk along a bare steel beam and slips on condensate grease.
* **Key Mandatory Safeguards**:
  * Full-Body Safety Harness with 100% continuous tie-off to certified anchor points ($\ge 22.2\text{ kN}$).
  * Scaffolding certified with valid Green Scaff-Tag, complete with toe-boards, mid-rails, and top-rails.
  * Tool lanyards and drop-prevention netting to prevent dropped object hazards below.

* **Sentinel-X AI Detection**: Identifies terms like *"unclipped harness", "missing toe board", "scaffold without green tag", "unprotected edge", "monkey board slip"*.

---

## 📊 Command Center Chart Mechanics & Axis Breakdown

```
  Y-Axis (Vertical ↑)
  Incident Reports (Count)
    ▲
  4 │
  3 │                          /───\       /───\     ─── 🔵 Cyan: Total Field Observations
  2 │                         /     \     /     \
  1 │      /\        /───\   /       \───/       \   ─── 🔴 Red: Fatal SIF Precursors
  0 ┴──────┴──────────┴─────/─────────────────────\► X-Axis (Horizontal →)
       Feb'14      Aug'18        Jan'24      May'26    Time (Month & Year)
```

1. **X-Axis (Horizontal $\rightarrow$)**: **Time (Month & Year)** spanning **2014 to 2026** (formatted with dynamic spacing to prevent clutter).
2. **Y-Axis (Vertical $\uparrow$)**: **Number of Incident Reports** ($0, 1, 2, 3, 4$). Locked strictly to whole integers (`allowDecimals={false}`).
3. **🔵 Cyan Area (`Total Reports`)**: Total volume of field observations submitted across Assam.
4. **🔴 Red Area (`SIF Precursors`)**: High-energy fatal precursor subset identified by the AI.
5. **When the Red Line Drops to 0**: Represents **Controlled Steady-State Operations** where all submitted logs were minor routine observations with zero life-threatening hazard exposure.

---

## 🏗️ End-to-End System Architecture

```
                                  SENTINEL-X SYSTEM TOPOLOGY
                                  
  [ Mobile / Web App ]       [ Field Tablets ]        [ SCADA / Incident Feeds ]
           │                         │                             │
           └─────────────────────────┼─────────────────────────────┘
                                     ▼
                      ┌──────────────────────────────┐
                      │  FastAPI INGESTION ENDPOINT  │
                      │       POST /classify         │
                      └──────────────┬───────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────┐                    ┌──────────────────────────────┐
│    GROQ LLM INFERENCE        │                    │    IOGP RULE MATCHING        │
│  - Zero-Shot SIF Potential   │                    │  - Cosine Semantic Search    │
│  - Causal Chain Extraction   │                    │  - All-MiniLM-L6-v2 Embed    │
│  - Precursor DNA Score       │                    │  - Report 459 Taxonomy       │
└──────────┬───────────────────┘                    └──────────┬───────────────────┘
           │                                                   │
           └─────────────────────────┬─────────────────────────┘
                                     ▼
                      ┌──────────────────────────────┐
                      │    EXPLAINABLE AI (XAI)      │
                      │  - LIME Token Perturbation   │
                      │  - SIF/Routine Feature Mass  │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │     PERSISTENCE LAYER        │
                      │  - SQLite (WAL Mode)         │
                      │  - Indexed Analytics Tables  │
                      └──────────────┬───────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────┐                    ┌──────────────────────────────┐
│    EXECUTIVE COMMAND         │                    │    PRECURSOR INTERCEPTION    │
│  - Macro Telemetry Cards     │                    │  - Risk Universe Graph       │
│  - Multi-Year Trajectory     │                    │  - Safety Time Machine       │
│  - Facility Risk Matrix      │                    │  - Intervention Simulator    │
└──────────────────────────────┘                    └──────────────────────────────┘
```

---

## 🚀 Quickstart & Installation Guide

### 1. Backend Setup (FastAPI + Groq)
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1

# Dependencies:
pip install -r requirements.txt

# Start Backend Server:
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🎙️ 5-Minute Hackathon Pitch & Presentation Script

| Minute | Screen | Speaker Script |
|:---|:---|:---|
| **0:00 - 1:00** | **Login & Command Center** | *"Good morning judges. In oil & gas, treating all near-misses equally causes fatal precursors to be buried. Today, we present **SENTINEL-X**, an autonomous safety precursor intelligence platform built for **Oil India Limited**."* |
| **1:00 - 2:00** | **Report Intelligence (`/analyze`)** | *"Let's input a raw field log: 'Worker unbolting valve without LOTO'. In under 800ms, our Groq AI decomposes the Safety DNA (96% SIF risk), links the 4-step causal chain, tags IOGP Rule #4, and runs LIME token attribution."* |
| **2:00 - 3:00** | **Safety Time Machine (`/timeline`)** | *"Disasters don't happen randomly — they compound. Watch our **Safety Time Machine**: 30 days ago, risk was 14%. As LOTO bypasses clustered at Duliajan, momentum accelerated by +31.4% (94.6% risk). Sentinel-X catches this before energy is released."* |
| **3:00 - 4:00** | **Intervention Simulator (`/simulator`)** | *"Leadership cannot fix everything at once. In our **Simulator**, Dr. Gogoi drags the LOTO compliance lever to 95%. Our mathematical multi-barrier reliability model projects a **47.3% fatal risk reduction**."* |
| **4:00 - 5:00** | **Intervention Queue (`/queue`)** | *"Finally, in the **Intervention Queue**, we convert that insight into action, clicking `[DISPATCH AUDIT]` to assign the work order directly to Site Lead Rajesh Barua at Duliajan. That is how Sentinel-X saves lives."* |

---

## 📜 License
This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details. Built for **Smart India Hackathon (SIH26165)** for **Oil India Limited (OIL)** by **THE NEURAL VANGUARD**.