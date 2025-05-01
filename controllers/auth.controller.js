import User from "../model/user.model.js";
import Nano from "../utilis/nano.utilis.js";
import Mailer from "../utilis/mailer.utils.js";
import Bcrypt from "../utilis/bcrypt.util.js";
import JWT from "../utilis/jwt.util.js";
import config from "../config.js";
import returnResponse from "../utilis/response.utili.js";
const AuthController = {
  async signUp(req, res) {
    console.log(req, "fewrfew");
    const { email, phone, firstName, lastName, password } = req.bodyValue;
    const existingProfileByEmail = await User.findOne({
      email,
      isDeleted: false,
    });
    // if (existingProfileByEmail.isDeleted == true) {
    //   return res.status(400).json(
    //     returnResponse({
    //       success: false,
    //       message: "this email is blocked by admin use another email",
    //       body: {
    //         email: email,
    //       },
    //     })
    //   );
    // }

    if (existingProfileByEmail)
      return res.status(400).json(
        returnResponse({
          success: false,
          message: "Email already exists.",
          body: { email: email },
        })
      );

    if (phone) {
      const existingProfileByPhone = await User.findOne({
        phone,
        isDeleted: false,
      });

      if (existingProfileByPhone)
        return res.status(400).json(
          returnResponse({
            success: false,
            message: "Phone already exists.",
            body: { phone: phone },
          })
        );
    }

    // const emailVerificationCode = Nano.getCode({});
    const hashedPassword = await Bcrypt.getHash({ data: password });
    const createUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      // emailVerificationCode,
      password: hashedPassword,
    });
    // console.log("this is user", createUser.id);
    // console.log("_id", _id);
    // console.log("createUser", createUser);
    // await ChefAuth.create({
    //   chefId: chef._id,
    //   ip: IP.getIP(req),
    //   host: req.headers.host,
    //   pathname: req.originalUrl,
    //   origin: req.headers.origin,
    //   userAgent: req.headers["user-agent"],
    // });

    // await Task.create(
    //   systemTasks.map((task) => ({ assignedChefId: chef._id, isSystemCreated: true, ...task }))
    // );
    // Then use the config object in your JWT.sign method:
    const token = JWT.sign({ _id: createUser._id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
    console.log("tokerm", token);
    const data = createUser.toObject();

    // delete data.password;

    // await Mailer.sendVerificationEmail({
    //   email,
    //   code: emailVerificationCode,
    //   name: `${firstName} ${lastName}`,
    // });

    // if (phone) await TwilioService.sendCode({ phone });

    return res.status(201).json({
      success: true,
      token,
      user: data,
      message: "Account created successfully!",
    });
  },
  async signIn(req, res) {
    const { email, password } = req.bodyValue;
    const existingProfileByEmail = await User.findOne({
      email,
      isDeleted: false,
    }).select(["+password"]);
    console.log("this is login email:", existingProfileByEmail);

    if (!existingProfileByEmail)
      return res.status(404).json(
        returnResponse({
          success: false,
          message: "Email does not exists.",
          body: { email: email },
        })
      );

    const passwordValid = await Bcrypt.compare(
      password,
      existingProfileByEmail.password
    );

    if (!passwordValid)
      return res.status(400).json(
        returnResponse({
          success: false,
          message: "Incorrect password.",
        })
      );
    const token = JWT.sign({ _id: existingProfileByEmail._id });
    const data = existingProfileByEmail.toObject();
    delete data.password;
    return res.status(201).json({
      success: true,
      token,
      message: "User login successfully!",
    });
  },
  async forgotPassword(req, res) {
    const { email } = req.bodyValue;
    const query = { email, isDeleted: false };
    const user = await User.findOne(query).select(["+resetCode"]);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Email does not exists." });

    const resetCode = Nano.getCode({});
    const name = `${user.firstName} ${user.lastName}`;
    const [, error] = await Mailer.sendVerificationCodeToEmail({
      email,
      resetCode,
      name,
    });

    if (error)
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Something went wrong!",
      });

    user.resetCode = resetCode;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: `Reset link sent to ${email}.` });
  },
  async resetPassword(req, res) {
    const { email, password, confirmPassword, resetCode } = req.bodyValue;
    const query = { email, isDeleted: false };
    const user = await User.findOne(query).select(["+password", "+resetCode"]);

    if (!user)
      return res
        .status(404)
        .json(
          returnResponse({ success: false, message: "Email does not exists." })
        );

    if (user.resetCode !== resetCode)
      return res.status(400).json({ success: false, message: "Invalid code." });

    user.password = await Bcrypt.getHash({ data: password });
    user.resetCode = "";
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: `Password changed successfully.` });
  },
  async getUserDetails(req, res) {
    const user = req.user;
    // console.log({ user: req.users.email });
    // const { email, password, confirmPassword, resetCode } = req.bodyValue;
    // const query = { email, isDeleted: false };
    // const user = await User.findOne(query).select(["+password", "+resetCode"]);

    if (!user)
      return res.status(404).json(
        returnResponse({
          success: false,
          message: "Something went wrong try again",
        })
      );

    // if (user.resetCode !== resetCode)
    //   return res.status(400).json({ success: false, message: "Invalid code." });

    // user.password = await Bcrypt.getHash({ data: password });
    // user.resetCode = "";
    // await user.save();

    return res.status(200).json({
      success: true,
      message: `User details is fetched`,
      body: { user },
    });
  },
};
export default AuthController;
