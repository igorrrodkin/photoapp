import { pgTable, text, boolean } from "drizzle-orm-pg";

export const selfies = pgTable("selfies", {
  clientUuid: text("client_uuid"),
  presignedNormal: text("presigned_normal"),
  presignedMini: text("presigned_mini"),
  isFrontPhoto: boolean("is_front_photo"),
  photoUuid: text("photo_uuid"),
});

// export type Selfies = InferModel<typeof selfies>;
