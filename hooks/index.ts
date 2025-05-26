export const FormattedPrice = (price: string) => {
  let p = Number(price)
  const convertedPrice = new Intl.NumberFormat('en-US', {
    useGrouping: true,
  }).format(p).replace(/,/g, ' ');

  return convertedPrice
}