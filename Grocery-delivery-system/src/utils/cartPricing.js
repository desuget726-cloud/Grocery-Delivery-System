export const FREE_DELIVERY_THRESHOLD = 500
export const DELIVERY_FEE = 50

export function getDiscountAmount(promoCode, subtotal) {
  if (promoCode === 'WELCOME10') {
    return subtotal * 0.1
  }
  if (promoCode === 'FRESH100' && subtotal > 800) {
    return 100
  }
  return 0
}

export function getDeliveryFee(promoCode, subtotal) {
  if (
    subtotal === 0 ||
    subtotal >= FREE_DELIVERY_THRESHOLD ||
    promoCode === 'FREEDEL'
  ) {
    return 0
  }
  return DELIVERY_FEE
}
