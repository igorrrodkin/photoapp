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
export interface setEmail {
  email: string;
}
export interface changeNumberInterface {
  newNumber: string;
}
export interface profileContent {
  name: string | null;
  email: string | null;
}
export interface reqPresignedUrl {
  contentType: string;
  filename: string;
  metadata: {
    caption: string;
    name: string;
  };
}

export interface otpData {
  otp: string | null;
  date: string | null;
}
