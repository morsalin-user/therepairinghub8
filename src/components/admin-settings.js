"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"

export default function AdminSettings() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    escrowPeriodMinutes: 1,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      } else {
        console.error("Failed to fetch settings:", data.message)
        toast({
          title: t("common.error"),
          description: t("adminSettingsPage.errorLoadingSettings"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: t("common.error"),
        description: t("adminSettingsPage.errorLoadingSettings"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: t("adminSettingsPage.settingsSaved"),
          description: t("adminSettingsPage.settingsSavedDescription"),
        })
        setSettings(data.settings)
      } else {
        toast({
          title: t("common.error"),
          description: data.message || t("adminSettingsPage.errorSavingSettings"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: t("common.error"),
        description: t("adminSettingsPage.errorSavingSettings"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("adminSettingsPage.platformSettings")}</CardTitle>
        <CardDescription>{t("adminSettingsPage.configureGlobalPlatformSettings")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="escrowPeriodMinutes">{t("adminSettingsPage.escrowPeriodMinutes")}</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="escrowPeriodMinutes"
              name="escrowPeriodMinutes"
              type="number"
              min="1"
              value={settings.escrowPeriodMinutes}
              onChange={handleInputChange}
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {settings.escrowPeriodMinutes === "1" ? "minute" : "minutes"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("adminSettingsPage.escrowPeriodDescription")}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("adminSettingsPage.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("adminSettingsPage.saveSettings")}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
