import cardValidator from "card-validator";

import Environment from "erede-node/lib/environment";

import Transaction from "erede-node/lib/transaction";

import RedeError from "erede-node/lib/exception/RedeError";

import eRede from "erede-node/lib/erede";

import Url from "erede-node/lib/url";

import Store from "erede-node/lib/store";

import { encrypt, decrypt } from "./crypto";

import { fetchJson } from "./fetch";

import _ from "./funcs";

export type eRedeConfig = {
	token: string;
	pv: string;
};

export type eRedeCardInfo = {
	brand: string;
	cvv: string;
	expMonth: string;
	expYear: string;
	holder: string;
	number: string;
};

export type eRedeCharge = {
	ref: string;
	amount: number;
	cardToken: string;
	cardType: string;
};

export type eRedeResponse = {
	success?: boolean;
	statusCode?: string;
	statusReason: string;
};

export type eRedeSuccessResponse = eRedeResponse & {
	nsu: string;
	tid: string;
	reference: string;
	refundId: string;
	refundDate: string;
};

const getErrorMessage = (error: any) => {
	if (error instanceof Error) return error.message;

	switch (Number.parseInt(error.returnCode)) {
		case 80:
		case 111:
			return "Não autorizado. (Saldo/limite insuficiente).";
		case 42:
			return "Referência: o número do pedido já existe.";
		case 58:
			return "Não autorizado. Entre em contato com o emissor do cartão.";
		case 55:
			return "Nome do titular do cartão: tamanho do parâmetro inválido.";
		case 64:
			return "Transação não processada. Tente novamente.";
		case 69:
			return "Transação não permitida para este produto ou serviço.";
		case 71:
			return "Valor: Formato de parâmetro inválido.";
		case 110:
			return "Não autorizado. Tipo de transação não permitido para este cartão.";
		case 105:
			return "Não autorizado. Cartao restrito.";
		case 109:
			return "Não autorizado. Cartão inexistente.";
		case 112:
			return "Não autorizado. A data de validade expirou.";
		case 119:
			return "Não autorizado. Código de segurança inválido.";
		case 353:
			return "Transação não encontrada.";
		case 365:
			return "Reembolso parcial não disponível.";
		case 354:
			return "Transação com prazo expirado para reembolso.";
		case 355:
			return "Transação já cancelada.";
		default:
			return error.returnMessage || "Payment gateway server error (eRede)";
	}
};

export const fmtAmount = (amount: number) =>
	Number.parseInt((amount * 100).toString());

export const isRefundOk = (status: string) =>
	status === "359" || status === "360";

const createSuccessResponse = (resp: any, refund?: boolean) => {
	const {
		returnCode: statusCode,
		returnMessage,
		nsu,
		tid,
		reference,
		refundId,
		refundDateTime: refundDate,
	} = resp;

	const success = refund ? isRefundOk(statusCode) : statusCode === "00";

	const statusReason = success
		? `${
				refund
					? `Transação: ${refundId}`
					: `Transação: ${tid}, NSU: ${nsu}, Ref: ${reference}`
			}. ${returnMessage}`
		: undefined;

	return {
		success,
		statusCode,
		statusReason,
		nsu,
		tid,
		reference,
		refundId,
		refundDate,
	} as eRedeSuccessResponse;
};

const createFailureResponse = (error: any) => {
	console.log(error);
	return {
		statusCode: error.returnCode,
		statusReason: getErrorMessage(error),
	} as eRedeResponse;
};

export class eRedeToken {
	encrypt({ brand, cvv, expMonth, expYear, holder, number }: eRedeCardInfo) {
		return encrypt(
			`${brand}-${cvv}-${expMonth}-${expYear}-${holder}-${number}`,
		);
	}

	decrypt(plain: string) {
		if (!plain) return;

		const s = decrypt(plain);

		const [brand, cvv, expMonth, expYear, holder, number] = s.split("-");
		return { brand, cvv, expMonth, expYear, holder, number } as eRedeCardInfo;
	}
}

export class eRedeService {
	public store;
	public erede;

	static cardToken = new eRedeToken();

	static checkCardNumber = (number: string) => {
		number = _.numbers(number);

		const { card, isValid } = cardValidator.number(number);

		return { number, brand: _.toUpper(card?.niceType), isValid };
	};

	constructor(config: eRedeConfig) {
		this.store = new Store(config.token, config.pv, Environment.production());
		this.erede = new eRede(this.store);
	}

	customRequest(method: string, body: any) {
		const path = this.store.environment.endpoint + "/transactions";

		const options = {
			method,
			port: 443,
			body,
			auth: this.store.filiation + ":" + this.store.token,
		};

		return fetchJson(path, options)
			.then(async (resp) => {
				const json = await resp.json();

				const { status } = resp;

				return { status, json };
			})
			.then(({ status, json }) => {
				let resp = json as any;

				if (status >= 400) {
					if (!resp || resp.returnMessage === undefined) {
						resp = {
							returnMessage: "Alguma coisa aconteceu",
							returnCode: "-1",
						};
					}

					return Promise.reject(
						new RedeError(resp.returnMessage, resp.returnCode),
					);
				}

				return Transaction.fromJSON(resp);
			});
	}

	async findPayment(ref: string) {
		try {
			const resp = await this.erede.getByReference(ref);
			return createSuccessResponse(resp);
		} catch (error) {
			return createFailureResponse(error);
		}
	}

	async payWithCredit(charge: eRedeCharge, card: eRedeCardInfo) {
		const trx = new Transaction(
			fmtAmount(charge.amount),
			charge.ref,
			1,
		).creditCard(
			card.number,
			card.cvv,
			card.expMonth,
			card.expYear,
			card.holder,
		);

		try {
			const resp: eRedeResponse = await this.customRequest("POST", trx);
			return createSuccessResponse(resp);
		} catch (error) {
			if ((error as any)?.returnCode === "42") {
				return await this.findPayment(charge.ref);
			}
			return createFailureResponse(error);
		}
	}

	async payWithDebit(charge: eRedeCharge, card: eRedeCardInfo) {
		const transaction = new Transaction(fmtAmount(charge.amount), charge.ref)
			.debitCard(
				card.number,
				card.cvv,
				parseInt(card.expMonth),
				parseInt(card.expYear),
				card.holder,
			)
			.setThreeDSecure()
			.addUrl(
				"http://dev-api-cl.us-east-1.elasticbeanstalk.com/recurrent-payments/notification",
				Url.THREE_D_SECURE_SUCCESS,
			);

		try {
			const resp = await this.erede.create(transaction);

			if (resp.returnCode === "220") {
				await fetch(`${process.env.LAMBDA_APP_API_URL}/create-debit-payment`, {
					method: "POST",
					body: JSON.stringify(resp),
					headers: {
						"Content-Type": "application/json",
					},
				});
				throw new Error("Qualquer coisa");
			}

			return createSuccessResponse(resp);
		} catch (error) {
			return createFailureResponse(error as eRedeResponse);
		}
	}

	async payment(charge: eRedeCharge) {
		const card = eRedeService.cardToken.decrypt(charge.cardToken);

		if (!card) throw new Error("Invalid card token.");

		return charge.cardType === "C"
			? await this.payWithCredit(charge, card)
			: await this.payWithDebit(charge, card);
	}

	async refund(tid: string, amount: number) {
		try {
			const resp = await this.erede.cancel({ tid, amount: fmtAmount(amount) });
			return createSuccessResponse(resp, true);
		} catch (error) {
			return createFailureResponse(error);
		}
	}
}
