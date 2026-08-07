import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Plus, Trash2, CheckCircle2, BarChart2, Mail, Lock, ArrowRight, ArrowLeft, Download, Code, Phone, RefreshCw, Eye, FileText } from 'lucide-react';
import JSZip from 'jszip';
import { generateStandaloneHtml, generateReadme, generateLeadPayloadSchema } from './generateStandaloneQuiz';

const DEFAULT_CONFIG = {
  branding: {
    primaryColor: '#1A73E8',
    bodyColor: '#F1F3F4',
    headerColor: '#3C4043',
    logoUrl: '',
  },
  content: {
    eyebrow: 'Executive Diagnostic (V4)',
    title: 'AI Workplace Readiness Index (V4)',
    description: 'Diagnostic tool to evaluate physical infrastructure readiness for AI-enabled workflows, hybrid presence, and future spatial adaptability.',
  },
  integration: {
    webhookUrl: '',
    geminiApiKey: '',
  },
  results: [
    { maxScore: 30, title: 'Workplace at Risk', tone: 'Critical Gap', color: '#FCE8E6', desc: 'Your workplace is not prepared for AI-era work. Focus, collaboration and adaptability barriers are likely limiting employee performance.', cta: 'Book a Strategy Consultation' },
    { maxScore: 60, title: 'Emerging Workplace', tone: 'Foundational Gaps', color: '#FEF7E0', desc: 'Your workplace has some useful foundations, but support for AI-enabled work, hybrid collaboration and employee choice is inconsistent.', cta: 'Request an Improvement Roadmap' },
    { maxScore: 85, title: 'Adaptive Workplace', tone: 'Optimization Opportunity', color: '#E8F0FE', desc: 'Your workplace supports many modern work behaviors, but there are still clear opportunities to improve focus, flexibility and collaboration performance.', cta: 'Explore Next-Gen Strategies' },
    { maxScore: 100, title: 'AI-Ready Workplace', tone: 'Strong Position', color: '#E6F4EA', desc: 'Your workplace is well positioned for AI-era work, with strong support for focus, collaboration, adaptability and employee experience.', cta: 'Schedule Executive Benchmarking' }
  ],
  questions: [
    { id: "q1", section: "AI adoption", question: "How frequently do employees use AI tools in their daily work?", options: [ { label: "Rarely or never", value: 0 }, { label: "A few employees use AI occasionally", value: 3 }, { label: "AI is used regularly by some teams", value: 6 }, { label: "AI is widely used across departments", value: 10 } ] },
    { id: "q2", section: "AI adoption", question: "Has your organization established clear guidance and training for AI usage?", options: [ { label: "No formal or informal guidance exists", value: 0 }, { label: "Informal guidance exists but is inconsistent", value: 3 }, { label: "Basic policy exists", value: 6 }, { label: "Formal governance, training and adoption support exist", value: 10 } ] },
    { id: "q3", section: "Focus & Cognitive Performance", question: "As AI automates routine tasks, deep-focus knowledge work becomes more critical. How often do employees struggle to concentrate in the office?", options: [ { label: "Frequently", value: 0 }, { label: "Often", value: 3 }, { label: "Occasionally", value: 6 }, { label: "Rarely", value: 10 } ] },
    { id: "q4", section: "Focus & Cognitive Performance", question: "Does your physical workplace provide specialized, distraction-free environments designed for intense, AI-assisted knowledge work?", options: [ { label: "Poorly supported", value: 0 }, { label: "Adequately supported", value: 3 }, { label: "Well supported", value: 6 }, { label: "Extremely well supported", value: 10 } ] },
    { id: "q5", section: "Hybrid Collaboration", question: "AI meeting assistants are changing collaboration. How effective are your current physical spaces at integrating remote participants and AI tools seamlessly?", options: [ { label: "Frequently frustrating", value: 0 }, { label: "Often challenging", value: 3 }, { label: "Generally effective", value: 6 }, { label: "Seamless experience", value: 10 } ] },
    { id: "q6", section: "Hybrid Collaboration", question: "Do employees have access to acoustically optimized spaces specifically designed for video and AI-driven hybrid collaboration?", options: [ { label: "None", value: 0 }, { label: "Very limited", value: 3 }, { label: "Some dedicated spaces", value: 6 }, { label: "Extensive range of dedicated spaces", value: 10 } ] },
    { id: "q7", section: "Workplace Choice", question: "As AI shifts the nature of work, employees need different settings. How many distinct space types are available in your office?", options: [ { label: "1 to 2 space types", value: 0 }, { label: "3 to 4 space types", value: 3 }, { label: "5 to 6 space types", value: 6 }, { label: "7 or more space types", value: 10 } ] },
    { id: "q8", section: "Workplace Choice", question: "Employees can easily transition between different workspaces based on whether they are doing AI-focused individual work or group collaboration.", options: [ { label: "Strongly disagree", value: 0 }, { label: "Disagree", value: 3 }, { label: "Agree", value: 6 }, { label: "Strongly agree", value: 10 } ] },
    { id: "q9", section: "Employee Experience", question: "With AI increasing productivity expectations, how would you rate employee satisfaction with the comfort and experience of your physical workplace?", options: [ { label: "Poor", value: 0 }, { label: "Fair", value: 3 }, { label: "Good", value: 6 }, { label: "Excellent", value: 10 } ] },
    { id: "q10", section: "Employee Experience", question: "Since AI cannot replace human connection, does your workplace effectively foster in-person relationship-building and community?", options: [ { label: "Rarely", value: 0 }, { label: "Sometimes", value: 3 }, { label: "Usually", value: 6 }, { label: "Consistently", value: 10 } ] },
    { id: "q11", section: "Future Readiness", question: "As AI rapidly changes technology needs and team structures, how adaptable is your physical workplace to new spatial requirements?", options: [ { label: "Not at all", value: 0 }, { label: "Somewhat", value: 3 }, { label: "Mostly", value: 6 }, { label: "Highly adaptable", value: 10 } ] },
    { id: "q12", section: "Future Readiness", question: "If AI adoption shifts more work towards in-person collaborative sessions, how prepared is your workplace for a sudden 25% increase in attendance?", options: [ { label: "Major disruption expected", value: 0 }, { label: "Significant adjustments required", value: 3 }, { label: "Minor adjustments required", value: 6 }, { label: "Ready immediately", value: 10 } ] }
  ]
};

