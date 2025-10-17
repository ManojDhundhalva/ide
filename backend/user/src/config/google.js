import { google } from "googleapis";
import config from "./index.js";

export const oauth2client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  "postmessage"
);
