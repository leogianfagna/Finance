/**
 * Formata um número para contábil Brasil.
 * @param {float} value Valor a ser formatado.
 * @returns {string} Valor formatado para impressão na UI, exemplo R$ 2.140,94.
 */
export function numberToCurrencyBR(value) {
  const prefix = value < 0 ? "- " : "";
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

  return prefix + formatter.format(Math.abs(value));
}
