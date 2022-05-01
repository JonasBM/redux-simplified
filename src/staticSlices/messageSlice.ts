import { createAction, createReducer } from "@reduxjs/toolkit";

import { Message } from "../types";

export const createMessage = createAction(
  "CREATE_MESSAGE",
  (message: any, status?: number) => {
    let details;
    if (typeof message === "string") {
      details = { INFO: message };
    } else {
      details = message;
    }
    if (!status) status = 0;
    return { payload: { details, status } };
  }
);

export const messageReducer = createReducer<Message>(
  {
    details: {},
    status: null,
  },
  (builder) => {
    builder.addCase(createMessage, (state, action) => {
      return {
        details: action.payload.details,
        status: action.payload.status,
      };
    });
  }
);
