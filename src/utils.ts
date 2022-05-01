import { ActionTypes } from "./types";
import { AxiosRequestHeaders } from "axios";

export const formatData = (objeto: any, header: AxiosRequestHeaders) => {
  if (objeto && header) {
    if (header["Content-Type"] === "multipart/form-data") {
      return Object.keys(objeto).reduce((formData, key) => {
        formData.append(key, objeto[key]);
        return formData;
      }, new FormData());
    }
  }
  return objeto;
};

export const getHeader = (
  header: AxiosRequestHeaders = { "Content-Type": "application/json" },
  token?: string
): AxiosRequestHeaders => {
  if (token) {
    header["Authorization"] = token;
  }
  return header;
};

export const getActionTypes = (name: string): ActionTypes => {
  return {
    LIST: "LIST_" + name.toUpperCase(),
    CREATE: "CREATE_" + name.toUpperCase(),
    RETRIEVE: "RETRIEVE_" + name.toUpperCase(),
    UPDATE: "UPDATE_" + name.toUpperCase(),
    DESTROY: "DESTROY_" + name.toUpperCase(),
    RESET: "RESET_" + name.toUpperCase(),
  };
};

export const getURL = (base: string, id?: string | number): string => {
  if (id) {
    const trailingSlash = base.endsWith("/") ? "" : "/";
    return `${base}${trailingSlash}${id.toString()}/`;
  }
  return base;
};
