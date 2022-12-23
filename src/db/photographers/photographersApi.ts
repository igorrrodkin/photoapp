import { PgDatabase } from "drizzle-orm-pg";
import { eq } from "drizzle-orm/expressions.js";
import { photographers } from "./schema.js";

// export type Photographer = InferModel<typeof photographers>;

export default class Photographers {
  public constructor(private db: PgDatabase) {}

  public photographerInterceptor = async (login: string, password: string) => {
    const content = await this.db
      .select(photographers)
      .fields({
        login: photographers.login,
        password: photographers.password,
      })
      .where(eq(photographers.login, login));
    let response;
    if (content.length == 0) {
      response = { message: "Invalid login", statusCode: 404 };
    } else {
      const passwordDatabase = content[0].password;
      if (passwordDatabase != password) {
        response = { message: "Invalid password", statusCode: 403 };
      } else {
        response = {
          message: "Successfully logged in",
          statusCode: 200,
        };
      }
    }
    return response;
  };
}
