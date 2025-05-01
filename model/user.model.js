import mongoose from "mongoose";

import config from "../config.js";

const { pronounsTypes } = config;

const userSchema = new mongoose.Schema(
  {
    // stripeCustomerId: {
    //   type: String,
    // },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      default: "",
      type: String,
      select: false,
    },
    isDeleted: {
      default: false,
      type: Boolean,
    },
    resetCode: {
      default: "",
      type: String,
      select: false,
    },
    // image: {
    //   type: String,
    // },
    // aboutChef: {
    //   type: String,
    // },

    // emailVerificationCode: {
    //   type: String,
    //   select: false,
    // },
    // isEmailVerified: {
    //   default: false,
    //   type: Boolean,
    // },
    // isPhoneVerified: {
    //   default: false,
    //   type: Boolean,
    // },
    // currentPopupsPerMonth: {
    //   type: Number,
    // },
    // popupGoalsPerMonth: {
    //   type: Number,
    // },
    // typicalHostingDateAndTime: {
    //   type: String,
    // },
    // lastOnboardingStage: {
    //   default: 1,
    //   type: Number,
    // },
    // paymentVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    // isPremium: {
    //   type: Boolean,
    //   default: false,
    // },
    // premiumLastPurchaseDate: {
    //   type: Date,
    // },
    // facebookAccountLink: {
    //   type: String,
    // },
    // instagramAccountLink: {
    //   type: String,
    // },
    // tiktokAccountLink: {
    //   type: String,
    // },
    // birthday: {
    //   type: Date,
    // },
    // pronouns: {
    //   type: String,
    //   enums: pronounsTypes,
    // },
    // description: {
    //   type: String,
    // },
    // popupColor: {
    //   default: 0,
    //   type: Number,
    //   select: false,
    // },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;
