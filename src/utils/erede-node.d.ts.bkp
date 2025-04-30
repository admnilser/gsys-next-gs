declare module "erede-node/lib/environment" {
  export default class Environment {
    static production(): Environment;
    static development(): Environment;
    public endpoint: string;
  }
}

declare module "erede-node/lib/transaction" {
  export default class Transaction {
    static fromJSON(json: any): any;
    constructor(amount: number, reference: string, paymentType?: number) {}
    creditCard: (
      number: string,
      cvv: string,
      expMonth: string,
      expYear: string,
      holder: string
    ) => any;

    debitCard: (
      number: string,
      cvv: string,
      expMonth: number,
      expYear: number,
      holder: string
    ) => {
      setThreeDSecure: () => { addUrl: (url: string, type: string) => any };
    };
  }
}

declare module "erede-node/lib/exception/RedeError" {
  export default class RedeError {
    constructor(message: string, code: string);
  }
}

declare module "erede-node/lib/erede" {
  export default class eRede {
    constructor(store: Store) {}
    create: (trx: Transaction) => any;
    cancel: (args: { tid: string; amount: number }) => any;
    getByReference: (ref: string) => any;
  }
}

declare module "erede-node/lib/url" {
  export default class Url {
    static THREE_D_SECURE_SUCCESS: string;
  }
}

declare module "erede-node/lib/store" {
  export default class Store {
    constructor(
      public token: string,
      public pv: string,
      public env: Environment
    ) {}

    public environment: Environment;
    public filiation: string;
  }
}
