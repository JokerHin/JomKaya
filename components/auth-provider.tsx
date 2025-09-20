"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  hasCompletedAssessment: boolean;
  assessmentData?: InvestorAssessment;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestorAssessment {
  userId?: string;
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

  investmentExperience: "none" | "1-3-years" | "3-5-years" | "5-plus-years";

  createdAt?: string;
  updatedAt?: string;
}

export interface DBUser {
  user_id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBInvestorProfile {
  profileId: string;
  user_id: string;
  investmentGoals: string[];
  riskTolerance: "Conservative" | "Moderate" | "Aggressive";
  investmentExperience: "Beginner" | "Intermediate" | "Advanced";
  timeHorizon: "1-2 years" | "3-5 years" | "5-10 years" | "10+ years";
  investmentAmount: string;
  incomeRange: string;
  geographicPreferences: string[];
  sustainabilityFocus:
    | "Very Important"
    | "Somewhat Important"
    | "Not Important";
  liquidityNeeds: "High" | "Medium" | "Low";
  taxConsiderations: "Very Important" | "Somewhat Important" | "Not Important";
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateAssessment: (assessment: InvestorAssessment) => Promise<void>;
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
    const storedUser = localStorage.getItem("jomkaya_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("jomkaya_user", JSON.stringify(data.user));
        setIsLoading(false);
        return true;
      } else {
        console.error("Login failed:", data.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const newUser: User = {
          ...data.user,
          hasCompletedAssessment: false,
        };
        setUser(newUser);
        localStorage.setItem("jomkaya_user", JSON.stringify(newUser));
        setIsLoading(false);
        return true;
      } else {
        console.error("Registration failed:", data.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jomkaya_user");
  };

  const updateAssessment = async (assessment: InvestorAssessment) => {
    if (user) {
      try {
        const response = await fetch("/api/assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            assessmentData: assessment,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const updatedUser = {
            ...user,
            hasCompletedAssessment: true,
            assessmentData: assessment,
          };
          setUser(updatedUser);
          localStorage.setItem("jomkaya_user", JSON.stringify(updatedUser));
        } else {
          console.error("Failed to save assessment:", data.message);
        }
      } catch (error) {
        console.error("Assessment save error:", error);
      }
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
