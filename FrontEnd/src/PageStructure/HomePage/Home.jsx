import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllPublishedNotices } from "../../Services/noticeService";

import "./Home.css";

function Home() {
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNotices = async () => {
      try {
        setLoadingNotices(true);
        const data = await getAllPublishedNotices();
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.Data || [];

        if (isMounted && Array.isArray(list)) {
          // Sort latest published first, least/oldest in last
          const sorted = [...list]
            .filter(
              (n) =>
                (n.isPublished ?? n.IsPublished ?? true) &&
                (n.isActive ?? n.IsActive ?? true),
            )
            .sort((a, b) => {
              const dateA = new Date(
                a.publishedDate ||
                  a.PublishedDate ||
                  a.createdDate ||
                  a.CreatedDate ||
                  0,
              );
              const dateB = new Date(
                b.publishedDate ||
                  b.PublishedDate ||
                  b.createdDate ||
                  b.CreatedDate ||
                  0,
              );
              return dateB - dateA;
            });

          setNotices(sorted);
        }
      } catch (err) {
        console.warn("Failed to fetch published notices for home ticker:", err);
      } finally {
        if (isMounted) {
          setLoadingNotices(false);
        }
      }
    };

    fetchNotices();

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="home-page">
      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <p className="hero-small-title">
            Empowering Education, Enhancing Futures
          </p>

          <h1>
            Welcome to
            <span> CollegeApp</span>
          </h1>

          <p className="hero-description">
            A complete college management system designed to connect students,
            teachers and staff in one simple and powerful platform.
          </p>

          <div className="hero-buttons">
            <Link to="/about" className="hero-button primary-button">
              Explore More
              <span>→</span>
            </Link>

            <Link to="/contact" className="hero-button secondary-button">
              Contact Us
              <span>☎</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          NOTICE TICKER
      ===================================================== */}

      <section className="notice-ticker-section">
        <div className="notice-ticker">
          <div className="notice-label">
            <span className="notice-megaphone">📢</span>

            <strong>Latest Notice</strong>
          </div>

          <div className="notice-scroll-wrapper">
            <div className="notice-scroll-content">
              {loadingNotices ? (
                <Link to="/notice">📌 Loading latest notices...</Link>
              ) : notices.length > 0 ? (
                notices.map((notice, index) => (
                  <React.Fragment key={`${notice.id ?? notice.Id ?? index}`}>
                    <Link to="/notice">📌 {notice.title ?? notice.Title}</Link>
                    {index < notices.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))
              ) : (
                <Link to="/notice">📌 No notices available at this time</Link>
              )}
            </div>
          </div>

          <Link to="/notice" className="notice-view-all">
            View All
          </Link>
        </div>
      </section>

      {/* =====================================================
          EDUCATION SECTION
      ===================================================== */}

      <section className="education-section">
        <div className="section-heading">
          <span style={{ color: "#072d53" }}>About Education</span>

          <h2>The Power of Education</h2>

          <div
            style={{ backgroundColor: "#063a64" }}
            className="heading-line"
          ></div>

          <p>
            Education is the foundation of personal, professional and social
            growth. It empowers individuals with knowledge, develops skills and
            creates opportunities for a better future.
          </p>
        </div>

        <div className="education-cards">
          {/* Knowledge */}

          <div className="education-card">
            <div className="education-icon">🎓</div>

            <h3>Knowledge</h3>

            <p>
              Education helps us gain knowledge, understand the world and make
              better decisions.
            </p>
          </div>

          {/* Personal Growth */}

          <div className="education-card">
            <div className="education-icon">👤</div>

            <h3>Personal Growth</h3>

            <p>
              Learning builds confidence, improves skills and shapes a better
              future.
            </p>
          </div>

          {/* Better Society */}

          <div className="education-card">
            <div className="education-icon">👥</div>

            <h3>Better Society</h3>

            <p>
              Educated people create better communities and contribute to a
              stronger society.
            </p>
          </div>

          {/* Career */}

          <div className="education-card">
            <div className="education-icon">💼</div>

            <h3>Career Success</h3>

            <p>
              Education opens doors to many opportunities and prepares students
              for successful careers.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLEGE SECTION
      ===================================================== */}

      <section className="college-section">
        <div className="section-heading">
          <span>About Our College</span>

          <h2>Our College</h2>

          <div className="heading-line"></div>
        </div>

        <div className="college-information">
          <p>
            Our college is committed to academic excellence and the overall
            development of students. We provide a vibrant learning environment
            with modern infrastructure, experienced faculty and a wide range of
            opportunities.
          </p>

          <p>
            We believe in nurturing talent, encouraging creativity and promoting
            values that shape responsible citizens. Our mission is to empower
            students to achieve their goals and contribute positively to
            society.
          </p>

          <p>
            With a strong focus on innovation, discipline and quality education,
            we prepare our students for the challenges of the future and help
            them become leaders in their respective fields.
          </p>

          <p>
            CollegeApp makes it easier for students, teachers and staff to
            access important college information through a single digital
            platform.
          </p>

          <p>
            Students can stay connected with academic activities, notices,
            examinations and other important college updates.
          </p>

          <p>
            Our goal is to combine technology with education to create a
            transparent, efficient and student- friendly college management
            environment.
          </p>
        </div>
      </section>

      {/* =====================================================
          CALL TO ACTION
      ===================================================== */}

      <section className="home-cta">
        <div className="cta-content">
          <h2>Building a Better Future Through Education</h2>

          <p>
            Knowledge gives us the power to learn, grow and make a difference.
          </p>

          <Link to="/contact" className="cta-button">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
