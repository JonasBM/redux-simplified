import {
  ActionConfig,
  ActionTypes,
  Config,
  PayloadIdType,
  actionMessages,
} from "./types";
import { AnyAction, Dispatch, Reducer } from "@reduxjs/toolkit";
import {
  ExistingNameError,
  PayloadHasNoAttributeError,
  StateNotAArrayError,
  StateNotPaginatedError,
  WorngPayloadIdTypeError,
} from "./erros";
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { finishFetching, startFetching } from "./staticSlices/fetchingSlice";
import { formatData, getActionTypes, getHeader, getURL } from "./utils";

import { GlobalConfig } from ".";
import { createMessage } from "./staticSlices/messageSlice";
import { returnError } from "./staticSlices/errorSlice";

const names: string[] = [];

export class CRUDAction<T extends object, S = T[]> {
  name: string;
  url: string;
  types: ActionTypes;
  initialState: S;

  config?: Config;

  private getSaveState = (_config?: ActionConfig): boolean => {
    const actionSaveState = _config?.saveState;
    if (typeof actionSaveState === "boolean") return actionSaveState;
    const CRUDSaveState = this.config?.saveState;
    if (typeof CRUDSaveState === "boolean") return CRUDSaveState;
    const GlobalSaveState = GlobalConfig.getConfig()?.saveState;
    if (typeof GlobalSaveState === "boolean") return GlobalSaveState;
    return true;
  };

  private getContentHeader = (_config?: ActionConfig): AxiosRequestHeaders => {
    const actionContentHeader = _config?.contentHeader;
    if (actionContentHeader) return actionContentHeader;
    const CRUDContentHeader = this.config?.contentHeader;
    if (CRUDContentHeader) return CRUDContentHeader;
    const GlobalContentHeader = GlobalConfig.getConfig()?.contentHeader;
    if (GlobalContentHeader) return GlobalContentHeader;
    return { "Content-Type": "application/json" };
  };

  private getPaginated = (): boolean => {
    const CRUDPaginated = this.config?.paginated;
    if (typeof CRUDPaginated === "boolean") return CRUDPaginated;
    const GlobalPaginated = GlobalConfig.getConfig()?.paginated;
    if (typeof GlobalPaginated === "boolean") return GlobalPaginated;
    return false;
  };

  private getPayloadIdName = (_config?: ActionConfig): keyof T => {
    const actionPayloadIdName = _config?.payloadIdName;
    if (actionPayloadIdName) return actionPayloadIdName as keyof T;
    const CRUDPayloadIdName = this.config?.payloadIdName;
    if (CRUDPayloadIdName) return CRUDPayloadIdName as keyof T;
    const GlobalPayloadIdName = GlobalConfig.getConfig()?.payloadIdName;
    if (GlobalPayloadIdName) return GlobalPayloadIdName as keyof T;
    return "id" as keyof T;
  };

  private getPayloadId = (object: Partial<T>): PayloadIdType => {
    const _payloadIdName = this.getPayloadIdName();
    if ((object as object).hasOwnProperty(_payloadIdName)) {
      return object[_payloadIdName] as unknown as PayloadIdType;
    }
    throw new PayloadHasNoAttributeError(_payloadIdName.toString());
  };

  private getPaginatedArrayName = (): keyof S => {
    const CRUDPaginatedArrayName = this.config?.paginatedArrayName;
    if (CRUDPaginatedArrayName) return CRUDPaginatedArrayName as keyof S;
    const GlobalPaginatedArrayName =
      GlobalConfig.getConfig()?.paginatedArrayName;
    if (GlobalPaginatedArrayName) return GlobalPaginatedArrayName as keyof S;
    return "results" as keyof S;
  };

  private getArray = (payload: S): T[] => {
    if (this.getPaginated()) {
      const _paginatedArrayName = this.getPaginatedArrayName();
      if ((payload as unknown as object).hasOwnProperty(_paginatedArrayName)) {
        return payload[_paginatedArrayName] as unknown as T[];
      }
      throw new StateNotPaginatedError(_paginatedArrayName.toString());
    } else {
      if (Array.isArray(payload)) {
        return payload as T[];
      }
      throw new StateNotAArrayError();
    }
  };

  private getToken = (_config?: ActionConfig): string | undefined => {
    const actionToken = _config?.authorizationHeaderContent;
    if (actionToken) return actionToken;
    const CRUDToken = this.config?.authorizationHeaderContent;
    if (CRUDToken) return CRUDToken;
    const GlobalToken = GlobalConfig.getConfig()?.authorizationHeaderContent;
    if (GlobalToken) return GlobalToken;
    return undefined;
  };

  private getShowLoading = (_config?: ActionConfig): boolean => {
    const actionShowLoading = _config?.showLoading;
    if (typeof actionShowLoading === "boolean") return actionShowLoading;
    const CRUDShowLoading = this.config?.showLoading;
    if (typeof CRUDShowLoading === "boolean") return CRUDShowLoading;
    const GlobalShowLoading = GlobalConfig.getConfig()?.showLoading;
    if (typeof GlobalShowLoading === "boolean") return GlobalShowLoading;
    return true;
  };

