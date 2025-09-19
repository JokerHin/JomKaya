"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  hasCompletedAssessment: boolean;
  assessmentData?: InvestorAssessment;
}

export interface InvestorAssessment {
  age: number;
  yearsUntilRetirement: number;
  employmentStatus: string;
  monthlyIncome: number;
  monthlySavings: number;
  initialInvestmentAmount: number;

  riskAppetite: "low" | "medium" | "high" | "critical";
  investmentGoals: string[];
  investmentHorizon: "short" | "medium" | "long";
  liquidityNeeds: "high" | "medium" | "low";
  growthVsDividend: "growth" | "dividend" | "balanced";

  preferredProductTypes: string[];
  preferredSectors: string[];
  shariahCompliantOnly: boolean;

  // Experience
  investmentExperience: "none" | "1-3-years" | "3-5-years" | "5-plus-years";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateAssessment: (assessment: InvestorAssessment) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("jomkaya_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, this would hit your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        hasCompletedAssessment: false,
      };

      setUser(mockUser);
      localStorage.setItem("jomkaya_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: "1",
        email,
        name,
        hasCompletedAssessment: false,
      };

      setUser(mockUser);
      localStorage.setItem("jomkaya_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jomkaya_user");
  };

  const updateAssessment = (assessment: InvestorAssessment) => {
    if (user) {
      const updatedUser = {
        ...user,
        hasCompletedAssessment: true,
        assessmentData: assessment,
      };
      setUser(updatedUser);
      localStorage.setItem("jomkaya_user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateAssessment,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
