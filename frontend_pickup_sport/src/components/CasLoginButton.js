import React from 'react';
const CasLoginButton = () => {
    const handleCasLogin = () => {
        const casLoginEndpoint = process.env.REACT_APP_CAS_LOGIN_ENDPOINT || 'http://localhost:8000/cas-login';
        window.location.href = casLoginEndpoint;
    };

    return (
        <button type="button" className="btn btn-secondary" onClick={handleCasLogin}>
            Login with CAS
        </button>
    );
};

export default CasLoginButton;