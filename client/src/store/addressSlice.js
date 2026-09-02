import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchAddresses = createAsyncThunk('addresses/fetchAddresses', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/addresses');
    return res.data?.addresses || [];
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch addresses');
  }
});

export const addAddress = createAsyncThunk('addresses/addAddress', async (addressData, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.post('/addresses', addressData);
    dispatch(fetchAddresses());
    return res.data?.address;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to save address');
  }
});

export const updateAddress = createAsyncThunk('addresses/updateAddress', async ({ id, data }, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.put(`/addresses/${id}`, data);
    dispatch(fetchAddresses());
    return res.data?.address;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update address');
  }
});

export const deleteAddress = createAsyncThunk('addresses/deleteAddress', async (id, { rejectWithValue, dispatch }) => {
  try {
    await api.delete(`/addresses/${id}`);
    dispatch(fetchAddresses());
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete address');
  }
});

export const setDefaultAddress = createAsyncThunk('addresses/setDefault', async (id, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.patch(`/addresses/${id}/default`);
    dispatch(fetchAddresses());
    return res.data?.address;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to set default address');
  }
});

const addressSlice = createSlice({
  name: 'addresses',
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.loading = true; })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default addressSlice.reducer;
