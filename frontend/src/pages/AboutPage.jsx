import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div style={{ backgroundColor: "#f8f9fa", fontFamily: "'Poppins', sans-serif" }}>

      {/* Hero Section */}
      <section className="hero-section text-white text-center py-5">
        <div className="container pt-0">
          <h1 className="display-8 fw-bold">About Our Project</h1>
          <p className="lead">
            Delivering smart and scalable solutions with cutting-edge technology.
          </p>
        </div>
      </section>

      {/* About Description */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <img
                src="/"
                className="img-fluid rounded shadow"
                alt="About"
              />
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Who We Are</h2>
              <p className="section-description">
                Our project is focused on creating a seamless and dynamic platform tailored to solve
                real-world problems using innovative web technologies. We believe in the power of
                clean design, efficient development, and user-centric experiences to deliver impactful results.
              </p>
              <p className="section-description">
                Whether it's managing large-scale systems or enhancing digital interaction, our goal
                is to provide reliable, scalable, and intelligent solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-5 text-center">
        <div className="container">
          <h2 className="section-title">Our Mission & Values</h2>
          <p className="section-description mb-5">
            We’re committed to building technology that empowers users and improves lives.
          </p>
          <div className="row g-4">
            {[
              {
                icon: "🚀",
                title: "Innovation",
                text: "We embrace change and constantly push boundaries with modern technologies and creative thinking.",
              },
              {
                icon: "🤝",
                title: "Collaboration",
                text: "Great things are built together. We foster teamwork across disciplines to drive excellence.",
              },
              {
                icon: "🔒",
                title: "Trust & Security",
                text: "We prioritize data integrity and security, ensuring trust and transparency in every interaction.",
              },
            ].map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="p-4 bg-light rounded shadow-sm h-100">
                  <div className="value-icon mb-3">{item.icon}</div>
                  <h5>{item.title}</h5>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default AboutPage;
