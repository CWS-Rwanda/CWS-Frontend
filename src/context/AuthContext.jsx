import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('cws_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Demo users
    const users = [
      { id: 1, email: 'admin@cws.rw', password: 'admin123', role: 'admin', name: 'Admin User' },
      { id: 2, email: 'receptionist@cws.rw', password: 'rec123', role: 'receptionist', name: 'Reception Staff' },
      { id: 3, email: 'operator@cws.rw', password: 'op123', role: 'operator', name: 'Processing Operator' },
      { id: 4, email: 'sustainability@cws.rw', password: 'sus123', role: 'sustainability', name: 'Quality Manager' },
      { id: 5, email: 'finance@cws.rw', password: 'fin123', role: 'finance', name: 'Finance Officer' },
    ];

    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('cws_user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cws_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
