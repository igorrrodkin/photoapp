import { pgTable, text, boolean } from "drizzle-orm-pg";

export const photos = pgTable("photos", {
  photographer: text("photographer"),
  albumName: text("album_name"),
  presignedNormal: text("presigned_normal"),
  presignedMini: text("presigned_mini"),
  presignedWatermark: text("presigned_watermark"),
  presignedMiniWatermark: text("presigned_mini_watermark"),
  presignedCover: text("cover_presigned"),
  photoUuid: text("photo_uuid"),
  accessClients: text("access_clients"),
  coverPhoto: boolean("cover_photo"),
});
