"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Star, Calendar, Mail, Phone, Edit } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { userAPI, reviewAPI } from "@/lib/api"
import { useTranslation } from "@/lib/i18n"

export default function UserProfile({ params }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [existingReview, setExistingReview] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchUserProfile()
    fetchUserReviews()
  }, [params.id, isAuthenticated])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const { success, user } = await userAPI.getProfile(params.id)
      if (success) {
        setUser(user)
      } else {
        toast({
          title: t("common.error"),
          description: t("userProfilePage.failedToLoadUserProfile"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: t("common.error"),
        description: t("userProfilePage.failedToLoadUserProfile"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserReviews = async () => {
    try {
      const { success, reviews } = await reviewAPI.getReviews({ user: params.id })
      if (success) {
        const sortedReviews = reviews.sort((a, b) => {
          if (a.reviewer._id === currentUser?._id) return -1
          if (b.reviewer._id === currentUser?._id) return 1
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        setReviews(sortedReviews)
        const userReview = reviews.find((review) => review.reviewer._id === currentUser?._id)
        if (userReview) {
          setExistingReview(userReview)
          setReviewData({ rating: userReview.rating, comment: userReview.comment })
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewData.comment.trim()) {
      toast({
        title: t("userProfilePage.reviewRequired"),
        description: t("userProfilePage.provideComment"),
        variant: "destructive",
      })
      return
    }
    setIsSubmittingReview(true)
    try {
      let result
      if (existingReview) {
        result = await reviewAPI.updateReview(existingReview._id, {
          rating: reviewData.rating,
          comment: reviewData.comment,
        })
      } else {
        result = await reviewAPI.createReview({
          revieweeId: params.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        })
      }
      if (result.success) {
        toast({
          title: existingReview ? t("userProfilePage.reviewUpdated") : t("userProfilePage.reviewSubmitted"),
          description: t("userProfilePage.reviewActionSuccess", { action: existingReview ? "updated" : "submitted" }),
        })
        setShowReviewModal(false)
        fetchUserReviews()
      }
    } catch (error) {
      console.error("Review submission error:", error)
      toast({
        title: t("userProfilePage.reviewFailed"),
        description: error.response?.data?.message || t("userProfilePage.reviewProblem"),
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-10">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-[#22304A] mb-2">{t("userProfilePage.userNotFound")}</h3>
          <p className="text-[#6B7280] mb-6">{t("userProfilePage.userNotFoundDescription")}</p>
          <Button onClick={() => router.back()} className="bg-[#10B981] hover:bg-[#0D9468] text-white">
            {t("userProfilePage.goBack")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt={user.name} />
                <AvatarFallback className="text-2xl bg-[#10B981] text-white">
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl text-[#22304A]">{user.name}</CardTitle>
              <CardDescription>
                <Badge
                  variant={user.userType === "Seller" ? "default" : "secondary"}
                  className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]"
                >
                  {user.userType}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center items-center space-x-1 mb-2">
                  {renderStars(Math.round(user.rating || 0))}
                  <span className="ml-2 text-sm text-[#6B7280]">
                    {user.rating ? user.rating.toFixed(1) : "0.0"} ({user.reviewCount || 0} {t("userProfilePage.reviews")})
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-[#6B7280]">
                  <Mail className="h-4 w-4 mr-2 text-[#10B981]" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Phone className="h-4 w-4 mr-2 text-[#10B981]" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-[#6B7280]">
                  <Calendar className="h-4 w-4 mr-2 text-[#10B981]" />
                  <span>
                    {t("userProfilePage.joined")} {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {user.bio && (
                <div>
                  <h3 className="font-semibold text-[#22304A] mb-2">{t("userProfilePage.about")}</h3>
                  <p className="text-sm text-[#6B7280]">{user.bio}</p>
                </div>
              )}
              {user.services && user.services.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#22304A] mb-2">{t("userProfilePage.services")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="border-[#10B981] text-[#10B981]">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {currentUser && currentUser._id !== user._id && (
                <Button
                  className="w-full mt-4"
                  onClick={() => setShowReviewModal(true)}
                  variant={existingReview ? "outline" : "default"}
                >
                  {existingReview ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("userProfilePage.editYourReview")}
                    </>
                  ) : (
                    t("userProfilePage.leaveAReview")
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#22304A]">
                {t("userProfilePage.reviews")} ({reviews.length})
              </CardTitle>
              <CardDescription className="text-[#6B7280]">
                {t("userProfilePage.whatOthersSay", { userName: user.name })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#6B7280]">{t("userProfilePage.noReviewsYet")}</p>
                  <p className="text-sm text-[#6B7280] mt-2">
                    {t("userProfilePage.beFirstToLeaveReview", { userName: user.name })}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className={`border rounded-lg p-4 ${
                        review.reviewer._id === currentUser?._id
                          ? "bg-[#10B981]/5 border-[#10B981]"
                          : "border-[#E5E7EB]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage
                              src={review.reviewer.avatar || "/placeholder.svg?height=40&width=40"}
                              alt={review.reviewer.name}
                            />
                            <AvatarFallback className="bg-[#10B981] text-white">
                              {review.reviewer.name
                                ? review.reviewer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[#22304A]">
                              {review.reviewer.name}
                              {review.reviewer._id === currentUser?._id && (
                                <Badge variant="secondary" className="ml-2 bg-[#10B981]/10 text-[#10B981]">
                                  {t("userProfilePage.yourReview")}
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="ml-2 text-sm text-[#6B7280]">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[#6B7280]">{review.comment}</p>
                      {review.job && (
                        <p className="text-xs text-[#6B7280] mt-2">
                          {t("userProfilePage.reviewForJob")}: {review.job.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#22304A] mb-4">
              {existingReview ? t("userProfilePage.editYourReview") : t("userProfilePage.leaveAReview")}{" "}
              {t("userProfilePage.for")} {user.name}
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-[#22304A]">{t("userProfilePage.rating")}</Label>
                <div className="flex space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData((prev) => ({ ...prev, rating: star }))}
                      className={`text-2xl ${star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[#22304A]">{t("userProfilePage.comment")}</Label>
                <Textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder={t("userProfilePage.shareYourExperience")}
                  rows={4}
                  className="border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                className="border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                {t("userProfilePage.cancel")}
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="bg-[#10B981] hover:bg-[#0D9468] text-white"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingReview ? t("userProfilePage.updating") : t("userProfilePage.submitting")}
                  </>
                ) : existingReview ? (
                  t("userProfilePage.updateReview")
                ) : (
                  t("userProfilePage.submitReview")
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