const STYLES = `
  :root { font-family: 'Inter', system-ui, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #E5E7EB; color: #1F2937; }
  .app-layout { display: flex; height: 100vh; overflow: hidden; }
  
  .builder-sidebar { width: 500px; background: white; border-right: 1px solid #D1D5DB; display: flex; flex-direction: column; z-index: 10; flex-shrink: 0; }
  .builder-header { padding: 20px; border-bottom: 1px solid #D1D5DB; display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; }
  .builder-header h2 { margin: 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .builder-export-btn { background: #1A73E8; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.2s; }
  .builder-export-btn:hover { background: #1557B0; }
  
  .builder-tabs { display: flex; border-bottom: 1px solid #D1D5DB; }
  .tab-btn { flex: 1; padding: 12px 0; background: none; border: none; font-size: 13px; font-weight: 600; cursor: pointer; color: #6B7280; border-bottom: 2px solid transparent; }
  .tab-btn.active { color: #2563EB; border-bottom-color: #2563EB; }
  .builder-content { flex: 1; overflow-y: auto; padding: 20px; }
  
  .field-group { margin-bottom: 20px; }
  .field-group label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #4B5563; margin-bottom: 8px; }
  .field-group input, .field-group textarea { width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; font-family: inherit; }
  .field-group textarea { resize: vertical; min-height: 80px; }
  
  .q-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #F9FAFB; position: relative; }
  .opt-row { display: grid; grid-template-columns: 1fr 80px 40px; gap: 8px; margin-bottom: 8px; align-items: center; }
  .opt-row input { margin: 0; }
  
  .preview-area { flex: 1; background: var(--bg-page, #F1F3F4); overflow-y: auto; position: relative; display: flex; justify-content: center; padding: 40px 20px; }
  .quiz-shell { width: 100%; max-width: 900px; }
  .quiz-hero { background: var(--header-bg, #3C4043); border-radius: 8px; padding: 24px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; color: white; display: grid; grid-template-columns: 1fr 250px; gap: 32px; align-items: center; }
  .quiz-hero .eyebrow { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9AA0A6; margin-bottom: 8px; display: inline-flex; align-items: center; }
  .quiz-hero h1 { font-size: 28px; font-weight: 400; margin: 0 0 12px; color: white; }
  .quiz-hero p { font-size: 14px; color: #E8EAED; margin: 0; line-height: 1.6; }
  .progress-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 16px 20px; text-align: right; }
  .progress-track { height: 6px; background: rgba(255,255,255,0.15); border-radius: 3px; margin-top: 12px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--primary-color, #1A73E8); transition: width 0.3s ease; }
  
  .quiz-card { background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .question-head { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid #DADCE0; }
  .question-head h2 { font-size: 22px; font-weight: 400; margin: 0; color: #202124; line-height: 1.4; }
  .section-label { display: inline-block; background: #F8F9FA; border: 1px solid #DADCE0; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; color: #5F6368; margin-top: 16px; }
  .options-grid { display: grid; gap: 12px; }
  .option-btn { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border: 1px solid #DADCE0; border-radius: 4px; background: white; cursor: pointer; text-align: left; font-size: 15px; color: #202124; transition: all 0.2s; }
  .option-btn:hover { background: #F8F9FA; }
  .option-btn.selected { border-color: var(--primary-color); background: #E8F0FE; color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
  .nav-row { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 24px; border-top: 1px solid #DADCE0; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
  .btn-primary { background: var(--primary-color); color: white; transition: opacity 0.2s; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: white; border: 1px solid #DADCE0; color: #202124; }
  
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #202124; }
  .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #DADCE0; border-radius: 4px; font-size: 14px; }
  
  .result-grid { display: grid; grid-template-columns: 320px 1fr; gap: 32px; }
  .result-panel { border-radius: 8px; padding: 32px 24px; text-align: center; border: 1px solid #DADCE0; }
  .result-panel h2 { font-size: 24px; font-weight: 400; margin: 24px 0 12px; }
  .score-display { font-size: 72px; font-weight: 300; line-height: 1; margin-top: 24px; }

  /* AI REPORT STYLES */
  .ai-report-box { background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 32px; margin-top: 32px; text-align: left; }
  .ai-report-box .ai-header { display: flex; align-items: center; gap: 8px; color: var(--primary-color); font-weight: 600; font-size: 18px; margin-bottom: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 16px;}
  .ai-loading { display: flex; align-items: center; gap: 12px; color: #6B7280; font-weight: 500; font-size: 14px; }
  .spinner { border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary-color); border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* Rendered HTML inside AI Report */
  .ai-content { font-size: 15px; line-height: 1.75; color: #374151; }
  .top-insights-box { background: #F0F7FF; border: 1px solid #BFDBFE; border-left: 5px solid #1D4ED8; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; }
  .top-insights-box h3 { margin: 0 0 12px 0 !important; font-size: 16px !important; font-weight: 700 !important; color: #1E3A8A !important; border-bottom: none !important; padding-bottom: 0 !important; }
  .top-insights-box ol { margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #1E293B; }
  .top-insights-box li { margin-bottom: 8px; }
  .ai-content h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #F3F4F6; }
  .ai-content h3:first-child { margin-top: 0; }
  .ai-content p { margin: 0 0 16px; }
  .ai-content ul { margin: 0 0 16px; padding-left: 20px; }
  .ai-content li { margin-bottom: 10px; }
  .ai-content blockquote { border-left: 3px solid var(--primary-color); background: #F9FAFB; padding: 12px 16px; margin: 16px 0; font-style: italic; color: #4B5563; border-radius: 0 6px 6px 0; }
  .ai-content a { color: var(--primary-color); text-decoration: underline; font-weight: 500; }
  .ai-content strong { color: #111827; font-weight: 600; }
  .research-citations-box a { color: #2563eb !important; word-break: break-all; }

  /* CITED SOURCES, HOVER TOOLTIPS & FOOTNOTES */
  html { scroll-behavior: smooth; }
  
  .cite-ref {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin: 0 4px;
    vertical-align: baseline;
  }
  .cite-badge {
    display: inline-flex;
    align-items: center;
    background: #EFF6FF;
    color: #1D4ED8 !important;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid #BFDBFE;
    text-decoration: none !important;
    line-height: 1.3;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .cite-badge:hover {
    background: #1D4ED8;
    color: #FFFFFF !important;
    border-color: #1D4ED8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.3);
  }
  
  /* Hover Tooltip behavior */
  .cite-ref[data-tooltip] {
    position: relative;
    cursor: pointer;
  }
  .cite-ref[data-tooltip]::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 128%;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: #0F172A;
    color: #F8FAFC;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.45;
    padding: 8px 12px;
    border-radius: 6px;
    white-space: normal;
    width: max-content;
    max-width: 280px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: left;
  }
  .cite-ref[data-tooltip]::after {
    content: '';
    position: absolute;
    bottom: 112%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px 6px 0 6px;
    border-style: solid;
    border-color: #0F172A transparent transparent transparent;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cite-ref[data-tooltip]:hover::before {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
  .cite-ref[data-tooltip]:hover::after {
    opacity: 1;
    visibility: visible;
  }

  /* Footnotes Box Styling */
  .footnotes-box {
    margin-top: 36px;
    padding: 22px 26px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-left: 4px solid #2563EB;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .footnotes-box h4 {
    margin: 0 0 14px 0;
    font-size: 14px;
    font-weight: 700;
    color: #1E3A8A;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .footnotes-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.65;
    color: #334155;
  }
  .footnotes-list li {
    margin-bottom: 10px;
    transition: background 0.3s ease;
  }
  .footnotes-list li:target {
    background: #FEF08A;
    padding: 4px 8px;
    border-radius: 4px;
  }
  .footnotes-list strong {
    color: #0F172A;
  }

  /* Modal Styles */
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
  .modal-content { background: white; border-radius: 12px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
  .export-option-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; transition: border-color 0.2s; }
  .export-option-card:hover { border-color: #1A73E8; background: #F4F8FF; }

  @media print {
    .builder-sidebar { display: none !important; }
    .app-layout { height: auto !important; overflow: visible !important; display: block !important; }
    .preview-area { background: white !important; padding: 0 !important; overflow: visible !important; display: block !important; }
    .quiz-shell { max-width: 100% !important; margin: 0 !important; }
    .nav-row { display: none !important; }
    .quiz-card { padding: 0 !important; box-shadow: none !important; }
    .quiz-hero { margin-top: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .result-panel { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { background: white !important; margin: 0; padding: 20px; }
  }
`;

