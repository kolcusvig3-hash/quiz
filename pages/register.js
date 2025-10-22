import { CONFIG } from "../config";
import { useState } from "react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [section, setSection] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [messageModal, setMessageModal] = useState({
    isVisible: false,
    title: "",
    content: "",
    isError: false,
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || isSubmitted) return;

    if (!fullName || !emailId || !phoneNumber || !section) {
      setMessageModal({
        isVisible: true,
        title: "Registration Error",
        content: "All fields are required for registration.",
        isError: true,
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new URLSearchParams();
    formData.append(CONFIG.REGISTRATION_FIELDS.fullName, fullName);
    formData.append(CONFIG.REGISTRATION_FIELDS.emailId, emailId);
    formData.append(CONFIG.REGISTRATION_FIELDS.phoneNumber, phoneNumber);
    formData.append(CONFIG.REGISTRATION_FIELDS.section, section);

    try {
      await fetch(CONFIG.REGISTRATION_FORM_ACTION, {
        method: "POST",
        body: formData,
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setIsSubmitted(true);
      setMessageModal({
        isVisible: true,
        title: "Registration Successful!",
        content:
          "Your details have been submitted. You will receive your Registration ID via email shortly. Please keep it safe for all future submissions.",
        isError: false,
      });
    } catch (error) {
      console.error("Registration error:", error);
      setMessageModal({
        isVisible: true,
        title: "Registration Failed",
        content:
          "A network error occurred. Please check your connection and try again.",
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="day-page"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #fafafa, #f1f5f9)",
        padding: "40px 10px",
      }}
    >
      {messageModal.isVisible && (
        <div className="modal-overlay">
          <div
            className={`modal-card ${messageModal.isError ? "error" : "success"}`}
          >
            <h3>{messageModal.title}</h3>
            <p>{messageModal.content}</p>
            <button
              onClick={() =>
                setMessageModal({ ...messageModal, isVisible: false })
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div
        className="card"
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "30px 25px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
          Register Yourself
        </h2>
        <p
          className="small"
          style={{
            color: "#555",
            fontSize: "0.9rem",
            marginBottom: "20px",
            lineHeight: "1.4",
          }}
        >
          Register with your details (GMAIL preferred). After registration, you will receive a{" "}
          <b>Registration ID</b> via email. This ID is mandatory for answer
          submission. Contact <b>kolcusvig3@gmail.com</b> for queries.
        </p>

        {isSubmitted ? (
          <p
            style={{
              padding: "20px",
              backgroundColor: "#e6ffe6",
              border: "1px solid #00cc00",
              borderRadius: "6px",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            ✅ Registration Complete! Please check your email for your Registration ID. Keep it safe for all future submissions.
          </p>
        ) : (
          <form
            onSubmit={handleFormSubmit}
            className="input-area"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <label htmlFor="emailId">Email ID *</label>
            <input
              id="emailId"
              type="email"
              placeholder="Your valid email address - GMAIL preferred"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="Your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <label htmlFor="section">Section / Division / Unit *</label>
            <input
              id="section"
              type="text"
              placeholder="Your Section / Division / Unit"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: "18px",
                padding: "12px",
                backgroundColor: isSubmitting ? "#9ca3af" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "background 0.3s ease",
              }}
            >
              {isSubmitting ? "Registering..." : "Register and Get ID"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
