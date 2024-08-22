import { IUser } from "@/models";
import { authenticate } from "@/service";
import { useRouter } from "next/router";
import { createContext, FC, ReactNode, useEffect, useState } from "react";

export interface IAuthContext {
  user: IUser | null;
  setUser : any
}

export const AuthContext = createContext<IAuthContext>({
  user: null,
  setUser : null
});

export const AuthProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const allowedPath = ["/login", "/signup"];
  const router = useRouter();

  useEffect(() => {
    const getCurrentUser = async () => {
      const response = await authenticate();

      if (response == false && !(allowedPath.includes(router.pathname ))) {
        router.replace("/login");
        return;
      }

      setUser(response as IUser);
    };

    !user && getCurrentUser();
  }, [router.pathname]);

  const render = () => {
    if (user && allowedPath.includes(router.pathname)) {
      router.replace("/");
    } else if (user || allowedPath.includes(router.pathname)) {
      return children;
    } else {
      return <>Loading...</>;
    }
  };

  return (
    <AuthContext.Provider value={{ user,setUser }}>{render()}</AuthContext.Provider>
  );
};
