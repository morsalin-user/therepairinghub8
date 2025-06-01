import mongoose from "mongoose"

const deletedUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    services: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    userType: {
      type: String,
      enum: ["Buyer", "Seller", "Admin"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    clerkId: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    quotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quote",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    balance: {
      type: Number,
      default: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalSpending: {
      type: Number,
      default: 0,
    },
    paypalEmail: {
      type: String,
      default: "",
    },
    conversations: [
      {
        with: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        job: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
          required: true,
        },
        lastMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
        unreadCount: {
          type: Number,
          default: 0,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Additional fields for deleted user tracking
    originalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
    deletionReason: {
      type: String,
      default: "User requested account deletion",
    },
    originalCreatedAt: {
      type: Date,
      required: true,
    },
    originalUpdatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance
deletedUserSchema.index({ email: 1 })
deletedUserSchema.index({ originalUserId: 1 })
deletedUserSchema.index({ deletedAt: 1 })
deletedUserSchema.index({ userType: 1 })

// Export the model
const DeletedUser = mongoose.models.DeletedUser || mongoose.model("DeletedUser", deletedUserSchema)

export default DeletedUser
