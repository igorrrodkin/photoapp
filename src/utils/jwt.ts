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
  return decoded.clientUUID;
};

export const signAccessTokenClient = (clientUUID: string) => {
  const token = jsonwebtoken.sign({ clientUUID }, clientSecret, {
    expiresIn: "1 day",
  });
  return token;
};

export const signAccessTokenPhotographer = (login: string) => {
  const token = jsonwebtoken.sign({ login }, photographerSecret, {
    expiresIn: "10h",
  });
  return token;
};
