async function fetchEmails() {
    const token = localStorage.getItem('gmail_access_token');
    if (!token) return [];

    let allMessages = [];
    let nextPageToken = null;

    try {
        // Step 1: List all messages using pagination
        do {
            const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
            const listResponse = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!listResponse.ok) {
                throw new Error(`Gmail API error: ${listResponse.status}`);
            }

            const listData = await listResponse.json();

            if (listData.messages) {
                allMessages = allMessages.concat(listData.messages);
            }
            nextPageToken = listData.nextPageToken;

            // Limit to avoid hitting rate limits or hanging for massive mailboxes in this version
            if (allMessages.length > 2000) break;

        } while (nextPageToken);

        if (allMessages.length === 0) {
            console.warn('No messages found in Gmail.');
            return [];
        }

        // Step 2: Fetch details for messages
        // To speed up, we fetch details in chunks or just a reasonable subset if too many
        const limit = 100; // Let's start with a reasonable limit for user experience
        const subset = allMessages.slice(0, limit);

        const emailPromises = subset.map(async (msg) => {
            const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const detailData = await detailResponse.json();

            const headers = detailData.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const date = headers.find(h => h.name === 'Date')?.value || '';
            const snippet = detailData.snippet;

            // Robust UTF-8 Base64 decoding
            function decodeBase64(data) {
                const bString = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
                const bArray = new Uint8Array(bString.length);
                for (let i = 0; i < bString.length; i++) {
                    bArray[i] = bString.charCodeAt(i);
                }
                return new TextDecoder('utf-8').decode(bArray);
            }

            // Extract Body (Recursive search for HTML or Text)
            function getBody(payload) {
                let html = '';
                let text = '';

                function traverse(parts) {
                    for (const part of parts) {
                        if (part.mimeType === 'text/html' && part.body && part.body.data) {
                            html = decodeBase64(part.body.data);
                        } else if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                            text = decodeBase64(part.body.data);
                        } else if (part.parts) {
                            traverse(part.parts);
                        }
                    }
                }

                if (payload.parts) {
                    traverse(payload.parts);
                } else if (payload.body && payload.body.data) {
                    const data = decodeBase64(payload.body.data);
                    if (payload.mimeType === 'text/html') html = data;
                    else text = data;
                }

                return html || text || snippet;
            }

            const fullBody = getBody(detailData.payload);

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
                body: fullBody,
                category: categorizeEmail(subject, snippet),
                date: new Date(date).toLocaleDateString()
            };
        });

        return await Promise.all(emailPromises);
    } catch (error) {
        console.error('Error fetching emails:', error);
        if (error.message && error.message.includes('401')) {
            console.error('Token unauthorized. Clearing token.');
            localStorage.removeItem('gmail_access_token');
        }
        return [];
    }
}

function categorizeEmail(subject, snippet) {
    const text = (subject + ' ' + snippet).toLowerCase();

    // Shopping / खरीददारी
    if (text.includes('order') || text.includes('shopping') || text.includes('amazon') || text.includes('delivered') ||
        text.includes('खरीद') || text.includes('ऑर्डर') || text.includes('डिलीवर')) return 'Shopping';

    // Tech / तकनीकी
    if (text.includes('security') || text.includes('github') || text.includes('code') || text.includes('dev') ||
        text.includes('सुरक्षा') || text.includes('कोड')) return 'Tech';

    // Billing / भुगतान
    if (text.includes('invoice') || text.includes('billing') || text.includes('payment') || text.includes('bank') ||
        text.includes('भुगतान') || text.includes('बिल') || text.includes('बैंक') || text.includes('खाता')) return 'Billing';

    // Social / सामाजिक
    if (text.includes('linkedIn') || text.includes('facebook') || text.includes('connect') ||
        text.includes('फेसबुक') || text.includes('लिंक्डइन') || text.includes('संपर्क')) return 'Social';

    return 'General';
}