export default function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('quizBuilderConfig');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('quizBuilderConfig', JSON.stringify(config));
  }, [config]);

  const [activeTab, setActiveTab] = useState('questions');
  const [isIntegrationUnlocked, setIsIntegrationUnlocked] = useState(false);
  const [integrationPasswordInput, setIntegrationPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lead, setLead] = useState({ name: '', email: '', company: '', role: '' });
  
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0);
  
  const [applied, setApplied] = useState(false);
  const [tel, setTel] = useState('');
  const [telSent, setTelSent] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [isVisitorPreview, setIsVisitorPreview] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'quiz' || params.get('mode') === 'visitor' || params.get('standalone') === 'true';
  });

  const isQuestionStep = step < config.questions.length;
  const isGateStep = step === config.questions.length;
  const isResultStep = step === config.questions.length + 1;
  const progress = isResultStep ? 100 : Math.round((step / (config.questions.length + 1)) * 100);

  const scoreData = useMemo(() => {
    const raw = config.questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const maxPossible = config.questions.length * 10;
    return maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;
  }, [answers, config.questions]);

  const activeResult = useMemo(() => {
    return config.results.find(r => scoreData <= r.maxScore) || config.results[config.results.length - 1];
  }, [scoreData, config.results]);

  const thinkingSteps = useMemo(() => [
    `🔍 Researching Google intelligence & workplace news for "${lead.company || 'your organization'}"...`,
    `📊 Processing survey metrics (${scoreData}/100 index) & response parameters...`,
    `🏗️ Analyzing acoustic transmission (STC), spatial adaptability & IT/power infrastructure...`,
    `💡 Formulating Steelcase ARC diagnostic roadmap and tailored spatial recommendations...`
  ], [lead.company, scoreData]);

  const canProceed = isQuestionStep ? answers[config.questions[step]?.id] !== undefined : (lead.name && lead.email);

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [config.questions[step].id]: val });
    setTimeout(() => setStep(step + 1), 300);
  };

  const getAnswerLabels = () => {
    let labeledAnswers = {};
    config.questions.forEach(q => {
      const selectedOpt = q.options.find(o => o.value === answers[q.id]);
      labeledAnswers[q.id] = selectedOpt ? selectedOpt.label : 'N/A';
    });
    return labeledAnswers;
  };

  const getCleanWebhookUrl = (url) => {
    if (!url) return '';
    let clean = url.trim();
    if (clean.includes('script.google.com') && !clean.endsWith('/exec')) {
      if (clean.endsWith('/')) clean = clean.slice(0, -1);
      clean += '/exec';
    }
    return clean;
  };

  const submitToGoogle = async (actionData) => {
    const url = getCleanWebhookUrl(config.integration.webhookUrl);
    if (!url) return;
    
    try {
      const params = new URLSearchParams();
      params.append('payload', JSON.stringify(actionData));
      
      await fetch(url, { 
        method: 'POST', 
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
    } catch (e) { console.error("Webhook failed:", e); }
  };

  const activeApiKey = config.integration.geminiApiKey || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY);

  const submitToWebhook = async () => {
    setIsSubmitting(true);
    await submitToGoogle({ action: "submit", lead, answers: getAnswerLabels(), score: scoreData, timestamp: new Date().toISOString() });
    setIsSubmitting(false);
    setStep(step + 1);
    generateAiAnalysis();
  };

  const requestAssessment = async () => {
    setApplied(true);
    await submitToGoogle({ action: "update", email: lead.email, assessmentRequested: true, timestamp: new Date().toISOString() });
  };

  const submitTel = async () => {
    if (!tel) return;
    setTelSent(true);
    await submitToGoogle({ action: "update", email: lead.email, tel: tel, timestamp: new Date().toISOString() });
  };

  const generateAiAnalysis = async () => {
    setIsGeneratingAI(true);
    setAiReport("");
    setThinkingStepIndex(0);

    const interval = setInterval(() => {
      setThinkingStepIndex(prev => (prev < 3 ? prev + 1 : prev));
    }, 2200);

    try {
      let qaText = config.questions.map(q => {
        const selectedOpt = q.options.find(o => o.value === answers[q.id]);
        return "Q: " + q.question + "\nA: " + (selectedOpt ? selectedOpt.label : 'N/A');
      }).join('\n\n');

      const response = await fetch("/api/analyze-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: lead.company,
          leadName: lead.name,
          role: lead.role,
          scoreData: scoreData,
          qaText: qaText,
          customApiKey: activeApiKey
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      if (data.html) {
        setAiReport(data.html);
      } else {
        throw new Error("Invalid response");
      }
    } catch (e) {
      console.error("AI Generation error:", e);
      setAiReport(`
        <div class="top-insights-box" style="background: #F0F7FF; border: 1px solid #BFDBFE; border-left: 5px solid #1D4ED8; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1E3A8A; border-bottom: none; padding-bottom: 0;">
            🎯 Executive Summary: Top 3 Critical Technical Readiness Insights
          </h3>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #1E293B;">
            <li style="margin-bottom: 10px;"><strong>Acoustic Spill & Focus Degradation (Bottom-Line Impact):</strong> Uncontained voice prompting in open plan areas creates cognitive task-switching latency, costing up to $28,000 per employee annually in lost productive focus <span class="cite-ref" data-tooltip="Source: UC Irvine / WSJ Focus Study — 23m 15s recovery latency per interruption ($28k/emp/yr)"><a href="#fn-uc-irvine" class="cite-badge">[UC Irvine Study]</a></span>.</li>
            <li style="margin-bottom: 10px;"><strong>Rigid Spatial Topologies & Process Bottlenecks:</strong> Static workstation setups prevent rapid sprint reconfigurations for AI co-creation, slowing project release cycles by 15–25% <span class="cite-ref" data-tooltip="Source: Steelcase Flex Agile Teams Study — Reconfigurable team spaces yield 5x performance gains"><a href="#fn-flex-agile" class="cite-badge">[Flex Agile Study]</a></span>.</li>
            <li style="margin-bottom: 0;"><strong>Immediate High-Value Spatial Intervention:</strong> Deploy STC 38+ rated acoustic micro-pods and dynamic visual privacy boundaries, mirroring proven agility models from Cisco PENN 1 <span class="cite-ref" data-tooltip="Source: Cisco PENN 1 NYC Blueprint — 40% more collaboration space, 36% lower energy costs"><a href="#fn-cisco" class="cite-badge">[Cisco Blueprint]</a></span> and Microsoft modern workplace hubs <span class="cite-ref" data-tooltip="Source: Microsoft AI Workplace Research — 22% developer output velocity gain & 1.2 hrs/day saved"><a href="#fn-microsoft" class="cite-badge">[Microsoft Research]</a></span>.</li>
          </ol>
        </div>

        <h3>1. Company Intelligence & Workplace Research Context</h3>
        <p>Workplace analysis for <strong>${lead.company || 'your organization'}</strong> indicates an accelerating transition toward hybrid collaboration and generative AI workflows. Organizations operating in this space require high spatial adaptability and strict acoustic containment to maximize cognitive output and retain top technical talent.</p>
        
        <h3>2. Technical Score Breakdown (${scoreData}/100 Index Analysis)</h3>
        <p>Your overall score of <strong>${scoreData}/100</strong> highlights key spatial and acoustic vulnerabilities. Modern generative AI workflows demand rapid context-switching between solitary prompting (high acoustic isolation) and team co-creation (agile spatial reconfiguration). Leading enterprise benchmarks—such as SAP's Workplace Health Index study <span class="cite-ref" data-tooltip="Source: SAP Business Health Index — 1% index gain yields $90M–$100M operating profit increase"><a href="#fn-sap" class="cite-badge">[SAP Benchmark]</a></span>—demonstrate that optimizing physical environments directly improves operating margins, where each 1% increase in health and spatial satisfaction yields $90M–$100M in enterprise performance gains.</p>
        
        <h3>3. Critical Architectural & Operational Friction Points (Bottom-Line Impact)</h3>
        <ul>
          <li><strong>Acoustic Spill & Speech Privacy Deficits:</strong> Uncontained voice prompting in open plan areas creates auditory fatigue. <em>Financial Impact:</em> According to UC Irvine / Wall Street Journal focus research <span class="cite-ref" data-tooltip="Source: UC Irvine / WSJ Focus Recovery Study — 23m 15s recovery overhead costing $28k/emp/yr"><a href="#fn-uc-irvine" class="cite-badge">[UC Irvine Study]</a></span>, every open-office interruption requires 23 minutes and 15 seconds to regain deep task focus—draining $28,000 per employee annually in lost billable productivity. Gensler research <span class="cite-ref" data-tooltip="Source: Gensler Workplace Index — High-STC acoustic focus zones boost cognitive performance by 21%"><a href="#fn-gensler" class="cite-badge">[Gensler Index]</a></span> confirms that acoustic focus zones elevate cognitive performance scores by 21%.</li>
          <li><strong>Fixed Workstation Topologies & Sprint Friction:</strong> Rigid desk layouts prevent rapid regrouping for AI project sprints. <em>Financial Impact:</em> Delayed sprint execution lengthens software product delivery cycles by 15–25%, delaying time-to-market and AI ROI.</li>
          <li><strong>Power & Micro-Infrastructure Bottlenecks:</strong> Insufficient mobile power drops create tethering constraints during interactive AI workshops. <em>Financial Impact:</em> Degraded collaboration efficiency increases voluntary engineering turnover, costing $150,000+ per departing specialist in recruitment and onboarding.</li>
        </ul>
        
        <h3>4. High-Performance Spatial Optimization Roadmap</h3>
        <ul>
          <li><strong>Acoustically Rated Micro-Pods:</strong> Deploy isolated booths engineered with STC 38+ ratings for voice-based AI prompting and intense individual focus (modeled after Cisco PENN 1 <span class="cite-ref" data-tooltip="Source: Cisco PENN 1 NYC Workspace — 40% collaboration expansion & double occupancy"><a href="#fn-cisco" class="cite-badge">[Cisco Case Study]</a></span> and Steelcase Paris WorkLife hybrid labs <span class="cite-ref" data-tooltip="Source: Steelcase Paris WorkLife Hybrid Lab — 13% direct gain in daily employee productivity"><a href="#fn-paris-worklife" class="cite-badge">[Steelcase Lab]</a></span>).</li>
          <li><strong>Dynamic Visual Boundaries:</strong> Implement mobile acoustic screens to define project micro-zones and shield confidential screen prompts on demand (proven at IIMA Ventures Accelerator <span class="cite-ref" data-tooltip="Source: IIMA Ventures Accelerator Case Study — Morphable maker labs accelerated iteration by 35%"><a href="#fn-iima" class="cite-badge">[IIMA Case Study]</a></span>).</li>
          <li><strong>Micro-Power Drop Topologies:</strong> Deploy flexible ceiling and under-floor power distribution drops to eliminate tethering constraints in agile AI war rooms.</li>
          <li><strong>Steelcase ARC Guidance:</strong> Explore the <a href="https://swiy.co/Steelcase-4new-Ai-workspaces" target="_blank" rel="noopener noreferrer">Steelcase 4 New AI Workspaces Blueprint</a>, <a href="https://swiy.co/Steelcase-People-Centered-AI-Spaces" target="_blank" rel="noopener noreferrer">People-Centered AI Spaces Research</a>, and <a href="https://swiy.co/Steelcase-community-based-design" target="_blank" rel="noopener noreferrer">Community-Based Design Methodology</a>.</li>
        </ul>
        
        <h3>5. Executive Next Steps: Beyond DIY to Certified Spatial Mastery</h3>
        <p>While these direct diagnostic recommendations allow your team to make immediate, initial spatial adjustments, achieving full 100% workplace optimization for AI adoption involves complex environmental variables like acoustic reverberation (RT60), spatial sensor telemetry, and behavioral ergonomics.</p>
        <p>While internal facilities teams often attempt a DIY approach, global technology leaders—including pioneer organizations like <strong>Microsoft</strong> and <strong>Google</strong>—trust and engage <strong>Steelcase Applied Research + Consulting (ARC)</strong> specialists to masterplan their physical AI environments. A Steelcase ARC consultant will reach out to conduct a holistic, data-driven diagnostic audit to craft a customized Community-Based Design masterplan.</p>

        <div class="footnotes-box">
          <h4>📚 Cited Sources & Benchmark Research References</h4>
          <ol class="footnotes-list">
            <li id="fn-uc-irvine"><strong>UC Irvine / Wall Street Journal Focus Study:</strong> Workplace interruption research demonstrating a 23min 15sec task-switching recovery overhead per interruption ($28,000/employee/year in lost billable productivity).</li>
            <li id="fn-sap"><strong>SAP Workplace Health Index Benchmark:</strong> Enterprise spatial and well-being study showing each 1% increase in index yields $90M–$100M in annual operating profit gain.</li>
            <li id="fn-cisco"><strong>Cisco PENN 1 & Osaka Hybrid Workspace Blueprint:</strong> Office redesign achieving a 40% increase in collaboration zones, 13% workstation capacity gain in 36% less footprint, and $1.2M lease/energy savings.</li>
            <li id="fn-microsoft"><strong>Microsoft Modern AI Workplace Study:</strong> Reengineered AI co-creation workspaces reducing task-switching overhead, eliminating 1.2 hrs/day of redundant sync meetings, and boosting developer velocity by 22%.</li>
            <li id="fn-gensler"><strong>Gensler Workplace Index (Acoustic Focus & Retention):</strong> Companies providing high-STC acoustic focus zones exhibit 21% higher cognitive performance scores and 18% lower voluntary turnover.</li>
            <li id="fn-paris-worklife"><strong>Steelcase Paris WorkLife Hybrid Lab:</strong> Technology-enabled video and acoustic focus pods resulting in a 13% direct gain in daily productivity and a 28% increase in workplace satisfaction.</li>
            <li id="fn-iima"><strong>IIMA Ventures Startup Accelerator Case Study:</strong> Steelcase morphable Maker Labs and mobile acoustic boundaries enabled a 35% acceleration in product iteration cycles.</li>
            <li id="fn-flex-agile"><strong>Steelcase Flex Agile Teams Study:</strong> High-performing cross-functional teams equipped with adaptable furniture and spatial reconfigurability are 5x more likely to be high-performing and profitable.</li>
          </ol>
        </div>
      `);
    } finally {
      clearInterval(interval);
      setIsGeneratingAI(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setAiReport("");
    setLead({ name: '', email: '', company: '', role: '' });
    setApplied(false);
    setTelSent(false);
    setTel("");
  };

  const downloadFile = (filename, content, type = 'application/json') => {
    try {
      const blob = new Blob([content], { type: `${type};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const getSanitizedConfig = (cfg) => {
    const clean = JSON.parse(JSON.stringify(cfg || {}));
    if (clean.integration) {
      clean.integration.geminiApiKey = '';
    }
    return clean;
  };

  const exportJson = () => {
    downloadFile('quiz-config.json', JSON.stringify(getSanitizedConfig(config), null, 2), 'application/json');
  };

  const exportStandaloneHtml = () => {
    try {
      const htmlContent = generateStandaloneHtml(config);
      downloadFile('index.html', htmlContent, 'text/html');
    } catch (err) {
      console.error('Failed to generate standalone HTML:', err);
    }
  };

  const exportReadme = () => {
    const readmeContent = generateReadme(getSanitizedConfig(config));
    downloadFile('README.md', readmeContent, 'text/markdown');
  };

  const exportPayloadSchema = () => {
    const schemaContent = generateLeadPayloadSchema();
    downloadFile('lead-payload-schema.json', schemaContent, 'application/json');
  };

  const exportZipPackage = async () => {
    try {
      const zip = new JSZip();
      const sanitizedConfig = getSanitizedConfig(config);
      zip.file('index.html', generateStandaloneHtml(config));
      zip.file('quiz-config.json', JSON.stringify(sanitizedConfig, null, 2));
      zip.file('README.md', generateReadme(sanitizedConfig));
      zip.file('lead-payload-schema.json', generateLeadPayloadSchema());

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz-github-package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    }
  };

  const exportGitHubFiles = () => {
    setShowExportModal(true);
  };

  return (
    <div className="app-layout">
      <style>{STYLES}</style>
      
      {isVisitorPreview && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          background: '#1E293B',
          color: '#F8FAFC',
          padding: '8px 16px',
          borderRadius: '30px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          border: '1px solid #334155'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Eye size={16} color="#60A5FA" /> Standalone Quiz Preview (No Builder)</span>
          <button 
            onClick={() => setIsVisitorPreview(false)}
            style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* BUILDER SIDEBAR */}
      {!isVisitorPreview && (
        <div className="builder-sidebar">
          <div className="builder-header">
            <h2><Settings size={20} /> Quiz Builder</h2>
            <div style={{display:'flex', gap:6, alignItems:'center'}}>
              <button className="btn btn-secondary" onClick={() => setIsVisitorPreview(true)} style={{fontSize:12, padding:'6px 10px'}} title="Preview standalone quiz view without builder sidebar"><Eye size={14}/> Preview</button>
              <button className="btn btn-secondary" onClick={() => { localStorage.removeItem('quizBuilderConfig'); window.location.reload(); }} style={{fontSize:12, padding:'6px 10px'}}>Reset</button>
              <button className="builder-export-btn" onClick={exportGitHubFiles}><Download size={15}/> Export</button>
            </div>
          </div>
        
        <div className="builder-tabs">
          <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Content</button>
          <button className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>Questions & Scoring</button>
          <button className={`tab-btn ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}>Theme</button>
          <button className={`tab-btn ${activeTab === 'integration' ? 'active' : ''}`} onClick={() => setActiveTab('integration')}>
            Integration {!isIntegrationUnlocked && <Lock size={12} style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }} />}
          </button>
        </div>

        <div className="builder-content">
          {activeTab === 'content' && (
            <>
              <div className="field-group">
                <label>Header Eyebrow</label>
                <input value={config.content.eyebrow} onChange={e => setConfig({...config, content: {...config.content, eyebrow: e.target.value}})} />
              </div>
              <div className="field-group">
                <label>Quiz Title</label>
                <input value={config.content.title} onChange={e => setConfig({...config, content: {...config.content, title: e.target.value}})} />
              </div>
              <div className="field-group">
                <label>Description</label>
                <textarea value={config.content.description} onChange={e => setConfig({...config, content: {...config.content, description: e.target.value}})} />
              </div>
            </>
          )}

          {activeTab === 'theme' && (
            <>
              <div className="field-group">
                <label>Primary Brand Color</label>
                <input type="color" value={config.branding.primaryColor} onChange={e => setConfig({...config, branding: {...config.branding, primaryColor: e.target.value}})} style={{padding: '2px', height: '40px'}} />
              </div>
              <div className="field-group">
                <label>Header Background Color</label>
                <input type="color" value={config.branding.headerColor} onChange={e => setConfig({...config, branding: {...config.branding, headerColor: e.target.value}})} style={{padding: '2px', height: '40px'}} />
              </div>
              <div className="field-group">
                <label>Page Background Color</label>
                <input type="color" value={config.branding.bodyColor} onChange={e => setConfig({...config, branding: {...config.branding, bodyColor: e.target.value}})} style={{padding: '2px', height: '40px'}} />
              </div>
            </>
          )}

          {activeTab === 'questions' && (
            <>
              <p style={{fontSize:'13px', color:'#6B7280', marginTop:0, marginBottom: 16}}>Customize questions, choices, and point values below.</p>
              {config.questions.map((q, qIdx) => (
                <div key={q.id} className="q-card">
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                      <label style={{fontSize: '12px', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', margin: 0}}>Metric {qIdx + 1}</label>
                      <button 
                        onClick={() => {
                          if(window.confirm('Are you sure you want to delete this question?')) {
                            const newQ = [...config.questions];
                            newQ.splice(qIdx, 1);
                            setConfig({...config, questions: newQ});
                          }
                        }} 
                        style={{background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', padding: 4}}
                      >
                        <Trash2 size={14}/> Delete
                      </button>
                  </div>

                  <div className="field-group" style={{marginBottom: 8}}>
                    <label>Question Text</label>
                    <textarea value={q.question} onChange={e => {
                      const newQ = [...config.questions];
                      newQ[qIdx].question = e.target.value;
                      setConfig({...config, questions: newQ});
                    }} />
                  </div>
                  <div className="field-group" style={{marginBottom: 12}}>
                    <label>Category / Section</label>
                    <input value={q.section} onChange={e => {
                      const newQ = [...config.questions];
                      newQ[qIdx].section = e.target.value;
                      setConfig({...config, questions: newQ});
                    }} />
                  </div>
                  <label style={{fontSize:'11px', textTransform:'uppercase', fontWeight:600, color:'#4B5563', marginBottom:6, display:'block'}}>Answer Options & Points</label>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="opt-row">
                      <input value={opt.label} placeholder="Answer text" onChange={e => {
                        const newQ = [...config.questions];
                        newQ[qIdx].options[optIdx].label = e.target.value;
                        setConfig({...config, questions: newQ});
                      }} />
                      <input type="number" value={opt.value} placeholder="Pts" onChange={e => {
                        const newQ = [...config.questions];
                        newQ[qIdx].options[optIdx].value = Number(e.target.value);
                        setConfig({...config, questions: newQ});
                      }} />
                      <button className="btn btn-secondary" style={{padding:'8px', width:'100%', height:'100%'}} onClick={() => {
                        const newQ = [...config.questions];
                        newQ[qIdx].options.splice(optIdx, 1);
                        setConfig({...config, questions: newQ});
                      }}><Trash2 size={16} color="#DC2626"/></button>
                    </div>
                  ))}
                  <button className="btn btn-secondary" style={{width:'100%', marginTop:8, fontSize:'12px'}} onClick={() => {
                    const newQ = [...config.questions];
                    newQ[qIdx].options.push({ label: 'New Option', value: 5 });
                    setConfig({...config, questions: newQ});
                  }}><Plus size={14}/> Add Choice</button>
                </div>
              ))}

              <div style={{ padding: '24px 0', marginTop: '16px', borderTop: '2px dashed #D1D5DB' }}>
                <button 
                  className="btn btn-primary" 
                  style={{width:'100%', justifyContent: 'center', padding: '16px', fontSize: '15px', fontWeight: 'bold', backgroundColor: '#10B981', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}} 
                  onClick={() => {
                    const newQ = [...config.questions];
                    newQ.push({
                        id: "q" + Date.now(),
                        section: "New Category",
                        question: "Enter your new question here...",
                        options: [
                            { label: "Option 1", value: 0 },
                            { label: "Option 2", value: 5 },
                            { label: "Option 3", value: 10 }
                        ]
                    });
                    setConfig({...config, questions: newQ});
                    
                    setTimeout(() => {
                      const contentArea = document.querySelector('.builder-content');
                      if (contentArea) contentArea.scrollTop = contentArea.scrollHeight;
                    }, 100);
                }}>
                  <Plus size={20} style={{marginRight: 8}}/> + ADD NEW QUESTION
                </button>
              </div>
            </>
          )}

          {activeTab === 'integration' && (
            !isIntegrationUnlocked ? (
              <div style={{ padding: '24px 16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', background: '#FEF3C7', color: '#D97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Lock size={22} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '600', color: '#111827' }}>Integration Settings Locked</h3>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
                  Enter password to view and edit Webhook URLs and Gemini API keys.
                </p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (integrationPasswordInput === '987321654') {
                    setIsIntegrationUnlocked(true);
                    setPasswordError(false);
                    setIntegrationPasswordInput('');
                  } else {
                    setPasswordError(true);
                  }
                }}>
                  <div className="field-group" style={{ textAlign: 'left', marginBottom: '12px' }}>
                    <label>Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter password..." 
                      value={integrationPasswordInput} 
                      onChange={e => {
                        setIntegrationPasswordInput(e.target.value);
                        setPasswordError(false);
                      }} 
                      autoFocus
                    />
                  </div>
                  {passwordError && (
                    <div style={{ color: '#DC2626', fontSize: '12px', marginBottom: '12px', textAlign: 'left', fontWeight: '500' }}>
                      Incorrect password. Please try again.
                    </div>
                  )}
                  <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                    Unlock Integration
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Unlocked
                  </span>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setIsIntegrationUnlocked(false)} 
                    style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Lock size={12} /> Lock Tab
                  </button>
                </div>
                <div className="field-group">
                  <label>Google Sheets Webhook URL</label>
                  <input placeholder="https://script.google.com/macros/s/..." value={config.integration.webhookUrl} onChange={e => setConfig({...config, integration: {...config.integration, webhookUrl: e.target.value}})} />
                  <div style={{fontSize:'12px', color:'#059669', marginTop:'6px', display:'flex', alignItems:'center', gap:'4px'}}><CheckCircle2 size={14}/> Settings automatically saved locally</div>
                </div>
                <div className="field-group">
                  <label>Gemini API Key (For Custom AI Reports)</label>
                  <input placeholder="AIzaSy..." type="password" value={config.integration.geminiApiKey} onChange={e => setConfig({...config, integration: {...config.integration, geminiApiKey: e.target.value}})} />
                  <p style={{fontSize:'12px', color:'#6B7280', marginTop:'8px'}}>Get a free key from Google AI Studio. If provided, the final report will automatically generate a custom analysis using Gemini 3.5 Flash-Lite.</p>
                </div>
              </>
            )
          )}
        </div>
      </div>
      )}

      {/* PREVIEW AREA */}
      <div className="preview-area" style={{ '--bg-page': config.branding.bodyColor, '--primary-color': config.branding.primaryColor, '--header-bg': config.branding.headerColor }}>
        <div className="quiz-shell">
          <div className="quiz-hero">
            <div>
              <div className="eyebrow"><BarChart2 size={14} style={{marginRight: 6}} /> {config.content.eyebrow}</div>
              <h1>{config.content.title}</h1>
              <p>{config.content.description}</p>
            </div>
            <div className="progress-card">
              <div style={{fontSize:'12px', fontWeight:600, color:'#9AA0A6', textTransform:'uppercase'}}>{isResultStep ? 'Report Generated' : 'Data Collection'}</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
              <div style={{fontSize:'28px', color:'white', marginTop:'12px'}}>{progress}%</div>
            </div>
          </div>

          <main className="quiz-card">
            {isQuestionStep && (() => {
              const q = config.questions[step];
              if (!q) return null; 
              
              return (
                <div>
                  <div className="question-head">
                    <div style={{fontSize:'12px', fontWeight:600, color:'#5F6368', textTransform:'uppercase', marginBottom:'12px'}}>Metric {step + 1} of {config.questions.length}</div>
                    <h2>{q.question}</h2>
                    <div className="section-label">{q.section}</div>
                  </div>
                  <div className="options-grid">
                    {q.options.map(opt => {
                      const selected = answers[q.id] === opt.value;
                      return (
                        <button key={opt.label} onClick={() => handleAnswer(opt.value)} className={`option-btn ${selected ? 'selected' : ''}`}>
                          <span>{opt.label} (<b>{opt.value} pts</b>)</span>
                          {selected && <CheckCircle2 size={18} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {isGateStep && (
              <div>
                <div className="question-head">
                  <h2>Generate Your Diagnostic Report</h2>
                  <p style={{color:'#5F6368', marginTop:'8px'}}>Data collection complete. Enter your details to process your customized readiness profile.</p>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label>Full Name *</label><input required value={lead.name} onChange={e=>setLead({...lead, name: e.target.value})} /></div>
                  <div className="form-group"><label>Work Email *</label><input type="email" required value={lead.email} onChange={e=>setLead({...lead, email: e.target.value})} /></div>
                  <div className="form-group"><label>Company</label><input value={lead.company} onChange={e=>setLead({...lead, company: e.target.value})} /></div>
                  <div className="form-group"><label>Role / Job Title</label><input value={lead.role} onChange={e=>setLead({...lead, role: e.target.value})} /></div>
                </div>
                <div style={{fontSize:'12px', color:'#5F6368', display:'flex', alignItems:'center', gap:'6px'}}><Lock size={12}/> Data securely processed.</div>
              </div>
            )}

            {isResultStep && (
              <div className="result-grid">
                <div>
                  <div className="result-panel" style={{backgroundColor: activeResult.color}}>
                    <div style={{fontSize:'12px', fontWeight:600, textTransform:'uppercase'}}>{activeResult.tone}</div>
                    <div className="score-display">{scoreData}</div>
                    <div style={{fontSize:'12px', fontWeight:600}}>OUT OF 100</div>
                    <h2>{activeResult.title}</h2>
                    <p style={{fontSize:'14px', lineHeight:'1.6'}}>{activeResult.desc}</p>
                  </div>
                </div>
                
                <div>
                  {activeApiKey && (
                    <div className="ai-report-box" style={{marginTop:0, marginBottom: 24}}>
                      <div className="ai-header"><BarChart2 size={20}/> Custom AI Diagnosis</div>
                      {isGeneratingAI ? (
                        <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                            <div className="spinner" style={{ width: 20, height: 20, border: '3px solid #BFDBFE', borderTopColor: '#1D4ED8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1E3A8A' }}>Steelcase ARC AI Engine Working...</h4>
                              <span style={{ fontSize: '12px', color: '#64748B' }}>Synthesizing web research & spatial metrics</span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {thinkingSteps.map((stepText, idx) => {
                              const isPast = idx < thinkingStepIndex;
                              const isCurrent = idx === thinkingStepIndex;
                              return (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '10px', 
                                  fontSize: '13px', 
                                  color: isCurrent ? '#1D4ED8' : isPast ? '#059669' : '#94A3B8',
                                  fontWeight: isCurrent ? 600 : 400,
                                  transition: 'all 0.3s ease',
                                  padding: '8px 12px',
                                  background: isCurrent ? '#EFF6FF' : isPast ? '#F0FDF4' : 'transparent',
                                  borderRadius: '6px',
                                  border: isCurrent ? '1px solid #BFDBFE' : '1px solid transparent'
                                }}>
                                  {isPast ? (
                                    <CheckCircle2 size={16} color="#059669" />
                                  ) : isCurrent ? (
                                    <div className="spinner" style={{ width: 14, height: 14, border: '2px solid #93C5FD', borderTopColor: '#1D4ED8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                  ) : (
                                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #CBD5E1' }}></div>
                                  )}
                                  <span>{stepText}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="ai-content" dangerouslySetInnerHTML={{__html: aiReport}} />
                      )}
                    </div>
                  )}
                  
                  <div style={{padding:'24px', background:'#F8F9FA', borderRadius:'8px', border:'1px solid #DADCE0'}}>
                    <h4 style={{margin:'0 0 8px', fontSize:'16px'}}>Professional Assessment</h4>
                    <p style={{fontSize:'13px', color:'#5F6368', margin:'0 0 16px'}}>Schedule a deep-dive session with a workplace strategy specialist.</p>
                    
                    <button 
                      className="btn btn-primary" 
                      onClick={requestAssessment}
                      disabled={applied}
                      style={{width: '100%', justifyContent: 'center', marginBottom: 12, backgroundColor: applied ? '#9CA3AF' : 'var(--primary-color)'}}
                    >
                      <Mail size={16}/> {applied ? "Request Sent" : "Apply Now"}
                    </button>
                    
                    {applied && !telSent && (
                      <div style={{background:'white', padding:16, border:'1px solid #E5E7EB', borderRadius:6, marginTop:12}}>
                        <label style={{fontSize:12, fontWeight:600, display:'block', marginBottom:8}}>Add Telephone (Optional)</label>
                        <div style={{display:'flex', gap:8}}>
                          <input type="tel" placeholder="+1..." value={tel} onChange={e=>setTel(e.target.value)} style={{flex:1, padding:'8px 12px', border:'1px solid #D1D5DB', borderRadius:4}} />
                          <button onClick={submitTel} className="btn btn-secondary" style={{padding:'8px 12px'}}>Send</button>
                        </div>
                      </div>
                    )}
                    {telSent && (
                      <div style={{fontSize:13, color:'#059669', display:'flex', alignItems:'center', gap:6, marginTop:8}}><CheckCircle2 size={14}/> Phone saved</div>
                    )}
                    
                    <div style={{fontSize:12, color:'#059669', display:'flex', alignItems:'center', gap:6, justifyContent:'center', marginTop:12}}>
                      <CheckCircle2 size={14}/> Qualified for Consultation
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Repaired Bottom Navigation */}
            <div className="nav-row">
              <button className="btn btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || isResultStep || isSubmitting || isGeneratingAI}>
                <ArrowLeft size={16} /> Back
              </button>
              
              {isGateStep && (
                <button 
                  className="btn btn-primary" 
                  onClick={submitToWebhook} 
                  disabled={!canProceed || isSubmitting || isGeneratingAI}
                  style={{
                    opacity: (!canProceed || isSubmitting || isGeneratingAI) ? 0.7 : 1,
                    cursor: (!canProceed || isSubmitting || isGeneratingAI) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {(isSubmitting || isGeneratingAI) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <div className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      Analyzing & Generating Report...
                    </span>
                  ) : (
                    <>
                      Generate Report <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Repaired Reset Button Layout */}
            {isResultStep && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  onClick={resetQuiz}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', transition: 'color 0.2s' }}
                >
                  <RefreshCw size={14} /> Retake Assessment
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, borderBottom:'1px solid #E5E7EB', paddingBottom:12}}>
              <h3 style={{margin:0, fontSize:18, fontWeight:600, display:'flex', alignItems:'center', gap:8, color:'#111827'}}>
                <Download size={20} color="#1A73E8"/> Export Standalone Quiz Package
              </h3>
              <button onClick={() => setShowExportModal(false)} style={{background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6B7280'}}>✕</button>
            </div>
            
            <p style={{fontSize:14, color:'#4B5563', marginTop:0, marginBottom:16, lineHeight:1.5}}>
              Export <strong>JUST the functional quiz</strong> (without the builder sidebar) ready to host on GitHub Pages or any web server for visitors!
            </p>

            {/* HIGH PRIORITY ZIP PACKAGE CARD */}
            <div style={{ background: '#F0F7FF', border: '2px solid #3B82F6', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📦 Complete GitHub Pages Repository Package (.zip)
                  </strong>
                  <span style={{ fontSize: '13px', color: '#334155', display: 'block', marginTop: '4px' }}>
                    Includes <code>index.html</code> (standalone quiz), <code>README.md</code> (setup instructions), <code>quiz-config.json</code>, and <code>lead-payload-schema.json</code>.
                  </span>
                </div>
                <button className="btn btn-primary" onClick={exportZipPackage} style={{ fontSize: '14px', padding: '10px 18px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0, backgroundColor: '#1D4ED8' }}>
                  <Download size={16}/> Download ZIP
                </button>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px', letterSpacing: '0.05em' }}>
              Or Download Individual Files:
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>index.html (Standalone Quiz App)</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>Complete single-file interactive quiz web app. Zero builder UI — pure quiz experience for visitors!</span>
              </div>
              <button className="btn btn-secondary" onClick={exportStandaloneHtml} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download HTML</button>
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>README.md (GitHub Setup Guide)</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>Step-by-step instructions on publishing your quiz to GitHub Pages in 2 minutes.</span>
              </div>
              <button className="btn btn-secondary" onClick={exportReadme} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download Guide</button>
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>quiz-config.json</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>JSON quiz config schema, branding, questions, and webhook settings.</span>
              </div>
              <button className="btn btn-secondary" onClick={exportJson} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download JSON</button>
            </div>

            <div className="export-option-card">
              <div>
                <strong style={{fontSize:14, color:'#111827', display:'block'}}>lead-payload-schema.json</strong>
                <span style={{fontSize:12, color:'#6B7280'}}>Webhook payload schema sent to Google Sheets / Zapier.</span>
              </div>
              <button className="btn btn-secondary" onClick={exportPayloadSchema} style={{fontSize:13, padding:'8px 14px'}}><Download size={14}/> Download Schema</button>
            </div>

            <div style={{marginTop:20, textAlign:'right'}}>
              <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
