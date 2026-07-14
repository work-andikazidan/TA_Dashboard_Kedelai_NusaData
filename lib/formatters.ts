export function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return "-"
  }

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(numberValue)
}

export function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return "-"
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue)
}