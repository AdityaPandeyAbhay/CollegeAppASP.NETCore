import React from "react";
import "./SchoolVisionMission.css";

function SchoolVisionMission() {
  return (
    <section className="school-vm-container">
      {/* =====================================================
          HERO BANNER & MOTTO
      ===================================================== */}
      <div className="school-vm-banner">
        <div className="school-vm-banner-badge">
          <span className="school-vm-emblem">🏫</span>
          <span>College &amp; School ERP Portal</span>
        </div>
        <h2 className="school-vm-motto">
          “Inspiring Excellence • Empowering Minds • Shaping Tomorrow’s Leaders”
        </h2>
        <p className="school-vm-tagline">
          ज्ञान, संस्कार और सर्वांगीण विकास का संगम — उच्च शैक्षणिक मानकों और आधुनिक तकनीक से समृद्ध शिक्षा प्रणाली।
        </p>
      </div>

      {/* =====================================================
          VISION & MISSION DUAL CARDS
      ===================================================== */}
      <div className="school-vm-duo-grid">
        {/* VISION CARD */}
        <div className="school-vm-card vision-card">
          <div className="school-vm-card-header">
            <div className="school-vm-icon-bubble vision-icon">🎯</div>
            <div>
              <span className="school-vm-label">Our Aspiration</span>
              <h3 className="school-vm-title">Our Vision (हमारा दृष्टिकोण)</h3>
            </div>
          </div>
          <p className="school-vm-body">
            To be a premier institution of academic distinction and holistic development, dedicated to nurturing intellectually vibrant, morally grounded, and socially responsible global citizens who lead positive change with innovation and integrity.
          </p>
          <div className="school-vm-card-footer">
            <span className="school-vm-pill">🌟 Academic Distinction</span>
            <span className="school-vm-pill">🌍 Global Outlook</span>
            <span className="school-vm-pill">💡 Lifelong Learning</span>
          </div>
        </div>

        {/* MISSION CARD */}
        <div className="school-vm-card mission-card">
          <div className="school-vm-card-header">
            <div className="school-vm-icon-bubble mission-icon">🚀</div>
            <div>
              <span className="school-vm-label">Our Commitment</span>
              <h3 className="school-vm-title">Our Mission (हमारा लक्ष्य)</h3>
            </div>
          </div>
          <p className="school-vm-body">
            To provide high-quality, inclusive, and forward-looking education through modern pedagogy, experienced faculty, and smart digital infrastructure—fostering critical thinking, ethical leadership, practical skills, and character excellence in every student.
          </p>
          <div className="school-vm-card-footer">
            <span className="school-vm-pill">📚 Smart Pedagogy</span>
            <span className="school-vm-pill">🤝 Ethical Leadership</span>
            <span className="school-vm-pill">🔬 Practical Knowledge</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          CORE VALUES / INSTITUTIONAL PILLARS
      ===================================================== */}
      <div className="school-vm-pillars-section">
        <div className="school-vm-pillars-header">
          <h4 className="school-vm-pillars-title">Core Institutional Pillars (मुख्य स्तम्भ)</h4>
          <span className="school-vm-pillars-subtitle">The guiding values that define our educational philosophy</span>
        </div>

        <div className="school-vm-pillars-grid">
          {/* PILLAR 1 */}
          <div className="school-vm-pillar-card">
            <div className="school-vm-pillar-icon">🎓</div>
            <h5 className="school-vm-pillar-name">Academic Excellence</h5>
            <p className="school-vm-pillar-desc">
              Rigorous curriculum mastery, research-driven inquiry, and dedicated faculty mentorship to achieve peak scholarly performance.
            </p>
          </div>

          {/* PILLAR 2 */}
          <div className="school-vm-pillar-card">
            <div className="school-vm-pillar-icon">💡</div>
            <h5 className="school-vm-pillar-name">Innovation &amp; Technology</h5>
            <p className="school-vm-pillar-desc">
              State-of-the-art ERP systems, digital smart boards, STEM laboratories, and progressive learning methodologies for the 21st century.
            </p>
          </div>

          {/* PILLAR 3 */}
          <div className="school-vm-pillar-card">
            <div className="school-vm-pillar-icon">🤝</div>
            <h5 className="school-vm-pillar-name">Integrity &amp; Discipline</h5>
            <p className="school-vm-pillar-desc">
              Nurturing honesty, ethical governance, mutual respect, self-discipline, and deep civic responsibility in all students and staff.
            </p>
          </div>

          {/* PILLAR 4 */}
          <div className="school-vm-pillar-card">
            <div className="school-vm-pillar-icon">🌟</div>
            <h5 className="school-vm-pillar-name">Holistic Development</h5>
            <p className="school-vm-pillar-desc">
              Harmonious balance of academic rigor, athletic sports, cultural arts, community service, and physical-mental well-being.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CAMPUS COMMITMENT FOOTER STRIP
      ===================================================== */}
      <div className="school-vm-strip">
        <div className="school-vm-strip-item">
          <span className="school-vm-strip-icon">🛡️</span>
          <span>Safe &amp; Ragging-Free Campus</span>
        </div>
        <div className="school-vm-strip-divider">•</div>
        <div className="school-vm-strip-item">
          <span className="school-vm-strip-icon">⚡</span>
          <span>100% Digitized ERP Administration</span>
        </div>
        <div className="school-vm-strip-divider">•</div>
        <div className="school-vm-strip-item">
          <span className="school-vm-strip-icon">👥</span>
          <span>Transparent Student-Faculty Collaboration</span>
        </div>
        <div className="school-vm-strip-divider">•</div>
        <div className="school-vm-strip-item">
          <span className="school-vm-strip-icon">🏆</span>
          <span>Holistic Co-Curricular Opportunities</span>
        </div>
      </div>
    </section>
  );
}

export default SchoolVisionMission;
