import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// A mock fetch - in real app replace with API call
export const fetchProducts = createAsyncThunk('products/fetch', async () => {
  // simulate network
  await new Promise(r => setTimeout(r, 300));
  return [
    { id: 1, name: 'React Basics', price: 49 },
    { id: 2, name: 'Advanced Hooks', price: 79 },
  ];
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle' },
  reducers: {
    updateProduct(state, action) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload; })
      .addCase(fetchProducts.rejected, state => { state.status = 'error'; });
  }
});

export const { updateProduct } = productsSlice.actions;
export default productsSlice.reducer;
