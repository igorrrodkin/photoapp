import { PgDatabase } from "drizzle-orm-pg";
import { eq, and } from "drizzle-orm/expressions.js";
import { photos } from "./schema.js";

export default class Photos {
  public constructor(private db: PgDatabase) {}

  public getClientPhotos = async (clientUUID: string) => {
    const clientContent = await this.db
      .select(photos)
      .where(eq(photos.accessClients, clientUUID));
    return clientContent;
  };

  public getClientPhotosOneAlbum = async (
    clientUUID: string,
    albumUUID: string
  ) => {
    const clientContent = await this.db
      .select(photos)
      .where(
        and(
          eq(photos.accessClients, clientUUID),
          eq(photos.albumUuid, albumUUID)
        )
      );
    return clientContent;
  };

  public getAlbumCover = async (albumUUID: string) => {
    const coverContent = await this.db
      .select(photos)
      .fields({ presignedCover: photos.presignedCover })
      .where(and(eq(photos.albumUuid, albumUUID), eq(photos.coverPhoto, true)));
    return coverContent[0].presignedCover;
  };

  public insertPhotoInformation = async (
    photographerLogin: string,
    photoId: string,
    albumId: string,
    isCoverPhoto: boolean,
    signedUrl: string,
    signedUrlMiniature: string,
    signedUrlMiniatureWatermarked: string,
    signedUrlWatermarked: string,
    signedUrlCover: string
  ) => {
    await this.db.insert(photos).values({
      photographer: photographerLogin,
      photoUuid: photoId,
      albumUuid: albumId,
      coverPhoto: isCoverPhoto,
      presignedNormal: signedUrl,
      presignedMini: signedUrlMiniature,
      presignedMiniWatermark: signedUrlMiniatureWatermarked,
      presignedWatermark: signedUrlWatermarked,
      presignedCover: signedUrlCover,
    });
  };

  public checkIfAlbumContainsPhotos = async (albumId: string) => {
    const content = await this.db
      .select(photos)
      .where(eq(photos.albumUuid, albumId));
    if (content.length) {
      return true;
    } else {
      return false;
    }
  };

  public giveAccessToPhoto = async (clientUuid: string, photoUuid: string) => {
    const content = await this.db
      .select(photos)
      .where(eq(photos.photoUuid, photoUuid));
    const imageRow = content[0];
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
