async function fetchEmails() {
    const token = localStorage.getItem('gmail_access_token');
    if (!token) return [];

    try {
        // Step 1: List messages
        const listResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listResponse.json();

        if (!listData.messages) return [];

        // Step 2: Fetch details for each message
        const emailPromises = listData.messages.map(async (msg) => {
            const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const detailData = await detailResponse.json();

            const headers = detailData.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const date = headers.find(h => h.name === 'Date')?.value || '';
            const snippet = detailData.snippet;

            // Extract domain for logo
            const domainMatch = from.match(/@([^>\s]+)/);
            const domain = domainMatch ? domainMatch[1] : 'google.com';
            const senderName = from.split('<')[0].replace(/"/g, '').trim() || from;

            return {
                id: detailData.id,
                sender: senderName,
                domain: domain,
                subject: subject,
                snippet: snippet,
                category: categorizeEmail(subject, snippet),
                date: new Date(date).toLocaleDateString()
            };
        });

        return await Promise.all(emailPromises);
    } catch (error) {
        console.error('Error fetching emails:', error);
        return [];
    }
}

function categorizeEmail(subject, snippet) {
    const text = (subject + ' ' + snippet).toLowerCase();
    if (text.includes('order') || text.includes('shopping') || text.includes('amazon') || text.includes('delivered')) return 'Shopping';
    if (text.includes('security') || text.includes('github') || text.includes('code') || text.includes('dev')) return 'Tech';
    if (text.includes('invoice') || text.includes('billing') || text.includes('payment') || text.includes('bank')) return 'Billing';
    if (text.includes('linkedIn') || text.includes('facebook') || text.includes('connect')) return 'Social';
    return 'General';
}
