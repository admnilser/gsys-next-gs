import { cpf, cnpj } from "cpf-cnpj-validator";

import _ from "utils";

const validate = (accept, error) => (!accept ? error : undefined);

const Validators = {
  required: (val, msg) =>
    validate(
      _.notNoU(val) && _.size(String(val)) > 0,
      msg || "Este campo deve ser preenchido"
    ),
  cpf: (val) => validate(cpf.isValid(val), "CPF inválido"),
  cnpj: (val) => validate(cnpj.isValid(val), "CNPJ inválido"),
  isNumber: (val) =>
    validate(_.isNumber(val), "Valor deve ser um numero válido."),
  lt: (max) => (val) =>
    validate(
      _.isNumber(val) ? Number(val) < max : false,
      `Valor deve ser menor que ${max}`
    ),
  let: (max) => (val) =>
    validate(
      _.isNumber(val) ? Number(val) <= max : false,
      `Valor deve ser menor ou igual que ${max}`
    ),
  gt: (min) => (val) =>
    validate(
      _.isNumber(val) ? Number(val) > min : false,
      `Valor deve ser maior que ${min}`
    ),
  get: (min) => (val) =>
    validate(
      _.isNumber(val) ? Number(val) >= min : false,
      `Valor deve ser maior ou igual que ${min}`
    ),
  length: (len) => (val) =>
    validate(
      val ? _.size(val) >= len : false,
      `Texto deve ter no mínimo ${len} digito(s)`
    ),
};

export default Validators;
