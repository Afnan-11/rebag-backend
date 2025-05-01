import JWT from "../utilis/jwt.util.js";
import User from "../model/user.model.js";
function authorize(model = "user") {
  return async (req, res, next) => {
    const status = 401;
    const success = false;
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res
        .status(status)
        .json({ success, message: "No token provided." });
    }
    // console.log("this is token: ", authHeader);
    // Handle Bearer token format
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    // console.log("this is header token: ", token);
    try {
      // Ensure verify method has the token and secret
      const decoded = JWT.verify(token, process.env.JWT_SECRET);
      const query = { _id: decoded?._id, isDeleted: false };

      const user = await User.findOne(query);
      // console.log({ user });
      if (!user) {
        return res.status(status).json({ success, message: "Invalid token." });
      }

      req[`${model}`] = user; // Attach user to request
      next(); // Move to next middleware
    } catch (error) {
      console.error("Authorization Error: ", error);
      return res
        .status(status)
        .json({ success, message: `${error.name}: ${error.message}` });
    }
  };
}

export default authorize;
