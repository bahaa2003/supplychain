import User from "../../models/User.schema.js";
import Location from "../../models/Location.schema.js";
import Company from "../../models/Company.schema.js";
import Attachment from "../../models/Attachment.schema.js";
import NotificationSettings from "../../models/NotificationSettings.schema.js";
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

  const existingCompany = await Company.findOne({ companyName });
  if (existingCompany)
    return next(new AppError("Company name already taken", 400));

  // Start the session and transaction
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

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

    // Upload company logo if exists
    let logoAttachment = null;
    if (req.files && req.files.logo && req.files.logo[0]) {
      try {
        const result = await uploadToImageKit(req.files.logo[0], "company_logos", company.companyName);


        [logoAttachment] = await Attachment.create(
          [
            {
              type: "company_logo",
              fileUrl: result.url,
              fileId: result.fileId,
              ownerCompany: company._id,
              uploadedBy: user._id,
              relatedTo: "Company",
              status: "approved", // or "pending" if you want review
              description: "Company main logo",
            },
          ],
          { session }
        );

        // link the logo to the company
        company.logo = logoAttachment._id;
        await company.save({ session });
      } catch (uploadError) {
        throw new AppError("Failed to upload company logo. Please try again.", 500);
      }
    }

    // Upload company documents if exist
    const attachments = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
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
          throw new AppError("Failed to upload company documents. Please try again.", 500);
        }
      }
    }

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
          verifyLink:
            process.env.NODE_ENV === "development"
              ? `http://localhost:${process.env.PORT}/api/auth/verify/${token}`
              : `${process.env.BACKEND_URL}/api/auth/verify/${token}`,
        },
        [user]
      );
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // We do not cancel registration if the email fails.
    }

    res.status(201).json({
      status: "success",
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        userId: user._id,
        companyId: company._id,
        locationId: location._id,
        logo: logoAttachment ? logoAttachment.fileUrl : null,
        attachmentsCount: attachments.length,
      },
    });
  } catch (error) {
    // abort the transaction in case of an error
    await session.abortTransaction();

    // cleanup if needed
    console.error("Registration transaction failed:", error);

    next(new AppError(error.message, 500));
  } finally {
    // end the session
    await session.endSession();
  }
};
