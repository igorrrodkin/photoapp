import { InferModel, PgDatabase } from "drizzle-orm-pg";
import { eq } from "drizzle-orm/expressions.js";
import { otpData, profileContent } from "../../dtos/interfaces.js";
import { clients } from "./schema.js";
import { v4 } from "uuid";
export type Client = InferModel<typeof clients>;

class Clients {
  public constructor(public db: PgDatabase) {}

  public registerClient = async (phoneNumber: string) => {
    await this.db
      .insert(clients)
      .values({ phoneNumber: phoneNumber, uuid: v4() });
  };

  public ifClientNumberNotExists = async (
    phoneNumber: string
  ): Promise<boolean> => {
    const content = await this.db
      .select(clients)
      .where(eq(clients.phoneNumber, phoneNumber));
    if (content.length == 0) {
      return true;
    }
    return false;
  };

  public updateOTPbyUUID = async (uuid: string, otp: string): Promise<void> => {
    await this.db
      .update(clients)
      .set({ otp: otp, otpDepartureDate: JSON.stringify(new Date().getTime()) })
      .where(eq(clients.uuid, uuid));
  };
  public updateOTPbyNumber = async (
    phoneNumber: string,
    otp: string
  ): Promise<void> => {
    await this.db
      .update(clients)
      .set({ otp: otp, otpDepartureDate: JSON.stringify(new Date().getTime()) })
      .where(eq(clients.phoneNumber, phoneNumber));
  };
  public getOTPdata = async (phoneNumber: string): Promise<otpData> => {
    const content = await this.db
      .select(clients)
      .fields({ otp: clients.otp, date: clients.otpDepartureDate })
      .where(eq(clients.phoneNumber, phoneNumber));

    return content[0];
  };

  public getOTPdataByUUID = async (uuid: string): Promise<otpData> => {
    const content = await this.db
      .select(clients)
      .fields({ otp: clients.otp, date: clients.otpDepartureDate })
      .where(eq(clients.uuid, uuid));

    return content[0];
  };
  // method is used for inavailability to send otp again
  public setResendOTPinavailable = async (
    phoneNumber: string
  ): Promise<void> => {
    await this.db
      .update(clients)
      .set({ resendOtp: false })
      .where(eq(clients.phoneNumber, phoneNumber));
  };

  public setResendOTPavailable = async (phoneNumber: string): Promise<void> => {
    await this.db
      .update(clients)
      .set({ resendOtp: true })
      .where(eq(clients.phoneNumber, phoneNumber));
  };

  public checkIfresendOTPavailable = async (
    phoneNumber: string
  ): Promise<boolean> => {
    const content = await this.db
      .select(clients)
      .fields({ resendOtp: clients.resendOtp })
      .where(eq(clients.phoneNumber, phoneNumber));
    if (content[0].resendOtp) {
      return content[0].resendOtp;
    }
    return false;
  };

  public updateClientName = async (
    uuid: string,
    name: string
  ): Promise<void> => {
    await this.db
      .update(clients)
      .set({ name: name })
      .where(eq(clients.uuid, uuid));
  };

  public updateClientEmail = async (
    uuid: string,
    email: string
  ): Promise<void> => {
    await this.db
      .update(clients)
      .set({ email: email })
      .where(eq(clients.uuid, uuid));
  };

  public getClientData = async (uuid: string): Promise<profileContent> => {
    const content = await this.db
      .select(clients)
      .fields({
        name: clients.name,
        email: clients.email,
        phoneNumber: clients.phoneNumber,
      })
      .where(eq(clients.uuid, uuid));

    return content[0];
  };
  public changePhoneNumber = async (
    uuid: string,
    newNumber: string
  ): Promise<void> => {
    await this.db
      .update(clients)
      .set({ phoneNumber: newNumber })
      .where(eq(clients.uuid, uuid));
  };

  public getUUIDbyNumber = async (phoneNumber: string) => {
    const content = await this.db
      .select(clients)
      .fields({ uuid: clients.uuid })
      .where(eq(clients.phoneNumber, phoneNumber));
    return content[0].uuid;
  };

  public getNumberByUUID = async (uuid: string) => {
    const content = await this.db
      .select(clients)
      .fields({ phoneNumber: clients.phoneNumber })
      .where(eq(clients.uuid, uuid));
    return content[0].phoneNumber;
  };

  public selectAvailablePhotosByNumber = async (clientPhoneNumber: string) => {
    const content = await this.db
      .select(clients)
      .fields({
        availablePhotos: clients.availablePhotos,
      })
      .where(eq(clients.phoneNumber, clientPhoneNumber));
    return content;
  };

  public setPhotoAvailable = async (
    clientNumber: string,
    photoUuid: string
  ) => {
    const alreadyAvailable = await this.db
      .select(clients)
      .fields({ availablePhotos: clients.availablePhotos })
      .where(eq(clients.phoneNumber, clientNumber));
    if (alreadyAvailable[0].availablePhotos == null) {
      await this.db
        .update(clients)
        .set({
          availablePhotos: JSON.stringify([photoUuid]),
        })
        .where(eq(clients.phoneNumber, clientNumber));
    } else {
      const parsedPhotosUuid = JSON.parse(alreadyAvailable[0].availablePhotos!);
      parsedPhotosUuid.push(photoUuid);
      await this.db
        .update(clients)
        .set({
          availablePhotos: JSON.stringify(parsedPhotosUuid),
        })
        .where(eq(clients.phoneNumber, clientNumber));
    }
  };

  public getAvailablePhotosByClientID = async (clientUuid: string) => {
    const content = await this.db
      .select(clients)
      .fields({ availablePhotos: clients.availablePhotos })
      .where(eq(clients.uuid, clientUuid));
    return content[0].availablePhotos;
  };
}

export default Clients;