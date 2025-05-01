/* eslint-disable no-console */

import { text } from "express";
import config from "../config.js";
import nodemailer from "nodemailer";

const Mailer = {
  async sendPasswordResetEmail({ email, name, resetCode }) {
    const options = { to: `"${name}" <${email}>`, subject: "Reset Password" };
    const data = {
      name,
      link: `${config.appUrl}/reset-password?email=${email}&resetCode=${resetCode}`,
    };
    const res = await this.sendEmail({ file: "resetPassword", options, data });

    return res;
  },
  async sendVerificationCodeToEmail({ email, name, resetCode }) {
    const options = {
      to: `"${name}" <${email}>`,
      subject: "Reset Password",
      from: config.mailer.user,
      text: `this is resetcode ${resetCode}`,
    };
    const data = {
      name,
      link: `${config.appUrl}/reset-password?email=${email}&resetCode=${resetCode}`,
    };
    const res = await this.sendEmail({ file: "resetPassword", options, data });

    return res;
  },
  async sendEmail({ data = {}, options = {}, file }) {
    return new Promise((resolve) => {
      const { user, pass } = config.mailer;
      //   const templatePath = path.join(`views/${file}.view.ejs`);
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
      });

      // eslint-disable-next-line consistent-return
      console.log("this is data code from the mailer", data);
      console.log("this is data code from the mailer", options);
      transporter.sendMail(options, (error, info) => {
        if (error) console.log("Error sending email:", { error });
        else console.log("Email sent:", info.response);

        return resolve([info, error]);
      });
    });
  },
};

export default Mailer;
