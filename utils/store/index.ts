"use client";

import { combineReducers } from "redux";

import { createDraftSafeSelector, configureStore } from "@reduxjs/toolkit";

import storage from "redux-persist/lib/storage";

import {
	persistReducer,
	persistStore,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";

import { authReducer } from "./auth";
import { uiReducer } from "./ui";
import { resReducer } from "./res";

const rootReducer = combineReducers({
	ui: uiReducer,
	res: resReducer,
	auth: authReducer,
});

const persistConfig = {
	key: "gsys-app-storage",
	storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);

export type StoreState = ReturnType<typeof store.getState>;
export type StoreDispatch = typeof store.dispatch;

export const createSelector = createDraftSafeSelector.withTypes<StoreState>();
