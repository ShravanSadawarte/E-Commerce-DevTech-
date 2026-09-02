import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileMenuOpen: false,
    searchModalOpen: false,
    floatingChatOpen: false,
    authModalOpen: false,
    authModalMode: 'login', // 'login' | 'register'
    quickViewProductId: null,
    toast: null, // { message, type: 'success' | 'error' | 'info' }
  },
  reducers: {
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    setSearchModalOpen: (state, action) => {
      state.searchModalOpen = action.payload;
    },
    setFloatingChatOpen: (state, action) => {
      state.floatingChatOpen = action.payload;
    },
    setAuthModal: (state, action) => {
      state.authModalOpen = action.payload.open;
      state.authModalMode = action.payload.mode || 'login';
    },
    setQuickViewProductId: (state, action) => {
      state.quickViewProductId = action.payload;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  setMobileMenuOpen,
  setSearchModalOpen,
  setFloatingChatOpen,
  setAuthModal,
  setQuickViewProductId,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
