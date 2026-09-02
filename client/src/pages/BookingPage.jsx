import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, User, Mail, Phone, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BookingPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Fetch slot availability whenever selected date changes
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await api.get('/bookings/slots', { params: { date: selectedDate } });
        setSlots(res.data?.slots || []);
        // Auto select first available slot
        const firstAvail = res.data?.slots?.find((s) => s.isAvailable);
        setSelectedSlot(firstAvail ? firstAvail.slot : '');
      } catch (e) {
        setSlots([
          { slot: '10:00 AM', isAvailable: true },
          { slot: '11:00 AM', isAvailable: true },
          { slot: '01:00 PM', isAvailable: true },
          { slot: '02:00 PM', isAvailable: true },
          { slot: '04:00 PM', isAvailable: true },
          { slot: '05:00 PM', isAvailable: true },
        ]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        date: selectedDate,
        timeSlot: selectedSlot,
        customerName,
        email,
        phone,
        notes,
      });
      setSuccessBooking(res.data?.booking);
    } catch (e) {
      alert(e.message || 'Failed to book appointment slot.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900">Bespoke Styling Appointment</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Calendar Concierge
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Book a Stylist Consultation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Select your preferred date and time slot for a personalized 1-on-1 wardrobe review, fit analysis, and private collection preview.
        </p>
      </div>

      {successBooking ? (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 card-shadow animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/60">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Booking Confirmed!</h3>
            <p className="text-xs text-slate-500">
              Your styling session has been scheduled with our master stylist.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold text-slate-900">{successBooking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time Slot:</span>
              <span className="font-bold text-slate-900">{successBooking.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Guest:</span>
              <span className="font-bold text-slate-900">{successBooking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-900">{successBooking.serviceType}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccessBooking(null);
              setNotes('');
            }}
            className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider hover:bg-slate-800 transition"
          >
            Book Another Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Calendar Date & Time Slot Grid */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-8">
            {/* 1. Date Selector */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="w-4 h-4 text-slate-900" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  1. Select Date
                </h3>
              </div>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-64 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-xs"
              />
            </div>

            {/* 2. Available Time Slots Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-900" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    2. Available Time Slots
                  </h3>
                </div>
                {loadingSlots && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((item) => {
                  const isSelected = selectedSlot === item.slot;
                  return (
                    <button
                      type="button"
                      key={item.slot}
                      disabled={!item.isAvailable}
                      onClick={() => setSelectedSlot(item.slot)}
                      className={`py-3.5 px-4 rounded-2xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 ${
                        !item.isAvailable
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100 line-through'
                          : isSelected
                          ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900'
                          : 'bg-white border-2 border-slate-200 text-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <span>{item.slot}</span>
                      {isSelected && <span className="text-emerald-400 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Customer Details Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              3. Guest Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Styling Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Preferences, upcoming event themes, or sizing requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>CONFIRM BOOKING</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
