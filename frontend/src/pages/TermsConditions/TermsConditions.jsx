import './TermsConditions.css';

import { useNavigate } from 'react-router-dom';
import Terms from '../Terms/Terms';

function TermsConditions() {
  const navigate = useNavigate();

  return <Terms onBack={() => navigate('/about')} />;
}

export default TermsConditions;
