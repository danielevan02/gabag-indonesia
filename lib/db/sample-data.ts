

export const sample = {
  user: [
    {
      id: "74c862cd-fdf0-459b-b708-cf9b519610bc",
      name: "Daniel Laventiza",
      email: "daniel@gmail.com",
      password: '$2a$10$V48w2SC7oddyolhA.N1ageYPvpg2R9.7d.cERDkrswfCXEy62VeMq',
      role: 'user',
      address: {"province":"BANTEN","regency":"KABUPATEN TANGERANG","district":"PASARKEMIS","village":"KUTA BUMI","address":"Taman Kutabumi Blok D 10 no. 25","postalCode":"15561"}

    }
  ],
  category: [
    {
      id: "bc6d6369-1dac-465f-987d-b75e806275ca",
      name: "Fashion",
      discount: 20,
      image: '/dummy/category1.webp'
    },
    {
      id: "de8e1345-65d7-42fc-b484-a763ce7e2c48",
      name: "Breast Pump",
      discount: 20,
      image: '/dummy/category2.webp'
    },
    {
      id: "3d4761d8-087a-4022-974c-59fe60cda9dd",
      name: "Cooler Bag",
      discount: 20,
      image: '/dummy/category3.webp'
    },
    {
      id: "bd82d0f5-1204-4461-a7d2-426ca695d49d",
      name: "Accessories",
      discount: 20,
      image: '/dummy/category4.webp'
    },
    {
      id: "389ee9dc-20b2-43ee-9a54-6e40cd121bda",
      name: "Beauty",
      discount: 20,
      image: '/dummy/category5.webp'
    },
  ],
  product: [
    {
      id: "d0e1028e-d972-4b8b-9f23-6617b2f08ffe",
      name: 'Stretch Mark Serum',
      slug: 'stretch-mark-serum',
      description: 's',
      images: ['/dummy/product1.webp'],
      stock: 10,
      price: 259000,
      rating: 0,
      numReviews: 0,
      banner: 'Best Seller',
      weight: 0.8
    },
    {
      id: "eedda1db-e4a6-4470-96cb-f191fe460bbe",
      name: 'Thermal Bag Executive Petunia',
      slug: 'thermal-bag-executive-petunia',
      description: 's',
      images: ['/dummy/product3.jpg'],
      stock: 10,
      price: 549000,
      rating: 0,
      numReviews: 0,
      banner: 'Exclusive',
      weight: 0.2
    },
    {
      id: "12114520-e75f-465b-84c2-98bc70d8ca0f",
      name: 'Backpack Cooler Bag 2 in 1 (Laptop Fit)',
      slug: 'backpack-cooler-bag-2-in-1-laptop-fit',
      description: 's',
      images: ['/dummy/product2.webp', "/dummy/product1.webp", '/dummy/product3.jpg', '/dummy/product4.jpeg', '/dummy/product5.jpg','/dummy/product6.webp'],
      stock: 10,
      price: 452000,
      rating: 0,
      numReviews: 0,
      banner: 'Best Seller',
      discount: 30,
      hasDifferentVariantPrice: true,
      hasVariant: true, 
      weight: 0.5,

    },
    {
      id: "eabeef49-8f36-46dd-a24a-3574c0d4d105",
      name: 'Backpack Sling Double Compartment',
      slug: 'backpack-sling-double-compartment',
      description: 's',
      images: ['/dummy/product4.jpeg'],
      stock: 10,
      price: 432000,
      rating: 0,
      numReviews: 0,
      weight: 0.6
    },
    {
      id:"b6c82fc0-1e4e-44b7-bc75-8fa842aeab3e",
      name: 'Pombag',
      slug: 'pombag',
      description: 's',
      images: ['/dummy/product6.webp'],
      stock: 10,
      price: 98000,
      rating: 0,
      numReviews: 0,
      hasVariant: true,
      hasDifferentVariantPrice: true,
      weight: 0.8
    },
    {
      id: "b19c3894-fc54-423f-b582-363ccb5974a4",
      name: 'Sling Single Compartment (Gaia/Cinnamon)',
      slug: 'sling-single-compartment',
      description: 's',
      images: ['/dummy/product5.jpg'],
      stock: 10,
      price: 345000,
      rating: 0,
      numReviews: 0,
      hasVariant: true,
      weight: 0.7
    },
  ],
  variant: [
    {
      id: '09b5e768-8f14-4281-ac40-d677b51903ed',
      productId: "12114520-e75f-465b-84c2-98bc70d8ca0f",
      name: "Hazel",
      image: '/dummy/product2var1.webp',
      stock: 20,
      price: 300000
    },
    {
      id: '50a66dbe-7c0b-443a-91e9-f01808819083',
      productId: "12114520-e75f-465b-84c2-98bc70d8ca0f",
      name: "Zenia",
      image: '/dummy/product2var2.jpeg',
      stock: 10,
      price: 350000
    }

  ]
}