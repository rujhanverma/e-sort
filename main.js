function getLogoUrl(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

let allEmails = [];

async function renderEmails(filter = 'All') {
    const grid = document.getElementById('email-grid');
    grid.innerHTML = '<div class="loader">Fetching your snapshots...</div>';

    if (allEmails.length === 0) {
        allEmails = await fetchEmails();
    }

    grid.innerHTML = '';

    if (allEmails.length === 0) {
        grid.innerHTML = '<div class="placeholder-msg">No emails found or access denied.</div>';
        return;
    }

    const filtered = filter === 'All'
        ? allEmails
        : allEmails.filter(e => e.category === filter || e.sender.includes(filter));

    filtered.forEach(email => {
        const card = document.createElement('div');
        card.className = 'email-card';
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
});

// Custom event from auth.js
document.addEventListener('auth-success', () => {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('welcome-text').innerText = 'Your Snapshot is Ready!';
    document.getElementById('status-text').innerText = 'We have organized your latest emails.';
    renderEmails();
});
