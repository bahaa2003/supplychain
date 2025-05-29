import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, companyId: user.company },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
