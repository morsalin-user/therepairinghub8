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

export default function DeleteAccountModal({ isOpen, setIsOpen }) {
  const { user, setUser, logout } = useAuth()
  const [emailConfirmation, setEmailConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeleteAccount = async () => {
    if (emailConfirmation !== user.email) {
      toast({
        title: "Email mismatch",
        description: "Please enter your email address correctly to confirm deletion.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
        const success = await userAPI.deleteAccount(user._id)
      if (success) {
        // Close modal immediately
        setIsOpen(false)

        // Show success message
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted. Redirecting to login...",
        })

        // The auth context will handle the redirect
      }
    } catch (error) {
      console.error("Delete account error:", error)
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting your account. Please try again.",
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
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
            <br />
            <br />
            Please enter your email address to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          type="email"
          placeholder="Email Address"
          value={emailConfirmation}
          onChange={(e) => setEmailConfirmation(e.target.value)}
          disabled={isDeleting}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={handleDeleteAccount}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
