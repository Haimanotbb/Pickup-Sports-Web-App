import React from 'react';

// CasLoginButton component for CAS authentication via a backend redirect.
const CasLoginButton = () => {
    const handleCasLogin = () => {
        // Redirect to the backend endpoint that handles CAS login.
        // The backend view (cas_login) will then redirect to Yale CAS with the correct service URL.
        // Use an environment variable if provided, otherwise default to 'http://localhost:8000/cas/login'.
        const casLoginEndpoint = process.env.REACT_APP_CAS_LOGIN_ENDPOINT || 'http://localhost:8000/cas/login';
        window.location.href = casLoginEndpoint;
    };

    return (
        <button type="button" className="btn btn-secondary" onClick={handleCasLogin}>
            Login with CAS
        </button>
    );
};

export default CasLoginButton;