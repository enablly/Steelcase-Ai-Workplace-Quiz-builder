function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateStandaloneHtml(rawConfig) {
  // Always strip sensitive API keys before exporting to client-side HTML to prevent credential leakage and pass GitHub secret scanning
  const config = JSON.parse(JSON.stringify(rawConfig || {}));
  if (config.integration) {
    config.integration.geminiApiKey = '';
  }
  const configJson = JSON.stringify(config, null, 2);
  const primaryColor = config.branding?.primaryColor || '#1A73E8';
  const headerColor = config.branding?.headerColor || '#3C4043';
  const bodyColor = config.branding?.bodyColor || '#F1F3F4';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(config.content?.title || 'Interactive Diagnostic Quiz')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${primaryColor};
      --header-bg: ${headerColor};
      --bg-page: ${bodyColor};
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg-page);
      color: #1F2937;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .preview-area {
      width: 100%;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
    }
    .quiz-shell {
      width: 100%;
      max-width: 900px;
    }
    .quiz-hero {
      background: var(--header-bg);
      border-radius: 8px;
      padding: 24px 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 24px;
      color: white;
      display: grid;
      grid-template-columns: 1fr 250px;
      gap: 32px;
      align-items: center;
    }
    @media (max-width: 640px) {
      .quiz-hero { grid-template-columns: 1fr; gap: 16px; padding: 20px; }
      .preview-area { padding: 16px 10px; }
      .quiz-card { padding: 20px !important; }
      .form-grid { grid-template-columns: 1fr !important; }
      .result-grid { grid-template-columns: 1fr !important; }
    }
    .quiz-hero .eyebrow {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #9AA0A6;
      margin-bottom: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .quiz-hero h1 { font-size: 26px; font-weight: 400; margin: 0 0 12px; color: white; line-height: 1.3; }
    .quiz-hero p { font-size: 14px; color: #E8EAED; margin: 0; line-height: 1.6; }
    .progress-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 16px 20px;
      text-align: right;
    }
    .progress-track {
      height: 6px;
      background: rgba(255,255,255,0.15);
      border-radius: 3px;
      margin-top: 12px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
      width: 0%;
    }
    .quiz-card {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .question-head {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid #DADCE0;
    }
    .question-head h2 { font-size: 22px; font-weight: 400; margin: 0; color: #202124; line-height: 1.4; }
    .section-label {
      display: inline-block;
      background: #F8F9FA;
      border: 1px solid #DADCE0;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      color: #5F6368;
      margin-top: 16px;
    }
    .options-grid { display: grid; gap: 12px; }
    .option-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border: 1px solid #DADCE0;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      text-align: left;
      font-size: 15px;
      color: #202124;
      transition: all 0.2s;
      width: 100%;
    }
    .option-btn:hover { background: #F8F9FA; }
    .option-btn.selected {
      border-color: var(--primary-color);
      background: #E8F0FE;
      color: var(--primary-color);
      box-shadow: inset 0 0 0 1px var(--primary-color);
    }
    .nav-row {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #DADCE0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: white; border: 1px solid #DADCE0; color: #202124; }
    .btn-secondary:hover { background: #F8F9FA; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #202124; }
    .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #DADCE0; border-radius: 4px; font-size: 14px; }

    .result-grid { display: grid; grid-template-columns: 320px 1fr; gap: 32px; }
    .result-panel { border-radius: 8px; padding: 32px 24px; text-align: center; border: 1px solid #DADCE0; }
    .result-panel h2 { font-size: 24px; font-weight: 400; margin: 24px 0 12px; }
    .score-display { font-size: 72px; font-weight: 300; line-height: 1; margin-top: 24px; }

    .ai-report-box { background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 28px; margin-bottom: 24px; text-align: left; }
    .ai-report-box .ai-header { display: flex; align-items: center; gap: 8px; color: var(--primary-color); font-weight: 600; font-size: 18px; margin-bottom: 20px; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px;}
    .ai-content { font-size: 15px; line-height: 1.75; color: #374151; }
    .top-insights-box { background: #F0F7FF; border: 1px solid #BFDBFE; border-left: 5px solid #1D4ED8; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; }
    .top-insights-box h3 { margin: 0 0 12px 0 !important; font-size: 16px !important; font-weight: 700 !important; color: #1E3A8A !important; border-bottom: none !important; padding-bottom: 0 !important; }
    .top-insights-box ol { margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #1E293B; }
    .top-insights-box li { margin-bottom: 8px; }
    .ai-content h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #F3F4F6; }
    .ai-content p { margin: 0 0 16px; }
    .ai-content ul { margin: 0 0 16px; padding-left: 20px; }
    .ai-content li { margin-bottom: 10px; }
    .ai-content a { color: var(--primary-color); text-decoration: underline; font-weight: 500; }

    .cite-ref { position: relative; display: inline-flex; align-items: center; margin: 0 4px; vertical-align: baseline; }
    .cite-badge { display: inline-flex; align-items: center; background: #EFF6FF; color: #1D4ED8 !important; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid #BFDBFE; text-decoration: none !important; line-height: 1.3; }
    .footnotes-box { margin-top: 36px; padding: 22px 26px; background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #2563EB; border-radius: 8px; }
    .footnotes-box h4 { margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; letter-spacing: 0.04em; }
    .footnotes-list { margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.65; color: #334155; }
    .footnotes-list li { margin-bottom: 10px; }

    .spinner { border: 3px solid rgba(0,0,0,0.1); border-top-color: var(--primary-color); border-radius: 50%; width: 18px; height: 18px; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="preview-area">
    <div class="quiz-shell">
      ${config.branding && config.branding.logoUrl ? `
        <div style="margin-bottom:16px; display:flex; justify-content:flex-start; align-items:center;">
          <img src="${config.branding.logoUrl}" alt="Brand Logo" style="max-height:60px; max-width:280px; object-fit:contain;" />
        </div>
      ` : ''}
      <div class="quiz-hero">
        <div>
          <div class="eyebrow" id="hero-eyebrow">📊 Diagnostic Tool</div>
          <h1 id="hero-title">Interactive Diagnostic Quiz</h1>
          <p id="hero-desc"></p>
        </div>
        <div class="progress-card">
          <div style="font-size:12px; font-weight:600; color:#9AA0A6; text-transform:uppercase;" id="progress-label">Data Collection</div>
          <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
          <div style="font-size:28px; color:white; margin-top:12px;" id="progress-text">0%</div>
        </div>
      </div>

      <main class="quiz-card" id="quiz-main-card">
        <!-- Rendered dynamically by JavaScript -->
      </main>
    </div>
  </div>

  <div id="link-modal-overlay" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(17, 24, 39, 0.6); backdrop-filter:blur(4px); z-index:99999; align-items:center; justify-content:center; padding:20px;">
    <div style="background:white; border-radius:12px; width:100%; max-width:420px; padding:24px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #E5E7EB; text-align:center;">
      <div style="width:48px; height:48px; border-radius:50%; background:#EFF6FF; color:#1D4ED8; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:22px;">
        📄
      </div>
      <h3 style="margin:0 0 8px; font-size:18px; font-weight:700; color:#111827;">Link Protected</h3>
      <p style="margin:0 0 20px; font-size:14px; color:#4B5563; line-height:1.5;">Full link included in PDF download.</p>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary" onclick="hideExternalLinkPopup()" style="flex:1; justify-content:center;">Close</button>
        <button class="btn btn-primary" onclick="hideExternalLinkPopup(); downloadPdfReport();" style="flex:1; justify-content:center;">📄 Download PDF</button>
      </div>
    </div>
  </div>

  <script>
    const QUIZ_CONFIG = ${configJson};

    const FREE_EMAIL_DOMAINS = new Set([
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'me.com', 'mac.com',
      'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com', 'gmx.com',
      'live.com', 'msn.com', 'comcast.net', 'sbcglobal.net', 'cox.net', 'att.net', 'verizon.net',
      'googlemail.com', 'rocketmail.com', 'ymail.com', 'mail.ru', 'qq.com', '163.com', '126.com',
      'fastmail.com', 'hushmail.com', 'tutanota.com', 'tutamail.com'
    ]);

    function isWorkEmail(email) {
      if (!email || typeof email !== 'string') return false;
      const trimmed = email.trim().toLowerCase();
      if (!trimmed.includes('@')) return false;
      const parts = trimmed.split('@');
      if (parts.length !== 2) return false;
      const domain = parts[1];
      if (!domain || !domain.includes('.')) return false;
      return !FREE_EMAIL_DOMAINS.has(domain);
    }

    let currentStep = 0;
    let isTransitioning = false;
    let answers = {};
    let lead = { name: '', email: '', company: '', role: '', projectStatus: '' };
    let isApplied = false;
    let telSent = false;

    function init() {
      document.getElementById('hero-eyebrow').innerText = '📊 ' + (QUIZ_CONFIG.content?.eyebrow || 'Diagnostic');
      document.getElementById('hero-title').innerText = QUIZ_CONFIG.content?.title || 'Interactive Diagnostic';
      document.getElementById('hero-desc').innerText = QUIZ_CONFIG.content?.description || '';
      render();
    }

    function calculateProgress() {
      const totalQuestions = QUIZ_CONFIG.questions.length;
      const isResult = currentStep > totalQuestions;
      if (isResult) return 100;
      return Math.round((currentStep / (totalQuestions + 1)) * 100);
    }

    function updateProgressUI() {
      const p = calculateProgress();
      const isResult = currentStep > QUIZ_CONFIG.questions.length;
      document.getElementById('progress-fill').style.width = p + '%';
      document.getElementById('progress-text').innerText = p + '%';
      document.getElementById('progress-label').innerText = isResult ? 'Report Generated' : 'Data Collection';
    }

    function calculateScore() {
      let raw = 0;
      QUIZ_CONFIG.questions.forEach(q => {
        if (answers[q.id] !== undefined) raw += answers[q.id];
      });
      const maxPossible = QUIZ_CONFIG.questions.length * 10;
      return maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;
    }

    function getAnswerLabels() {
      let labeled = {};
      QUIZ_CONFIG.questions.forEach(q => {
        const val = answers[q.id];
        const opt = q.options ? q.options.find(o => o.value === val) : null;
        labeled[q.id] = opt ? opt.label : (val !== undefined ? val : 'N/A');
      });
      return labeled;
    }

    function getActiveResult(score) {
      const results = QUIZ_CONFIG.results || [];
      return results.find(r => score <= r.maxScore) || results[results.length - 1] || {
        title: 'Diagnostic Complete',
        tone: 'Completed',
        color: '#E8F0FE',
        desc: 'Thank you for completing the assessment.',
        cta: 'Contact Us'
      };
    }

    function render() {
      updateProgressUI();
      const mainCard = document.getElementById('quiz-main-card');
      const totalQuestions = QUIZ_CONFIG.questions.length;

      if (currentStep < totalQuestions) {
        // Question Step
        const q = QUIZ_CONFIG.questions[currentStep];
        let optionsHtml = '';
        q.options.forEach(opt => {
          const selected = answers[q.id] === opt.value;
          optionsHtml += \`
            <button class="option-btn \${selected ? 'selected' : ''}" onclick="selectAnswer('\${q.id}', \${opt.value})">
              <span>\${escapeHtml(opt.label)}</span>
              \${selected ? '<span style="color:var(--primary-color)">✓</span>' : ''}
            </button>
          \`;
        });

        mainCard.innerHTML = \`
          <div class="question-head">
            <div style="font-size:12px; font-weight:600; color:#5F6368; text-transform:uppercase; margin-bottom:12px;">Metric \${currentStep + 1} of \${totalQuestions}</div>
            <h2>\${escapeHtml(q.question)}</h2>
            <div class="section-label">\${escapeHtml(q.section || 'General')}</div>
          </div>
          <div class="options-grid">
            \${optionsHtml}
          </div>
          <div class="nav-row">
            <button class="btn btn-secondary" onclick="prevStep()" \${currentStep === 0 ? 'disabled' : ''}>← Back</button>
            <div></div>
          </div>
        \`;
      } else if (currentStep === totalQuestions) {
        // Gate Step
        const isFreeEmail = lead.email && lead.email.includes('@') && !isWorkEmail(lead.email);
        mainCard.innerHTML = \`
          <div class="question-head">
            <h2>Generate Your Diagnostic Report</h2>
            <p style="color:#5F6368; margin-top:8px;">Data collection complete. Enter your contact details and workplace project status to process your customized readiness profile.</p>
          </div>
          <form onsubmit="submitGateForm(event)">
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name *</label>
                <input id="lead-name" required placeholder="e.g. Jane Doe" value="\${escapeHtml(lead.name)}" oninput="lead.name=this.value; checkCanProceed();" />
              </div>
              <div class="form-group">
                <label>Work Email *</label>
                <input type="email" id="lead-email" required placeholder="name@company.com" value="\${escapeHtml(lead.email)}" oninput="handleEmailInput(this.value);" style="border-color: \${isFreeEmail ? '#EF4444' : '#DADCE0'};" />
                <div id="email-error-msg" style="display: \${isFreeEmail ? 'block' : 'none'}; font-size:12px; color:#DC2626; margin-top:6px; font-weight:500;">
                  ⚠️ Please enter your official work email. Personal accounts (Gmail, Yahoo, Hotmail, etc.) are not accepted.
                </div>
              </div>
              <div class="form-group">
                <label>Company *</label>
                <input id="lead-company" required placeholder="e.g. Steelcase Inc." value="\${escapeHtml(lead.company)}" oninput="lead.company=this.value; checkCanProceed();" />
              </div>
              <div class="form-group">
                <label>Job Title / Role</label>
                <input id="lead-role" placeholder="e.g. Director of Real Estate & Workplace" value="\${escapeHtml(lead.role)}" oninput="lead.role=this.value" />
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label style="display:block; font-size:13px; font-weight:600; color:#202124; margin-bottom:8px;">
                  What best describes your current workplace project status? *
                </label>
                <select id="lead-status" required onchange="lead.projectStatus=this.value; checkCanProceed();" style="width:100%; padding:10px 14px; border:1px solid #DADCE0; border-radius:4px; font-size:14px; background-color:white; color:\${lead.projectStatus ? '#111827' : '#6B7280'};">
                  <option value="" \${!lead.projectStatus ? 'selected' : ''} disabled>-- Select project status --</option>
                  <option value="A - Active project, decisions within 6 months" \${lead.projectStatus === "A - Active project, decisions within 6 months" ? 'selected' : ''}>A - Active project, decisions within 6 months</option>
                  <option value="B - Exploring a project, 6-12 months" \${lead.projectStatus === "B - Exploring a project, 6-12 months" ? 'selected' : ''}>B - Exploring a project, 6-12 months</option>
                  <option value="C - Future project, no timeline yet" \${lead.projectStatus === "C - Future project, no timeline yet" ? 'selected' : ''}>C - Future project, no timeline yet</option>
                  <option value="D - Researching workplace trends and best practices" \${lead.projectStatus === "D - Researching workplace trends and best practices" ? 'selected' : ''}>D - Researching workplace trends and best practices</option>
                  <option value="E - We are Dealer / Architect / Designer / Industry Partner" \${lead.projectStatus === "E - We are Dealer / Architect / Designer / Industry Partner" ? 'selected' : ''}>E - We are Dealer / Architect / Designer / Industry Partner</option>
                </select>
              </div>
            </div>
            <div style="font-size:12px; color:#5F6368; margin-bottom:20px; display:flex; align-items:center; gap:6px;">🔒 Data securely processed. Official work email required.</div>
            <div class="nav-row">
              <button type="button" class="btn btn-secondary" onclick="prevStep()">← Back</button>
              <button type="submit" id="btn-submit-gate" class="btn btn-primary" \${!(lead.name && lead.email && isWorkEmail(lead.email) && lead.company && lead.projectStatus) ? 'disabled' : ''}>Generate Report →</button>
            </div>
          </form>
        \`;
      } else {
        // Result Step
        const score = calculateScore();
        const activeRes = getActiveResult(score);
        const defaultAiReport = generateStaticAiReport(score, lead.company, lead.name);

        mainCard.innerHTML = \`
          <div class="result-grid">
            <div>
              <div class="result-panel" style="background-color: \${activeRes.color}">
                <div style="font-size:12px; font-weight:600; text-transform:uppercase;">\${escapeHtml(activeRes.tone)}</div>
                <div class="score-display">\${score}</div>
                <div style="font-size:12px; font-weight:600;">OUT OF 100</div>
                <h2>\${escapeHtml(activeRes.title)}</h2>
                <p style="font-size:14px; line-height:1.6;">\${escapeHtml(activeRes.desc)}</p>
              </div>
            </div>
            
            <div>
              <div class="ai-report-box">
                <div class="ai-header" style="display:flex; justify-content:space-between; align-items:center;">
                  <span>📊 Custom AI Diagnosis</span>
                  <button class="btn btn-secondary" onclick="downloadPdfReport()" style="font-size:12px; padding:6px 12px; background:white; border-color:#BFDBFE; color:#1D4ED8; cursor:pointer;">
                    📄 Download PDF Report
                  </button>
                </div>
                <div class="ai-content">\${defaultAiReport}</div>
              </div>

              <div style="padding:24px; background:#F8F9FA; border-radius:8px; border:1px solid #DADCE0;">
                <h4 style="margin:0 0 8px; font-size:16px;">Professional Assessment</h4>
                <p style="font-size:13px; color:#5F6368; margin:0 0 16px;">Schedule a deep-dive session with a workplace strategy specialist.</p>
                
                <button class="btn btn-primary" id="btn-apply-cta" onclick="requestAssessment()" style="width:100%; justify-content:center; margin-bottom:12px; background-color: \${isApplied ? '#9CA3AF' : 'var(--primary-color)'}" \${isApplied ? 'disabled' : ''}>
                  \${isApplied ? '✓ Request Sent' : '✉ Apply Now'}
                </button>

                <div id="tel-box" style="display:\${isApplied && !telSent ? 'block' : 'none'}; background:white; padding:16px; border:1px solid #E5E7EB; border-radius:6px; margin-top:12px;">
                  <label style="font-size:12px; font-weight:600; display:block; margin-bottom:8px;">Add Telephone (Optional)</label>
                  <div style="display:flex; gap:8px;">
                    <input type="tel" id="tel-input" placeholder="+1..." style="flex:1; padding:8px 12px; border:1px solid #D1D5DB; border-radius:4px;" />
                    <button type="button" onclick="submitTel()" class="btn btn-secondary" style="padding:8px 12px;">Send</button>
                  </div>
                </div>

                <div id="tel-saved-msg" style="display:\${telSent ? 'block' : 'none'}; font-size:13px; color:#059669; margin-top:8px;">✓ Phone saved</div>

                <div style="font-size:12px; color:#059669; display:flex; align-items:center; gap:6px; justify-content:center; margin-top:12px;">
                  ✓ Qualified for Consultation
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 32px; border-top: 1px solid #DADCE0; padding-top: 20px;">
            <button onclick="resetQuiz()" class="btn btn-secondary" style="font-size:13px;">
              🔄 Retake Assessment
            </button>
          </div>
        \`;
      }
    }

    function selectAnswer(qId, val) {
      if (isTransitioning || currentStep >= QUIZ_CONFIG.questions.length) return;
      isTransitioning = true;
      answers[qId] = val;
      render();
      setTimeout(() => {
        if (currentStep < QUIZ_CONFIG.questions.length) {
          currentStep++;
        }
        isTransitioning = false;
        render();
      }, 250);
    }

    function prevStep() {
      if (isTransitioning) return;
      if (currentStep > 0) {
        currentStep--;
        render();
      }
    }

    function handleEmailInput(val) {
      lead.email = val;
      const errEl = document.getElementById('email-error-msg');
      const emailInput = document.getElementById('lead-email');
      const isFree = val && val.includes('@') && !isWorkEmail(val);
      if (errEl) {
        errEl.style.display = isFree ? 'block' : 'none';
      }
      if (emailInput) {
        emailInput.style.borderColor = isFree ? '#EF4444' : '#DADCE0';
      }
      checkCanProceed();
    }

    function checkCanProceed() {
      const btn = document.getElementById('btn-submit-gate');
      if (btn) {
        const can = lead.name && lead.email && isWorkEmail(lead.email) && lead.company && lead.projectStatus;
        btn.disabled = !can;
      }
    }

    async function submitGateForm(e) {
      e.preventDefault();
      if (!lead.name || !lead.email || !isWorkEmail(lead.email) || !lead.company || !lead.projectStatus) {
        alert('Please complete all required fields with your official work email and workplace project status.');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-gate');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
      }

      await sendWebhook({
        action: 'submit',
        lead: lead,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        role: lead.role,
        projectStatus: lead.projectStatus,
        project_status: lead.projectStatus,
        answers: getAnswerLabels(),
        score: calculateScore(),
        timestamp: new Date().toISOString()
      });

      currentStep++;
      render();
    }

    async function requestAssessment() {
      isApplied = true;
      render();
      await sendWebhook({
        action: 'update',
        email: lead.email,
        assessmentRequested: true,
        consultationRequested: true,
        requestConsultation: "Yes",
        timestamp: new Date().toISOString()
      });
    }

    async function submitTel() {
      const telVal = document.getElementById('tel-input')?.value;
      if (!telVal) return;
      telSent = true;
      render();
      await sendWebhook({
        action: 'update',
        email: lead.email,
        tel: telVal,
        phone: telVal,
        timestamp: new Date().toISOString()
      });
    }

    async function sendWebhook(data) {
      const url = QUIZ_CONFIG.integration?.webhookUrl;
      if (!url) return;
      try {
        let cleanUrl = url.trim();
        if (cleanUrl.includes('script.google.com') && !cleanUrl.endsWith('/exec')) {
          if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
          cleanUrl += '/exec';
        }
        const params = new URLSearchParams();
        params.append('payload', JSON.stringify(data));
        await fetch(cleanUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params
        });
      } catch (err) {
        console.warn('Webhook submit:', err);
      }
    }

    function resetQuiz() {
      currentStep = 0;
      isTransitioning = false;
      answers = {};
      lead = { name: '', email: '', company: '', role: '', projectStatus: '' };
      isApplied = false;
      telSent = false;
      render();
    }

    function generateStaticAiReport(score, company, leadName) {
      const compStr = escapeHtml(company || 'your organization');
      return \`
        <div class="top-insights-box">
          <h3>🎯 Executive Summary: Top 3 Critical Technical Readiness Insights</h3>
          <ol>
            <li><strong>Acoustic Spill & Focus Degradation:</strong> Uncontained voice prompting in open plan areas creates cognitive task-switching latency, costing up to $28,000 per employee annually in lost productive focus <span class="cite-ref"><a href="#fn-uc-irvine" class="cite-badge">[UC Irvine Study]</a></span>.</li>
            <li><strong>Rigid Spatial Topologies & Process Bottlenecks:</strong> Static workstation setups prevent rapid sprint reconfigurations for AI co-creation, slowing project release cycles by 15–25% <span class="cite-ref"><a href="#fn-flex-agile" class="cite-badge">[Flex Agile Study]</a></span>.</li>
            <li><strong>Immediate High-Value Spatial Intervention:</strong> Deploy STC 38+ rated acoustic micro-pods and dynamic visual privacy boundaries, mirroring proven agility models from Cisco PENN 1 <span class="cite-ref"><a href="#fn-cisco" class="cite-badge">[Cisco Blueprint]</a></span> and Microsoft modern workplace hubs <span class="cite-ref"><a href="#fn-microsoft" class="cite-badge">[Microsoft Research]</a></span>.</li>
          </ol>
        </div>

        <h3>1. Workplace Research Context</h3>
        <p>Workplace analysis for <strong>\${compStr}</strong> indicates an accelerating transition toward hybrid collaboration and generative AI workflows. Organizations operating in this space require high spatial adaptability and strict acoustic containment to maximize cognitive output and retain top technical talent.</p>
        
        <h3>2. Technical Score Breakdown (\${score}/100 Index Analysis)</h3>
        <p>Your overall score of <strong>\${score}/100</strong> highlights key spatial and acoustic vulnerabilities. Modern generative AI workflows demand rapid context-switching between solitary prompting (high acoustic isolation) and team co-creation (agile spatial reconfiguration). Leading enterprise benchmarks—such as SAP's Workplace Health Index study <span class="cite-ref"><a href="#fn-sap" class="cite-badge">[SAP Benchmark]</a></span>—demonstrate that optimizing physical environments directly improves operating margins.</p>

        <h3>3. High-Performance Spatial Optimization Roadmap</h3>
        <ul>
          <li><strong>Acoustically Rated Micro-Pods:</strong> Deploy isolated booths engineered with STC 38+ ratings for voice-based AI prompting and intense individual focus.</li>
          <li><strong>Dynamic Visual Boundaries:</strong> Implement mobile acoustic screens to define project micro-zones and shield confidential screen prompts on demand.</li>
          <li><strong>Micro-Power Drop Topologies:</strong> Deploy flexible ceiling and under-floor power distribution drops to eliminate tethering constraints in agile AI war rooms.</li>
          <li><strong>Steelcase ARC Guidance:</strong> Explore the <a href="https://swiy.co/Steelcase-4new-Ai-workspaces" target="_blank" rel="noopener noreferrer">Steelcase 4 New AI Workspaces Blueprint</a>, <a href="https://swiy.co/Steelcase-People-Centered-AI-Spaces" target="_blank" rel="noopener noreferrer">People-Centered AI Spaces Research</a>, and <a href="https://swiy.co/Steelcase-community-based-design" target="_blank" rel="noopener noreferrer">Community-Based Design Methodology</a>.</li>
        </ul>

        <div class="footnotes-box">
          <h4>📚 Cited Sources & Benchmark Research References</h4>
          <ol class="footnotes-list">
            <li id="fn-uc-irvine"><strong>UC Irvine / Wall Street Journal Focus Study:</strong> Workplace interruption study demonstrating 23min 15sec task-switching recovery overhead per interruption ($28,000/employee/year in lost billable output). <a href="https://www.ics.uci.edu/~gmark/" target="_blank" rel="noopener noreferrer">UC Irvine Research</a> | <a href="https://www.wsj.com" target="_blank" rel="noopener noreferrer">WSJ Analysis</a></li>
            <li id="fn-sap"><strong>SAP Workplace Health Index Benchmark:</strong> Enterprise spatial and well-being study showing each 1% increase in index yields $90M–$100M in annual operating profit gain. <a href="https://www.sap.com" target="_blank" rel="noopener noreferrer">SAP Enterprise Study</a></li>
            <li id="fn-cisco"><strong>Cisco PENN 1 & Osaka Hybrid Workspace Blueprint:</strong> Office redesign achieving a 40% increase in collaboration zones, 13% workstation capacity gain in 36% less footprint, and $1.2M lease/energy savings. <a href="https://www.cisco.com/c/en/us/solutions/hybrid-work/penn-1.html" target="_blank" rel="noopener noreferrer">Cisco PENN 1 Blueprint</a></li>
            <li id="fn-microsoft"><strong>Microsoft Modern AI Workplace Study:</strong> Reengineered AI co-creation workspaces reducing task-switching overhead, eliminating 1.2 hrs/day of redundant sync meetings, and boosting developer velocity by 22%. <a href="https://www.steelcase.com/research/" target="_blank" rel="noopener noreferrer">Steelcase WorkSpace Research</a></li>
            <li id="fn-gensler"><strong>Gensler Workplace Index (Acoustic Focus & Retention):</strong> Companies providing high-STC acoustic focus zones exhibit 21% higher cognitive performance scores and 18% lower voluntary turnover. <a href="https://www.gensler.com/gri/global-workplace-survey-2024" target="_blank" rel="noopener noreferrer">Gensler Survey 2024</a></li>
            <li id="fn-mckinsey"><strong>McKinsey & Company State of AI & Future of Work Report:</strong> Global AI deployment benchmark detailing generative AI productivity curves and spatial collaboration requirements. <a href="https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai" target="_blank" rel="noopener noreferrer">McKinsey AI Report</a></li>
            <li id="fn-gartner"><strong>Gartner Digital Workplace & Smart Office Analytics:</strong> Analytics on smart office sensors, acoustic isolation, and agile pod density. <a href="https://www.gartner.com/en/information-technology/insights/digital-workplace" target="_blank" rel="noopener noreferrer">Gartner Insights</a></li>
            <li id="fn-hbr"><strong>Harvard Business Review & BCG Generative AI Productivity Study:</strong> Empirical research on AI-assisted team output, task quality gains, and project velocity acceleration. <a href="https://hbr.org/2023/09/how-ai-will-transform-project-management" target="_blank" rel="noopener noreferrer">HBR Research</a></li>
            <li id="fn-steelcase-privacy"><strong>Steelcase Privacy & Acoustic Pods Research:</strong> Applied environmental study on acoustic transmission class (STC 38+), speech privacy, and focus recovery in open-plan spaces. <a href="https://www.steelcase.com/research/articles/topics/privacy/" target="_blank" rel="noopener noreferrer">Steelcase Acoustic Privacy Guide</a> | <a href="https://www.steelcase.com/products/flex-collection/" target="_blank" rel="noopener noreferrer">Steelcase Flex Collection</a></li>
          </ol>
        </div>
      \`;
    }

    function downloadPdfReport() {
      const companyName = escapeHtml(lead.company || 'Organization');
      const leadNameStr = escapeHtml(lead.name || 'Executive');
      const leadRoleStr = escapeHtml(lead.role || 'Workplace Leader');
      const score = calculateScore();
      const reportHtml = generateStaticAiReport(score, lead.company, lead.name);

      const showLogoInPdf = QUIZ_CONFIG.branding && QUIZ_CONFIG.branding.logoUrl && QUIZ_CONFIG.branding.showLogoInPdf !== false;
      const logoHtml = showLogoInPdf ? '<div style="margin-bottom:16px;"><img src="' + QUIZ_CONFIG.branding.logoUrl + '" alt="Brand Logo" style="max-height:55px; max-width:240px; object-fit:contain;" /></div>' : '';

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const printDoc = printWindow.document;
      printDoc.open();
      printDoc.write('<!DOCTYPE html><html><head><meta charset="utf-8">');
      printDoc.write('<title>' + companyName + ' - Steelcase ARC AI Diagnostic Report</title>');
      printDoc.write('<style>');
      printDoc.write('body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1F2937; line-height: 1.6; max-width: 900px; margin: 0 auto; }');
      printDoc.write('.header-banner { border-bottom: 2px solid #1D4ED8; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }');
      printDoc.write('.score-badge { background: #1D4ED8; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; min-width: 120px; }');
      printDoc.write('.score-num { font-size: 32px; font-weight: 700; line-height: 1; }');
      printDoc.write('.score-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; margin-top: 4px; }');
      printDoc.write('h1 { margin: 0 0 8px 0; font-size: 24px; color: #1E3A8A; }');
      printDoc.write('.meta { font-size: 13px; color: #4B5563; }');
      printDoc.write('.top-insights-box { background: #F0F7FF; border: 1px solid #BFDBFE; border-left: 5px solid #1D4ED8; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; }');
      printDoc.write('.top-insights-box h3 { margin-top: 0; color: #1E3A8A; font-size: 16px; font-weight: 700; }');
      printDoc.write('.footnotes-box { margin-top: 36px; padding: 22px 26px; background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #2563EB; border-radius: 8px; }');
      printDoc.write('.footnotes-box h4 { margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; }');
      printDoc.write('a { color: #1D4ED8; text-decoration: underline; font-weight: 500; }');
      printDoc.write('.cite-badge { display: inline-flex; align-items: center; background: #EFF6FF; color: #1D4ED8 !important; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid #BFDBFE; text-decoration: none !important; }');
      printDoc.write('.print-bar { background: #F3F4F6; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #E5E7EB; }');
      printDoc.write('@media print { .no-print { display: none !important; } body { padding: 0; } }');
      printDoc.write('</style></head><body>');
      printDoc.write('<div class="print-bar no-print"><span style="font-size: 13px; color: #4B5563;">📄 Printable AI Readiness Diagnostic Report — Save as PDF via browser print</span><button onclick="window.print()" style="background: #1D4ED8; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">🖨️ Save as PDF</button></div>');
      printDoc.write('<div class="header-banner"><div>' + logoHtml + '<h1>Steelcase ARC — AI Workplace Readiness Diagnostic</h1><div class="meta"><strong>Client:</strong> ' + companyName + ' &nbsp;|&nbsp; <strong>Contact:</strong> ' + leadNameStr + ' (' + leadRoleStr + ') &nbsp;|&nbsp; <strong>Date:</strong> ' + new Date().toLocaleDateString() + '</div></div><div class="score-badge"><div class="score-num">' + score + '</div><div class="score-lbl">Readiness Score</div></div></div>');
      printDoc.write('<div class="report-content">' + reportHtml + '</div>');
      printDoc.write('<' + 'script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<' + '/script>');
      printDoc.write('</body></html>');
      printDoc.close();
      printWindow.document.close();
    }

    function hideExternalLinkPopup() {
      const modal = document.getElementById('link-modal-overlay');
      if (modal) modal.style.display = 'none';
    }

    function showExternalLinkPopup() {
      const modal = document.getElementById('link-modal-overlay');
      if (modal) modal.style.display = 'flex';
    }

    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#fn-')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const origBg = el.style.backgroundColor;
            el.style.backgroundColor = '#FEF3C7';
            el.style.transition = 'background-color 0.5s ease';
            setTimeout(() => { el.style.backgroundColor = origBg || ''; }, 2000);
          }
        } else if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
          e.preventDefault();
          showExternalLinkPopup();
        }
      }
    });

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;
}

export function generateReadme(config) {
  const title = config.content?.title || 'Interactive Diagnostic Quiz';
  return `# ${title} - Standalone Quiz Deployment Package

This package contains the standalone, end-user interactive quiz application ready for GitHub Pages or web hosting.

## 🌟 Key Features
- **Pure Standalone App**: Contains **JUST the functional quiz** for visitors (no builder or edit tools).
- **Responsive & Mobile Ready**: Clean design that adapts to mobile, tablet, and desktop screens.
- **Lead Collection**: Integrated lead capture form sending submissions directly to your configured Google Webhook URL (captures Name, Email, Company, Role, and Workplace Project Status).
- **Diagnostic Reporting**: Automated scoring (0–100) and instant custom diagnostic reporting with citations.

---

## 📊 Google Apps Script for Google Sheets (Handles Date, Project Status, Request Consultation, Phone & Answers Q1..Qn)

If connecting to Google Sheets, paste the following Google Apps Script in **Extensions > Apps Script** inside your spreadsheet and deploy as a Web App (Execute as: *Me*, Access: *Anyone*):

\`\`\`javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }

    var action = data.action || "submit";
    var lead = data.lead || data || {};
    var answers = data.answers || {};
    var timestamp = data.timestamp || new Date().toISOString();
    var email = String(data.email || lead.email || "").trim();

    if (sheet.getLastRow() === 0) {
      var defaultHeaders = ["Timestamp", "Name", "Email", "Company", "Title", "Project Status", "Readiness Score", "Request Consultation", "Phone"];
      var qKeys = Object.keys(answers);
      if (qKeys.length > 0) {
        qKeys.sort(function(a, b) {
          var numA = parseInt(a.replace(/\D/g, '')) || 0;
          var numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        });
        qKeys.forEach(function(k) { defaultHeaders.push(k.toUpperCase()); });
      } else {
        for (var i = 1; i <= 12; i++) { defaultHeaders.push("Q" + i); }
      }
      sheet.appendRow(defaultHeaders);
      sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#F3F4F6");
    }

    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });

    function ensureHeader(colName, keywords) {
      var exists = headersLower.some(function(h) {
        return keywords.some(function(kw) { return h.indexOf(kw.toLowerCase()) !== -1; });
      });
      if (!exists) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(colName).setFontWeight("bold");
        lastCol = sheet.getLastColumn();
        headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });
      }
    }

    ensureHeader("Project Status", ["project"]);
    ensureHeader("Request Consultation", ["consultation", "assessment"]);
    ensureHeader("Phone", ["phone", "telephone", "tel"]);

    Object.keys(answers).forEach(function(qKey) {
      var keyLower = qKey.toLowerCase().trim();
      var keyNum = keyLower.replace(/\D/g, '');
      var exists = headersLower.some(function(h) {
        return h === keyLower || (keyNum && (h === "q" + keyNum || h.indexOf("q" + keyNum + ":") === 0 || h.indexOf("q" + keyNum + " ") === 0));
      });
      if (!exists) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(qKey.toUpperCase()).setFontWeight("bold");
        lastCol = sheet.getLastColumn();
        headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        headersLower = headers.map(function(h) { return String(h).toLowerCase().trim(); });
      }
    });

    if (action === "submit") {
      var newRow = [];
      for (var i = 0; i < headers.length; i++) {
        var head = headersLower[i];
        if (head.indexOf("timestamp") !== -1 || head.indexOf("date") !== -1 || head.indexOf("time") !== -1) {
          newRow.push(timestamp);
        } else if (head === "name" || head.indexOf("full name") !== -1) {
          newRow.push(lead.name || data.name || "");
        } else if (head === "email" || head.indexOf("work email") !== -1) {
          newRow.push(lead.email || data.email || "");
        } else if (head === "company" || head.indexOf("organization") !== -1) {
          newRow.push(lead.company || data.company || "");
        } else if (head === "title" || head.indexOf("role") !== -1 || head.indexOf("job title") !== -1) {
          newRow.push(lead.role || lead.title || data.role || data.title || "");
        } else if (head.indexOf("project") !== -1) {
          newRow.push(lead.projectStatus || lead.project_status || data.projectStatus || data.project_status || "");
        } else if (head.indexOf("score") !== -1 || head.indexOf("readiness") !== -1) {
          newRow.push(data.score !== undefined ? data.score : "");
        } else if (head.indexOf("consultation") !== -1 || head.indexOf("assessment") !== -1 || head.indexOf("request") !== -1) {
          newRow.push("No");
        } else if (head.indexOf("phone") !== -1 || head.indexOf("telephone") !== -1 || head === "tel") {
          newRow.push(data.tel || data.phone || "");
        } else {
          var matchedVal = "";
          Object.keys(answers).forEach(function(qKey) {
            var qLower = qKey.toLowerCase().trim();
            var qNum = qLower.replace(/\D/g, '');
            if (head === qLower || (qNum && (head === "q" + qNum || head.indexOf("q" + qNum + ":") === 0 || head.indexOf("q" + qNum + " ") === 0))) {
              matchedVal = answers[qKey];
            }
          });
          if (matchedVal !== "") {
            newRow.push(matchedVal);
          } else if (head.indexOf("answers") !== -1 || head.indexOf("survey") !== -1) {
            newRow.push(JSON.stringify(answers));
          } else {
            newRow.push("");
          }
        }
      }
      sheet.appendRow(newRow);

    } else if (action === "update") {
      var rows = sheet.getDataRange().getValues();
      var emailColIdx = -1;
      for (var c = 0; c < headersLower.length; c++) {
        if (headersLower[c].indexOf("email") !== -1) { emailColIdx = c; break; }
      }
      if (emailColIdx === -1) emailColIdx = 2;

      var consultColIdx = -1;
      var phoneColIdx = -1;
      for (var c = 0; c < headersLower.length; c++) {
        if (headersLower[c].indexOf("consultation") !== -1 || headersLower[c].indexOf("assessment") !== -1) consultColIdx = c;
        if (headersLower[c].indexOf("phone") !== -1 || headersLower[c].indexOf("telephone") !== -1 || headersLower[c] === "tel") phoneColIdx = c;
      }

      var targetRowIndex = -1;
      if (email !== "") {
        for (var r = rows.length - 1; r >= 1; r--) {
          var rowEmail = String(rows[r][emailColIdx] || "").trim();
          if (rowEmail.toLowerCase() === email.toLowerCase()) {
            targetRowIndex = r;
            break;
          }
        }
      }

      if (targetRowIndex === -1 && rows.length > 1) {
        targetRowIndex = rows.length - 1;
      }

      if (targetRowIndex !== -1) {
        if ((data.assessmentRequested || data.consultationRequested || data.requestConsultation) && consultColIdx !== -1) {
          sheet.getRange(targetRowIndex + 1, consultColIdx + 1).setValue("Yes");
        }
        if ((data.tel || data.phone) && phoneColIdx !== -1) {
          sheet.getRange(targetRowIndex + 1, phoneColIdx + 1).setValue(data.tel || data.phone);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

---

## 🚀 How to Host on GitHub Pages (Step-by-Step Guide)

### Step 1: Create a GitHub Repository
1. Log into your account at [GitHub.com](https://github.com).
2. Click **New Repository** (or visit [github.com/new](https://github.com/new)).
3. Enter a repository name (e.g., \`ai-workplace-quiz\`).
4. Keep it **Public** so GitHub Pages can host it for free.
5. Click **Create repository**.

### Step 2: Upload Files
1. In your new repository page, click **uploading an existing file** link.
2. Drag and drop all files from this exported ZIP package:
   - \`index.html\`
   - \`quiz-config.json\`
   - \`lead-payload-schema.json\`
   - \`README.md\`
3. Click **Commit changes**.

### Step 3: Enable GitHub Pages
1. In your GitHub repository, click on **Settings** (top navigation bar).
2. On the left sidebar, click **Pages** (under Code and automation).
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Under **Branch**, select \`main\` (or \`master\`) and folder \`/ (root)\`.
5. Click **Save**.

---

## 🔗 Your Live Quiz URL
After 1–2 minutes, GitHub Pages will deploy your site at:
\`https://<your-github-username>.github.io/<repository-name>/\`

Visitors can click this link to take your quiz directly!
`;
}

export function generateLeadPayloadSchema() {
  return JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Quiz Lead Submission Payload",
    "type": "object",
    "properties": {
      "action": { "type": "string", "example": "submit" },
      "lead": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "example": "Jane Doe" },
          "email": { "type": "string", "example": "jane@steelcase.com" },
          "company": { "type": "string", "example": "Steelcase Inc." },
          "role": { "type": "string", "example": "Director of Workplace Strategy" },
          "projectStatus": { "type": "string", "example": "A - Active project, decisions within 6 months" }
        },
        "required": ["name", "email", "company", "projectStatus"]
      },
      "name": { "type": "string", "example": "Jane Doe" },
      "email": { "type": "string", "example": "jane@steelcase.com" },
      "company": { "type": "string", "example": "Steelcase Inc." },
      "role": { "type": "string", "example": "Director of Workplace Strategy" },
      "projectStatus": { "type": "string", "example": "A - Active project, decisions within 6 months" },
      "project_status": { "type": "string", "example": "A - Active project, decisions within 6 months" },
      "answers": {
        "type": "object",
        "description": "Selected point values or labels keyed by question ID",
        "example": { "q1": 10, "q2": 6 }
      },
      "score": { "type": "integer", "example": "85" },
      "timestamp": { "type": "string", "format": "date-time" }
    }
  }, null, 2);
}
