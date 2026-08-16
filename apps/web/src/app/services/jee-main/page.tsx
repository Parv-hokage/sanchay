'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAI } from '../../../context/AIContext';
import { KnowledgeSearchWidget } from '../../../components/knowledge/KnowledgeSearchWidget';

// ==========================================
// Official JEE Main Reference Data
// ==========================================

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  category: 'Application' | 'Admit Card' | 'Answer Key' | 'Response Sheet' | 'Result' | 'Advisory';
  summary: string;
  url: string;
}

const OFFICIAL_NOTICES: NoticeItem[] = [
  {
    id: 'not-1',
    title: 'Display of Final Answer Keys for JEE (Main) 2026 Session 1 (Paper 1)',
    date: 'February 12, 2026',
    category: 'Answer Key',
    summary:
      'National Testing Agency has uploaded the Final Answer Keys for JEE (Main) 2026 Session 1 (Paper 1: B.E./B.Tech.) on the official website. The result will be compiled based on these verified keys.',
    url: 'https://jeemain.nta.nic.in/public-notices/final-answer-key-session-1',
  },
  {
    id: 'not-2',
    title: 'Display of Recorded Response Sheets and Provisional Answer Key Challenge',
    date: 'February 05, 2026',
    category: 'Response Sheet',
    summary:
      'Candidates who appeared in JEE (Main) 2026 Session 1 can view and download their recorded response sheets and question papers. Challenge window open with processing fee of Rs. 200 per question.',
    url: 'https://jeemain.nta.nic.in/public-notices/response-sheet-challenge',
  },
  {
    id: 'not-3',
    title: 'Declaration of JEE (Main) 2026 Session 1 NTA Scores and Scorecards',
    date: 'February 14, 2026',
    category: 'Result',
    summary:
      'NTA Scores for Paper 1 (B.E./B.Tech.) have been declared. Candidates can download their official scorecards using Application Number and Date of Birth.',
    url: 'https://jeemain.nta.nic.in/results',
  },
  {
    id: 'not-4',
    title: 'Online Application Window for JEE (Main) 2026 Session 2 (April 2026)',
    date: 'January 28, 2026',
    category: 'Application',
    summary:
      'Inviting Online Applications for Joint Entrance Examination (Main) – 2026 Session 2. Candidates can register or add Session 2 to existing applications.',
    url: 'https://jeemain.nta.nic.in/session-2-registration',
  },
  {
    id: 'not-5',
    title: 'Release of Advance Intimation of Examination City for Candidates',
    date: 'January 10, 2026',
    category: 'Admit Card',
    summary:
      'Advance Intimation Slip informing candidates of the allotment of Examination City for JEE (Main) 2026 Session 1 is now available for download.',
    url: 'https://jeemain.nta.nic.in/city-intimation',
  },
];

