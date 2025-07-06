import User from "../../models/User.js";
import Location from "../../models/Location.js";
import Company from "../../models/Company.js";
import Attachment from "../../models/Attachment.js";
import NotificationSettings from "../../models/NotificationSettings.js";
import { AppError } from "../../utils/AppError.js";
import sendEmail from "../../services/email.service.js";
import { uploadToImageKit } from "../../middlewares/upload.middleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const register = async (req, res, next) => {
  const {
    name,
    email,
    password,
<<<<<<< HEAD
    companyName,
    industry,
    size,
    location,
    locationName,
    street,
    city,
    state,
    country,
    zipCode,
    latitude,
    longitude,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("Email already registered", 400);

  const existingCompany = await Company.findOne({ companyName });
  if (existingCompany) throw new AppError("Company name already taken", 400);

  const now = new Date();
  const endDate = addDays(now, 30);

  const company = await Company.create({
    companyName,
    industry,
    size,
    location,
    createdBy: null,
    isApproved: false,
    subscription: {
      plan: "Free",
      status: "active",
      startDate: now,
      endDate,
    },
  });

  const user = await User.create({
    name,
    email,
    password: bcrypt.hashSync(password, 12),
    role: "admin",
    company: company._id,
    isEmailVerified: false,
  });

  company.createdBy = user._id;
  await company.save();

  await Location.create({
    locationName,
    type: "Company",
    company: company._id,
    address: {
      street,
      city,
      state,
      country,
      zipCode,
    },
    contactPerson: {
      name: user.name,
      email: user.email,
    },
    coordinates: {
      latitude,
      longitude,
    },
    isActive: true,
  });
=======
    companyName,
    industry,
    size,
    locationName,
    city,
    state,
    country,
    zipCode,
    latitude,
    longitude,
  } = req.body;

  // Check if the user and company exist before starting the transaction
  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError("Email already registered", 400));

  const existingCompany = await Company.findOne({ name: companyName });
  if (existingCompany)
    return next(new AppError("Company name already taken", 400));
>>>>>>> 7ee5753de0630aa63e3c9e4cdf747272b2501a17

  // Start the session and transaction
  const session = await mongoose.startSession();

<<<<<<< HEAD
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  sendEmail(
    "verifyEmail",
    {
      verifyLink: `http://localhost:${process.env.PORT}/api/auth/verify/${token}`,
    },
    [user]
  );
=======
  try {
    await session.startTransaction();
>>>>>>> 7ee5753de0630aa63e3c9e4cdf747272b2501a17

    // Create the company
    const [company] = await Company.create(
      [
        {
          companyName,
          industry,
          size,
          createdBy: null,
          isApproved: false,
        },
      ],
      { session }
    );

    // Create the user
    const [user] = await User.create(
      [
        {
          name,
          email,
          password: bcrypt.hashSync(password, 12),
          role: "admin",
          company: company._id,
          isEmailVerified: false,
        },
      ],
      { session }
    );

    // Create the location
    const [location] = await Location.create(
      [
        {
          locationName,
          type: "Company",
          company: company._id,
          address: {
            street: req.body.street,
            city,
            state,
            country,
            zipCode,
          },
          contactPerson: {
            name: user.name,
            email: user.email,
          },
          coordinates: {
            latitude,
            longitude,
          },
          isActive: true,
        },
      ],
      { session }
    );

    // Update the company with the user and location IDs
    company.createdBy = user._id;
    company.location = location._id;
    await company.save({ session });

    // create notification settings
    await NotificationSettings.create(
      [
        {
          user: user._id,
          email: { enabled: true },
          sms: { enabled: false },
          inApp: { enabled: true },
        },
      ],
      { session }
    );

    // upload files if they exist
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToImageKit(file, "company_documents");

          const [attachment] = await Attachment.create(
            [
              {
                type: "company_document",
                fileUrl: result.url,
                fileId: result.fileId,
                ownerCompany: company._id,
                uploadedBy: user._id,
                relatedTo: "Company",
                status: "pending",
              },
            ],
            { session }
          );

          attachments.push(attachment);
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          // You can either cancel the transaction or log the error and continue with the registration
          throw new AppError("Failed to upload files. Please try again.", 500);
        }
      }
    }

<<<<<<< HEAD
  res.status(201).json({
    status: "success",
    message:
      "Registration successful! Free Trial activated. Please check your email to verify your account.",
  });
=======
    // commit the transaction
    await session.commitTransaction();

    // send verification email
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    try {
      await sendEmail(
        "verifyEmail",
        {
          verifyLink: `http://localhost:${process.env.PORT}/api/auth/verify/${token}`,
        },
        [user]
      );
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // We do not cancel your registration if the email fails to be sent.
      // The user can request to resend the email later
    }

    res.status(201).json({
      status: "success",
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        userId: user._id,
        companyId: company._id,
        locationId: location._id,
        attachmentsCount: attachments.length,
      },
    });
  } catch (error) {
    // abort the transaction in case of an error
    await session.abortTransaction();

    // delete the files if they exist
    if (req.files && req.files.length > 0) {
      // you can add code to delete the files from ImageKit here if needed
      console.log("Transaction failed - files may need cleanup");
    }

    console.error("Registration transaction failed:", error);

    next(new AppError(error.message, 500));
  } finally {
    console.log("finally");
    // end the session
    await session.endSession();
  }
>>>>>>> 7ee5753de0630aa63e3c9e4cdf747272b2501a17
};
