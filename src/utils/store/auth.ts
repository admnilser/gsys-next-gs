"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthUser } from "../types";

export type AuthState<U extends AuthUser> = {
	user: U;
	logged: boolean;
};

const authSlice = createSlice({
	name: "res",
	initialState: { user: null } as AuthState<AuthUser>,
	reducers: {
		login: (state, action: PayloadAction<AuthUser>) => {
			state.user = action.payload;
		},

		logout: (state) => {
			state.user = null;
		},
	},
});

export const { login, logout } = authSlice.actions;

export const authReducer = authSlice.reducer;
