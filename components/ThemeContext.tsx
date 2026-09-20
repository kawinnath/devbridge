"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type Role = "CLIENT" | "DEVELOPER" | "ADMIN";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  trustScore: number;
  verificationBadge: boolean;
  subscription: string;
  hasUsedIntroOffer?: boolean;
  profileCompleted?: boolean;
}

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  role: Role;
  setRole: (role: Role) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
}

const defaultContext: AppContextType = {
  theme: "dark",
  toggleTheme: () => {},
  role: "DEVELOPER",
  setRole: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [role, setRoleState] = useState<Role>("DEVELOPER");
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [user, setUserState] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme") as Theme;
      if (storedTheme) {
        setTheme(storedTheme);
      } else if (typeof window !== "undefined" && window.matchMedia) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch (_) {}

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUserState(data.user);
            setRoleState(data.user.role);
            setIsLoggedInState(true);
            try {
              localStorage.setItem("user", JSON.stringify(data.user));
              localStorage.setItem("role", data.user.role);
              localStorage.setItem("isLoggedIn", "true");
            } catch (_) {}
            return;
          }
        }
        
        // Unauthenticated or 401 session -> Normal public visitor state
        setUserState(null);
        setIsLoggedInState(false);
        try {
          localStorage.removeItem("user");
          localStorage.setItem("isLoggedIn", "false");
        } catch (_) {}
      } catch (err) {
        // Network offline / delay fallback to cached session
        try {
          const storedUser = localStorage.getItem("user");
          const storedLogin = localStorage.getItem("isLoggedIn") === "true";
          const storedRole = localStorage.getItem("role") as Role;

          if (storedUser && storedLogin) {
            setUserState(JSON.parse(storedUser));
            if (storedRole) setRoleState(storedRole);
            setIsLoggedInState(true);
          } else {
            setUserState(null);
            setIsLoggedInState(false);
          }
        } catch (_) {
          setUserState(null);
          setIsLoggedInState(false);
        }
      }
    }

    checkSession();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    const root = document.documentElement;
    try {
      if (theme === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
        localStorage.setItem("theme", "light");
      } else {
        root.classList.add("dark");
        root.classList.remove("light");
        localStorage.setItem("theme", "dark");
      }
    } catch (_) {}
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setUser = (newUser: UserSession | null) => {
    setUserState(newUser);
    if (newUser) {
      setRoleState(newUser.role);
      setIsLoggedInState(true);
      try {
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("role", newUser.role);
        localStorage.setItem("isLoggedIn", "true");
      } catch (_) {}
    } else {
      setIsLoggedInState(false);
      try {
        localStorage.removeItem("user");
        localStorage.setItem("isLoggedIn", "false");
      } catch (_) {}
    }
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("role", newRole);
    } catch (_) {}
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUserState(updatedUser);
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (_) {}
    }
  };

  const setIsLoggedIn = (val: boolean) => {
    setIsLoggedInState(val);
    try {
      localStorage.setItem("isLoggedIn", String(val));
    } catch (_) {}
    if (!val) {
      setUser(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        role,
        setRole,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
      }}
    >
      <div className="min-h-screen flex flex-col bg-transparent">
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(AppContext);
  return context || defaultContext;
}
