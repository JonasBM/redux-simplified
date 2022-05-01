import { createAction, createReducer } from "@reduxjs/toolkit";

import { Message } from "../types";

export const returnError = createAction("GET_ERRORS", (err: any | string) => {
  let details;
  let status;
  if (typeof err === "string") {
    details = { undefined_error: err };
  } else {
    details = err?.response?.data;
    status = err?.response?.status;
  }
  if (!status) status = 0;
  return { payload: { details, status } };
});

export const errorReducer = createReducer<Message>(
  {
    details: {},
    status: null,
  },
  (builder) => {
    builder.addCase(returnError, (state, action) => {
      return {
        details: action.payload.details,
        status: action.payload.status,
      };
    });
  }
);
