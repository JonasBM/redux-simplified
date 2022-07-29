import { createAction, createReducer } from "@reduxjs/toolkit";

import { Message } from "../types";

export const createMessage = createAction(
  "CREATE_MESSAGE",
  (message: any, status?: number) => {
    let detail;
    if (typeof message === "string") {
      detail = { INFO: message };
    } else {
      detail = message;
    }
    if (!status) status = 0;
    return { payload: { detail, status } };
  }
);

export const messageReducer = createReducer<Message>(
  {
    detail: {},
    status: null,
  },
  (builder) => {
    builder.addCase(createMessage, (state, { payload }) => {
      return payload;
    });
  }
);
