import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

//import hbs from "./hbs";

const {
  SMTP_HOST = "mail.gsysadm.com",
  SMTP_PORT = "465",
  SMTP_USER = "contato@gsysadm.com",
  SMTP_PASS = "NilSer0802?",
} = process.env;

const SMTP_TRANSPORT_OPTIONS: SMTPTransport.Options = {
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT),
  secure: SMTP_PORT === "465",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.3",
    rejectUnauthorized: false,
  },
};

const SMTP_TRANSPORT = nodemailer.createTransport(SMTP_TRANSPORT_OPTIONS);

export default class Mailer {
  private _data: object | null;

  constructor() {
    this._data = null;
  }

  html(...paths: string[]) {
    //this._template = hbs.template.apply(null, paths);
    return this;
  }

  data(value: any) {
    this._data = value;
    return this;
  }

  send(options: Mail.Options) {
    return new Promise((res, rej) => {
      const html = undefined; //hbs.compile(this._template, this._data);

      SMTP_TRANSPORT.sendMail(
        { from: SMTP_USER, ...options, html },
        (error, response) => {
          error ? rej(error) : res(response);
        }
      );
    });
  }
}
