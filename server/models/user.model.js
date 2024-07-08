import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    pastExperience: {
      type: String,
      default: "",
    },
    skillSets: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Pre-save hook to remove any non-digit characters from the telephone number
userSchema.pre("save", function (next) {
  if (this.telephone) {
    this.telephone = this.telephone.replace(/\D/g, "");
    // Remove '91' from the beginning if it exists
    if (this.telephone.startsWith("91")) {
      this.telephone = this.telephone.slice(2);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
