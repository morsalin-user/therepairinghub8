import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/db"
import User from "../../../../models/User"
import { handleProtectedRoute } from "../../../../lib/auth"

// Get user by ID
export async function GET(req, { params }) {
  try {
    await connectToDatabase()

    // Check authentication
    const authResult = await handleProtectedRoute(req)
    if (!authResult.success) {
      return authResult
    }

    const userId = params.id

    // Find user
    const user = await User.findById(userId).select("-password")
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        bio: user.bio,
        avatar: user.avatar,
        services: user.services,
        skills: user.skills,
        phone: user.phone,
        address: user.address,
        paypalEmail: user.paypalEmail,
        rating: user.rating,
        reviewCount: user.reviewCount,
        status: user.status,
        availableBalance: user.availableBalance,
        totalEarnings: user.totalEarnings,
        totalSpending: user.totalSpending,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Update user
export async function PUT(req, { params }) {
  try {
    await connectToDatabase()

    // Check authentication
    const authResult = await handleProtectedRoute(req)
    if (!authResult.success) {
      return authResult
    }

    const userId = params.id
    const updateData = await req.json()
    const { name, bio, avatar, services, skills, phone, address, paypalEmail, currentPassword, newPassword } =
      updateData

    // Check if user is updating their own profile or is an admin
    if (authResult.user._id.toString() !== userId && authResult.user.userType !== "Admin") {
      return NextResponse.json({ success: false, message: "Not authorized to update this user" }, { status: 403 })
    }

    // Find user with password for password change
    const user = await User.findById(userId).select("+password")
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isCurrentPasswordValid = await user.matchPassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters" },
          { status: 400 },
        )
      }

      user.password = newPassword // This will trigger the pre-save hook to hash it
    }

    // Update other user fields
    if (name !== undefined) user.name = name
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar
    if (services !== undefined) user.services = Array.isArray(services) ? services : []
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : []
    if (phone !== undefined) user.phone = phone
    if (address !== undefined) user.address = address
    if (paypalEmail !== undefined) user.paypalEmail = paypalEmail

    // Save updated user
    await user.save()

    // Return user without password
    const updatedUser = await User.findById(userId).select("-password")

    return NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.userType,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        services: updatedUser.services,
        skills: updatedUser.skills,
        phone: updatedUser.phone,
        address: updatedUser.address,
        paypalEmail: updatedUser.paypalEmail,
        rating: updatedUser.rating,
        reviewCount: updatedUser.reviewCount,
        status: updatedUser.status,
        availableBalance: updatedUser.availableBalance,
        totalEarnings: updatedUser.totalEarnings,
        totalSpending: updatedUser.totalSpending,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Delete user
export async function DELETE(req, { params }) {
  try {
    await connectToDatabase()

    // Check authentication
    const authResult = await handleProtectedRoute(req)
    if (!authResult.success) {
      return authResult
    }

    const userId = params.id

    // Check if user is deleting their own account or is an admin
    if (authResult.user._id.toString() !== userId && authResult.user.userType !== "Admin") {
      return NextResponse.json({ success: false, message: "Not authorized to delete this user" }, { status: 403 })
    }

    // Find user with all data
    const user = await User.findById(userId).select("+password")
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Import DeletedUser model
    const DeletedUser = (await import("../../../../models/DeletedUser")).default

    // Save user data to DeletedUser collection
    const deletedUserData = {
      name: user.name,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      bio: user.bio,
      services: user.services,
      skills: user.skills,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      isActive: user.isActive,
      status: user.status,
      rating: user.rating,
      reviewCount: user.reviewCount,
      clerkId: user.clerkId,
      emailVerified: user.emailVerified,
      jobs: user.jobs,
      quotes: user.quotes,
      reviews: user.reviews,
      notifications: user.notifications,
      balance: user.balance,
      availableBalance: user.availableBalance,
      totalEarnings: user.totalEarnings,
      totalSpending: user.totalSpending,
      paypalEmail: user.paypalEmail,
      conversations: user.conversations,
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordExpire: user.resetPasswordExpire,
      originalUserId: user._id,
      originalCreatedAt: user.createdAt,
      originalUpdatedAt: user.updatedAt,
      deletedAt: new Date(),
      deletionReason: "User requested account deletion",
    }

    // Create deleted user record
    await DeletedUser.create(deletedUserData)

    // Delete user from Clerk if clerkId exists
    if (user.clerkId) {
      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${user.clerkId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          console.log(`Successfully deleted user from Clerk: ${user.clerkId}`)
        } else {
          const errorData = await response.text()
          console.error("Clerk deletion failed:", response.status, errorData)

          // Try alternative method with clerkClient
          try {
            const { clerkClient } = await import("@clerk/nextjs/server")
            await clerkClient.users.deleteUser(user.clerkId)
            console.log(`Deleted user from Clerk using clerkClient: ${user.clerkId}`)
          } catch (clientError) {
            console.error("ClerkClient deletion also failed:", clientError)
          }
        }
      } catch (clerkError) {
        console.error("Error deleting user from Clerk:", clerkError)

        // Try alternative method
        try {
          const { clerkClient } = await import("@clerk/nextjs/server")
          await clerkClient.users.deleteUser(user.clerkId)
          console.log(`Deleted user from Clerk using fallback method: ${user.clerkId}`)
        } catch (fallbackError) {
          console.error("All Clerk deletion methods failed:", fallbackError)
        }
      }
    }

    // Delete user from User collection
    await User.findByIdAndDelete(userId)

    return NextResponse.json({
      success: true,
      message: "User account deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
