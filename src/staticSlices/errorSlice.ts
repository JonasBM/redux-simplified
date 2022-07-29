import { createAction, createReducer } from "@reduxjs/toolkit";

import { Message } from "../types";

export const returnError = createAction("GET_ERRORS", (err: any | string) => {
  let detail;
  let status;
  if (typeof err === "string") {
    detail = { undefined_error: err };
  } else {
    detail = err?.response?.data;
    status = err?.response?.status;
  }
  if (!status) status = 0;
  return { payload: { detail, status } };
});

export const errorReducer = createReducer<Message>(
  {
    detail: null,
    status: null,
  },
  (builder) => {
    builder.addCase(returnError, (state, { payload }) => {
      return payload;
    });
  }
);
