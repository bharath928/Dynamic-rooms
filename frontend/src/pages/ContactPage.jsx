import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ContactPage.css"; // (optional if you want to move CSS to separate file)

const ContactPage = () => {
  return (
    <div style={{ background: "linear-gradient(to right, #e3f2fd, #fff)", paddingTop: "80px", fontFamily: "'Poppins', sans-serif" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-custom fixed-top">
        <div className="container">
          <a className="navbar-brand mx-auto" href="#">Meet The Team</a>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center g-4">
          {/* Team Members */}
          {[
            { name: "Bharath", role: "Full Stack Developer", img: "/bharath.webp" },
            { name: "Jagadesh", role: "Full Stack Developer", img: "/jagga.webp" },
            { name: "Mahesh", role: "Full Stack Developer", img: "/blazzerpic1.webp" },
            { name: "Madhu", role: "Full Stack Developer", img: "/madhu.webp" },
            // { name: "Chandu", role: "Full Stack Developer", img: "/madhu.webp" },
          ].map((member, index) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg custom-col-lg" key={index}>
              <div className="card team-card">
                <img src={member.img} className="team-img" alt={member.name} />
                <div className="card-body text-center">
                  <h5 className="card-title">{member.name}</h5>
                  <p className="card-text text-muted">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="form-section mt-5">
          <h3 className="text-center section-title mb-4">Send Us Your Queries or Issues</h3>
          <form action="https://formspree.io/f/xrbbnlgw" method="POST" className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">Your Name</label>
              <input type="text" name="name" className="form-control" id="name" required placeholder="Enter your full name" />
            </div>

            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Your Email</label>
              <input type="email" name="email" className="form-control" id="email" required placeholder="Enter your email" />
            </div>

            <div className="col-12">
              <label htmlFor="subject" className="form-label">Subject</label>
              <input type="text" name="subject" className="form-control" id="subject" placeholder="Subject of your message" />
            </div>

            <div className="col-12">
              <label htmlFor="message" className="form-label">Your Message</label>
              <textarea name="message" className="form-control" id="message" rows="5" required placeholder="Type your message here..."></textarea>
            </div>

            <div className="col-12 text-center">
              <button type="submit" className="btn btn-primary px-5">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
