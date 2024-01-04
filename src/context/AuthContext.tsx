import * as React from "react";
import { SystemUser } from "../types";
import { COOKIE_TOKEN } from "../utils/constants";
import { deleteCookie, getCookie } from "../utils/cookies";
import { isStorageAvailable } from "../utils/storage";
import { FirebaseContext } from "../firebase";

export type ValuesOf<T> = { [P in keyof T]: T[P] };

type StatusOptions = ValuesOf<authStatus>;
enum authStatus {
  Error,
  Loading,
  Ready,
}

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthProviderValue = {
  status: StatusOptions | undefined;
  user: SystemUser | undefined;
  updateAuth: ({ user }: { user: SystemUser | undefined }) => void;
  cleanAuth: () => void;
  error?: any | undefined;
};

export const AuthContext = React.createContext<AuthProviderValue | undefined>(
  undefined
);

const useAuthContext = (): AuthProviderValue => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext debe ser usado dentro de un AuthProvider");
  }
  return context;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { firebase } = React.useContext(FirebaseContext);

  const destroyStorageAndCookies = (): void => {
    if (isStorageAvailable("sessionStorage")) {
      Object.keys(sessionStorage).forEach((key) => delete sessionStorage[key]);
    }
    if (isStorageAvailable("localStorage")) {
      Object.keys(localStorage).forEach((key) => delete localStorage[key]);
    }
    const token = getCookie(COOKIE_TOKEN);
    if (token) {
      deleteCookie(COOKIE_TOKEN);
    }
  };

  const cleanAuth = () => {
    destroyStorageAndCookies();
    setValue({
      ...value,
      status: authStatus.Ready,
      user: undefined,
      error: undefined,
    });
  };

  const [value, setValue] = React.useState<AuthProviderValue>({
    user: undefined,
    updateAuth: function ({ user }: { user: SystemUser | undefined }) {
      setValue({
        ...value,
        status: authStatus.Ready,
        user,
        error: undefined,
      });
    },
    cleanAuth,
    status: authStatus.Loading,
  });

  const initializeAuth = async () => {
    const accessToken = getCookie(COOKIE_TOKEN);
    if (accessToken) {
      try {
        const result = await firebase?.getOneDocument("users", [
          ["token", "==", accessToken],
        ]);

        if (result) {
          return {
            ...value,
            status: authStatus.Ready,
            user: result || undefined,
          };
        } else {
          destroyStorageAndCookies();
          return {
            ...value,
            status: authStatus.Ready,
          };
        }
      } catch (error) {
        destroyStorageAndCookies();
        return {
          ...value,
          status: authStatus.Ready,
        };
      }
    }
    return {
      ...value,
      status: authStatus.Ready,
    };
  };

  React.useEffect(() => {
    const init = async () => {
      const result = await initializeAuth();
      setValue(result);
    };
    init();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, authStatus, useAuthContext };
