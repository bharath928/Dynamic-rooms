// Footer.jsx
import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = forwardRef((props, ref) => {  // Correct: (props, ref)
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
            <footer
            ref={ref}
            className="text-white text-center py-3 px-2"
            style={{
              background: 'linear-gradient(to right,#0066cc, #003366)', // subtle gradient
              position: 'fixed',
              bottom: 0,
              width: '100%',
              zIndex: 1000,
              fontSize: '0.9rem',
              boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.2)',
              letterSpacing: '0.3px'
            }}
          >
            <p className="mb-1">
              Developed by{' '}
              <span
                onClick={() => window.open('/team', '_blank')}
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: '#90caf9',
                  wordBreak: 'break-word',
                  fontWeight: 500
                }}
                onMouseOver={(e) => (e.target.style.color = '#ffffff')}
                onMouseOut={(e) => (e.target.style.color = '#90caf9')}
              >
                Department of Computer Science and Engineering, AITAM
              </span>
            </p>
            <p className="mb-0">
              &copy; {currentYear} All rights reserved.
            </p>
          </footer>

  );
});

export default Footer;
