import { PgDatabase } from "drizzle-orm-pg";
import { eq, and } from "drizzle-orm/expressions.js";
import { photos } from "./schema.js";

export default class Photos {
  public constructor(private db: PgDatabase) {}

  public getPresignedURLs = async (
    loginPhotographer: string,
    albumName: string
  ) => {
    const content = await this.db
      .select(photos)
      .fields({
        presigned: photos.presignedNormal,
        presignedMini: photos.presignedMini,
        presignedWatermark: photos.presignedWatermark,
        presignedMiniWatermark: photos.presignedMiniWatermark,
      })
      .where(
        and(
          eq(photos.photographer, loginPhotographer),
          eq(photos.albumName, albumName)
        )
      );

    return content;
  };

  public getContentByPhotoUuidWatermarked = async (photoUuid: string) => {
    const content = await this.db
      .select(photos)
      .fields({
        albumName: photos.albumName,
        // presigned: photos.presignedNormal,
        // presignedMini: photos.presignedMini,
        presignedWatermark: photos.presignedWatermark,
        presignedMiniWatermark: photos.presignedMiniWatermark,
      })
      .where(eq(photos.photoUuid, photoUuid));
    return content[0];
  };

  public getContentByPhotoUuidNormal = async (photoUuid: string) => {
    const content = await this.db
      .select(photos)
      .fields({
        albumName: photos.albumName,
        presigned: photos.presignedNormal,
        presignedMini: photos.presignedMini,
        //   presignedWatermark: photos.presignedWatermark,
        //   presignedMiniWatermark: photos.presignedMiniWatermark,
      })
      .where(eq(photos.photoUuid, photoUuid));
    return content[0];
  };

  public getContentByPhotoUuid = async (photoUuid: string) => {
    const content = await this.db
      .select(photos)
      .where(eq(photos.photoUuid, photoUuid));
    return content[0];
  };

  public giveAccessToPhoto = async (clientUuid: string, photoUuid: string) => {
    const content = await this.db
      .select(photos)
      .where(eq(photos.photoUuid, photoUuid));
    const imageRow = content[0];
    // return imageRow;
    imageRow.accessClients = clientUuid;
    await this.db.insert(photos).values(imageRow);
  };

  public findPhotoByUuid = async (photoUuid: string) => {
    const content = await this.db
      .select(photos)
      .where(eq(photos.photoUuid, photoUuid));
    if (content.length) {
      return true;
    } else return false;
  };
}
