"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { userAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"

export default function DeleteAccountModal({ isOpen, setIsOpen }) {
  const { t } = useTranslation()
  const { user, setUser, logout } = useAuth()
  const [emailConfirmation, setEmailConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeleteAccount = async () => {
    if (emailConfirmation !== user.email) {
      toast({
        title: t("deleteAccountModal.emailMismatch"),
        description: t("deleteAccountModal.emailMismatchDescription"),
        variant: "destructive",
      })
      return
    }
    setIsDeleting(true)
    try {
      const success = await userAPI.deleteAccount(user._id)
      if (success) {
        setIsOpen(false)
        toast({
          title: t("deleteAccountModal.accountDeleted"),
          description: t("deleteAccountModal.accountDeletedDescription"),
        })
      }
    } catch (error) {
      console.error("Delete account error:", error)
      toast({
        title: t("deleteAccountModal.deletionFailed"),
        description: t("deleteAccountModal.deletionFailedDescription"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteAccountModal.areYouSure")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteAccountModal.confirmationDescription")}
            <br />
            <br />
            {t("deleteAccountModal.enterEmailToConfirm")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          type="email"
          placeholder={t("deleteAccountModal.emailPlaceholder")}
          value={emailConfirmation}
          onChange={(e) => setEmailConfirmation(e.target.value)}
          disabled={isDeleting}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("deleteAccountModal.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={handleDeleteAccount}>
            {isDeleting ? t("deleteAccountModal.deleting") : t("deleteAccountModal.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
