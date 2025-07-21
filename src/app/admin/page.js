"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Users, Briefcase, CreditCard, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n"

export default function AdminDashboard() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    transactions: 0,
    revenue: 0,
  })

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      if (user && user.userType !== "Admin") {
        toast({
          title: t("adminDashboardPage.accessDenied"),
          description: t("adminDashboardPage.accessDeniedDescription"),
          variant: "destructive",
        })
        router.push("/")
        return
      }
      const fetchStats = async () => {
        try {
          const response = await fetch("/api/admin/stats")
          const data = await response.json()
          if (data.success) {
            setStats(data.stats)
          } else {
            toast({
              title: t("common.error"),
              description: t("adminDashboardPage.errorLoadingAdminStatistics"),
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error fetching admin stats:", error)
          toast({
            title: t("common.error"),
            description: t("adminDashboardPage.errorLoadingAdminStatistics"),
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchStats()
    }
  }, [user, isAuthenticated, authLoading, router, toast, t])

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t("adminDashboardPage.title")}</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("adminDashboardPage.totalUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">{t("adminDashboardPage.registeredUsers")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("adminDashboardPage.totalJobs")}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobs}</div>
            <p className="text-xs text-muted-foreground">{t("adminDashboardPage.postedJobs")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("adminDashboardPage.transactions")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions}</div>
            <p className="text-xs text-muted-foreground">{t("adminDashboardPage.completedTransactions")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("adminDashboardPage.revenue")}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("adminDashboardPage.platformFees")}</p>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">{t("adminDashboardPage.userManagement")}</TabsTrigger>
          <TabsTrigger value="jobs">{t("adminDashboardPage.jobManagement")}</TabsTrigger>
          <TabsTrigger value="transactions">{t("adminDashboardPage.transactionManagement")}</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t("adminDashboardPage.userManagement")}</CardTitle>
              <CardDescription>{t("adminDashboardPage.userManagementDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t("adminDashboardPage.userManagementInterface")}</p>
              <Button className="mt-4">{t("adminDashboardPage.viewAllUsers")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>{t("adminDashboardPage.jobManagement")}</CardTitle>
              <CardDescription>{t("adminDashboardPage.jobManagementDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t("adminDashboardPage.jobManagementInterface")}</p>
              <Button className="mt-4">{t("adminDashboardPage.viewAllJobs")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>{t("adminDashboardPage.transactionManagement")}</CardTitle>
              <CardDescription>{t("adminDashboardPage.transactionManagementDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t("adminDashboardPage.transactionManagementInterface")}</p>
              <Button className="mt-4">{t("adminDashboardPage.viewAllTransactions")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
