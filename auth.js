const CLIENT_ID = '755704742204-n06smbdkjqtnto5ngag6j4rmmhtcggcg.apps.googleusercontent.com';
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly profile email';

let tokenClient;
let accessToken = null;

function initTokenClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: GMAIL_SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                accessToken = tokenResponse.access_token;
                localStorage.setItem('gmail_access_token', accessToken);
                document.dispatchEvent(new CustomEvent('auth-success'));
            }
        },
    });
}

function handleAuthClick() {
    if (accessToken) {
        // Already have a token, but let's re-verify or just trigger success
        document.dispatchEvent(new CustomEvent('auth-success'));
    } else {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    }
}

function handleSignoutClick() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken);
        accessToken = null;
        localStorage.removeItem('gmail_access_token');
        // Clear runtime state before reload or re-auth
        location.reload();
    } else {
        // Just in case token is in storage but not in variable
        localStorage.removeItem('gmail_access_token');
        location.reload();
    }
}

window.onload = function () {
    initTokenClient();
    // Check if token exists in storage
    const storedToken = localStorage.getItem('gmail_access_token');
    if (storedToken) {
        accessToken = storedToken;
        // Check if token is still valid (simplified check for demo)
        document.dispatchEvent(new CustomEvent('auth-success'));
    }
};
