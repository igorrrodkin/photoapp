import { PgDatabase } from "drizzle-orm-pg";
import { eq, and } from "drizzle-orm/expressions.js";
import { selfies } from "./schema.js";

export default class Selfies {
  public constructor(private db: PgDatabase) {}

  public getFrontPhotoPresigned = async (clientUUID: string) => {
    const content = await this.db
      .select(selfies)
      .fields({
        presignedDefault: selfies.presignedNormal,
      })
      .where(
        and(eq(selfies.clientUuid, clientUUID), eq(selfies.isFrontPhoto, true))
      );
    if (content.length) {
      return content[0];
    } else {
      return null;
    }
  };

  public clientSelfiesExists = async (clientUUID: string) => {
    const content = await this.db
      .select(selfies)
      .where(eq(selfies.clientUuid, clientUUID));
    if (content.length) {
      return true;
    } else {
      return false;
    }
  };

  public updateFrontPhotosByClientUUID = async (clientUUID: string) => {
    await this.db
      .update(selfies)
      .set({
        isFrontPhoto: false,
      })
      .where(eq(selfies.clientUuid, clientUUID));
  };

  public insertPhotoContent = async (
    clientUUID: string,
    signedUrlSelfies: string,
    photoUUID: string
  ) => {
    await this.db.insert(selfies).values({
      clientUuid: clientUUID,
      presignedNormal: signedUrlSelfies,
      isFrontPhoto: true,
      photoUuid: photoUUID,
    });
  };
}
