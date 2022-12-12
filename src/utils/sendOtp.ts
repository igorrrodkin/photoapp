import { Telegraf } from "telegraf";

const chatId = process.env.CHAT_ID_TG_BOT;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(botToken);

const generateOTP = (): string => {
  return JSON.stringify(Math.floor(Math.random() * 899999 + 100000));
};

export const sendOneTimePassword = (login: string) => {
  const generatedOTP = generateOTP();
  bot.telegram.sendMessage(chatId, `OTP for login "${login}": ${generatedOTP}`);
  return generatedOTP;
};
