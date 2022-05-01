import { AxiosRequestHeaders } from "axios";

export type PayloadIdType = number;

export type ActionTypes = {
  LIST: string;
  CREATE: string;
  RETRIEVE: string;
  UPDATE: string;
  DESTROY: string;
  RESET: string;
};

export type actionMessages = {
  reset?: string;
  list?: string;
  create?: string;
  retrieve?: string;
  update?: string;
  destroy?: string;
};

export type Config = ActionConfig & {
  paginated?: boolean;
  paginatedArrayName?: string;
  actionMessages?: actionMessages;
};

export type ActionConfig = {
  saveState?: boolean;
  contentHeader?: AxiosRequestHeaders;
  payloadIdName?: string;
  authorizationHeader?: string;
  showLoading?: boolean;
};

export type Message = {
  details: object | string;
  status: number | null;
};
