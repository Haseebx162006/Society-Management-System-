import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_super_admin: boolean;
  password_reset_required: boolean;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "IMPORTED";
  locked_until?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const loadState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, refreshToken: null };
  }
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return { user: null, token: null, refreshToken: null };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return { user: null, token: null, refreshToken: null };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.refreshToken = refreshToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('authState', JSON.stringify(state));
      }
    },
    updateAccessToken: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string; user?: User }>) => {
        state.token = action.payload.accessToken;
        if (action.payload.refreshToken) {
            state.refreshToken = action.payload.refreshToken;
        }
        if (action.payload.user) {
            state.user = action.payload.user;
        }
        if (typeof window !== 'undefined') {
            localStorage.setItem('authState', JSON.stringify(state));
        }
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authState');
      }
    },
  },
});

export const { setCredentials, logOut, updateAccessToken } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
