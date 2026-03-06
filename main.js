const mockEmails = [
    {
        id: 1,
        sender: "Amazon",
        domain: "amazon.com",
        subject: "Your Package has been delivered!",
        snippet: "Great news! Your order #123-45678-910 was delivered at your front door...",
        category: "Shopping",
        date: "2 mins ago"
    },
    {
        id: 2,
        sender: "GitHub",
        domain: "github.com",
        subject: "[GitHub] Security alert for your repository",
        snippet: "We found a known security vulnerability in one of your dependencies...",
        category: "Tech",
        date: "1 hour ago"
    },
    {
        id: 3,
        sender: "LinkedIn",
        domain: "linkedin.com",
        subject: "You have 5 new job recommendations",
        snippet: "Based on your profile, we think you might be interested in these roles...",
        category: "Social",
        date: "3 hours ago"
    },
    {
        id: 4,
        sender: "Netflix",
        domain: "netflix.com",
        subject: "New Season of your favorite show is out!",
        snippet: "Don't miss the latest episodes of 'The Crown' now streaming on Netflix...",
        category: "Entertainment",
        date: "Yesterday"
    },
    {
        id: 5,
        sender: "Google Cloud",
        domain: "google.com",
        subject: "Your monthly billing statement",
        snippet: "Your invoice for January is now available in the Google Cloud Console...",
        category: "Billing",
        date: "2 days ago"
    }
];

function getLogoUrl(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function renderEmails(filter = 'All') {
    const grid = document.getElementById('email-grid');
    grid.innerHTML = '';

    const filtered = filter === 'All' 
        ? mockEmails 
        : mockEmails.filter(e => e.category === filter || e.sender === filter);

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
    renderEmails();

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