const SYLLABUS_DATA = {
  Physics: [
    {
      unit: 'Unit 1: Physics and Measurement',
      topics: 'Physics, technology, and society; SI units, fundamental and derived units; Least count, significant figures, errors in measurement, dimensions of physical quantities.',
    },
    {
      unit: 'Unit 2: Kinematics',
      topics: 'Frame of reference, motion in a straight line, position-time graph, speed and velocity; Uniformly accelerated motion, velocity-time graph; Vectors, resolution of a vector, scalar and vector products; Motion in a plane, projectile motion, uniform circular motion.',
    },
    {
      unit: 'Unit 3: Laws of Motion',
      topics: 'Force and inertia, Newton’s First Law; Momentum, Newton’s Second Law, impulse; Newton’s Third Law; Law of conservation of linear momentum and its applications; Equilibrium of concurrent forces; Static and kinetic friction, laws of friction, rolling friction, lubrication; Dynamics of uniform circular motion, centripetal force and its applications.',
    },
    {
      unit: 'Unit 4: Work, Energy, and Power',
      topics: 'Work done by a constant and variable force; Kinetic and potential energies, work-energy theorem, power; Potential energy of a spring, conservation of mechanical energy; Conservative and non-conservative forces; Elastic and inelastic collisions in one and two dimensions.',
    },
    {
      unit: 'Unit 5: Rotational Motion',
      topics: 'Centre of mass of a two-particle system, centre of mass of a rigid body; Basic concepts of rotational motion, moment of a force, torque, angular momentum, conservation of angular momentum and its applications; Moment of inertia, radius of gyration.',
    },
    {
      unit: 'Unit 6: Thermodynamics & Kinetic Theory',
      topics: 'Thermal equilibrium, zeroth law of thermodynamics, concept of temperature; Heat, work, and internal energy; First law of thermodynamics, isothermal and adiabatic processes; Second law of thermodynamics; Equation of state of a perfect gas, kinetic theory of gases.',
    },
    {
      unit: 'Unit 7: Electrostatics & Current Electricity',
      topics: 'Coulomb’s law, electric field, electric flux, Gauss’s law and applications; Electric potential, equipotential surfaces, electric dipole; Conductors and insulators, capacitance, capacitors in series and parallel; Ohm’s law, electrical resistance, V-I characteristics, Kirchhoff’s laws and applications.',
    },
    {
      unit: 'Unit 8: Optics & Modern Physics',
      topics: 'Reflection and refraction of light, total internal reflection, lenses, prism, dispersion; Wave optics, Huygens’ principle, interference, diffraction; Dual nature of radiation, photoelectric effect; Atoms, Bohr model, nuclei; Semiconductor electronics, logic gates.',
    },
  ],
  Chemistry: [
    {
      unit: 'Physical: Some Basic Concepts & Atomic Structure',
      topics: 'Matter and its nature, Dalton’s atomic theory, concept of atom, molecule, element, compound; Mole concept, chemical formula, stoichiometry; Bohr’s model of hydrogen atom, de Broglie relationship, Heisenberg uncertainty principle, quantum numbers, Aufbau principle, Pauli exclusion principle, Hund’s rule.',
    },
    {
      unit: 'Physical: Chemical Bonding & Thermodynamics',
      topics: 'Ionic bonding, covalent bonding, Lewis structure, VSEPR theory, hybridization (sp, sp2, sp3, dsp2, sp3d, sp3d2); Molecular orbital theory; First, second, and third laws of thermodynamics, enthalpy, entropy, Gibbs free energy, spontaneity of reactions.',
    },
    {
      unit: 'Physical: Chemical Kinetics & Equilibrium',
      topics: 'Rate of chemical reaction, order and molecularity of reactions, rate law, Arrhenius equation; Law of chemical equilibrium, equilibrium constant, Le Chatelier’s principle; Ionic equilibrium, pH, buffer solutions, solubility product.',
    },
    {
      unit: 'Inorganic: Periodic Table & Coordination Chemistry',
      topics: 'Modern periodic law and periodic table, periodic trends in properties; d- and f-block elements, transition metals, electronic configuration, oxidation states; Coordination compounds, IUPAC nomenclature, isomerism, Werner’s theory, crystal field theory.',
    },
    {
      unit: 'Organic: Basic Principles & Hydrocarbons',
      topics: 'IUPAC nomenclature, inductive effect, electromeric effect, resonance, hyperconjugation; Classification, isomerism, general methods of preparation and properties of alkanes, alkenes, alkynes, and aromatic hydrocarbons.',
    },
    {
      unit: 'Organic: Functional Groups & Biomolecules',
      topics: 'Alkyl halides, alcohols, phenols, ethers; Aldehydes and ketones, carboxylic acids and their derivatives; Organic compounds containing nitrogen (amines, diazonium salts); Biomolecules: Carbohydrates, proteins, nucleic acids, vitamins.',
    },
  ],
  Mathematics: [
    {
      unit: 'Unit 1: Sets, Relations, and Functions',
      topics: 'Sets and their representation; Union, intersection, and complement of sets; Types of relations, equivalence relations; Types of functions, one-one, onto and composite functions.',
    },
    {
      unit: 'Unit 2: Matrices and Determinants',
      topics: 'Matrices, operations on matrices, transpose of a matrix, symmetric and skew-symmetric matrices; Determinants, minors, cofactors, adjoint and inverse of a matrix; Solution of system of linear equations using matrix inversion and Cramer’s rule.',
    },
    {
      unit: 'Unit 3: Calculus (Differential & Integral)',
      topics: 'Limit, continuity, and differentiability; Derivatives of sum, difference, product, and quotient; Chain rule, trigonometric, inverse trigonometric, exponential, and logarithmic functions; Maxima and minima, tangents and normals; Indefinite and definite integrals, fundamental theorem of calculus, areas enclosed by curves, differential equations.',
    },
    {
      unit: 'Unit 4: Coordinate Geometry & Vectors',
      topics: 'Straight lines, slopes, distance between parallel lines; Standard forms of equations of circle, parabola, ellipse, and hyperbola; Vectors and scalars, addition of vectors, components of a vector, scalar and vector products; Three dimensional geometry, direction cosines and ratios, equations of line and plane.',
    },
    {
      unit: 'Unit 5: Probability & Statistics',
      topics: 'Measures of dispersion: calculation of mean, median, mode of grouped and ungrouped data; Calculation of standard deviation, variance; Probability: conditional probability, multiplication theorem, Bayes’ theorem, probability distribution.',
    },
  ],
};

