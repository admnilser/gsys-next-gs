"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Entity, ResourceState } from "../types";

import fn from "../funcs";

export type ResItemState = ResourceState<Entity>;

export type ResState<K extends string = string> = Record<K, ResItemState>;

export type ResPayloadAction<D> = PayloadAction<{
	res: string;
	data: Partial<D>;
}>;

const resSlice = createSlice({
	name: "res",
	initialState: {} as ResState,
	reducers: {
		clearCache: (state) => {
			fn.forEach(state, (res, key) => {
				state[key] = {} as ResItemState;
			});
		},
		updateData: (state, action: ResPayloadAction<ResItemState>) => {
			const { res, data } = action.payload;
			state[res] = { ...state[res], ...data };
		},
		updateDataItem(
			state,
			action: ResPayloadAction<{
				item: Partial<Entity>;
				free: boolean;
				index: number;
			}>,
		) {
			const {
				res,
				data: { item, free, index },
			} = action.payload;

			const id = item?.id;

			if (!id) return;

			const resState = state[res] || {};

			let { data = [], keys = [], recs = {}, total = 0 } = resState;

			if (free) {
				keys = fn.remove(keys, id);
				recs[id] = undefined;
				total--;
			} else {
				recs[id] = fn.assign({}, recs[id], item);
				if (!keys.includes(id) && index)
					index > -1 ? keys.splice(index, 0, id) : keys.push(id);
			}

			state[res] = { ...resState, data, keys, recs, total };
		},
	},
});

export const { clearCache, updateData, updateDataItem } =
	resSlice.actions;

export const resReducer = resSlice.reducer;
