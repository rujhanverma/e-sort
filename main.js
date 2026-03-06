function getLogoUrl(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

let allEmails = [];
let sortRules = JSON.parse(localStorage.getItem('sort_rules') || '[]');
let feedbacks = JSON.parse(localStorage.getItem('user_feedbacks') || '[]');
let currentLanguage = localStorage.getItem('app_lang') || 'en';
let sidebarTimer;
const HIDE_DELAY = 3000;

const TRANSLATIONS = {
    en: {
        welcome: "Welcome, Bhai!",
        status: "Please connect your Google account to see your emails.",
        searchPlaceholder: "Search your emails...",
        navAll: "📊 All Messages",
        navShopping: "🛍️ Shopping",
        navTech: "💻 Tech News",
        navBilling: "💳 Payments",
        navSocial: "🤝 Social",
        titleSaved: "Saved Sorts",
        titleAdvanced: "Advanced Sorts",
        btnCreateRule: "+ Create Sort Rule",
        connectBtn: "Connect Google",
        disconnectBtn: "Disconnect",
        readyTitle: "e-sort is Ready!",
        readyStatus: "We have organized your emails.",
        loading: "e-sort is working...",
        noEmails: "No emails found or access denied.",

        ruleLogo: "Logo (Image Upload)",
        navFeedback: "💬 Feedback",
        navHistory: "📜 View History",
        historyTitle: "Feedback History",
        noHistory: "No feedback submitted yet.",
        feedbackModalTitle: "Share Your Feedback",
        feedbackPlaceholder: "Type your message here...",
        btnSubmitFeedback: "Submit Feedback",
        feedbackEmpty: "Please enter a message first!",
        feedbackThanks: "Thank you for the feedback! e-sort will get better."
    },
    hi: {
        welcome: "नमस्ते, भाई!",
        status: "अपने ईमेल देखने के लिए कृपया अपना गूगल खाता कनेक्ट करें।",
        searchPlaceholder: "अपने ईमेल खोजें...",
        navAll: "📊 सभी संदेश",
        navShopping: "🛍️ खरीददारी",
        navTech: "💻 तकनीकी समाचार",
        navBilling: "💳 भुगतान",
        navSocial: "🤝 सामाजिक",
        titleSaved: "सेव किए सॉर्ट्स",
        titleAdvanced: "एडवांस सॉर्ट्स",
        btnCreateRule: "+ सॉर्ट नियम बनाएं",
        connectBtn: "गूगल से जुड़ें",
        disconnectBtn: "डिस्कनेक्ट करें",
        readyTitle: "ई-सॉर्ट तैयार है!",
        readyStatus: "हमने आपके ईमेल व्यवस्थित कर दिए हैं।",
        loading: "ई-सॉर्ट काम कर रहा है...",
        noEmails: "कोई ईमेल नहीं मिला या एक्सेस नहीं है।",

        ruleHeading: "शीर्षक (विषय)",
        ruleKeyword: "कीवर्ड (बॉडी)",
        ruleLogo: "लोगो (इमेज अपलोड)",
        navFeedback: "💬 फीडबैक",
        navHistory: "📜 इतिहास देखें",
        historyTitle: "फीडबैक का इतिहास",
        noHistory: "अभी तक कोई फीडबैक नहीं दिया गया।",
        feedbackModalTitle: "अपना फीडबैक साझा करें",
        feedbackPlaceholder: "अपना संदेश यहाँ लिखें...",
        btnSubmitFeedback: "फीडबैक भेजें",
        feedbackEmpty: "कृपया पहले संदेश लिखें!",
        feedbackThanks: "फीडबैक के लिए धन्यवाद! ई-सॉर्ट और बेहतर होगा।"
    }
};

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('app_lang', lang);
    updateUI();
}

function handleFeedback() {
    openFeedbackInputModal();
}

function openFeedbackInputModal() {
    document.getElementById('feedback-input-modal').style.display = 'block';
}

function closeFeedbackInputModal() {
    document.getElementById('feedback-input-modal').style.display = 'none';
    document.getElementById('feedback-text').value = '';
}

async function submitFeedback() {
    const t = TRANSLATIONS[currentLanguage];
    const text = document.getElementById('feedback-text').value.trim();

    if (!text) {
        alert(t.feedbackEmpty);
        return;
    }

    const entry = {
        msg: text,
        time: new Date().toLocaleString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US')
    };

    feedbacks.push(entry);
    localStorage.setItem('user_feedbacks', JSON.stringify(feedbacks));

    alert(t.feedbackThanks);
    closeFeedbackInputModal();
}

function openHistoryModal() {
    renderFeedbacks();
    document.getElementById('history-modal').style.display = 'block';
}

function closeHistoryModal() {
    document.getElementById('history-modal').style.display = 'none';
}

