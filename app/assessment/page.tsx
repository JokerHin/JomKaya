"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/layout";
import { useAuth, InvestorAssessment } from "@/components/auth-provider";

export default function AssessmentPage() {
  const { user, updateAssessment } = useAuth();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<InvestorAssessment>>({
    shariahCompliantOnly: true,
    preferredSectors: [],
    investmentGoals: [],
    preferredProductTypes: [],
  });

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (formData as InvestorAssessment) {
      try {
        await updateAssessment(formData as InvestorAssessment);
        router.push("/chat");
      } catch (error) {
        console.error("Failed to save assessment:", error);
        // You could add error handling UI here
      }
    }
  };

  const updateFormData = (
    field: keyof InvestorAssessment,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (
    field: "investmentGoals" | "preferredSectors" | "preferredProductTypes",
    item: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.includes(item)
        ? prev[field]?.filter((i) => i !== item)
        : [...(prev[field] || []), item],
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Help us understand your current situation and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Your age"
                    value={formData.age || ""}
                    onChange={(e) =>
                      updateFormData("age", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirement">Years Until Retirement</Label>
                  <Input
                    id="retirement"
                    type="number"
                    placeholder="Years until retirement"
                    value={formData.yearsUntilRetirement || ""}
                    onChange={(e) =>
                      updateFormData(
                        "yearsUntilRetirement",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment">Employment Status</Label>
                <RadioGroup
                  value={formData.employmentStatus || ""}
                  onValueChange={(value: string) =>
                    updateFormData("employmentStatus", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employed" id="employed" />
                    <Label htmlFor="employed">Employed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self-employed" id="self-employed" />
                    <Label htmlFor="self-employed">Self-employed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retired" id="retired" />
                    <Label htmlFor="retired">Retired</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Financial Profile</CardTitle>
              <CardDescription>
                Tell us about your income and savings capacity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-income">Monthly Income (RM)</Label>
                  <Input
                    id="monthly-income"
                    type="number"
                    placeholder="Your monthly income"
                    value={formData.monthlyIncome || ""}
                    onChange={(e) =>
                      updateFormData(
                        "monthlyIncome",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly-savings">
                    Monthly Savings Capacity (RM)
                  </Label>
                  <Input
                    id="monthly-savings"
                    type="number"
                    placeholder="How much you can save monthly"
                    value={formData.monthlySavings || ""}
                    onChange={(e) =>
                      updateFormData(
                        "monthlySavings",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-amount">
                  Initial Investment Amount (RM)
                </Label>
                <Input
                  id="initial-amount"
                  type="number"
                  placeholder="Amount you can invest now"
                  value={formData.initialInvestmentAmount || ""}
                  onChange={(e) =>
                    updateFormData(
                      "initialInvestmentAmount",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Risk Appetite</CardTitle>
              <CardDescription>
                How comfortable are you with investment risk?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.riskAppetite || ""}
                onValueChange={(value: string) =>
                  updateFormData("riskAppetite", value)
                }
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="font-medium">
                      Low Risk
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    I prefer stable, low-risk investments with predictable
                    returns (e.g., Fixed Deposits, Sukuk)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="font-medium">
                      Medium Risk
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    I&apos;m willing to accept moderate risk for potentially
                    higher returns (e.g., Balanced Unit Trusts)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="font-medium">
                      High Risk
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    I&apos;m comfortable with high risk for potentially high
                    returns (e.g., Equity Funds, Individual Stocks)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical" className="font-medium">
                      Very High Risk
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    I&apos;m willing to take significant risks for maximum
                    growth potential (e.g., Small Cap Funds, Commodities)
                  </p>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Investment Goals & Timeline</CardTitle>
              <CardDescription>
                What are you hoping to achieve? (Select all that apply)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  "Retirement planning",
                  "Wealth growth",
                  "Regular income generation",
                  "Children&apos;s education fund",
                  "Emergency fund building",
                  "House down payment",
                  "Wealth preservation",
                  "Hajj fund",
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={
                        formData.investmentGoals?.includes(goal) || false
                      }
                      onCheckedChange={() =>
                        toggleArrayItem("investmentGoals", goal)
                      }
                    />
                    <Label htmlFor={goal}>{goal}</Label>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label>Investment Timeline</Label>
                <RadioGroup
                  value={formData.investmentHorizon || ""}
                  onValueChange={(value: string) =>
                    updateFormData("investmentHorizon", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="short" />
                    <Label htmlFor="short">Short-term (1-3 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium-term" />
                    <Label htmlFor="medium-term">Medium-term (3-7 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="long" />
                    <Label htmlFor="long">Long-term (7+ years)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Liquidity & Return Preferences</CardTitle>
              <CardDescription>
                How accessible should your investments be?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Liquidity Needs</Label>
                <RadioGroup
                  value={formData.liquidityNeeds || ""}
                  onValueChange={(value: string) =>
                    updateFormData("liquidityNeeds", value)
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high-liquidity" />
                      <Label htmlFor="high-liquidity" className="font-medium">
                        High Liquidity
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      I need quick access to my funds (within days)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium-liquidity" />
                      <Label htmlFor="medium-liquidity" className="font-medium">
                        Medium Liquidity
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      I can wait a few weeks to access my funds
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low-liquidity" />
                      <Label htmlFor="low-liquidity" className="font-medium">
                        Low Liquidity
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      I can lock my funds for extended periods for better
                      returns
                    </p>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label>Growth vs Dividend Preference</Label>
                <RadioGroup
                  value={formData.growthVsDividend || ""}
                  onValueChange={(value: string) =>
                    updateFormData("growthVsDividend", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="growth" id="growth" />
                    <Label htmlFor="growth">
                      Growth Focus - Capital appreciation over time
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dividend" id="dividend" />
                    <Label htmlFor="dividend">
                      Income Focus - Regular dividend/profit distribution
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced">
                      Balanced - Mix of growth and income
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Product Preferences</CardTitle>
              <CardDescription>
                What types of investment products interest you? (Select all that
                apply)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Unit Trust Funds",
                "Exchange Traded Funds (ETFs)",
                "Real Estate Investment Trusts (REITs)",
                "Sukuk (Islamic Bonds)",
                "Fixed Deposit-i",
                "Individual Stocks/Shares",
                "Gold Investment",
                "Commodity Funds",
                "Islamic Banking Products",
                "Structured Products",
              ].map((product) => (
                <div key={product} className="flex items-center space-x-2">
                  <Checkbox
                    id={product}
                    checked={
                      formData.preferredProductTypes?.includes(product) || false
                    }
                    onCheckedChange={() =>
                      toggleArrayItem("preferredProductTypes", product)
                    }
                  />
                  <Label htmlFor={product}>{product}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Sector Preferences</CardTitle>
              <CardDescription>
                Which sectors interest you? (Select all that apply)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Technology",
                "Healthcare & Pharmaceuticals",
                "Finance (Shariah-compliant)",
                "Real Estate",
                "Consumer Goods & Services",
                "Industrial & Manufacturing",
                "Telecommunications",
                "Utilities & Infrastructure",
                "Commodities & Natural Resources",
                "Islamic Banking & Finance",
                "Transportation & Logistics",
                "Plantation & Agriculture",
              ].map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={sector}
                    checked={
                      formData.preferredSectors?.includes(sector) || false
                    }
                    onCheckedChange={() =>
                      toggleArrayItem("preferredSectors", sector)
                    }
                  />
                  <Label htmlFor={sector}>{sector}</Label>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shariahOnly"
                    checked={formData.shariahCompliantOnly || false}
                    onCheckedChange={(checked: boolean) =>
                      updateFormData("shariahCompliantOnly", checked)
                    }
                  />
                  <Label htmlFor="shariahOnly" className="font-medium">
                    Only recommend Shariah-compliant investments
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
            <CardHeader>
              <CardTitle>Investment Experience</CardTitle>
              <CardDescription>
                Tell us about your investment background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>What is your level of investment experience?</Label>
                <RadioGroup
                  value={formData.investmentExperience || ""}
                  onValueChange={(value: string) =>
                    updateFormData("investmentExperience", value)
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none" className="font-medium">
                        No Experience (0 years)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      I&apos;m new to investing and need guidance
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3-years" id="1-3-years" />
                      <Label htmlFor="1-3-years" className="font-medium">
                        Some Experience (1-3 years)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      I have basic knowledge and some investment experience
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3-5-years" id="3-5-years" />
                      <Label htmlFor="3-5-years" className="font-medium">
                        Moderate Experience (3-5 years)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      I understand investment concepts and have a diversified
                      portfolio
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5-plus-years" id="5-plus-years" />
                      <Label htmlFor="5-plus-years" className="font-medium">
                        Extensive Experience (5+ years)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      I&apos;m experienced with various investment types and
                      market cycles
                    </p>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.age &&
          formData.yearsUntilRetirement &&
          formData.employmentStatus
        );
      case 2:
        return (
          formData.monthlyIncome &&
          formData.monthlySavings &&
          formData.initialInvestmentAmount
        );
      case 3:
        return formData.riskAppetite;
      case 4:
        return (
          formData.investmentGoals &&
          formData.investmentGoals.length > 0 &&
          formData.investmentHorizon
        );
      case 5:
        return formData.liquidityNeeds && formData.growthVsDividend;
      case 6:
        return (
          formData.preferredProductTypes &&
          formData.preferredProductTypes.length > 0
        );
      case 7:
        return (
          formData.preferredSectors && formData.preferredSectors.length > 0
        );
      case 8:
        return formData.investmentExperience;
      default:
        return false;
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
    setCheckingAuth(false);
  }, [user, router]);

  if (checkingAuth) {
    return null;
  }

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20" />
        <div className="container relative max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-2xl shadow-amber-500/25">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-20"></div>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Investor{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Suitability Assessment
                </span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Help us understand your investment profile to provide
                personalized recommendations
              </p>
              <div className="mt-6">
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i + 1 <= currentStep
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>

            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="border-amber-200 hover:bg-amber-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Assessment
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
