export interface IEmailConfigInterface {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  confirmationLink: string;
}
