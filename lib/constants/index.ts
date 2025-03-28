export const APP_NAME = "Gabag Indonesia"

export const APP_DESCRIPTION = "E-Commerce Perlengkapan Ibu dan Bayi Terlengkap Se-Indonesia"

export const SERVER_URL = "http://localhost:3000"

export const footerAdvantage = [
  {
    label: 'High Quality Material',
    img: "/images/advantage1.png"
  },
  {
    label: 'World First Milk Storage QR',
    img: "/images/advantage2.png"
  },
  {
    label: 'Multiple Payments Options',
    img: "/images/advantage3.png"
  },
  {
    label: 'Competitive Price',
    img: "/images/advantage4.png"
  },
]

export const aboutUs = [
  {label: 'Warranty', link: '/about-us/warranty'},
  {label: 'Blog', link: '/about-us/blog'},
  {label: 'Event & Campaign', link: '/about-us/event-campaign'},
  {label: 'Contact Us', link: '/about-us/contact'},
  {label: 'Career', link: '/about-us/career'},
  {label: 'Gallery', link: '/about-us/gallery'},
  {label: 'Join Reseller', link: '/about-us/reseller'},
  {label: 'About Gabag', link: '/about-us/about'},
]

export const paymentIcon = [
  "/images/payment/bni.webp",
  "/images/payment/bri.svg",
  "/images/payment/gopay.png",
  "/images/payment/mandiri.png",
  "/images/payment/mastercard.png",
  "/images/payment/qris.png",
  "/images/payment/shopeepay.svg",
  "/images/payment/visa.svg",
]

export const customerServices = [
  {label: 'Orders', link: '/orders'},
  {label: 'Tracking Order', link: '/track-order'},
  {label: "About Gabag's Coin", link: '/coin'},
]

export const downloadApps = [
  {image: '/images/gplay.png', link: 'https://play.google.com/store/apps/details?id=com.gabag.app&pcampaignid=web_share'},
  {image: '/images/appstore.webp', link: 'https://apps.apple.com/id/app/gabag-aplikasi/id1504829185'},
]

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