import React from "react";

import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* =================================================
            COLLEGE
        ================================================= */}

        <div className="footer-column footer-about">
          <h2>APNA SCHOOL</h2>
          <p>Public School — Empowering Education, Enhancing Futures.</p>
        </div>

        {/* =================================================
            CONTACT
        ================================================= */}

        <div className="footer-column">
          <h3>Contact Us</h3>

          <a href="tel:+919876543210">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              style={{ flexShrink: 0, marginTop: "2px" }}
            >
              <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <span>+91 98765 43210</span>
          </a>

          <a href="mailto:info@collegeapp.com">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              style={{ flexShrink: 0, marginTop: "2px" }}
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <span>info@collegeapp.com</span>
          </a>

          <div className="footer-address">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              style={{ flexShrink: 0, marginTop: "3px" }}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>College Road, Education City, India</span>
          </div>
        </div>

        {/* =================================================
            QUICK LINKS
        ================================================= */}

        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">
            Home
            <span>›</span>
          </Link>

          <Link to="/about">
            About Us
            <span>›</span>
          </Link>

          <Link to="/contact">
            Contact Us
            <span>›</span>
          </Link>

          <Link to="/notice">
            Notice
            <span>›</span>
          </Link>
        </div>

        {/* =================================================
            SOCIAL MEDIA
        ================================================= */}

        <div className="footer-column">
          <h3>Follow Us</h3>

          <div className="social-links">
            {/* WhatsApp */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="social whatsapp"
              title="WhatsApp"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.201.301-.778.98-.954 1.181-.176.2-.352.225-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.235-.245-.588-.493-.508-.677-.518-.176-.009-.376-.01-.577-.01-.201 0-.527.075-.803.376s-1.053 1.029-1.053 2.509 1.079 2.91 1.229 3.111c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.9.119.58-.088 1.782-.727 2.033-1.429.251-.702.251-1.304.176-1.429-.075-.125-.276-.201-.577-.351z" />
                <path d="M12.004 0C5.378 0 0 5.378 0 12.004c0 2.116.553 4.175 1.603 5.996L.053 24l6.175-1.62a11.956 11.956 0 0 0 5.776 1.488h.005c6.626 0 12.004-5.378 12.004-12.004C24.013 5.378 18.636 0 12.004 0zm0 21.993a9.96 9.96 0 0 1-5.077-1.385l-.364-.216-3.769.988 1.006-3.674-.237-.378a9.94 9.94 0 0 1-1.524-5.324c0-5.503 4.478-9.981 9.986-9.981 2.666 0 5.172 1.037 7.057 2.923 1.885 1.885 2.923 4.392 2.923 7.058 0 5.503-4.478 9.981-9.986 9.981z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="social facebook"
              title="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="social instagram"
              title="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="social linkedin"
              title="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="social x-social"
              title="X"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="social youtube"
              title="YouTube"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* =================================================
          FOOTER BOTTOM
      ================================================= */}

      <div className="footer-bottom">
        <p className="footer-bottom-text">
          <span>© 2026 Apna School Public School. All rights reserved.</span>
          <span className="footer-bottom-divider">•</span>
          <span>
            Developed by <span className="dev-name">Aditya Pandey</span>
          </span>
          <span className="footer-bottom-divider">|</span>
          <span>Designed with ❤️ for Better Education</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