const QUESTION_PAPERS = [
  {
    year: '2025',
    session: 'Session 1 (January)',
    paper: 'Paper 1 (B.E./B.Tech.)',
    date: '24 Jan 2025 Shift 1',
    downloadUrl: 'https://jeemain.nta.nic.in/archive/2025/paper1-shift1.pdf',
  },
  {
    year: '2025',
    session: 'Session 1 (January)',
    paper: 'Paper 1 (B.E./B.Tech.)',
    date: '24 Jan 2025 Shift 2',
    downloadUrl: 'https://jeemain.nta.nic.in/archive/2025/paper1-shift2.pdf',
  },
  {
    year: '2025',
    session: 'Session 1 (January)',
    paper: 'Paper 2A (B.Arch.)',
    date: '28 Jan 2025 Shift 1',
    downloadUrl: 'https://jeemain.nta.nic.in/archive/2025/paper2a.pdf',
  },
  {
    year: '2024',
    session: 'Session 1 (January)',
    paper: 'Paper 1 (B.E./B.Tech.)',
    date: '27 Jan 2024 Shift 1',
    downloadUrl: 'https://jeemain.nta.nic.in/archive/2024/paper1-shift1.pdf',
  },
  {
    year: '2024',
    session: 'Session 2 (April)',
    paper: 'Paper 1 (B.E./B.Tech.)',
    date: '05 Apr 2024 Shift 1',
    downloadUrl: 'https://jeemain.nta.nic.in/archive/2024/paper1-apr-shift1.pdf',
  },
];

const FAQS = [
  {
    q: 'Can a candidate apply for both Session 1 and Session 2 together?',
    a: 'Yes. Candidates have the option to apply for one Session or both Sessions (Session 1 and Session 2) together and pay the exam fee accordingly. If a candidate appears in both sessions, the best of the two NTA scores will be considered for ranking.',
  },
  {
    q: 'What is the age limit for appearing in JEE (Main) 2026?',
    a: 'There is NO age limit for the candidates. The candidates who have passed the Class 12 / equivalent examination in 2024, 2025, or appearing in 2026 irrespective of their age can appear in JEE (Main) 2026.',
  },
  {
    q: 'What is the marking scheme for Section B (Numerical Value Questions)?',
    a: 'In Section B, candidates must attempt any 5 questions out of 10. Correct answers earn +4 marks, incorrect answers receive -1 mark (negative marking applies), and unattempted questions receive 0 marks.',
  },
  {
    q: 'Will there be an application correction window after the registration deadline?',
    a: 'Yes. NTA provides a dedicated one-time correction window for candidates to edit specified non-critical fields in their application forms before admit cards are generated.',
  },
];

