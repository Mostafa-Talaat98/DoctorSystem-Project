import { EventEmitter } from "node:events";
import { EmailEventType } from "./email.events.types.js";
import { confirmEmailTemplate } from "./email.templates.js";
import { sendEmail } from "./send.email.js";

export const emailEvent = new EventEmitter();

emailEvent.on(EmailEventType.VERIFY_EMAIL, async (data) => {
    try {
        data.html = await confirmEmailTemplate({ otp: data.otp });
        data.subject = "Confirm Your Email Address";
        await sendEmail(data);
    } catch (error) {
        console.error("Fail To Send Email", error);
    }
});