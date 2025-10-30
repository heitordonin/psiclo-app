/**
 * Fórmulas financeiras baseadas nas funções do Google Planilhas/Excel
 */

/**
 * Calcula o pagamento mensal necessário para alcançar uma meta futura
 * Equivalente a: -PGTO(i;n;-PV;FV;0)
 * @param rate Taxa de juros mensal (decimal, ex: 0.01 para 1%)
 * @param nper Número de períodos (meses)
 * @param pv Valor presente (atual)
 * @param fv Valor futuro (meta)
 * @returns Pagamento mensal necessário
 */
export function calculateMonthlyPayment(
  rate: number,
  nper: number,
  pv: number,
  fv: number
): number {
  if (rate === 0) {
    return -(fv - pv) / nper;
  }
  
  const pvif = Math.pow(1 + rate, nper);
  return -((fv - pv * pvif) / ((pvif - 1) / rate));
}

/**
 * Calcula o valor presente necessário para determinada retirada mensal
 * Equivalente a: VP(i;n;-PMT;0;0)
 * @param rate Taxa de juros mensal (decimal, ex: 0.01 para 1%)
 * @param nper Número de períodos (meses)
 * @param pmt Pagamento mensal (retirada desejada)
 * @returns Valor presente necessário
 */
export function calculatePresentValue(
  rate: number,
  nper: number,
  pmt: number
): number {
  if (rate === 0) {
    return pmt * nper;
  }
  
  const pvif = Math.pow(1 + rate, nper);
  return -pmt * ((pvif - 1) / (rate * pvif));
}

/**
 * Calcula o valor futuro dado aportes mensais e valor presente
 * Equivalente a: VF(i;n;-PMT;-PV;0)
 * @param rate Taxa de juros mensal (decimal, ex: 0.01 para 1%)
 * @param nper Número de períodos (meses)
 * @param pmt Pagamento mensal (aporte)
 * @param pv Valor presente (investimento inicial)
 * @returns Valor futuro
 */
export function calculateFutureValue(
  rate: number,
  nper: number,
  pmt: number,
  pv: number
): number {
  if (rate === 0) {
    return -(pv + pmt * nper);
  }
  
  const pvif = Math.pow(1 + rate, nper);
  return -(pv * pvif + pmt * ((pvif - 1) / rate));
}
