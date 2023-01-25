import sharp from "sharp";

export const putWatermark = async (buffer: Buffer, bufferWatermark: Buffer) => {
  const newBuffer = await sharp(buffer!)
    .composite([{ input: bufferWatermark, gravity: "center" }])
    .toBuffer();
  return newBuffer;
};

export const resizeToMiniaure = async (buffer: Buffer) => {
  const newBuffer = await sharp(buffer)
    .resize(120, 200, { fit: "fill" })
    .toBuffer();
  return newBuffer;
};
export const resizeToMiniatureWatermarked = async (
  buffer: Buffer,
  bufferWatermark: Buffer
) => {
  const miniBufferWatermarked = await sharp(bufferWatermark)
    .resize(110, 40, { fit: "fill" })
    .toBuffer();
  const newBuffer = await sharp(buffer)
    .composite([{ input: miniBufferWatermarked, gravity: "center" }])
    .resize(120, 200, { fit: "fill" })
    .toBuffer();

  return newBuffer;
};

export const resizeToCover = async (buffer: Buffer) => {
  const newBuffer = await sharp(buffer)
    .resize(300, 400, { fit: "fill" })
    .toBuffer();
  return newBuffer;
};
