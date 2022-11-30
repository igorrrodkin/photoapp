import pg from "pg";
import dbConn from "./connection.js";
import "dotenv/config";
const client: pg.Client = dbConn();

interface userValidationResponse {
  message: string;
  statusCode: number;
}

interface album {
  login: string;
  album_name: string;
  album_location: string;
  datapicker: string;
  access_clients: string;
  price: number;
  price_id: string;
  product_id: string;
}

export const userValidation = async (
  userType: "clients" | "photographers",
  login: string,
  password: string
): Promise<userValidationResponse> => {
  const query = `SELECT login, password FROM public.${userType} WHERE login = '${login}'`;
  const content: pg.QueryResult = await client.query(query);
  let response: userValidationResponse;
  if (!content.rowCount) {
    response = { message: "Invalid login", statusCode: 404 };
  } else {
    const passwordDatabase = content.rows[0].password;
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

export const ifAlbumExists = async (
  login: string,
  albumName: string
): Promise<boolean> => {
  const query = `SELECT * FROM public.albums WHERE login = '${login}' AND album_name = '${albumName}'`;
  const content: pg.QueryResult = await client.query(query);
  if (content.rowCount) {
    return true;
  }
  return false;
};

export const createAlbumDB = async (
  login: string,
  albumName: string,
  location: string,
  datapicker: string,
  price: number,
  priceId: string,
  productId: string
): Promise<void> => {
  const query = `INSERT INTO public.albums("login", "album_name", "album_location", "datapicker", "price", "price_id", "product_id") VALUES ('${login}', '${albumName}', '${location}', '${datapicker}', '${price}', '${priceId}', '${productId}')`;
  const result: pg.QueryResult = await client.query(query);
};

export const listAlbums = async (login: string): Promise<pg.QueryResult> => {
  const query = `SELECT album_name, album_location, datapicker, price FROM public.albums WHERE login = '${login}'`;
  const result: pg.QueryResult = await client.query(query);
  return result;
};

export const giveAccessToAlbum = async (
  loginPhotographer: string,
  albumName: string,
  clientLogins: string[]
): Promise<void> => {
  const queryExtract = `SELECT access_clients FROM public.albums WHERE album_name = '${albumName}' AND login = '${loginPhotographer}'`;
  const content: pg.QueryResult = await client.query(queryExtract);
  const accessArrayStr = content.rows[0].access_clients;
  let finalArray: string[];
  if (accessArrayStr) {
    const accessArray = JSON.parse(accessArrayStr);
    finalArray = Array.from(new Set(accessArray.concat(clientLogins)));
  } else {
    finalArray = clientLogins;
  }
  const query = `UPDATE public.albums SET access_clients = '${JSON.stringify(
    finalArray
  )}' WHERE album_name = '${albumName}' AND login = '${loginPhotographer}'`;
  const result: pg.QueryResult = await client.query(query);
};

export const registerClient = async (
  login: string,
  password: string
): Promise<void> => {
  const query = `INSERT INTO public.clients("login", "password") VALUES ('${login}', '${password}')`;
  const result: pg.QueryResult = await client.query(query);
};

export const ifClientLoginExists = async (login: string): Promise<boolean> => {
  const query = `SELECT * FROM public.clients WHERE login = '${login}'`;
  const content: pg.QueryResult = await client.query(query);
  if (content.rowCount) {
    return true;
  }
  return false;
};

export const updateOTPbyLogin = async (
  login: string,
  otp: number
): Promise<void> => {
  const query = `UPDATE public.clients SET otp = '${otp}' WHERE  login ='${login}'`;
  const result: pg.QueryResult = await client.query(query);
};

export const getOTPvalueByLogin = async (login: string): Promise<number> => {
  const query = `SELECT otp FROM public.clients WHERE login = '${login}'`;
  const content: pg.QueryResult = await client.query(query);
  return +content.rows[0].otp;
};

// method is used for inavailability to send otp again
export const setResendOTPinavailable = async (login: string): Promise<void> => {
  const query = `UPDATE public.clients SET resend_otp = 'false' WHERE  login ='${login}'`;
  const result: pg.QueryResult = await client.query(query);
};

export const setResendOTPavailable = async (login: string): Promise<void> => {
  const query = `UPDATE public.clients SET resend_otp = 'true' WHERE  login ='${login}'`;
  const result: pg.QueryResult = await client.query(query);
};

export const checkIfresendOTPavailable = async (
  login: string
): Promise<boolean> => {
  const query = `SELECT resend_otp FROM public.clients WHERE login = '${login}'`;
  const content: pg.QueryResult = await client.query(query);
  return content.rows[0].resend_otp;
};

export const availableAlbums = async (userLogin: string): Promise<album[]> => {
  const query = `SELECT *  FROM public.albums`;
  const content: pg.QueryResult = await client.query(query);
  const availableAlbums = content.rows.filter(
    (item) =>
      item.access_clients && JSON.parse(item.access_clients).includes(userLogin)
  );
  return availableAlbums;
};

export const updateClientName = async (
  userLogin: string,
  name: string
): Promise<void> => {
  const query = `UPDATE public.clients SET name = '${name}' WHERE login = '${userLogin}'`;
  const result: pg.QueryResult = await client.query(query);
};

export const getClientName = async (userLogin: string): Promise<string> => {
  const query = `SELECT name FROM public.clients where login = '${userLogin}'`;
  const content: pg.QueryResult = await client.query(query);
  if (content.rows[0].name) {
    return content.rows[0].name;
  } else {
    return "Name has not been added. You can do it later";
  }
};

export const getPriceId = async (
  loginPhotographer: string,
  albumName: string
): Promise<string> => {
  const query = `SELECT price_id FROM public.albums WHERE login = '${loginPhotographer}' AND album_name = '${albumName}'`;
  const content: pg.QueryResult = await client.query(query);
  return content.rows[0].price_id;
};
