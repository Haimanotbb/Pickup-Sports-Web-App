import CasLoginButton from './CasLoginButton';
import logoUrl from '../assets/images/logo.png';
import '../index.css';

const Login = () => (
  <div className="login-page">
    <div className="background-logo" />
    <div className="login-card">
      <img src={logoUrl} alt="Y-Pickup Logo" className="login-logo" />
      <h1 className="login-title">Y-Pickup</h1>
      <p className="login-subtitle">
        Find and join pickup sports games across campus in seconds.
      </p>
      <CasLoginButton className="btn btn-yale btn-lg w-100 mt-3">
        Log in with Yale CAS
      </CasLoginButton>
    </div>
  </div>
);

export default Login;
