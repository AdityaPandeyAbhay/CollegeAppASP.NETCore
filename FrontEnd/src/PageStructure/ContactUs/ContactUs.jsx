import "./ContactUs.css";

function ContactUs() {
  return (
    <div className="contact-page">

      <div className="contact-container">

        <h1>Contact Us</h1>

        <div className="contact-intro">
          We are always happy to help. Feel free to contact our college
          office for any information, enquiry, or assistance.
        </div>

        <h2 className="section-title">Get In Touch</h2>

        <p>
          If you have any questions regarding admission, academics,
          students, courses, or other college-related information,
          please contact us using the details below.
        </p>

        <div className="contact-box">

          <h2>College Contact Information</h2>

          <p>
            <strong>📞 Phone:</strong>
            <a href="tel:+916386284592">
              +91 6386284592
            </a>
          </p>

          <p>
            <strong>✉ Email:</strong>
            <a href="mailto:college@example.com">
              college@example.com
            </a>
          </p>

          <p>
            <strong>📍 Address:</strong>
            College Address, Uttar Pradesh, India
          </p>

          <p>
            <strong>🕒 Office Hours:</strong>
            Monday - Saturday, 9:00 AM - 5:00 PM
          </p>

        </div>

      </div>

    </div>
  );
}

export default ContactUs;