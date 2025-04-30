"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UiState = {
	pages: string[];
};

const uiSlice = createSlice({
	name: "ui",
	initialState: {
		pages: [],
	} as UiState,
	reducers: {
		addPage: (state, action: PayloadAction<string>) => {
			const page = action.payload;
			if (state.pages.indexOf(page) < 0) {
				state.pages.push(page);
			}
		},
		remPage: (state, action: PayloadAction<string>) => {
			const page = action.payload;
			state.pages = state.pages.filter((p: string) => p !== page);
		},
	},
});

export const { addPage, remPage } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
