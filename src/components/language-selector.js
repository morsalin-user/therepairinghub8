"use client"
import { useState } from "react"
import { Globe, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useTranslation, LANGUAGES, SUPPORTED_LANGUAGES } from "@/lib/i18n"
import { useToast } from "@/hooks/use-toast"

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, t } = useTranslation()
  const { toast } = useToast()
  const [isChanging, setIsChanging] = useState(false)

  const handleLanguageChange = async (languageCode) => {
    if (isChanging) return
    setIsChanging(true)
    const success = await changeLanguage(languageCode)
    if (success) {
      toast({
        title: t("languages.languageChanged"),
        description: `${t("languageSelector.switchLanguage")}: ${LANGUAGES[languageCode]}`,
        duration: 2000,
      })
    }
    setIsChanging(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-white hover:bg-white/10 hover:text-white"
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("languageSelector.switchLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 mt-3">
        {Object.entries(LANGUAGES).map(([code, name]) => {
          const isSupported = SUPPORTED_LANGUAGES.includes(code)
          const isActive = currentLanguage === code
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isChanging || !isSupported}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{name}</span>
                {!isSupported && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    <Clock className="h-3 w-3 mr-1" />
                    {t("languageSelector.soon")}
                  </Badge>
                )}
              </div>
              {isActive && <Check className="h-4 w-4 text-accent-green" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
