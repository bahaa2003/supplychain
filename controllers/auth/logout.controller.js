export const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
};
