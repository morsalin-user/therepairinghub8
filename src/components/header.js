"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, User, LogOut, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n"
import LanguageSelector from "./language-selector"
import { ModeToggle } from "./mode-toggle"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    // Fetch unread notifications count
    if (user) {
      fetchUnreadCount()
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications?unread=true", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    { href: "/", label: t("navigation.home") },
    { href: "/jobs", label: t("navigation.jobs") },
    { href: "/services", label: t("navigation.services") },
    { href: "/docs", label: t("navigation.howItWorks") },
  ]

  return (
    <header className="bg-red-800 border-b border-navy-blue/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RH</span>
            </div>
            <span className="text-xl font-bold text-white">RepairingHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:flex items-center space-x-2 ml-4">
              <ModeToggle />
            </div>
            <LanguageSelector />

            {user ? (
              <>
                {/* Post Job Button */}
                <Link href="/post-job">
                  <Button className="bg-accent-green hover:bg-accent-green/90 text-white font-medium">
                    {t("navigation.postJob")}
                  </Button>
                </Link>

                {/* Notifications */}
                <Link href="/notifications" className="relative">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white hover:bg-white/10">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent-green text-white">
                          {user.firstName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {t("navigation.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        {t("navigation.notifications")}
                        {unreadCount > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          {t("navigation.admin")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("navigation.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    {t("navigation.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-accent-green hover:bg-accent-green/90 text-white">
                    {t("navigation.register")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0 text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/80 hover:text-white transition-colors duration-200 font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="text-white/80 hover:text-white transition-colors duration-200 font-medium px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("navigation.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="text-white/80 hover:text-white transition-colors duration-200 font-medium px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("navigation.register")}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
