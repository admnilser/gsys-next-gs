import { fetchJson } from "./fetch";

import _ from "./funcs";

export type MobizonResult = {
  success: boolean;
  data: unknown;
  statusCode: number;
  statusMessage: string;
};

export type MobizonMessage = {
  recipient: string;
  text: string;
  from: string;
};

export type MobizonApiPayload = {
  recipient: string;
  text: string;
  from: string;
};

export type MobizonApiResponse = {
  code: number;
  data: unknown;
  message: string;
  success: boolean;
};

const parseResult = (result: MobizonApiResponse): MobizonResult => {
  const { code, data, message } = result;
  return {
    success: code === 0,
    data,
    statusCode: code,
    statusMessage:
      code === 0
        ? "SMS enviada com sucesso"
        : code === 1
        ? message
        : "SMS server error",
  };
};

export default class Mobizon {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    const { SMS_API_KEY, SMS_API_SERVER } = process.env;

    if (!SMS_API_KEY || !SMS_API_SERVER) {
      throw new Error(
        "MOBIZON_API_KEY or MOBIZON_API_SERVER not defined! (Env var)"
      );
    }

    this.apiUrl = SMS_API_SERVER;
    this.apiKey = SMS_API_KEY;
  }

  async send({ recipient, text }: MobizonMessage) {
    const result = await fetchJson<void, MobizonApiResponse>({
      path: `${this.apiUrl}message/sendsmsmessage`,
      query: {
        recipient: `55${recipient}`,
        text: _.deburr(text),
        apiKey: this.apiKey,
      },
    });
    return parseResult(result);
  }

  async getBalance() {
    return parseResult({
      code: 0,
      data: {},
      message: "Not implemented",
      success: false,
    });
  }
}
