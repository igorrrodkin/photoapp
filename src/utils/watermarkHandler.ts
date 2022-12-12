import Jimp from 'jimp';

const LOGO = 'images.png';
const LOGO_MARGIN_PERCENTAGE = 10;

export const addWatermark = async (photo: string): Promise<Jimp> => {
  const [image, logo] = await Promise.all([Jimp.read(photo), Jimp.read(LOGO)]);

  logo.resize(image.bitmap.width / 10, Jimp.AUTO);

  const xMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;
  const yMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;

  const X = image.bitmap.width - logo.bitmap.width - xMargin;
  const Y = image.bitmap.height - logo.bitmap.height - yMargin;

  const img = image.composite(logo, X, Y);
  return img;
};
