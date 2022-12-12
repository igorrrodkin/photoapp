export interface authClients {
  login: string;
  password: string;
  otp?: string | number;
  type?: "registration" | "login";
}

export interface loginPhotographers {
  login: string;
  password: string;
}

export interface albumCreation {
  albumName: string;
  location: string;
  datapicker: string;
  price: number /* in cents */;
}

export interface giveAccess {
  giveAccessTo: string[];
}

export interface setName {
  name: string;
}
