import { Telegraf } from "telegraf";

const chatId = process.env.CHAT_ID_TG_BOT as string;
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

const generateOTP = (): number => {
  return Math.floor(Math.random() * 899999 + 100000);
};

export const sendOneTimePassword = (login: string) => {
  const generatedOTP = generateOTP();
  bot.telegram.sendMessage(chatId, `OTP for login "${login}": ${generatedOTP}`);
  return generatedOTP;
};
