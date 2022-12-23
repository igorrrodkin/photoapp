import jsonwebtoken from "jsonwebtoken";

const clientSecret = process.env.JWT_SECRET_CLIENTS;
const photographerSecret = process.env.JWT_SECRET;

export const extractLoginFromJWT = (token: string) => {
  const decoded: jsonwebtoken.JwtPayload = jsonwebtoken.decode(
    token
  ) as jsonwebtoken.JwtPayload;
  return decoded.login;
};

export const extractClientUUIDFromJWT = (token: string) => {
  const decoded: jsonwebtoken.JwtPayload = jsonwebtoken.decode(
    token
  ) as jsonwebtoken.JwtPayload;
  return decoded.phoneNumber;
};

export const signAccessTokenClient = async (clientUUID: string) => {
  jsonwebtoken.sign({ clientUUID }, clientSecret, {
    expiresIn: "1 day",
  });
};

export const signAccessTokenPhotographer = (login: string) => {
  jsonwebtoken.sign({ login }, photographerSecret, {
    expiresIn: "10h",
  });
};
