import './ReportIssue.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch(
        'http://localhost:5000/api/customers/support-issues',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            issueType,
            orderId: orderId.trim(),
            description: description.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit report');
      }

      console.log('Issue submitted:', data);

      navigate('/profile/help-support');
    } catch (error) {
      console.error('Submit issue failed:', error);
      setError(error.message || 'Unable to submit report');
    }
  };

  return (
    <main className="report_issue_page">
      {/* HEADER */}

      <div className="report_issue_header">
        <button
          className="report_issue_back"
          onClick={() => navigate('/profile/help-support')}
        >
          ‹
        </button>

        <h1>Report an Issue</h1>
      </div>

      {/* FORM */}

      <form className="report_issue_form" onSubmit={handleSubmit}>
        <div className="report_issue_intro">
          <h2>How can we help?</h2>

          <p>Tell us what went wrong and our support team will look into it.</p>
        </div>

        {/* ISSUE TYPE */}

        <div className="report_issue_field">
          <label htmlFor="issueType">Issue Type</label>

          <select
            id="issueType"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option value="">Select an issue</option>

            <option value="order_not_received">Order not received</option>

            <option value="wrong_items">Wrong items</option>

            <option value="missing_items">Missing items</option>

            <option value="damaged_items">Damaged items</option>

            <option value="payment_problem">Payment problem</option>

            <option value="delivery_problem">Delivery problem</option>

            <option value="shop_problem">Shop problem</option>

            <option value="other">Other</option>
          </select>
        </div>

        {/* ORDER ID */}

        <div className="report_issue_field">
          <label htmlFor="orderId">
            Order ID
            <span>Optional</span>
          </label>

          <input
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Example: RMA-ORD-12345"
          />
        </div>

        {/* DESCRIPTION */}

        <div className="report_issue_field">
          <label htmlFor="description">Describe the problem</label>

          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please explain what happened..."
            maxLength="1000"
            rows="7"
          />

          <span className="report_issue_character_count">
            {description.length}/1000
          </span>
        </div>

        {/* ERROR */}

        {error && <div className="report_issue_error">{error}</div>}

        {/* SUBMIT */}

        <button type="submit" className="report_issue_submit">
          Submit Report
        </button>
      </form>
    </main>
  );
}

export default ReportIssue;
