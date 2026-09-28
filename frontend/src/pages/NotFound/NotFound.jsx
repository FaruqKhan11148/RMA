import './NotFound.css';

import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <main className="not_found">
      <section className="not_found_content">
        <div className="not_found_illustration" aria-hidden="true">
          <div className="not_found_cloud not_found_cloud_one" />
          <div className="not_found_cloud not_found_cloud_two" />

          <div className="not_found_sun" />

          <div className="not_found_store">
            <div className="not_found_store_roof">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="not_found_store_sign">
              <span>RMA</span>
            </div>

            <div className="not_found_store_body">
              <div className="not_found_store_window">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="not_found_store_door" />
            </div>

            <div className="not_found_store_base" />
          </div>

          <div className="not_found_ground" />
        </div>

        <div className="not_found_text">
          <span className="not_found_code">404</span>

          <h1>Oops! Page not found</h1>

          <p>
            Looks like this page doesn't exist or the link you followed is no
            longer available.
          </p>

          <button
            type="button"
            className="not_found_home_button"
            onClick={handleGoHome}
          >
            Go to Home
          </button>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
