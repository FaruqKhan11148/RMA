import './PrivacyPolicy.css';

import { useNavigate } from 'react-router-dom';
import Privacy from '../Privacy/Privacy';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return <Privacy onBack={() => navigate('/about')} />;
}

export default PrivacyPolicy;
