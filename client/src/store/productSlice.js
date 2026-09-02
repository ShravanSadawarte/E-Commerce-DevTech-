import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch products');
  }
});

export const fetchProductDetails = createAsyncThunk('products/fetchDetails', async (idOrSlug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${idOrSlug}`);
    return res.data?.product;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch product details');
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data?.categories || [];
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch categories');
  }
});

export const fetchFilters = createAsyncThunk('products/fetchFilters', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/filters');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch filters');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    categories: [],
    filters: null,
    currentProduct: null,
    loading: false,
    detailsLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Products list
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Filters
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
