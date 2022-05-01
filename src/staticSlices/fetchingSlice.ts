import { createAction, createReducer } from "@reduxjs/toolkit";

export const startFetching = createAction("ADD_FETCHING");
export const finishFetching = createAction("SUB_FETCHING");
export const resetFetching = createAction("RESET_FETCHING");

export const fetchingReducer = createReducer(0, (builder) => {
  builder
    .addCase(startFetching, (state, action) => {
      state++;
      return state;
    })
    .addCase(finishFetching, (state, action) => {
      state--;
      if (state < 0) state = 0;
      return state;
    })
    .addCase(resetFetching, (state, action) => {
      state = 0;
      return state;
    });
});
