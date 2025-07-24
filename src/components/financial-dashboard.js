"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, DollarSign, CreditCard, TrendingUp, ArrowDownToLine, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n"

export default function FinancialDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawPaypalEmail, setWithdrawPaypalEmail] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [financialData, setFinancialData] = useState({
    availableBalance: 0,
    totalEarnings: 0,
    totalSpending: 0,
    recentTransactions: [],
    spendingByCategory: [],
    earningsTrend: [],
  })

  useEffect(() => {
    fetchFinancialData()
    if (user?.paypalEmail) {
      setWithdrawPaypalEmail(user.paypalEmail)
    }
    const interval = setInterval(fetchFinancialData, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (user?.paypalEmail && !withdrawPaypalEmail) {
      setWithdrawPaypalEmail(user.paypalEmail)
    }
  }, [user?.paypalEmail, withdrawPaypalEmail])

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users/financial-dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setFinancialData(data.financialData)
      } else {
        toast({
          title: t("common.error"),
          description: data.message || t("financialDashboard.errorLoadingFinancialData"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("financialDashboard.errorLoadingFinancialData"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async () => {
    console.log('=== WITHDRAWAL FRONTEND DEBUG ===')
    console.log('withdrawAmount:', withdrawAmount)
    console.log('withdrawPaypalEmail:', withdrawPaypalEmail)
    
    if (!withdrawAmount || isNaN(withdrawAmount) || Number.parseFloat(withdrawAmount) <= 0) {
      toast({
        title: t("financialDashboard.invalidAmount"),
        description: t("financialDashboard.enterValidWithdrawalAmount"),
        variant: "destructive",
      })
      return
    }
    if (!withdrawPaypalEmail || !withdrawPaypalEmail.includes("@")) {
      toast({
        title: t("financialDashboard.payPalEmailRequired"),
        description: t("financialDashboard.enterValidPayPalEmailAddress"),
        variant: "destructive",
      })
      return
    }
    const amount = Number.parseFloat(withdrawAmount)
    if (amount > financialData.availableBalance) {
      toast({
        title: t("financialDashboard.insufficientFunds"),
        description: `${t("financialDashboard.notEnoughFunds")} $${financialData.availableBalance.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }
    setIsWithdrawing(true)
    try {
      // Update user's PayPal email if it's different
      if (withdrawPaypalEmail !== user?.paypalEmail) {
        await fetch(`/api/users/${user._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ paypalEmail: withdrawPaypalEmail }),
        })
      }

      // Process withdrawal - FIXED: Send paypalEmail instead of withdrawPaypalEmail
      const withdrawalData = {
        amount: amount,
        paypalEmail: withdrawPaypalEmail // This was the issue!
      }
      
      console.log('Sending withdrawal data:', withdrawalData)
      
      const response = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(withdrawalData)
      })
      
      const result = await response.json()
      console.log('Withdrawal response:', result)
      
      if (result.success) {
        toast({
          title: t("financialDashboard.withdrawalInitiated"),
          description: result.message || `${t("financialDashboard.amountSentToPayPal")} $${amount}.`,
        })
        setFinancialData((prev) => ({
          ...prev,
          availableBalance: result.newBalance || prev.availableBalance - amount,
        }))
        setWithdrawAmount("")
        fetchFinancialData()
      } else {
        toast({
          title: t("financialDashboard.withdrawalFailed"),
          description: result.message || t("financialDashboard.withdrawalProcessingProblem"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast({
        title: t("financialDashboard.withdrawalFailed"),
        description: t("financialDashboard.withdrawalProcessingProblem"),
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const isSeller = user?.userType === "Seller"
  const isBuyer = user?.userType === "Buyer"

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isSeller && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("financialDashboard.availableBalance")}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${financialData.availableBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{t("financialDashboard.availableForWithdrawal")}</p>
            </CardContent>
          </Card>
        )}
        {isSeller && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("financialDashboard.totalEarnings")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${financialData.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{t("financialDashboard.fromCompletedJobs")}</p>
            </CardContent>
          </Card>
        )}
        {isBuyer && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("financialDashboard.totalSpending")}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${financialData.totalSpending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{t("financialDashboard.onServices")}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSeller ? t("financialDashboard.netEarnings") : t("financialDashboard.totalAmountSpent")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSeller
                ? `$${(financialData.totalEarnings - financialData.totalSpending).toFixed(2)}`
                : `$${financialData.totalSpending.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSeller ? t("financialDashboard.earningsMinusExpenses") : t("financialDashboard.totalAmountSpent")}
            </p>
          </CardContent>
        </Card>
      </div>
      {isSeller && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t("financialDashboard.withdrawEarnings")}</CardTitle>
            <CardDescription>{t("financialDashboard.withdrawYourEarnings")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="withdrawAmount">{t("financialDashboard.withdrawalAmount")}</Label>
                  <Input
                    id="withdrawAmount"
                    placeholder={t("financialDashboard.enterAmountToWithdraw")}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={financialData.availableBalance}
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawPaypalEmail">{t("financialDashboard.payPalEmail")}</Label>
                  <Input
                    id="withdrawPaypalEmail"
                    type="email"
                    placeholder={t("financialDashboard.enterPayPalEmail")}
                    value={withdrawPaypalEmail}
                    onChange={(e) => setWithdrawPaypalEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || financialData.availableBalance <= 0}
                  className="w-full md:w-auto"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("financialDashboard.processing")}
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      {t("financialDashboard.withdraw")}
                    </>
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">{t("financialDashboard.availableBalance")}:</span> ${financialData.availableBalance.toFixed(2)}
                </p>
                {user?.paypalEmail && (
                  <p>
                    <span className="font-medium">{t("financialDashboard.savedPayPalEmail")}:</span> {user.paypalEmail}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">{t("financialDashboard.recentTransactions")}</TabsTrigger>
          <TabsTrigger value="analysis">
            {isSeller ? t("financialDashboard.earningsAnalysis") : t("financialDashboard.spendingAnalysis")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("financialDashboard.recentTransactions")}</CardTitle>
              <CardDescription>{t("financialDashboard.yourRecentPaymentActivity")}</CardDescription>
            </CardHeader>
            <CardContent>
              {financialData.recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("financialDashboard.noTransactionsFound")}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isBuyer
                      ? t("financialDashboard.startByHiring")
                      : t("financialDashboard.completeSomeJobs")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {financialData.recentTransactions.map((transaction, index) => (
                    <div key={transaction.id || index} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.jobTitle || transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {transaction.category && <span> • {transaction.category}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === "withdrawal"
                              ? "text-red-500"
                              : transaction.type === "job_payment" && isSeller
                                ? "text-green-500"
                                : transaction.type === "job_earning"
                                  ? "text-green-500"
                                  : "text-red-500"
                          }`}
                        >
                          {transaction.type === "withdrawal" || (transaction.type === "job_payment" && isBuyer)
                            ? "-"
                            : "+"}
                          ${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isSeller ? t("financialDashboard.earningsAnalysis") : t("financialDashboard.spendingAnalysis")}</CardTitle>
              <CardDescription>
                {isSeller
                  ? t("financialDashboard.yourEarningsBreakdown")
                  : t("financialDashboard.howYourSpendingIsDistributed")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(isSeller ? financialData.earningsTrend : financialData.spendingByCategory).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isSeller ? t("financialDashboard.noEarningsDataAvailable") : t("financialDashboard.noSpendingDataAvailable")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isSeller
                      ? t("financialDashboard.completeSomeJobsToSeeEarnings")
                      : t("financialDashboard.startHiringServices")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(isSeller ? financialData.earningsTrend : financialData.spendingByCategory).map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: getColorForIndex(index) }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{isSeller ? item.month : item.category}</span>
                          <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${((item.amount / getMaxAmount(isSeller ? financialData.earningsTrend : financialData.spendingByCategory)) * 100).toFixed(0)}%`,
                              backgroundColor: getColorForIndex(index),
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isSeller
                            ? index > 0 && financialData.earningsTrend[index - 1]
                              ? item.amount > financialData.earningsTrend[index - 1].amount
                                ? t("financialDashboard.increasedFromLastMonth")
                                : item.amount < financialData.earningsTrend[index - 1].amount
                                  ? t("financialDashboard.decreasedFromLastMonth")
                                  : t("financialDashboard.sameAsLastMonth")
                              : t("financialDashboard.firstMonth")
                            : `${((item.amount / getTotalAmount(financialData.spendingByCategory)) * 100).toFixed(1)}% ${t("financialDashboard.ofTotalSpending")}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getColorForIndex(index) {
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#4ECDC4"]
  return colors[index % colors.length]
}

function getTotalAmount(data) {
  return data.reduce((sum, item) => sum + item.amount, 0)
}

function getMaxAmount(data) {
  return Math.max(...data.map((item) => item.amount), 0.01)
}