export default function JeeMainServicePortal() {
  const { setAIContext } = useAI();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bulletin' | 'syllabus' | 'notices' | 'papers' | 'faq' | 'candidate-services'
  >('overview');
  const [syllabusSubject, setSyllabusSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<string>('All');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    const tabLabels: Record<string, string> = {
      overview: 'Overview',
      bulletin: 'Information Bulletin',
      syllabus: 'Syllabus',
      notices: 'Public Notices',
      papers: 'Question Papers & Answer Keys',
      faq: 'Candidate FAQs',
      'candidate-services': 'Candidate Services',
    };
    setAIContext({
      department: 'Education',
      organization: 'NTA',
      service: 'JEE Main',
      section: tabLabels[activeTab] || activeTab,
      activeItem: selectedNotice?.title,
      workflow: activeTab === 'candidate-services' ? 'application' : 'inquiry',
      route: '/services/jee-main',
    });
  }, [activeTab, selectedNotice, setAIContext]);

  const filteredNotices =
    noticeCategory === 'All'
      ? OFFICIAL_NOTICES
      : OFFICIAL_NOTICES.filter((n) => n.category === noticeCategory);

  const filteredSyllabus = SYLLABUS_DATA[syllabusSubject].filter(
    (item) =>
      item.unit.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
      item.topics.toLowerCase().includes(syllabusSearch.toLowerCase()),
  );

  return (
    <div className="space-y-8 pb-16 font-sans">


      {/* Breadcrumb Hierarchy */}
      <nav className="flex items-center gap-2 text-xs text-slate-600 font-medium">
        <Link href="/" className="hover:text-sanchay-navy-800 text-slate-700">Home</Link>
        <span>/</span>
        <Link href="/departments" className="hover:text-sanchay-navy-800 text-slate-700">Education</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">National Testing Agency (NTA)</span>
        <span>/</span>
        <span className="font-bold text-sanchay-navy-950">JEE (Main) 2026</span>
      </nav>

      {/* Hero Portal Header - High Contrast WCAG AAA Compliant */}
      <div className="bg-linear-to-br from-[#0B1528] via-[#0F1E36] to-[#162D50] text-white rounded-3xl p-6 sm:p-9 shadow-2xl border border-slate-700/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-3 py-1 rounded-md shadow-xs">
                National Testing Agency (NTA)
              </span>
              <span className="text-xs text-slate-200 font-semibold">
                Official Portal: <code className="font-mono text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded">jeemain.nta.nic.in</code>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight text-white drop-shadow-sm">
              Joint Entrance Examination (Main) 2026
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 max-w-2xl leading-relaxed font-normal">
              Official gateway for admission to Undergraduate Engineering Programs (B.E./B.Tech.) at NITs, IIITs, CFTIs, and eligibility test for JEE (Advanced).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/services/jee-main/apply"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl hover:shadow-2xl text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply for JEE (Main) 2026</span>
              <span className="text-base">→</span>
            </Link>
          </div>
        </div>

        {/* Source Authenticity Banner */}
        <div className="mt-6 pt-4 border-t border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
          <div className="flex items-center gap-2.5 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs" />
            <span className="text-emerald-200 font-semibold">Service Status: <strong className="text-white font-black">Session 1 Scorecards Published & Session 2 Active</strong></span>
          </div>
          <span className="text-slate-300 font-medium">
            Source: National Testing Agency / Official Information Bulletins & Circulars
          </span>
        </div>
      </div>

      {/* Live Notice Ticker */}
      <div className="bg-sanchay-gold-50/90 border border-sanchay-gold-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-sanchay-gold-950 shadow-2xs">
        <span className="bg-sanchay-gold-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide shrink-0">
          Latest Update
        </span>
        <p className="font-semibold truncate flex-1">
          Final Answer Keys for Paper 1 (B.E./B.Tech.) released on jeemain.nta.nic.in. NTA Scores declared for Session 1.
        </p>
        <button
          onClick={() => setActiveTab('notices')}
          className="text-xs font-bold text-sanchay-navy-900 hover:underline shrink-0 cursor-pointer"
        >
          View All Notices →
        </button>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {[
            { id: 'overview', label: '📘 Overview' },
            { id: 'bulletin', label: '📜 Information Bulletin' },
            { id: 'syllabus', label: '🔬 Syllabus' },
            { id: 'notices', label: '📢 Public Notices' },
            { id: 'papers', label: '📑 Question Papers & Keys' },
            { id: 'faq', label: '❓ Candidate FAQs' },
            { id: 'candidate-services', label: '🎯 Candidate Services (Mock)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-sanchay-navy-800 text-sanchay-navy-900 bg-white shadow-2xs rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
      {/* ========================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mode of Exam</span>
              <p className="text-sm font-bold text-sanchay-navy-900 mt-1">Computer Based Test (CBT)</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Paper 1, Paper 2A, Paper 2B</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
              <p className="text-sm font-bold text-sanchay-navy-900 mt-1">Two Sessions (Jan & Apr)</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Best of two scores considered</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Questions</span>
              <p className="text-sm font-bold text-sanchay-navy-900 mt-1">75 Questions (300 Marks)</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">25 Questions each in P, C, M</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marking Scheme</span>
              <p className="text-sm font-bold text-sanchay-navy-900 mt-1">+4 Correct, -1 Incorrect</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Applies to Section A & Section B</span>
            </div>
          </div>

          {/* Source-Grounded Knowledge Search */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-sanchay-navy-900 flex items-center gap-2">
              <span>🔍</span>
              <span>Search Official JEE Main Knowledge & Rules</span>
            </h2>
            <KnowledgeSearchWidget
              initialServiceId="jee-main"
              placeholder="Ask about eligibility, marking scheme, category reservation, fees..."
            />
          </div>

          {/* Key Guidelines & Candidate Helpline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-sanchay-navy-900">Key Information & Dates</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium">Session 1 Exam Dates:</span>
                  <span className="font-bold text-sanchay-navy-800">22 Jan to 31 Jan 2026</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium">Session 1 Scorecard Release:</span>
                  <span className="font-bold text-sanchay-navy-800">14 February 2026</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium">Session 2 Exam Dates:</span>
                  <span className="font-bold text-sanchay-navy-800">01 Apr to 15 Apr 2026</span>
                </li>
                <li className="flex justify-between py-1">
                  <span className="font-medium">All India Rank Declaration:</span>
                  <span className="font-bold text-sanchay-navy-800">By 25 April 2026</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-sanchay-navy-900">NTA Candidate Helpdesk</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                For technical or registration assistance, candidates may contact the official NTA Helpdesk during working hours:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-semibold">📞 Helpline:</span>
                  <span>011-40759000 / 011-69227700</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-semibold">✉️ Official Email:</span>
                  <span className="font-mono text-sanchay-navy-700">jeemain@nta.ac.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: INFORMATION BULLETIN */}
      {/* ========================================== */}
      {activeTab === 'bulletin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-sanchay-navy-900">
                  JEE (Main) 2026 Information Bulletin
                </h2>
                <p className="text-xs text-slate-500">
                  Authoritative information brochure containing eligibility, examination scheme, reservations, and general instructions.
                </p>
              </div>
              <a
                href="https://jeemain.nta.nic.in/information-bulletin"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
              >
                Download Full PDF ↗
              </a>
            </div>

            {/* Chapter Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-sanchay-gold-700 uppercase">Chapter 3</span>
                <h3 className="text-xs font-bold text-sanchay-navy-900">Eligibility & Qualifications</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Class 12 pass in 2024, 2025 or appearing in 2026 with Physics, Mathematics & 1 optional subject. No age restriction.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-sanchay-gold-700 uppercase">Chapter 4</span>
                <h3 className="text-xs font-bold text-sanchay-navy-900">Pattern & Marking Scheme</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Paper 1: 300 marks. 20 MCQs + 5/10 Numerical per subject. Marking: +4 correct, -1 negative marking in both sections.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-sanchay-gold-700 uppercase">Chapter 5</span>
                <h3 className="text-xs font-bold text-sanchay-navy-900">Reservations & Certificates</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  GEN-EWS (10%), OBC-NCL (27%), SC (15%), ST (7.5%), PwD (5%). Certificates must follow Central Government formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: SYLLABUS */}
      {/* ========================================== */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-sanchay-navy-900">
                  Official JEE (Main) 2026 Syllabus
                </h2>
                <p className="text-xs text-slate-500">
                  Subject-wise syllabus for Paper 1 (B.E./B.Tech.) as released by NTA.
                </p>
              </div>

              {/* Subject Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                {(['Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSyllabusSubject(sub)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      syllabusSubject === sub
                        ? 'bg-white text-sanchay-navy-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Input */}
            <input
              type="text"
              value={syllabusSearch}
              onChange={(e) => setSyllabusSearch(e.target.value)}
              placeholder={`Search ${syllabusSubject} topics, units, or keywords...`}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
            />

            {/* Units List */}
            <div className="space-y-3">
              {filteredSyllabus.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                  <h3 className="text-xs font-bold text-sanchay-navy-900">{item.unit}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.topics}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: PUBLIC NOTICES */}
      {/* ========================================== */}
      {activeTab === 'notices' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-sanchay-navy-900">
                  Official Public Notices & Circulars
                </h2>
                <p className="text-xs text-slate-500">
                  Authoritative notifications, answer key releases, and candidate advisories from NTA.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Application', 'Admit Card', 'Answer Key', 'Response Sheet', 'Result'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNoticeCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      noticeCategory === cat
                        ? 'bg-sanchay-navy-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Notices List */}
            <div className="space-y-3">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-700 bg-sanchay-gold-50 px-2 py-0.5 rounded border border-sanchay-gold-200">
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{notice.date}</span>
                  </div>

                  <h3 className="text-xs font-bold text-sanchay-navy-900">{notice.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{notice.summary}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <a
                      href={notice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sanchay-navy-700 hover:underline"
                    >
                      Read Official Notice ↗
                    </a>
                    <button
                      onClick={() => setSelectedNotice(notice)}
                      className="text-[11px] font-bold text-sanchay-gold-700 hover:text-sanchay-gold-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>◯ Ask AI About This</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: QUESTION PAPERS & ANSWER KEYS */}
      {/* ========================================== */}
      {activeTab === 'papers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-sanchay-navy-900">
                Official Previous Year Question Papers & Answer Keys
              </h2>
              <p className="text-xs text-slate-500">
                Download verified master question papers and final answer keys for offline practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUESTION_PAPERS.map((qp, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Year: {qp.year}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{qp.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-sanchay-navy-900">{qp.paper}</h3>
                  <span className="text-[11px] text-slate-500 block">{qp.session}</span>
                  <div className="pt-2 flex justify-between items-center">
                    <a
                      href={qp.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-sanchay-navy-700 hover:underline"
                    >
                      Download Master PDF ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 6: CANDIDATE FAQS */}
      {/* ========================================== */}
      {activeTab === 'faq' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-sanchay-navy-900">
                Frequently Asked Questions (Candidate FAQs)
              </h2>
              <p className="text-xs text-slate-500">
                Official candidate queries resolved directly from NTA information guidelines.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <h3 className="text-xs font-bold text-sanchay-navy-900 flex items-start gap-2">
                    <span className="text-sanchay-gold-700 font-extrabold">Q:</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 7: CANDIDATE SERVICES (MOCK / SANDBOX) */}
      {/* ========================================== */}
      {activeTab === 'candidate-services' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-sanchay-gold-50/80 border border-sanchay-gold-300 rounded-2xl p-4 flex items-center gap-3 text-xs text-sanchay-gold-950 shadow-2xs">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-bold">SANDBOX / DEVELOPMENT SIMULATION</p>
              <p className="text-[11px] text-slate-600">
                Candidate applications and score queries execute through Sanchay’s authorized Mock Adapter. No real submission to NTA production servers occurs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Online Application Wizard Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-sanchay-navy-700 bg-sanchay-navy-50 px-2 py-0.5 rounded border border-sanchay-navy-200">
                  Online Registration
                </span>
                <h3 className="text-base font-bold text-sanchay-navy-900 mt-2">
                  Apply for JEE (Main) 2026
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Prepare your JEE application using your verified Sanchay profile data. Deterministic auto-fill automatically populates verified demographic and academic credentials.
                </p>
              </div>

              <Link
                href="/services/jee-main/apply"
                className="w-full py-2.5 bg-sanchay-navy-800 hover:bg-sanchay-navy-900 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Launch Application Wizard</span>
                <span>→</span>
              </Link>
            </div>

            {/* Scorecard & City Slip Simulation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Candidate e-Services
                </span>
                <h3 className="text-base font-bold text-sanchay-navy-900 mt-2">
                  Session 1 Scorecard & City Intimation
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  View your simulated NTA Scorecard and advance examination city allotment slip linked to your Sanchay UID.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate UID:</span>
                  <span className="font-mono font-bold text-sanchay-navy-800">SAN-2026-IND-7789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session 1 NTA Score:</span>
                  <span className="font-bold text-sanchay-emerald-600">99.4287514 Percentile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Allotted Exam City:</span>
                  <span className="font-semibold text-slate-800">New Delhi (DL01)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
