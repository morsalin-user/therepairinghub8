// UPDATE your api/jobs/route.js POST function:

export async function POST(req) {
  try {
    await connectToDatabase()
    
    // Check authentication
    const authResult = await handleProtectedRoute(req)
    if (!authResult.success) {
      return authResult
    }
    
    const { title, description, category, location, price, date } = await req.json()
    
    console.log("Received date from frontend:", date)
    
    // Validate required fields
    if (!title || !description || !category || !location || !price) {
      return NextResponse.json({ success: false, message: "Please provide all required fields" }, { status: 400 })
    }
    
    // Validate price
    if (isNaN(Number.parseFloat(price)) || Number.parseFloat(price) <= 0) {
      return NextResponse.json({ success: false, message: "Please provide a valid price" }, { status: 400 })
    }
    
    // Convert the frontend 'date' to backend 'deadline'
    let preferredDeadline = null
    if (date) {
      try {
        preferredDeadline = new Date(date)
        console.log("Converted to deadline:", preferredDeadline)
        if (isNaN(preferredDeadline.getTime())) {
          return NextResponse.json({ success: false, message: "Please provide a valid date" }, { status: 400 })
        }
      } catch (error) {
        return NextResponse.json({ success: false, message: "Please provide a valid date" }, { status: 400 })
      }
    }
    
    // Create job - IMPORTANT: Save to 'deadline' field, not 'date' field
    const job = await Job.create({
      title,
      description,
      category,
      location,
      price: Number.parseFloat(price),
      deadline: preferredDeadline, // 🔥 Save preferred date to 'deadline' field
      // Don't set 'date' field - let it be handled by timestamps if needed
      postedBy: authResult.user._id,
      status: "active",
    })
    
    console.log("Created job with deadline:", job.deadline)
    
    // Populate the job with user details
    await job.populate("postedBy", "name email avatar")
    
    return NextResponse.json({
      success: true,
      job,
    })
  } catch (error) {
    console.error("Create job error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
