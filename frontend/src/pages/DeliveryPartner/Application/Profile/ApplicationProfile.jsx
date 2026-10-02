import './ApplicationProfile.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchRmaApplication,
  updateRmaApplication,
} from '../utils/applicationApi';

function ApplicationProfile() {
  const navigate = useNavigate();

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        setError('');

        const application = await fetchRmaApplication();

        if (application?.profile?.dateOfBirth) {
          const date = new Date(application.profile.dateOfBirth);

          if (!Number.isNaN(date.getTime())) {
            setDateOfBirth(date.toISOString().split('T')[0]);
          }
        }

        setProfilePhotoUrl(application?.profile?.profilePhotoUrl || '');
      } catch (loadError) {
        console.error('Failed to load personal details:', loadError);

        setError(loadError.message || 'Unable to load your personal details.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!dateOfBirth) {
      setError('Please enter your date of birth.');
      return;
    }

    if (!profilePhotoUrl.trim()) {
      setError('Please add your profile photo.');
      return;
    }

    try {
      setSaving(true);

      await updateRmaApplication('profile', {
        dateOfBirth,
        profilePhotoUrl: profilePhotoUrl.trim(),
      });

      setSuccess('Personal details saved successfully.');

      setTimeout(() => {
        navigate('/delivery-partner/application');
      }, 500);
    } catch (saveError) {
      console.error('Failed to save personal details:', saveError);

      setError(saveError.message || 'Unable to save your personal details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="delivery_application_profile_page">
        <div className="delivery_application_profile_loading">Loading...</div>
      </main>
    );
  }

  return (
    <main className="delivery_application_profile_page">
      <div className="delivery_application_profile_container">
        <button
          type="button"
          className="delivery_application_profile_back"
          onClick={() => navigate('/delivery-partner/application')}
        >
          ← Back to Application
        </button>

        <div className="delivery_application_profile_header">
          <span>Step 1 of 6</span>

          <h1>Personal Details</h1>

          <p>
            Tell us a little about yourself. This information is used for your
            RMA Delivery Partner application.
          </p>
        </div>

        <form
          className="delivery_application_profile_form"
          onSubmit={handleSubmit}
        >
          <div className="delivery_application_profile_card">
            <div className="delivery_application_profile_field">
              <label htmlFor="delivery-dob">Date of Birth</label>

              <input
                id="delivery-dob"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="delivery_application_profile_field">
              <label htmlFor="delivery-profile-photo">Profile Photo</label>

              <input
                id="delivery-profile-photo"
                type="url"
                placeholder="Paste profile photo URL"
                value={profilePhotoUrl}
                onChange={(event) => setProfilePhotoUrl(event.target.value)}
                disabled={saving}
              />

              <small>
                We'll connect the RMA image upload system here next.
              </small>
            </div>

            {profilePhotoUrl.trim() && (
              <div className="delivery_application_profile_preview">
                <img
                  src={profilePhotoUrl}
                  alt="Profile preview"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {error && (
              <div className="delivery_application_profile_error">{error}</div>
            )}

            {success && (
              <div className="delivery_application_profile_success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="delivery_application_profile_button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ApplicationProfile;
