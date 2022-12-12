import { InferModel, PgDatabase } from "drizzle-orm-pg";
import { eq } from "drizzle-orm/expressions.js";
import { db } from "../connection.js";
import { clients } from "./schema.js";
// import { schema } from "../../index.js";
export type Client = InferModel<typeof clients>;

class Clients {
  //   public connect = await db.connect();
  public constructor(public db: PgDatabase) {}

  public clientInterceptor = async (login: string, password: string) => {
    const content = await this.db
      .select(clients)
      .fields({ login: clients.login, password: clients.password })
      .where(eq(clients.login, login));
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
  public registerClient = async (
    login: string,
    password: string
  ): Promise<void> => {
    // const client = await db.connect();
    await this.db.insert(clients).values({ login: login, password: password });
  };

  public ifClientLoginExists = async (login: string): Promise<boolean> => {
    // const client = await db.connect();
    const content = await this.db
      .select(clients)
      .where(eq(clients.login, login));
    if (content.length == 0) {
      return true;
    }
    return false;
  };

  public updateOTPbyLogin = async (
    login: string,
    //   otp: number,
    otp: string
  ): Promise<void> => {
    // const client = await db.connect();
    await this.db
      .update(clients)
      .set({ otp: otp })
      .where(eq(clients.login, login));
  };

  public getOTPvalueByLogin = async (login: string): Promise<number> => {
    // const client = await db.connect();
    const content = await this.db
      .select(clients)
      .fields({ otp: clients.otp })
      .where(eq(clients.login, login));
    if (content[0].otp) {
      return +content[0].otp;
    }
    return 0;
  };

  // method is used for inavailability to send otp again
  public setResendOTPinavailable = async (login: string): Promise<void> => {
    // const client = await db.connect();
    await this.db
      .update(clients)
      .set({ resendOtp: false })
      .where(eq(clients.login, login));
  };

  public setResendOTPavailable = async (login: string): Promise<void> => {
    // const client = await db.connect();
    await this.db
      .update(clients)
      .set({ resendOtp: true })
      .where(eq(clients.login, login));
  };

  public checkIfresendOTPavailable = async (
    login: string
  ): Promise<boolean> => {
    // const client = await db.connect();
    const content = await this.db
      .select(clients)
      .fields({ resendOtp: clients.resendOtp })
      .where(eq(clients.login, login));
    if (content[0].resendOtp) {
      return content[0].resendOtp;
    }
    return false;
  };

  public updateClientName = async (
    userLogin: string,
    name: string
  ): Promise<void> => {
    // const client = await db.connect();
    await this.db
      .update(clients)
      .set({ name: name })
      .where(eq(clients.login, userLogin));
  };

  public getClientName = async (userLogin: string): Promise<string> => {
    // const client = await db.connect();
    const content = await this.db
      .select(clients)
      .fields({ name: clients.name })
      .where(eq(clients.login, userLogin));
    if (content[0].name) {
      return content[0].name;
    } else {
      return "Name has not been added. You can do it later";
    }
  };
}

export default Clients;

export const clientInterceptor = async (login: string, password: string) => {
  const client = await db.connect();
  const content = await client
    .select(clients)
    .fields({ login: clients.login, password: clients.password })
    .where(eq(clients.login, login));
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
export const registerClient = async (
  login: string,
  password: string
): Promise<void> => {
  const client = await db.connect();
  await client.insert(clients).values({ login: login, password: password });
};
export const ifClientLoginExists = async (login: string): Promise<boolean> => {
  const client = await db.connect();
  const content = await client.select(clients).where(eq(clients.login, login));
  if (content.length == 0) {
    return true;
  }
  return false;
};
export const updateOTPbyLogin = async (
  login: string,
  //   otp: number,
  otp: string
): Promise<void> => {
  const client = await db.connect();
  await client
    .update(clients)
    .set({ otp: otp })
    .where(eq(clients.login, login));
};
export const getOTPvalueByLogin = async (login: string): Promise<number> => {
  const client = await db.connect();
  const content = await client
    .select(clients)
    .fields({ otp: clients.otp })
    .where(eq(clients.login, login));
  if (content[0].otp) {
    return +content[0].otp;
  }
  return 0;
};
// method is used for inavailability to send otp again
export const setResendOTPinavailable = async (login: string): Promise<void> => {
  const client = await db.connect();
  await client
    .update(clients)
    .set({ resendOtp: false })
    .where(eq(clients.login, login));
};
export const setResendOTPavailable = async (login: string): Promise<void> => {
  const client = await db.connect();
  await client
    .update(clients)
    .set({ resendOtp: true })
    .where(eq(clients.login, login));
};
export const checkIfresendOTPavailable = async (
  login: string
): Promise<boolean> => {
  const client = await db.connect();
  const content = await client
    .select(clients)
    .fields({ resendOtp: clients.resendOtp })
    .where(eq(clients.login, login));
  if (content[0].resendOtp) {
    return content[0].resendOtp;
  }
  return false;
};
export const updateClientName = async (
  userLogin: string,
  name: string
): Promise<void> => {
  const client = await db.connect();
  await client
    .update(clients)
    .set({ name: name })
    .where(eq(clients.login, userLogin));
};
export const getClientName = async (userLogin: string): Promise<string> => {
  const client = await db.connect();
  const content = await client
    .select(clients)
    .fields({ name: clients.name })
    .where(eq(clients.login, userLogin));
  if (content[0].name) {
    return content[0].name;
  } else {
    return "Name has not been added. You can do it later";
  }
};
