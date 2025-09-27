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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
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
    <header className="bg-[#1E3A8A] border-b border-white/10 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Enhanced with hover effect */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-xl">RH</span>
            </div>
            <span className="text-2xl font-bold text-white group-hover:text-[#38BDF8] transition-colors duration-200">
              RepairingHub
            </span>
          </Link>

          {/* Desktop Navigation - Centered, button-style with enhanced hover effects */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-white/80 hover:bg-[#10B981] hover:text-white hover:scale-105 rounded-md transition-all duration-200 font-medium hover:shadow-md"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {user ? (
              <>
                {/* Post Job Button - Enhanced with pulse effect */}
                <Link href="/post-job">
                  <Button className="bg-[#10B981] hover:bg-[#0d9468] hover:shadow-lg hover:scale-105 transition-all duration-200 text-white font-medium animate-pulse-subtle">
                    {t("navigation.postJob")}
                  </Button>
                </Link>

                {/* Notifications with enhanced hover */}
                <Link href="/notifications" className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-white hover:bg-[#10B981] hover:scale-110 transition-all duration-200"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#F59E42] border-0 animate-bounce">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu with enhanced hover */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0 hover:scale-110 transition-transform duration-200"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[#10B981] text-white">
                          {user.firstName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-[#22304A]">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="w-[200px] truncate text-sm text-[#22304A]/60">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer hover:bg-[#10B981]/10">
                        <User className="mr-2 h-4 w-4" />
                        {t("navigation.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer hover:bg-[#10B981]/10">
                        <Bell className="mr-2 h-4 w-4" />
                        {t("navigation.notifications")}
                        {unreadCount > 0 && (
                          <Badge variant="secondary" className="ml-auto bg-[#F59E42] text-white">
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer hover:bg-[#10B981]/10">
                          <Settings className="mr-2 h-4 w-4" />
                          {t("navigation.admin")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("navigation.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:text-[#38BDF8] hover:scale-105 transition-all duration-200"
                  >
                    {t("navigation.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#10B981] hover:bg-[#0d9468] hover:shadow-lg hover:scale-105 transition-all duration-200 text-white">
                    {t("navigation.register")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button with enhanced hover */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0 text-white hover:bg-[#10B981] hover:scale-110 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation with enhanced styling */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-white/80 hover:bg-[#10B981] hover:text-white hover:scale-105 rounded-md transition-all duration-200 font-medium hover:shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-white/80 hover:bg-[#10B981] hover:text-white hover:scale-105 rounded-md transition-all duration-200 font-medium hover:shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("navigation.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-white/80 hover:bg-[#10B981] hover:text-white hover:scale-105 rounded-md transition-all duration-200 font-medium hover:shadow-md"
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
