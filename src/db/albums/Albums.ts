import { PgDatabase } from "drizzle-orm-pg";
import { and, eq } from "drizzle-orm/expressions.js";
import { albums } from "./schema.js";

export default class Albums {
  public constructor(private db: PgDatabase) {}

  public ifAlbumExists = async (
    login: string,
    albumName: string
  ): Promise<boolean> => {
    const content = await this.db
      .select(albums)
      .where(and(eq(albums.login, login), eq(albums.albumName, albumName)));
    if (content.length) {
      return true;
    }
    return false;
  };
  public getAlbumDataByUUID = async (albumUUID: string) => {
    const content = await this.db
      .select(albums)
      .where(eq(albums.albumId, albumUUID));
    return content[0];
  };
  public getUUIDByLoginAndAlbumName = async (
    login: string,
    albumName: string
  ) => {
    const content = await this.db
      .select(albums)
      .where(and(eq(albums.albumName, albumName), eq(albums.login, login)));
    return content[0];
  };

  public createAlbumDB = async (
    login: string,
    albumName: string,
    location: string,
    datapicker: string,
    album_uuid: string
  ): Promise<void> => {
    await this.db.insert(albums).values({
      login: login,
      albumName: albumName,
      albumLocation: location,
      datapicker: datapicker,
      albumId: album_uuid,
    });
  };

  public listAlbums = async (login: string) => {
    const result = await this.db
      .select(albums)
      .fields({
        albumName: albums.albumName,
        albumLocation: albums.albumLocation,
        datapicker: albums.datapicker,
        albumUuid: albums.albumId,
      })
      .where(eq(albums.login, login));
    return result;
  };
}
