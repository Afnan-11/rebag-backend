import Joi from "joi";
import DateExtension from "@joi/date";

import googleLibphonenumber from "google-libphonenumber";

import moment from "moment";

import config from "../config.js";

const JoiDate = Joi.extend(DateExtension);
const PNF = googleLibphonenumber.PhoneNumberFormat;
const phoneUtil = googleLibphonenumber.PhoneNumberUtil.getInstance();

const {
  venueTypes,
  journeyTypes,
  parkingOptions,
  popupColors,
  tagsTypes,
  pronounsTypes,
  serveSafeStatus,
  chefRoles,
} = config;
const [, ...serveSafeStatusRest] = serveSafeStatus;
const format = "YYYY-MM-DD";
const types = {
  pattern: "string.pattern.base",
};
const messages = {
  websiteRegex: "must be a valid uri",
  zipCode: "Must be a valid US Zip Code.",
  alpha: "{#label} can only contain letters and spaces",
  password: "{#label} can only contain letters and numbers",
  alphaDescription:
    "{#label} can only contain letters, numbers, spaces and special characters (’'\".,&-@)",
};
const regex = {
  alpha: /^[A-Za-z ]+$/,
  password: /^[a-zA-Z0-9]+$/,
  description: /^[A-Za-z0-9’'".,&-@ ]+$/,
  zipCode: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
  websiteRegex:
    /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?$/,
};

const getAlpha = (max = 56) =>
  Joi.string()
    .max(max)
    .required()
    .trim()
    .pattern(regex.alpha)
    .messages({ [types.pattern]: messages.alpha });

const getAlphaDescription = (max = 56) =>
  Joi.string()
    .max(max)
    .required()
    .trim()
    .pattern(regex.description)
    .messages({ [types.pattern]: messages.alphaDescription });

const validateTimeDifference = (startTime, endTime) => {
  if (startTime % 1 !== 0 || endTime % 1 !== 0)
    throw new Error("Start Time and End Time must be without decimal point");
  if (startTime > 24 || startTime < 0 || endTime < 0 || endTime > 24) {
    throw new Error(
      "Start Time and End Time must be greater than 0 and less than 24 hours."
    );
  } else if (endTime < startTime) {
    throw new Error("End time cannot be before start time");
  } else if (endTime - startTime > 24) {
    throw new Error(
      "startTime and endTime difference must be less than 24 hours."
    );
  } else if (startTime === endTime) {
    throw new Error("Start And End Time must Be Not Equal");
  }
  return true;
};

const validateTimeSlots = (startTime, endTime, timeSlots) => {
  const slotsLengths = timeSlots.length;
  if (endTime - startTime < slotsLengths) {
    throw new Error(
      "Some Slots are exceeding duration between Start And End Time"
    );
  }
  for (let index = 0; index < endTime - startTime; index++) {
    if (timeSlots[index]?.venueSlot !== startTime + index) {
      throw new Error("Some Slots are missing in Venue Slots");
    }
    if (timeSlots[index]?.lock && timeSlots[index]?.noOfCovers !== 0) {
      throw new Error("If Slot is locked noOfCovers must be zero.");
    }
  }
  return true;
};

const schema = {
  firstName: getAlpha(),
  name: getAlphaDescription(45),
  description: getAlphaDescription(1250),
  boolean: Joi.boolean().required(),
  website: Joi.string().pattern(regex.websiteRegex).trim().allow(""),
  number: Joi.number().min(0),
  string: Joi.string().required().trim(),
  id: Joi.string().hex().length(24).required(),
  code: Joi.string().length(6).required().trim(),
  uri: Joi.string().uri().trim().allow("").optional(),
  email: Joi.string().email().min(5).max(64).required().trim(),

  image: Joi.string().uri().required().trim(),
  images: Joi.array().items(Joi.string().uri().required().trim()).required(),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  password: Joi.string().min(6).max(30).required(),
  // .pattern(regex.password)
  // .messages({ [types.pattern]: messages.password }),

  zipCode: Joi.string()
    .required()
    .trim()
    .pattern(regex.zipCode)
    .messages({ [types.pattern]: messages.zipCode }),

  nextOrder: Joi.number().positive().required(),
  previousOrder: Joi.number().less(Joi.ref("nextOrder")).positive().required(),

  date: JoiDate.date().format(format).min(moment().startOf("day")).required(),
  endDate: JoiDate.date().format(format).max("now").required(),
  startDate: JoiDate.date().format(format).max(Joi.ref("endDate")).required(),

  journeyType: Joi.string()
    .valid(...journeyTypes)
    .required(),

  venueType: Joi.string()
    .trim()
    .valid(...venueTypes)
    .required(),

  pronounType: Joi.string().valid(...pronounsTypes),
  serveSafeStatus: Joi.string().valid(...serveSafeStatus),
  serveSafeStatusRest: Joi.string().valid(...serveSafeStatusRest),
  chefRoles: Joi.string().valid(...chefRoles),

  parkingOptions: Joi.array()
    .items(
      Joi.string()
        .valid(...parkingOptions)
        .trim()
    )
    .required(),

  seatingTypes: Joi.array().items(Joi.string().required()).min(1).required(),
  seatingLocation: Joi.array().items(Joi.string().required()).min(1).required(),
  cuisineType: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .max(5)
    .required(),
  diningExperience: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .max(1)
    .required(),
  addTags: Joi.array()
    .items({
      name: Joi.string().required(),
      type: Joi.string()
        .valid(...tagsTypes)
        .required(),
    })
    .optional(),

  phone: Joi.string().allow("").optional(),
};

const Validation = {
  auth: {
    signUp: {
      body: Joi.object({
        email: schema.email,
        phone: schema.phone,
        password: schema.password,
        lastName: schema.firstName,
        firstName: schema.firstName,
      }),
    },
    signIn: {
      body: Joi.object({
        email: schema.email,
        password: schema.password,
        // acceptInvite: Joi.object({
        //   memberId: schema.id.required(),
        //   popupId: schema.id.required(),
        //   invitedBy: schema.id.required(),
        //   email: schema.email.required(),
        //   invitationCode: schema.code.required(),
        // }).optional(),
      }),
    },
    googleSignUp: {
      body: Joi.object({
        phone: schema.phone,
        accessToken: schema.string,
        lastName: schema.firstName,
        firstName: schema.firstName,
      }),
    },
    googleSignIn: {
      body: Joi.object({
        accessToken: schema.string,
        acceptInvite: Joi.object({
          memberId: schema.id.required(),
          popupId: schema.id.required(),
          invitedBy: schema.id.required(),
          email: schema.email.required(),
          invitationCode: schema.code.required(),
        }).optional(),
      }),
    },
    appleSignUp: {
      body: Joi.object({
        email: schema.email,
        phone: schema.phone,
        lastName: schema.firstName,
        firstName: schema.firstName,
      }),
    },
    appleSignIn: {
      body: Joi.object({
        code: schema.string,
        lastName: schema.string.allow("").optional(),
        firstName: schema.string.allow("").optional(),
        acceptInvite: Joi.object({
          memberId: schema.id.required(),
          popupId: schema.id.required(),
          invitedBy: schema.id.required(),
          email: schema.email.required(),
          invitationCode: schema.code.required(),
        }).optional(),
      }),
    },
    forgotPassword: {
      body: Joi.object({
        email: schema.email,
      }),
    },
    resetPassword: {
      body: Joi.object({
        email: schema.email,
        resetCode: schema.code,
        password: schema.password,
        confirmPassword: schema.confirmPassword,
      }),
    },
    verifyEmail: {
      body: Joi.object({
        code: schema.code,
      }),
    },
    verifyPhone: {
      body: Joi.object({
        code: schema.code,
        phone: schema.phone,
      }),
    },
    uploadProfile: {
      body: Joi.object({
        image: schema.image.optional(),
        aboutChef: getAlphaDescription(512),
        tiktokAccountLink: schema.uri.optional(),
        facebookAccountLink: schema.uri.optional(),
        instagramAccountLink: schema.uri.optional(),
      }),
    },
    popupsNumber: {
      body: Joi.object({
        popupGoalsPerMonth: schema.number.integer().optional(),
        currentPopupsPerMonth: schema.number.integer().optional(),
        typicalHostingDateAndTime: getAlphaDescription(512).optional(),
      }),
    },
    addJourneyPoint: {
      body: Joi.object({
        type: schema.journeyType,
        title: schema.name,
        startDate: schema.startDate,
        endDate: schema.endDate,
        location: schema.string,
        restaurant: Joi.string().when("type", {
          is: "Job",
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
      }),
    },
    editJourneyPoint: {
      params: Joi.object({
        journeyId: schema.id,
      }),
      body: Joi.object({
        type: schema.journeyType,
        title: schema.name,
        startDate: schema.startDate,
        endDate: schema.endDate,
        location: schema.string,
        nextId: schema.id.optional(),
        previousId: schema.id.optional(),
        restaurant: Joi.string().when("type", {
          is: "Job",
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
      }),
    },
    removeJourneyPoints: {
      params: Joi.object({
        journeyId: schema.id,
      }),
    },
    reOrderJourneyPoints: {
      params: Joi.object({
        journeyId: schema.id,
      }),
      body: Joi.object({
        nextId: schema.id.optional(),
        previousId: schema.id.optional(),
      }),
    },
    addServeSafeCertificate: {
      body: Joi.object({
        state: schema.string,
      }),
    },
    deleteServeSafe: {
      params: Joi.object({
        serveSafeId: schema.id,
      }),
    },
    editContact: {
      body: Joi.object({
        email: schema.email,
        phone: schema.phone,
        lastName: schema.firstName,
        firstName: schema.firstName,
      }),
    },
    updateProfile: {
      body: Joi.object({
        image: schema.image.optional(),
      }),
    },
    aboutMe: {
      body: Joi.object({
        pronouns: schema.pronounType,
        description: schema.description,
        birthday: schema.date,
      }),
    },
    editPassword: {
      body: Joi.object({
        password: schema.password,
      }),
    },
  },
  popup: {
    getPopupDetails: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    addPopup: {
      body: Joi.object({
        name: schema.name,
        phone: schema.phone,
        website: schema.website,
        description: schema.description,
      }),
    },
    editPopupListing: {
      body: Joi.object({
        color: Joi.string()
          .valid(...popupColors)
          .required(),
        name: schema.name,
        chefName: schema.name,
        website: schema.website,
        phone: schema.phone.optional(),
        description: schema.description,
        chefs: schema.images.max(2).optional(),
        foods: schema.images.max(4).optional(),
        popups: schema.images.max(4).optional(),
        thumbnail: schema.number,
        seatingLocation: schema.seatingLocation,
        seatingTypes: schema.seatingTypes,
        diningExperience: schema.diningExperience,
        addTags: schema.addTags,
        deleteTags: Joi.array().items(schema.id),
        facebookAccountLink: schema.uri.optional(),
        instagramAccountLink: schema.uri.optional(),
        tiktokAccountLink: schema.uri.optional(),

        // Venue Fields Validation
        date: schema.date.min(moment().startOf("day")),
        venueName: schema.name,
        city: schema.string,
        state: schema.string,
        zipCode: schema.zipCode,
        venueType: schema.venueType,
        streetAddress: schema.string,
        maxOccupancy: schema.number.integer(),
        startTime: schema.number.integer(),
        // eslint-disable-next-line consistent-return
        endTime: schema.number.integer().custom((value, helper) => {
          const startTime = helper.state?.ancestors[0]?.startTime;
          try {
            if (validateTimeDifference(startTime, value)) return value;
          } catch (error) {
            return helper.message(error?.message);
          }
        }),
        coverPrice: schema.number,
        venueCost: schema.number,
        seatsPerTimeSlot: Joi.array()
          .items(
            Joi.object({
              lock: schema.boolean,
              venueSlot: schema.number.integer(),
              noOfCovers: schema.number.integer(),
            }).required()
          )
          // eslint-disable-next-line consistent-return
          .custom((value, helper) => {
            const startTime = helper.state?.ancestors[0]?.startTime;
            const endTime = helper.state?.ancestors[0]?.endTime;
            try {
              if (validateTimeSlots(startTime, endTime, value)) return value;
            } catch (error) {
              return helper.message(error?.message);
            }
          })
          .required(),

        // Venue Parking Validation
        parkingAvailable: schema.boolean,
        parkingOptions: schema.parkingOptions,
        chargingStation: schema.boolean,
        parkingDescription: schema.description,
      }),
    },
    repeatPopup: {
      body: Joi.object({
        repeatPopupInterest: schema.boolean,
      }),
    },
    addPopupVenue: {
      body: Joi.object({
        popupId: schema.id,
        date: schema.date.min(moment().startOf("day")),
        name: schema.name,
        city: schema.string,
        state: schema.string,
        type: schema.venueType,
        zipCode: schema.zipCode,
        streetAddress: schema.string,
        maxOccupancy: schema.number.integer(),
        startTime: schema.number.integer(),
        // eslint-disable-next-line consistent-return
        endTime: schema.number.integer().custom((value, helper) => {
          const startTime = helper.state?.ancestors[0]?.startTime;
          try {
            if (validateTimeDifference(startTime, value)) return value;
          } catch (error) {
            return helper.message(error?.message);
          }
        }),
        venueCost: schema.number,
        coverPrice: schema.number,
        seatsPerTimeSlot: Joi.array()
          .items(
            Joi.object({
              lock: schema.boolean,
              venueSlot: schema.number.integer(),
              noOfCovers: schema.number.integer(),
            })
          )
          // eslint-disable-next-line consistent-return
          .custom((value, helper) => {
            const startTime = helper.state?.ancestors[0]?.startTime;
            const endTime = helper.state?.ancestors[0]?.endTime;
            try {
              if (validateTimeSlots(startTime, endTime, value)) return value;
            } catch (error) {
              return helper.message(error?.message);
            }
          })
          .required(),
      }),
    },
    editPopupVenue: {
      params: Joi.object({
        venueId: schema.id,
      }),
      body: Joi.object({
        popupId: schema.id,
        date: schema.date.min(moment().startOf("day")),
        name: schema.name,
        city: schema.string,
        state: schema.string,
        zipCode: schema.zipCode,
        type: schema.venueType,
        streetAddress: schema.string,
        maxOccupancy: schema.number.integer(),
        startTime: schema.number.integer(),
        // eslint-disable-next-line consistent-return
        endTime: schema.number.integer().custom((value, helper) => {
          const startTime = helper.state?.ancestors[0]?.startTime;
          try {
            if (validateTimeDifference(startTime, value)) return value;
          } catch (error) {
            return helper.message(error?.message);
          }
        }),
        coverPrice: schema.number,
        venueCost: schema.number,
        seatsPerTimeSlot: Joi.array()
          .items(
            Joi.object({
              lock: schema.boolean,
              venueSlot: schema.number.integer(),
              noOfCovers: schema.number.integer(),
            }).required()
          )
          // eslint-disable-next-line consistent-return
          .custom((value, helper) => {
            const startTime = helper.state?.ancestors[0]?.startTime;
            const endTime = helper.state?.ancestors[0]?.endTime;
            try {
              if (validateTimeSlots(startTime, endTime, value)) return value;
            } catch (error) {
              return helper.message(error?.message);
            }
          })
          .required(),
      }),
    },
    parkingDetails: {
      params: Joi.object({
        venueId: schema.id,
      }),
      body: Joi.object({
        parkingAvailable: schema.boolean,
        parkingOptions: schema.parkingOptions,
        chargingStation: schema.boolean,
        parkingDescription: schema.description,
      }),
    },
    getVenueDetails: {
      params: Joi.object({
        venueId: schema.id,
      }),
    },
    addTagsPopup: {
      params: Joi.object({
        popupId: schema.id,
      }),
      body: Joi.object({
        seatingTypes: schema.seatingTypes,
        seatingLocation: schema.seatingLocation,
        diningExperience: schema.diningExperience,
        addTags: schema.addTags,
        deleteTags: Joi.array().items(schema.id),
      }),
    },
    getTagsPopup: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    uploadImages: {
      params: Joi.object({
        popupId: schema.id,
      }),
      body: Joi.object({
        chefs: schema.images.max(2).optional(),
        foods: schema.images.max(4).optional(),
        popups: schema.images.max(4).optional(),
      }),
    },
    sendInvite: {
      body: Joi.object({
        popupId: schema.id,
        email: schema.email,
      }),
    },
    addPopupTask: {
      body: Joi.object({
        popupId: schema.id,
        title: schema.name,
        details: schema.description.optional(),
        dueDate: schema.date.allow("").optional(),
        assignedTo: schema.id.allow("").optional(),
      }),
    },
    editPopupTask: {
      params: Joi.object({
        taskId: schema.id,
      }),
      body: Joi.object({
        popupId: schema.id,
        title: schema.name,
        details: schema.description.optional(),
        dueDate: schema.date.allow("").optional(),
        assignedTo: schema.id.allow("").optional(),
      }),
    },
    editPopupTaskStatus: {
      params: Joi.object({
        taskId: schema.id,
      }),
      body: Joi.object({
        isCompleted: schema.boolean,
      }),
    },
    deletePopupTask: {
      params: Joi.object({
        taskId: schema.id,
      }),
    },
    getPopupTasks: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    getPopupMembers: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    editMemberRole: {
      params: Joi.object({
        memberId: schema.id,
      }),
      body: Joi.object({
        role: schema.chefRoles,
      }),
    },
    acceptInvite: {
      params: Joi.object({
        memberId: schema.id,
      }),
      body: Joi.object({
        popupId: schema.id,
        invitedBy: schema.id,
        email: schema.email,
        invitationCode: schema.code,
      }),
    },
    deletePopupMember: {
      params: Joi.object({
        memberId: schema.id,
      }),
    },
    editVenueLocation: {
      params: Joi.object({
        popupId: schema.id,
      }),
      body: Joi.object({
        date: schema.date,
        name: schema.name,
        city: schema.string,
        state: schema.string,
        zipCode: schema.zipCode,
        type: schema.venueType,
        streetAddress: schema.string,
        parkingAvailable: schema.boolean,
        parkingOptions: schema.parkingOptions,
        chargingStation: schema.boolean,
        parkingDescription: schema.description,
        venues: schema.images.max(4).optional(),
        maxOccupancy: schema.number.integer(),
        startTime: schema.number.integer(),
        // eslint-disable-next-line consistent-return
        endTime: schema.number.integer().custom((value, helper) => {
          const startTime = helper.state?.ancestors[0]?.startTime;
          try {
            if (validateTimeDifference(startTime, value)) return value;
          } catch (error) {
            return helper.message(error?.message);
          }
        }),
        coverPrice: schema.number,
        venueCost: schema.number,
        seatsPerTimeSlot: Joi.array()
          .items(
            Joi.object({
              lock: schema.boolean,
              venueSlot: schema.number.integer(),
              noOfCovers: schema.number.integer(),
            }).required()
          )
          // eslint-disable-next-line consistent-return
          .custom((value, helper) => {
            const startTime = helper.state?.ancestors[0]?.startTime;
            const endTime = helper.state?.ancestors[0]?.endTime;
            try {
              if (validateTimeSlots(startTime, endTime, value)) return value;
            } catch (error) {
              return helper.message(error?.message);
            }
          })
          .required(),
      }),
    },
    detailAvail: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    addMenu: {
      body: Joi.object({
        popupId: schema.id,
        title: schema.name,
        showItemCost: schema.boolean,
        description: schema.description.allow("").optional(),
        cuisineType: schema.cuisineType,
        addTags: Joi.array().items(schema.string),
        deleteTags: Joi.array().items(schema.id),
        sections: Joi.array()
          .items(
            Joi.object({
              _id: schema.id.optional(),
              name: schema.name,
              items: Joi.array()
                .items(
                  Joi.object({
                    _id: schema.id.optional(),
                    title: schema.name,
                    price: schema.number.optional(),
                    image: schema.image.optional(),
                    index: schema.number.integer().optional(),
                    tags: Joi.array().items(schema.string).optional(),
                    description: schema.description.allow("").optional(),
                  })
                )
                .min(1)
                .required(),
            })
          )
          .min(1)
          .required(),
        editTemplates: Joi.array().items(
          Joi.object({
            templateId: schema.id,
            title: schema.name,
            description: schema.description,
          })
        ),
      }),
    },
    getMenuDetails: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    publishPopup: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    unpublishPopup: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    createTemplate: {
      params: Joi.object({
        popupId: schema.id,
      }),
      body: Joi.object({
        title: schema.name,
        showItemCost: schema.boolean,
        description: schema.description.allow("").optional(),
        sections: Joi.array()
          .items(
            Joi.object({
              _id: schema.id.optional(),
              name: schema.name,
              items: Joi.array()
                .items(
                  Joi.object({
                    _id: schema.id.optional(),
                    title: schema.name,
                    price: schema.number.optional(),
                    image: schema.image.optional(),
                    index: schema.number.optional(),
                    tags: Joi.array().items(schema.string).optional(),
                    description: schema.description.allow("").optional(),
                  })
                )
                .min(1)
                .required(),
            })
          )
          .min(1)
          .required(),
      }),
    },
    copyTemplate: {
      params: Joi.object({
        templateId: schema.id,
      }),
      body: Joi.object({
        popupId: schema.id,
      }),
    },
    deleteTemplate: {
      params: Joi.object({
        templateId: schema.id,
      }),
      body: Joi.object({
        popupId: schema.id,
      }),
    },
    getMenuTemplates: {
      params: Joi.object({
        popupId: schema.id,
      }),
    },
    filterPopups: {
      query: Joi.object({
        today: schema.boolean.optional(),
        date: schema.date.optional(),
        location: schema.string.optional(),
        guests: schema.number.optional(),
        tags: Joi.array().items(schema.id).optional(),
      }),
    },
  },
  guestAuth: {
    signUp: {
      body: Joi.object({
        email: schema.email,
        phone: schema.phone,
        password: schema.password,
        lastName: schema.firstName,
        firstName: schema.firstName,
      }),
    },
    signIn: {
      body: Joi.object({
        email: schema.email,
        password: schema.password,
      }),
    },
    googleSignUp: {
      body: Joi.object({
        phone: schema.phone,
        accessToken: schema.string,
        lastName: schema.firstName,
        firstName: schema.firstName,
      }),
    },
    googleSignIn: {
      body: Joi.object({
        accessToken: schema.string,
      }),
    },
    appleSignUp: {
      body: Joi.object({
        email: schema.email,
        phone: schema.phone,
        lastName: schema.firstName,
        firstName: schema.firstName,
      }),
    },
    appleSignIn: {
      body: Joi.object({
        code: schema.string,
        lastName: schema.string.allow("").optional(),
        firstName: schema.string.allow("").optional(),
      }),
    },
    forgotPassword: {
      body: Joi.object({
        email: schema.email,
      }),
    },
    resetPassword: {
      body: Joi.object({
        email: schema.email,
        resetCode: schema.code,
        password: schema.password,
        confirmPassword: schema.confirmPassword,
      }),
    },
    verifyEmail: {
      body: Joi.object({
        code: schema.code,
      }),
    },
    verifyPhone: {
      body: Joi.object({
        code: schema.code,
        phone: schema.phone,
      }),
    },
  },
  guestReservation: {
    heldReservation: {
      body: Joi.object({
        guestId: schema.id.optional(),
        popupId: schema.id,
        venueDate: schema.date,
        venueSlot: schema.number,
        noOfGuests: schema.number.min(1),
        amount: schema.number,
      }),
    },
    setGuestDetails: {
      body: Joi.object({
        reservationId: schema.id,
        phone: schema.phone,
        email: schema.email,
        firstName: schema.firstName,
        lastName: schema.firstName,
      }),
    },
    addReservationGuest: {
      body: Joi.object({
        reservationId: schema.id,
        phone: schema.phone.optional(),
        email: schema.email.when("phone", {
          is: Joi.exist(),
          then: Joi.forbidden(),
          otherwise: Joi.required(),
        }),
      }),
    },
    getReservation: {
      params: Joi.object({
        reservationId: schema.id,
      }),
    },
  },
  admin: {
    signIn: {
      body: Joi.object({
        email: schema.email,
        password: schema.password,
      }),
    },
    updateCertificate: {
      params: Joi.object({
        serveSafeId: schema.id,
      }),
      body: Joi.object({
        status: schema.serveSafeStatusRest,
      }),
    },
    getPopupData: {
      query: Joi.object({
        title: schema.name.optional(),
        name: schema.firstName.optional(),
        email: schema.string.optional(),
        page: schema.number.min(1),
      }),
    },
    updatePopupStatus: {
      params: Joi.object({
        popupId: schema.id,
      }),
      body: Joi.object({
        banned: schema.boolean,
      }),
    },
    getGuestData: {
      query: Joi.object({
        name: schema.firstName.optional(),
        email: schema.string.optional(),
        phone: schema.string.optional(),
        page: schema.number.min(1),
      }),
    },
    getReservationData: {
      query: Joi.object({
        name: schema.firstName.optional(),
        email: schema.string.optional(),
        page: schema.number.min(1),
      }),
    },
  },
};

export default Validation;