  private getActionMesseges = (): actionMessages => {
    const _default: actionMessages = {
      reset: "Objects reseted",
      list: "Objects retrieved",
      create: "Object created",
      retrieve: "Object retrieved",
      update: "Object updated",
      destroy: "Object destroyed",
    };
    const CRUDActionMessages = this.config?.actionMessages;
    const GlobalActionMessages = GlobalConfig.getConfig()?.actionMessages;
    return { ..._default, ...GlobalActionMessages, ...CRUDActionMessages };
  };

  constructor(
    _name: string,
    _url: string,
    _config?: Config,
    _initialState?: S
  ) {
    if (names.includes(_name)) {
      throw new ExistingNameError(_name);
    } else {
      names.push(_name);
      this.name = _name;
      this.url = _url;
    }
    this.config = _config;
    this.types = getActionTypes(_name);

    if (_initialState) {
      this.initialState = _initialState;
    } else {
      if (this.getPaginated()) {
        this.initialState = {
          [this.getPaginatedArrayName()]: [],
        } as unknown as S;
      } else {
        this.initialState = [] as unknown as S;
      }
    }
  }

  // RESET
  reset = () => {
    return (dispatch: Dispatch): void => {
      dispatch({ type: this.types.RESET, payload: this.initialState });
      dispatch(createMessage({ CRUDReset: this.getActionMesseges().reset }));
    };
  };

  // LIST
  list = (object: object | undefined = undefined, _config?: ActionConfig) => {
    return (dispatch: Dispatch): Promise<S> => {
      const _showLoading = this.getShowLoading(_config);
      const _contentHeader = this.getContentHeader(_config);
      const config: AxiosRequestConfig = {
        headers: getHeader(_contentHeader, this.getToken(_config)),
        params: formatData(object, _contentHeader),
      };
      if (_showLoading) dispatch(startFetching());
      return axios
        .get<S>(getURL(this.url), config)
        .then((res) => {
          if (this.getSaveState(_config)) {
            dispatch({ type: this.types.LIST, payload: res.data });
          }
          dispatch(createMessage({ CRUDList: this.getActionMesseges().list }));
          if (_showLoading) dispatch(finishFetching());
          return res.data;
        })
        .catch((error) => {
          dispatch(returnError(error));
          if (_showLoading) dispatch(finishFetching());
          throw error;
        });
    };
  };

  // CREATE
  create = (object: Partial<T>, _config?: ActionConfig) => {
    return (dispatch: Dispatch): Promise<T> => {
      const _showLoading = this.getShowLoading(_config);
      const _contentHeader = this.getContentHeader(_config);
      const config: AxiosRequestConfig = {
        headers: getHeader(_contentHeader, this.getToken(_config)),
      };
      if (_showLoading) dispatch(startFetching());
      return axios
        .post<T>(getURL(this.url), formatData(object, _contentHeader), config)
        .then((res) => {
          if (this.getSaveState(_config)) {
            dispatch({ type: this.types.CREATE, payload: res.data });
          }
          dispatch(
            createMessage({ CRUDCreate: this.getActionMesseges().create })
          );
          if (_showLoading) dispatch(finishFetching());
          return res.data;
        })
        .catch((error) => {
          dispatch(returnError(error));
          if (_showLoading) dispatch(finishFetching());
          throw error;
        });
    };
  };

  // RETRIEVE
  retrieve = (id: PayloadIdType, _config?: ActionConfig) => {
    return (dispatch: Dispatch): Promise<T> => {
      const _showLoading = this.getShowLoading(_config);
      const config: AxiosRequestConfig = {
        headers: getHeader(
          this.getContentHeader(_config),
          this.getToken(_config)
        ),
      };
      if (_showLoading) dispatch(startFetching());
      return axios
        .get<T>(getURL(this.url, id), config)
        .then((res) => {
          if (this.getSaveState(_config)) {
            dispatch({ type: this.types.RETRIEVE, payload: res.data });
          }
          dispatch(
            createMessage({ CRUDRetrieve: this.getActionMesseges().retrieve })
          );
          if (_showLoading) dispatch(finishFetching());
          return res.data;
        })
        .catch((error) => {
          if (_showLoading) dispatch(finishFetching());
          dispatch(returnError(error));
          throw error;
        });
    };
  };

  // UPDATE
  update = (object: Partial<T>, _config?: ActionConfig) => {
    return (dispatch: Dispatch): Promise<T> => {
      const _showLoading = this.getShowLoading(_config);
      const _contentHeader = this.getContentHeader(_config);
      const config: AxiosRequestConfig = {
        headers: getHeader(_contentHeader, this.getToken(_config)),
      };
      if (_showLoading) dispatch(startFetching());
      return axios
        .put<T>(
          getURL(this.url, this.getPayloadId(object)),
          formatData(object, _contentHeader),
          config
        )
        .then((res) => {
          if (this.getSaveState(_config)) {
            dispatch({ type: this.types.UPDATE, payload: res.data });
          }
          dispatch(
            createMessage({ CRUDUpdate: this.getActionMesseges().update })
          );
          if (_showLoading) dispatch(finishFetching());
          return res.data;
        })
        .catch((error) => {
          dispatch(returnError(error));
          if (_showLoading) dispatch(finishFetching());
          throw error;
        });
    };
  };