function renderFeedbacks() {
    const list = document.getElementById('feedback-history-list');
    const t = TRANSLATIONS[currentLanguage];
    list.innerHTML = '';

    if (feedbacks.length === 0) {
        list.innerHTML = `<p style="color: var(--text-dim); text-align: center;">${t.noHistory}</p>`;
        return;
    }

    feedbacks.slice().reverse().forEach(fb => {
        const div = document.createElement('div');
        div.className = 'feedback-item';
        div.innerHTML = `
            <div class="feedback-time">${fb.time}</div>
            <div class="feedback-msg">${fb.msg}</div>
        `;
        list.appendChild(div);
    });
}

function updateUI() {
    const t = TRANSLATIONS[currentLanguage];
    document.getElementById('welcome-text').innerText = t.welcome;
    document.getElementById('status-text').innerText = t.status;
    document.getElementById('search-input').placeholder = t.searchPlaceholder;
    document.getElementById('nav-all').innerText = t.navAll;
    document.getElementById('nav-shopping').innerText = t.navShopping;
    document.getElementById('nav-tech').innerText = t.navTech;
    document.getElementById('nav-billing').innerText = t.navBilling;
    document.getElementById('nav-social').innerText = t.navSocial;

    document.getElementById('title-advanced').innerText = t.titleAdvanced;
    document.getElementById('btn-create-rule').innerText = t.btnCreateRule;
    document.getElementById('login-btn').innerText = t.connectBtn;
    document.getElementById('logout-btn').innerText = t.disconnectBtn;
    document.getElementById('nav-feedback').innerText = t.navFeedback;
    document.getElementById('nav-history').innerText = t.navHistory;
    document.getElementById('history-title').innerText = t.historyTitle;
    document.getElementById('feedback-modal-title').innerText = t.feedbackModalTitle;
    document.getElementById('feedback-text').placeholder = t.feedbackPlaceholder;
    document.getElementById('btn-submit-feedback').innerText = t.btnSubmitFeedback;

    // Toggle active state on buttons
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${currentLanguage}`).classList.add('active');

    // Update messages if auth success already happened
    if (document.getElementById('logout-btn').style.display === 'block') {
        document.getElementById('welcome-text').innerText = t.readyTitle;
        document.getElementById('status-text').innerText = t.readyStatus;
    }
}

async function renderEmails(filter = 'All', mode = 'builtin') {
    const grid = document.getElementById('email-grid');
    const t = TRANSLATIONS[currentLanguage];
    grid.innerHTML = `<div class="loader">${t.loading}</div>`;

    if (allEmails.length === 0) {
        allEmails = await fetchEmails();
    }

    // Update account switcher if not set
    if (document.getElementById('account-switcher').style.display === 'none') {
        const userInfo = await fetchUserInfo();
        if (userInfo) {
            const initial = (userInfo.name || userInfo.email || '?').charAt(0).toUpperCase();
            const switcher = document.getElementById('account-switcher');
            switcher.innerText = initial;
            switcher.style.display = 'flex';
        }
    }

    grid.innerHTML = '';

    if (allEmails.length === 0) {
        grid.innerHTML = `<div class="placeholder-msg">${t.noEmails}</div>`;
        return;
    }

    let filtered = [];
    if (filter === 'All') {
        filtered = allEmails;
    } else if (mode === 'custom-search') {
        const lowerFilter = filter.toLowerCase();
        filtered = allEmails.filter(e =>
            e.subject.toLowerCase().includes(lowerFilter) ||
            e.sender.toLowerCase().includes(lowerFilter) ||
            e.snippet.toLowerCase().includes(lowerFilter)
        );
    } else if (mode === 'rule') {
        const rule = sortRules.find(r => r.name === filter);
        if (rule) {
            const pattern = rule.pattern.toLowerCase();
            filtered = allEmails.filter(e => {
                if (rule.type === 'heading') return e.subject.toLowerCase().includes(pattern);
                if (rule.type === 'keyword') return e.body.toLowerCase().includes(pattern) || e.subject.toLowerCase().includes(pattern);
                if (rule.type === 'logo') return e.sender.toLowerCase().includes(pattern) || e.domain.toLowerCase().includes(pattern);
                return false;
            });
        }
    } else {
        filtered = allEmails.filter(e => e.category === filter || e.sender.includes(filter));
    }

    filtered.forEach(email => {
        const card = document.createElement('div');
        card.className = 'email-card';
        card.onclick = () => openEmail(email);
        card.innerHTML = `
            <div class="card-header">
                <img src="${getLogoUrl(email.domain)}" alt="${email.sender}" class="sender-logo">
                <div class="sender-info">
                    <div class="sender-name">${email.sender}</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim)">${email.date}</div>
                </div>
            </div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-snippet">${email.snippet}</div>
            <div class="category-tag">${email.category}</div>
        `;
        grid.appendChild(card);
    });
}

function openEmail(email) {
    const modal = document.getElementById('email-modal');
    document.getElementById('modal-logo').src = getLogoUrl(email.domain);
    document.getElementById('modal-subject').innerText = email.subject;
    document.getElementById('modal-sender').innerText = `From: ${email.sender}`;

    const iframe = document.getElementById('email-content-frame');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: sans-serif; line-height: 1.5; color: #333; padding: 20px; }
                    img { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>${email.body}</body>
        </html>
    `);
    doc.close();

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('email-modal').style.display = 'none';
}

