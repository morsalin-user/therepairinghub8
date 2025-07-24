import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/db"
import User from "../../../../models/User"
import Transaction from "../../../../models/Transaction"
import { handleProtectedRoute } from "../../../../lib/auth"

export async function POST(req) {
  try {
    await connectToDatabase()

    // Check authentication
    const authResult = await handleProtectedRoute(req)
    if (!authResult.success) {
      return authResult
    }

    const { amount, paypalEmail } = await req.json()
    
    console.log('=== WITHDRAWAL REQUEST DEBUG ===')
    console.log('Amount:', amount)
    console.log('PayPal Email:', paypalEmail)
    console.log('Type of paypalEmail:', typeof paypalEmail)
    console.log('PayPal Email length:', paypalEmail?.length)

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      console.log('Amount validation failed')
      return NextResponse.json({ success: false, message: "Please provide a valid amount" }, { status: 400 })
    }

    // Simple PayPal email validation - just check if it's a string and has @
    if (!paypalEmail) {
      console.log('PayPal email is missing')
      return NextResponse.json(
        { success: false, message: "Please provide a PayPal email address" },
        { status: 400 },
      )
    }

    if (typeof paypalEmail !== 'string') {
      console.log('PayPal email is not a string')
      return NextResponse.json(
        { success: false, message: "PayPal email must be a string" },
        { status: 400 },
      )
    }

    if (!paypalEmail.includes('@')) {
      console.log('PayPal email does not contain @')
      return NextResponse.json(
        { success: false, message: "Please provide a valid email format" },
        { status: 400 },
      )
    }

    console.log('PayPal email validation passed!')

    const user = await User.findById(authResult.user._id)
    if (!user) {
      console.log('User not found')
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    console.log('User found:', user._id)
    console.log('User available balance:', user.availableBalance)

    // Check if user has sufficient balance
    if (user.availableBalance < amount) {
      console.log('Insufficient funds')
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient funds. Available balance: $${user.availableBalance.toFixed(2)}`,
        },
        { status: 400 },
      )
    }

    // Update user's PayPal email if different
    if (user.paypalEmail !== paypalEmail) {
      console.log('Updating user PayPal email from', user.paypalEmail, 'to', paypalEmail)
      user.paypalEmail = paypalEmail
    }

    // Deduct amount from available balance
    const oldBalance = user.availableBalance
    user.availableBalance -= amount
    console.log('Balance updated from', oldBalance, 'to', user.availableBalance)
    
    await user.save()
    console.log('User saved successfully')

    // Create withdrawal transaction
    const transactionData = {
      user: user._id,
      provider: user._id,
      customer: user._id, // Required field - for withdrawals, user is both provider and customer
      amount: amount,
      serviceFee: 0, // No service fee for withdrawals
      type: "withdrawal",
      paymentMethod: "paypal",
      status: "completed",
      description: `Withdrawal to PayPal: ${paypalEmail}`,
      paymentId: `WD-${Date.now()}`,
      paypalEmail: paypalEmail,
    }
    
    console.log('Creating transaction with data:', transactionData)
    
    const transaction = await Transaction.create(transactionData)
    console.log('Transaction created:', transaction._id)

    console.log(`Withdrawal processed: $${amount} to ${paypalEmail} for user ${user._id}`)

    return NextResponse.json({
      success: true,
      message: `$${amount.toFixed(2)} has been sent to your PayPal account`,
      newBalance: user.availableBalance,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status
      },
    })
  } catch (error) {
    console.error("Withdrawal error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}