  // PARTIAL UPDATE
  partialUpdate = (object: Partial<T>, _config?: ActionConfig) => {
    return (dispatch: Dispatch): Promise<T> => {
      const _showLoading = this.getShowLoading(_config);
      const _contentHeader = this.getContentHeader(_config);
      const config: AxiosRequestConfig = {
        headers: getHeader(_contentHeader, this.getToken(_config)),
      };
      if (_showLoading) dispatch(startFetching());
      return axios
        .patch<T>(
          getURL(this.url, this.getPayloadId(object)),
          formatData(object, _contentHeader),
          config
        )
        .then((res) => {
          if (this.getSaveState(_config)) {
            dispatch({ type: this.types.UPDATE, payload: res.data });
          }
          dispatch(
            createMessage({ CRUDUpdate: this.getActionMesseges().update })
          );
          if (_showLoading) dispatch(finishFetching());
          return res.data as T;
        })
        .catch((error) => {
          dispatch(returnError(error));
          if (_showLoading) dispatch(finishFetching());
          throw error;
        });
    };
  };

  // DETROY
  destroy = (id: PayloadIdType, _config?: ActionConfig) => {
    return (dispatch: Dispatch): Promise<any> => {
      const _showLoading = this.getShowLoading(_config);
      const config: AxiosRequestConfig = {
        headers: getHeader(
          this.getContentHeader(_config),
          this.getToken(_config)
        ),
      };
      if (_showLoading) dispatch(startFetching());
      return axios
        .delete(getURL(this.url, id), config)
        .then((res) => {
          if (this.getSaveState(_config)) {
            dispatch({ type: this.types.DESTROY, payload: id });
          }
          dispatch(
            createMessage({ CRUDUpdate: this.getActionMesseges().destroy })
          );
          if (_showLoading) dispatch(finishFetching());
          return res.data;
        })
        .catch((error) => {
          dispatch(returnError(error));
          if (_showLoading) dispatch(finishFetching());
          throw error;
        });
    };
  };

  private addInstanceToArray = (oldArray: T[], payloadInstance: T): T[] => {
    if (oldArray && payloadInstance) {
      const _payloadId = this.getPayloadId(payloadInstance);
      if (oldArray.find((o) => this.getPayloadId(o) === _payloadId)) {
        return [
          ...oldArray.map((o) =>
            this.getPayloadId(o) === _payloadId ? payloadInstance : o
          ),
        ];
      } else {
        return [...oldArray.concat(payloadInstance)];
      }
    }
    return oldArray;
  };

  private addInstanceToState = (oldState: S, payloadInstance: T): S => {
    const _paginatedArrayName = this.getPaginatedArrayName();
    const _oldStateArray = this.getArray(oldState);
    const _newArray = this.addInstanceToArray(_oldStateArray, payloadInstance);
    if (oldState && payloadInstance) {
      if (this.getPaginated()) {
        return {
          ...oldState,
          [_paginatedArrayName]: _newArray,
        } as S;
      } else {
        return _newArray as unknown as S;
      }
    }
    return oldState;
  };

  private removeInstanceFromState = (
    oldState: S,
    payloadId: PayloadIdType
  ): S => {
    if (typeof payloadId === "number") {
      const _newArray = [
        ...this.getArray(oldState).filter(
          (o) => this.getPayloadId(o) !== payloadId
        ),
      ];
      if (this.getPaginated()) {
        return {
          ...oldState,
          [this.getPaginatedArrayName()]: _newArray,
        } as S;
      } else {
        return _newArray as unknown as S;
      }
    }
    throw new WorngPayloadIdTypeError();
  };

  private getNewState = (newState: S): S => {
    const _paginatedArrayName = this.getPaginatedArrayName();
    if (this.getPaginated()) {
      if ((newState as unknown as object).hasOwnProperty(_paginatedArrayName)) {
        return { ...newState } as S;
      }
      throw new StateNotPaginatedError(_paginatedArrayName.toString());
    } else {
      if (Array.isArray(newState)) {
        return [...newState] as unknown as S;
      }
      throw new StateNotAArrayError();
    }
  };

  reducer: Reducer<S, AnyAction> = (state = this.initialState, action) => {
    switch (action.type) {
      case this.types.RESET:
        return this.getNewState(action.payload);
      case this.types.LIST:
        return this.getNewState(action.payload);
      case this.types.CREATE:
        return this.addInstanceToState(state, action.payload);
      case this.types.RETRIEVE:
        return this.addInstanceToState(state, action.payload);
      case this.types.UPDATE:
        return this.addInstanceToState(state, action.payload);
      case this.types.DESTROY:
        return this.removeInstanceFromState(state, action.payload);
      default:
        return state as S;
    }
  };
}
