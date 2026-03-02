// import api from "../api/axios";
// import { createContext, useContext, useState, useMemo } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   // ✅ derive from state, NOT localStorage
//   const isAuthenticated = !!user;

//   const login = async (loginValue, password) => {
//     try {
//       const res = await api.post("/auth/admin-login", {
//         username: loginValue,
//         password,
//       });

//       if (res.data.success) {
//         localStorage.setItem("token", res.data.token);
//         localStorage.setItem("user", JSON.stringify(res.data.user));
//         setUser(res.data.user);
//         return true;
//       }

//       return false;
//     } catch (err) {
//       throw err;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//   };

//   // 🔥 VERY IMPORTANT: Memoize context value
//   const value = useMemo(() => {
//     return { user, login, logout, isAuthenticated };
//   }, [user]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth once
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/admin-login", {
      username,
      password,
    });

    if (res.data.success) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading,
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
