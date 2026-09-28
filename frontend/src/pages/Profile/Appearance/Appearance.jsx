import './Appearance.css';

import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="appearance">
      <section className="appearance_header">
        <h1>Appearance</h1>
        <p>Choose how RMA looks on your device.</p>
      </section>

      <section className="appearance_section">
        <h2>Theme</h2>

        <div className="appearance_options">
          <button
            type="button"
            className={`appearance_option ${
              theme === 'light' ? 'appearance_option_active' : ''
            }`}
            onClick={() => setTheme('light')}
          >
            <span className="appearance_option_left">
              <span className="appearance_option_icon">
                <Sun size={20} strokeWidth={2} />
              </span>

              <span className="appearance_option_content">
                <strong>Light</strong>
                <span>Use the light theme</span>
              </span>
            </span>

            <span className="appearance_option_check">
              {theme === 'light' && <Check size={18} strokeWidth={2.5} />}
            </span>
          </button>

          <button
            type="button"
            className={`appearance_option ${
              theme === 'dark' ? 'appearance_option_active' : ''
            }`}
            onClick={() => setTheme('dark')}
          >
            <span className="appearance_option_left">
              <span className="appearance_option_icon">
                <Moon size={20} strokeWidth={2} />
              </span>

              <span className="appearance_option_content">
                <strong>Dark</strong>
                <span>Use the dark theme</span>
              </span>
            </span>

            <span className="appearance_option_check">
              {theme === 'dark' && <Check size={18} strokeWidth={2.5} />}
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default Appearance;
