// project-project-group-17/frontend_pickup_sport/src/components/CasLoginButton.js
import React from 'react';

// CasLoginButton component for CAS authentication via a redirect.
const CasLoginButton = () => {
    const handleCasLogin = () => {
        // Replace with your actual CAS server URL.
        // Optionally, use an environment variable such as REACT_APP_CAS_URL.
        const casUrl = process.env.REACT_APP_CAS_URL || 'https://cas.example.com/login';
        // The service URL is where CAS will redirect back after successful authentication.
        // This could be your homepage or a dedicated endpoint.
        const serviceUrl = encodeURIComponent(window.location.origin);
        // Redirect the browser to the CAS login page.
        window.location.href = `${casUrl}?service=${serviceUrl}`;
    };

    return (
        <button type="button" className="btn btn-secondary" onClick={handleCasLogin}>
            Login with CAS
        </button>
    );
};

export default CasLoginButton;