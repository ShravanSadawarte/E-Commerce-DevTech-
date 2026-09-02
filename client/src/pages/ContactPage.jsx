import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ContactPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    try {
      await api.post('/contact', {
        name,
        email,
        subject,
        message,
      });
      setSentSuccess(true);
      setMessage('');
      setSubject('');
    } catch (e) {
      alert(e.message || 'Failed to submit contact message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Customer Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Have questions about shipping, orders, or sizing? Our concierge advisory team is here to assist you 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Office & Contact Info */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 card-shadow space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold tracking-tight">Contact Information</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fill out the form and our advisory support team will respond within 24 hours.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/10">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Phone Support</span>
                  <p className="text-xs font-bold">+1 (800) 555-DEVTECH</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/10">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Email Inquiries</span>
                  <p className="text-xs font-bold">concierge@devtech.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/10">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Headquarters</span>
                  <p className="text-xs font-bold">500 Fashion Avenue, New York, NY 10018</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <span className="text-xs text-slate-400 block">Operating Hours</span>
            <p className="text-xs font-semibold text-white mt-0.5">Monday – Sunday: 8:00 AM – 10:00 PM EST</p>
          </div>
        </div>

        {/* Right Column: Send Message Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 card-shadow space-y-6">
          <h3 className="text-base font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
            Send Us a Message
          </h3>

          {sentSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Message Dispatched!</h4>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                Thank you for reaching out. We have logged your inquiry and our team will get back to you shortly.
              </p>
              <button
                onClick={() => setSentSuccess(false)}
                className="bg-emerald-600 text-white text-xs font-bold px-5 py-2 rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding sizing for slim-fit shirt"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can our customer advisory team help you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition hover:scale-105"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>SEND MESSAGE</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
