const formatCurrency = (amount) =>
  `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(amount)} ETB`

export default formatCurrency
