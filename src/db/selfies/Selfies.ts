import { PgDatabase } from "drizzle-orm-pg";
import { eq, and } from "drizzle-orm/expressions.js";
import { selfies } from "./schema.js";

export default class Selfies {
  public constructor(private db: PgDatabase) {}

  public getFrontPhotoPresigned = async (uuid: string) => {
    const content = await this.db
      .select(selfies)
      .fields({
        presigned: selfies.presignedNormal,
      })
      .where(and(eq(selfies.clientUuid, uuid), eq(selfies.isFrontPhoto, true)));

    return content[0].presigned;
  };
  public getFrontPhotoPresignedMini = async (uuid: string) => {
    const content = await this.db
      .select(selfies)
      .fields({
        presignedMiniature: selfies.presignedMini,
      })
      .where(and(eq(selfies.clientUuid, uuid), eq(selfies.isFrontPhoto, true)));

    return content[0].presignedMiniature;
  };
}
