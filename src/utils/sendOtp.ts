import { Telegraf } from "telegraf";

const chatId = process.env.CHAT_ID_TG_BOT;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(botToken);

const generateOTP = (): string => {
  return JSON.stringify(Math.floor(Math.random() * 899999 + 100000));
};

export const sendOneTimePassword = (phoneNumber: string) => {
  const generatedOTP = generateOTP();
  bot.telegram.sendMessage(
    chatId,
    `OTP for phone number "${phoneNumber}": ${generatedOTP}`
  );
  return generatedOTP;
};

export const changeNumberOtp = (newNumber: string) => {
  const generatedOTP = generateOTP();
  bot.telegram.sendMessage(
    chatId,
    `OTP for changing phone number\nNew number:${newNumber}\nOTP:${generatedOTP}`
  );
  return generatedOTP;
};
