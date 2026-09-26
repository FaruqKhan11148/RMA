import './ReportIssue.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ReportIssueHeader from './components/ReportIssue/ReportIssueHeader';
import ReportIssueIntro from './components/ReportIssue/ReportIssueIntro';
import IssueTypeField from './components/ReportIssue/IssueTypeField';
import OrderIdField from './components/ReportIssue/OrderIdField';
import DescriptionField from './components/ReportIssue/DescriptionField';
import ReportIssueError from './components/ReportIssue/ReportIssueError';
import ReportIssueSubmit from './components/ReportIssue/ReportIssueSubmit';

import { submitSupportIssue } from './utils/reportIssueApi';

function ReportIssue() {
  const navigate = useNavigate();

  const [issueType, setIssueType] = useState('');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!issueType) {
      setError('Please select an issue type');
      return;
    }

    if (!description.trim()) {
      setError('Please describe the problem');
      return;
    }

    try {
      const data = await submitSupportIssue({
        issueType,
        orderId,
        description,
      });

      console.log('Issue submitted:', data);

      navigate('/profile/help-support');
    } catch (error) {
      console.error('Submit issue failed:', error);
      setError(error.message || 'Unable to submit report');
    }
  };

  return (
    <main className="report_issue_page">
      <ReportIssueHeader navigate={navigate} />

      <form className="report_issue_form" onSubmit={handleSubmit}>
        <ReportIssueIntro />

        <IssueTypeField issueType={issueType} setIssueType={setIssueType} />

        <OrderIdField orderId={orderId} setOrderId={setOrderId} />

        <DescriptionField
          description={description}
          setDescription={setDescription}
        />

        <ReportIssueError error={error} />

        <ReportIssueSubmit />
      </form>
    </main>
  );
}

export default ReportIssue;
