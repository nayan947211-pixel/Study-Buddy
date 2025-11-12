import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("token"),
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
})

export const { setToken, setUser, logout } = authSlice.actions
export const selectToken = (state) => state.authReducer.token;
export const selectUser = (state) => state.authReducer.user;
export const selectIsAuthenticated = (state) => state.authReducer.isAuthenticated;

export default authSlice.reducer