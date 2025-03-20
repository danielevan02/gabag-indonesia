export const APP_NAME = "Gabag Indonesia"

export const APP_DESCRIPTION = "E-Commerce Perlengkapan Ibu dan Bayi Terlengkap Se-Indonesia"

export const SERVER_URL = "http://localhost:3000"

export const sort = [
  {
    label: "Newest to Oldest",
    value: 'new-old',
  },
  {
    label: "New Arrival",
    value: 'new-arrival'
  },
  {
    label: "Exclusive",
    value: 'exclusive'
  },
  {
    label: "Best Seller",
    value: "best-seller"
  }
]

export const priceFilter = [
  {
    label: "Rp0 - Rp100.000",
    value: {
      min: 0,
      max: 100000
    },
  },
  {
    label: "Rp100.000 - Rp500.000",
    value: {
      min: 100000,
      max: 500000
    },
  },
  {
    label: "Rp500.000 - Rp1.000.000",
    value: {
      min: 500000,
      max: 1000000
    },
  },
  {
    label: "Rp1.000.000 - Rp2.000.000",
    value: {
      min: 1000000,
      max: 2000000
    },
  },
]