// Sorting Rules Logic
function openRuleModal() {
    document.getElementById('rule-modal').style.display = 'block';
}

function closeRuleModal() {
    document.getElementById('rule-modal').style.display = 'none';
    document.getElementById('rule-form').reset();
    toggleRuleInputs();
}

function toggleRuleInputs() {
    const type = document.getElementById('rule-type').value;
    document.getElementById('pattern-group').style.display = type === 'logo' ? 'none' : 'block';
    document.getElementById('logo-group').style.display = type === 'logo' ? 'block' : 'none';
}

async function saveRule(event) {
    event.preventDefault();
    const type = document.getElementById('rule-type').value;
    const name = document.getElementById('rule-name').value.trim();
    let pattern = document.getElementById('rule-pattern').value.trim();

    if (type === 'logo') {
        const logoFile = document.getElementById('rule-logo').files[0];
        if (logoFile) {
            // "Scanning" the logo: We'll use the filename as the pattern match 
            // for simplicity in this implementation, simulating a match.
            pattern = logoFile.name.split('.')[0];
        }
    }

    if (name && (pattern || type === 'logo')) {
        sortRules.push({ type, name, pattern });
        localStorage.setItem('sort_rules', JSON.stringify(sortRules));
        renderSortRules();
        closeRuleModal();
    }
}

function deleteRule(name, event) {
    event.stopPropagation();
    sortRules = sortRules.filter(r => r.name !== name);
    localStorage.setItem('sort_rules', JSON.stringify(sortRules));
    renderSortRules();
}

function renderSortRules() {
    const list = document.getElementById('sort-rules-list');
    list.innerHTML = '';
    sortRules.forEach(rule => {
        const item = document.createElement('div');
        item.className = 'nav-item filter-tag';
        const icon = rule.type === 'heading' ? '📝' : (rule.type === 'keyword' ? '🔍' : '🖼️');
        item.innerHTML = `
            <span>${icon} ${rule.name}</span>
            <span class="delete-filter" onclick="deleteRule('${rule.name}', event)">🗑️</span>
        `;
        item.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            renderEmails(rule.name, 'rule');
        };
        list.appendChild(item);
    });
}

window.onclick = function (event) {
    const emailModal = document.getElementById('email-modal');
    const ruleModal = document.getElementById('rule-modal');
    const historyModal = document.getElementById('history-modal');
    const feedbackInputModal = document.getElementById('feedback-input-modal');
    if (event.target == emailModal) closeModal();
    if (event.target == ruleModal) closeRuleModal();
    if (event.target == historyModal) closeHistoryModal();
    if (event.target == feedbackInputModal) closeFeedbackInputModal();
}



function initAutoHideSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const trigger = document.getElementById('sidebar-trigger');

    function showSidebar() {
        sidebar.classList.remove('closed');
        resetSidebarTimer();
    }

    function hideSidebar() {
        if (!sidebar.matches(':hover')) {
            sidebar.classList.add('closed');
        }
    }

    function resetSidebarTimer() {
        clearTimeout(sidebarTimer);
        sidebarTimer = setTimeout(hideSidebar, HIDE_DELAY);
    }

    sidebar.addEventListener('mousemove', showSidebar);
    sidebar.addEventListener('mouseenter', showSidebar);
    trigger.addEventListener('mouseenter', showSidebar);

    // Initial timer
    resetSidebarTimer();
}

async function fetchUserInfo() {
    const token = localStorage.getItem('gmail_access_token');
    if (!token) return null;
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (e) {
        console.error("Error fetching user info:", e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const category = item.dataset.category;
            renderEmails(category);
        });
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            renderEmails(searchInput.value, 'custom-search');
        }
    });

    renderSortRules();
    updateUI();
    initAutoHideSidebar();
});

// Custom event from auth.js
document.addEventListener('auth-success', async () => {
    const t = TRANSLATIONS[currentLanguage];
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('welcome-text').innerText = t.readyTitle;
    document.getElementById('status-text').innerText = t.readyStatus;

    // Update switcher initial
    const userInfo = await fetchUserInfo();
    if (userInfo) {
        const initial = (userInfo.name || userInfo.email || '?').charAt(0).toUpperCase();
        const switcher = document.getElementById('account-switcher');
        switcher.innerText = initial;
        switcher.style.display = 'flex';
    }

    renderEmails();
});
