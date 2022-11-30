export interface credentialsPhotographers {
  login: string;
  password: string;
}

export interface credentialsClients {
  login: string;
  password: string;
  type: "login" | "registration";
  otp?: number;
}

export interface albumCreation {
  albumName: string;
  location: string;
  datapicker: string;
  price: number /* in cents */;
}

export interface addClientName {
  name: string;
}
