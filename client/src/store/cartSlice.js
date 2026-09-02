import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ productId, variantId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/items', { productId, variantId, quantity });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to add item to cart');
  }
});

export const updateCartItemQty = createAsyncThunk('cart/updateQty', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update quantity');
  }
});

export const removeCartItem = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.delete('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totals: {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totals = { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, itemCount: 0 };
    },
  },
  extraReducers: (builder) => {
    const updateState = (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, itemCount: 0 };
      }
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, updateState)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, updateState)
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItemQty.fulfilled, updateState)
      .addCase(removeCartItem.fulfilled, updateState)
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totals = { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, itemCount: 0 };
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
