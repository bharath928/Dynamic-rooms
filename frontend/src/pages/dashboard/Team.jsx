import React, { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEnvelope, FaIdBadge } from 'react-icons/fa';

const teamData = [
  {
    name: 'Madhu',
    branch: 'CSE',
    roll: '22A51A05F5',
    email: 'madhukorada23@gmail.com',
    img: process.env.PUBLIC_URL + '/madhu.jpg',
    portfolio: 'https://madhu-portfolio-m9yv.onrender.com/',
  },
  {
    name: 'Mahesh',
    branch: 'CSE',
    roll: '22A51A05F4',
    email: 'mahesh20104@gmail.com.com',
    img: process.env.PUBLIC_URL + '/blazzerpic1.jpg',
    portfolio: 'https://mahesh5f4.github.io/myportfolio/',
  },
  {
    name: 'Jagadeesh',
    branch: 'CSE',
    roll: '22A51A05D9',
    email: 'sneha.reddy@example.com',
    img: process.env.PUBLIC_URL + '/jagga.jpg',
    portfolio: 'https://snehareddy.me',
  },
  {
    name: 'Bharath',
    branch: 'CSE',
    roll: '22A51A05F7',
    email: 'bharathkurasa@gmail.com',
    img: process.env.PUBLIC_URL + '/bharath.jpg',
    portfolio: 'https://rahulverma.io',
  },
];

const Team = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;

    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollDelay = 10;

    const autoScroll = () => {
      if (scrollContainer && scrollAmount < scrollContainer.scrollWidth / 2) {
        scrollAmount += scrollStep;
        scrollContainer.scrollLeft += scrollStep;
        setTimeout(autoScroll, scrollDelay);
      } else {
        scrollAmount = 0;
        scrollContainer.scrollLeft = 0;
        setTimeout(autoScroll, scrollDelay);
      }
    };

    autoScroll();
  }, []);

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4 fw-bold">🌟 Meet Our Team 🌟</h2>

      <div
        ref={scrollRef}
        className="d-flex overflow-hidden px-2 py-3"
        style={{
          scrollBehavior: 'smooth',
          whiteSpace: 'nowrap',
          gap: '1rem',
        }}
      >
        {teamData.map((member, index) => (
          <div
            key={index}
            className="card shadow-lg border-0 rounded-4 me-3"
            style={{
              minWidth: '260px',
              transition: 'transform 0.3s ease-in-out',
              display: 'inline-block',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <img
              src={member.img}
              className="card-img-top rounded-top"
              alt={member.name}
              style={{ height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body text-center">
              <h5 className="card-title fw-bold text-primary">{member.name}</h5>
              <span className="badge bg-info mb-2">{member.branch}</span>
              <p className="card-text mb-2 text-secondary">
                <FaIdBadge className="me-1 text-dark" />
                {member.roll}
              </p>
              <p className="card-text mb-2 text-secondary">
                <FaEnvelope className="me-1 text-dark" />
                <a href={`mailto:${member.email}`} className="text-decoration-none">
                  {member.email}
                </a>
              </p>
              <a
                href={member.portfolio}
                className="btn btn-outline-primary btn-sm mt-2"
                target="_blank"
                rel="noreferrer"
              >
                🔗 View Portfolio
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
