import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [notification, setNotification] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification("Message sent!");
    setFormData({ fullName: "", email: "", subject: "", message: "" });
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-cyan-800 to-blue-900 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Get In Touch</h1>
          <p className="text-xl text-white/80">
            We'd love to hear from you. Send us a message below.
          </p>
        </div>

        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl">
          {notification && (
            <div className="mb-6 py-2 px-4 bg-cyan-400/20 text-cyan-400 text-center font-medium rounded-lg">
              {notification}
            </div>
          )}

          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            <div className="md:flex md:space-x-4">
              <div className="w-full md:w-1/2 mb-4 md:mb-0">
                <label className="block text-white mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 md:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/50"
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-white mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 md:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 md:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 md:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/50"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto md:px-8 bg-cyan-400 text-black py-2 md:py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="mt-8 md:mt-10 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Need Immediate Assistance?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Call us at (555) 123-4567 or email us directly at
            support@bestelectronics4u.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
