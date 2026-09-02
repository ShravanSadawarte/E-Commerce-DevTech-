import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { fetchCart } from './cartSlice';

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/wishlist');
    return res.data?.items || [];
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch wishlist');
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.post('/wishlist/toggle', { productId });
    dispatch(fetchWishlist());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to toggle wishlist');
  }
});

export const moveWishlistToCart = createAsyncThunk('wishlist/moveToCart', async ({ productId, variantId }, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.post('/wishlist/move-to-cart', { productId, variantId });
    dispatch(fetchWishlist());
    dispatch(fetchCart());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to move to cart');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
