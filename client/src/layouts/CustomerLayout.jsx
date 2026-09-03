import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingChatWidget from '../components/FloatingChatWidget';
import GeminiChatbot from '../components/GeminiChatbot';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingChatWidget />
      <GeminiChatbot />
    </div>
  );
};

export default CustomerLayout;
