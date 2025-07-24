// api/users/financial-dashboard/route.js - FIXED VERSION
import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/db"
import Transaction from "../../../../models/Transaction"
import { handleProtectedRoute } from "../../../../lib/auth"
import User from "../../../../models/User"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(req) {
  try {
    await connectToDatabase()

    // Check authentication
    const authResult = await handleProtectedRoute(req)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status || 401 })
    }

    const userId = authResult.user._id
    const userType = authResult.user.userType

    console.log(`Fetching financial data for user ${userId}, type: ${userType}`)

    // Get user data
    const user = await User.findById(userId).select("totalEarnings totalSpending balance availableBalance paypalEmail")
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // RECALCULATE FINANCIAL DATA FROM TRANSACTIONS FOR ACCURACY
    let availableBalance = 0
    let totalEarnings = 0
    let totalSpending = 0

    if (userType === "Seller") {
      // For sellers: calculate earnings from released transactions
      const earningTransactions = await Transaction.find({
        provider: userId,
        status: "released",
        type: { $ne: "withdrawal" } // Exclude withdrawals from earnings
      })

      // Calculate total earnings (amount received minus service fees)
      totalEarnings = earningTransactions.reduce((sum, transaction) => {
        const providerAmount = transaction.amount - (transaction.serviceFee || 0)
        return sum + providerAmount
      }, 0)

      // Calculate total withdrawals
      const withdrawalTransactions = await Transaction.find({
        provider: userId,
        type: "withdrawal",
        status: "completed"
      })

      const totalWithdrawals = withdrawalTransactions.reduce((sum, withdrawal) => {
        return sum + withdrawal.amount
      }, 0)

      // Available balance = total earnings - total withdrawals
      availableBalance = Math.max(0, totalEarnings - totalWithdrawals)

      // Update user record if there's a discrepancy
      const earningsDiff = Math.abs((user.totalEarnings || 0) - totalEarnings)
      const balanceDiff = Math.abs((user.availableBalance || 0) - availableBalance)

      if (earningsDiff > 0.01 || balanceDiff > 0.01) {
        console.log(`Updating seller financial data: earnings ${user.totalEarnings || 0} -> ${totalEarnings}, balance ${user.availableBalance || 0} -> ${availableBalance}`)
        
        await User.findByIdAndUpdate(userId, {
          totalEarnings: totalEarnings,
          availableBalance: availableBalance
        })
      }

    } else if (userType === "Buyer") {
      // For buyers: calculate spending from all paid transactions
      const spendingTransactions = await Transaction.find({
        customer: userId,
        status: { $in: ["released", "in_escrow", "completed"] },
        type: "job_payment"
      })

      totalSpending = spendingTransactions.reduce((sum, transaction) => {
        return sum + transaction.amount // Full amount including service fee
      }, 0)

      // Update user record if there's a discrepancy
      const spendingDiff = Math.abs((user.totalSpending || 0) - totalSpending)

      if (spendingDiff > 0.01) {
        console.log(`Updating buyer spending: ${user.totalSpending || 0} -> ${totalSpending}`)
        
        await User.findByIdAndUpdate(userId, {
          totalSpending: totalSpending
        })
      }
    }

    console.log(`Calculated financial data:`, {
      availableBalance,
      totalEarnings,
      totalSpending
    })

    // Get all transactions for this user for recent transactions display
    const transactions = await Transaction.find({
      $or: [
        { customer: userId },
        { provider: userId }
      ],
    })
      .populate("job", "title category")
      .sort({ createdAt: -1 })
      .limit(50)

    console.log(`Found ${transactions.length} transactions`)

    const recentTransactions = []
    const spendingByCategory = {}
    const earningsByMonth = {}

    // Process transactions for display and analytics
    transactions.forEach((transaction) => {
      const isEarning = transaction.provider?.toString() === userId.toString()
      const isSpending = transaction.customer?.toString() === userId.toString()

      console.log(`Processing transaction ${transaction._id}:`, {
        isEarning,
        isSpending,
        amount: transaction.amount,
        status: transaction.status,
        type: transaction.type
      })

      // Calculate display amount based on user role
      let displayAmount = transaction.amount
      if (isEarning && transaction.status === "released" && transaction.type !== "withdrawal") {
        // For sellers showing earnings: subtract service fee
        displayAmount = transaction.amount - (transaction.serviceFee || 0)
      }

      // Add to recent transactions
      if (isEarning || isSpending) {
        recentTransactions.push({
          id: transaction._id,
          jobTitle: transaction.job?.title || (transaction.type === "withdrawal" ? "Withdrawal" : "Unknown Job"),
          description: transaction.type === "withdrawal" 
            ? "Withdrawal to PayPal" 
            : `${isEarning ? "Earned from" : "Paid for"} ${transaction.job?.title || "service"}`,
          amount: displayAmount,
          type: transaction.type === "withdrawal" ? "withdrawal" : (isEarning ? "job_earning" : "job_payment"),
          status: transaction.status,
          date: transaction.createdAt,
          category: transaction.job?.category || "General",
        })
      }

      // Spending by category (for buyers) - only count completed/released transactions
      if (isSpending && (transaction.status === "released" || transaction.status === "in_escrow" || transaction.status === "completed")) {
        const category = transaction.job?.category || "General"
        spendingByCategory[category] = (spendingByCategory[category] || 0) + transaction.amount
      }

      // Earnings by month (for sellers) - only count released transactions
      if (isEarning && transaction.status === "released" && transaction.type !== "withdrawal") {
        const month = new Date(transaction.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
        const providerAmount = transaction.amount - (transaction.serviceFee || 0)
        earningsByMonth[month] = (earningsByMonth[month] || 0) + providerAmount
      }
    })

    // Format spending by category
    const spendingByCategoryArray = Object.entries(spendingByCategory).map(([category, amount]) => ({
      category,
      amount,
    }))

    // Format earnings trend
    const earningsTrend = Object.entries(earningsByMonth)
      .map(([month, amount]) => ({
        month,
        amount,
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))

    const financialData = {
      availableBalance: Math.round(availableBalance * 100) / 100, // Round to 2 decimal places
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalSpending: Math.round(totalSpending * 100) / 100,
      recentTransactions: recentTransactions.slice(0, 20), // Limit to 20 most recent
      spendingByCategory: spendingByCategoryArray,
      earningsTrend,
    }

    console.log(`Final financial data for user ${userId}:`, {
      availableBalance: financialData.availableBalance,
      totalEarnings: financialData.totalEarnings,
      totalSpending: financialData.totalSpending,
      transactionsCount: financialData.recentTransactions.length
    })

    return NextResponse.json({
      success: true,
      financialData,
    })
  } catch (error) {
    console.error("Financial dashboard error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch financial data",
      },
      { status: 500 },
    )
  }
}