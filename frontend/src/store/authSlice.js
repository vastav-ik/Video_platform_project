import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false,
  user: JSON.parse(localStorage.getItem('user')) || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: state => {
      state.status = false;
      state.user = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearUser: state => {
      state.status = false;
      state.user = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { login, logout, clearUser } = authSlice.actions;

export default authSlice.reducer;
