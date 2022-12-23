import { InferModel, PgDatabase } from "drizzle-orm-pg";
import { and, eq } from "drizzle-orm/expressions.js";
import { albums } from "./schema.js";

export type Album = InferModel<typeof albums>;

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

  public createAlbumDB = async (
    login: string,
    albumName: string,
    location: string,
    datapicker: string
    // price: string,
    // priceId: string,
    // productId: string
  ): Promise<void> => {
    await this.db.insert(albums).values({
      login: login,
      albumName: albumName,
      albumLocation: location,
      datapicker: datapicker,
    });
  };

  public listAlbums = async (login: string) => {
    const result = await this.db
      .select(albums)
      .fields({
        album_name: albums.albumName,
        album_location: albums.albumLocation,
        datapicker: albums.datapicker,
      })
      .where(eq(albums.login, login));
    return result;
  };

  //   public giveAccessToAlbum = async (
  //     loginPhotographer: string,
  //     albumName: string,
  //     clientLogins: string[]
  //   ): Promise<void> => {
  //     const accessIsAlreadyGiven = await this.db
  //       .select(albums)
  //       .fields({ access_clients: albums.accessClients })
  //       .where(
  //         and(
  //           eq(albums.login, loginPhotographer),
  //           eq(albums.albumName, albumName)
  //         )
  //       );
  //     const accessContent = accessIsAlreadyGiven[0].access_clients;
  //     let finalArray: string[];
  //     if (accessContent) {
  //       const accessArray = JSON.parse(accessContent);
  //       finalArray = Array.from(new Set(accessArray.concat(clientLogins)));
  //     } else {
  //       finalArray = clientLogins;
  //     }
  //     await this.db
  //       .update(albums)
  //       .set({ accessClients: JSON.stringify(finalArray) })
  //       .where(
  //         and(
  //           eq(albums.albumName, albumName),
  //           eq(albums.login, loginPhotographer)
  //         )
  //       );
  //   };

  //   public availableAlbums = async (userLogin: string): Promise<Album[]> => {
  //     const content = await this.db.select(albums);
  //     const availableAlbums = content.filter(
  //       (item: Album) =>
  //         item.accessClients && JSON.parse(item.accessClients).includes(userLogin)
  //     );
  //     return availableAlbums;
  //   };

  //   public getPriceId = async (
  //     loginPhotographer: string,
  //     albumName: string
  //   ): Promise<string> => {
  //     const content = await this.db
  //       .select(albums)
  //       .fields({ price_id: albums.priceId })
  //       .where(
  //         and(
  //           eq(albums.login, loginPhotographer),
  //           eq(albums.albumName, albumName)
  //         )
  //       );
  //     return content[0].price_id!;
  //   };
}
