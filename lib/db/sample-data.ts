import { hashSync } from "bcrypt-ts-edge";

export const sample = {
  user: [
    {
      id: "74c862cd-fdf0-459b-b708-cf9b519610bc",
      name: "Daniel Evan Khalfany",
      email: "danielevan454@gmail.com",
      emailVerified: new Date(),
      image:
        "https://files.edgestore.dev/oarjw1imrdwjxrmm/publicImages/_public/48a5d876-6854-49fd-b291-8facea934eed.jpeg",
      password: hashSync("daniel123456", 10),
      role: "admin",
      address: {
        province: "BANTEN",
        city: "KABUPATEN TANGERANG",
        district: "PASARKEMIS",
        village: "KUTA BUMI",
        address: "Taman Kutabumi Blok D 10 no. 25",
        postalCode: "15561",
      },
      phone: "+6281297496456",
    },
    {
      id: "0ac83e61-9b27-46dc-b714-71f058e456da",
      name: "Leovieni Arzella",
      email: "leovieni@gmail.com",
      emailVerified: new Date(),
      password: hashSync("leovieni123456", 10),
      role: "user",
      address: {
        province: "Jawa Barat",
        city: "Bekasi",
        district: "Medan Satria",
        village: "Harapan Indah",
        address: "Jl. Alamandah Indah VI Blok QE no. 09",
        postalCode: "17133",
      },
      phone: "+6281280876039",
    },
  ],
  category: [
    {
      id: "e827dd23-8c59-4360-bcd7-147e3d5a5224",
      name: "Gabag Mom",
      image: "/dummy/mom-banner.png",
    },
    {
      id: "6329a950-5652-476d-94c6-7a73381936a5",
      name: "Gabag Beauty",
      image: "/dummy/beauty.png",
    },
    {
      id: "4bea0680-9151-4372-9b5d-b8dc0f9e77b8",
      name: "Gabag Kids",
      image: "/dummy/kids.png",
    },
  ],
  subCategory: [
    {
      id: "bc6d6369-1dac-465f-987d-b75e806275ca",
      name: "Fashion",
      discount: 20,
      image: "/dummy/category1.webp",
      categoryId: "e827dd23-8c59-4360-bcd7-147e3d5a5224",
    },
    {
      id: "de8e1345-65d7-42fc-b484-a763ce7e2c48",
      name: "Breast Pump",
      discount: 20,
      image: "/dummy/category2.webp",
      categoryId: "e827dd23-8c59-4360-bcd7-147e3d5a5224",
    },
    {
      id: "3d4761d8-087a-4022-974c-59fe60cda9dd",
      name: "Cooler Bag",
      discount: 20,
      image: "/dummy/category3.webp",
      categoryId: "e827dd23-8c59-4360-bcd7-147e3d5a5224",
    },
    {
      id: "bd82d0f5-1204-4461-a7d2-426ca695d49d",
      name: "Accessories",
      discount: 20,
      image: "/dummy/category4.webp",
      categoryId: "e827dd23-8c59-4360-bcd7-147e3d5a5224",
    },
    {
      id: "389ee9dc-20b2-43ee-9a54-6e40cd121bda",
      name: "Beauty",
      discount: 20,
      image: "/dummy/category5.webp",
      categoryId: "6329a950-5652-476d-94c6-7a73381936a5",
    },
    {
      id: "9537e064-99f0-4b9d-b694-5b6210754498",
      name: "Backpack Kids",
      image: "/dummy/category6.png",
      categoryId: "4bea0680-9151-4372-9b5d-b8dc0f9e77b8",
    },
    {
      id: "6ceac266-1fd3-4a4e-ad37-54f1ea3a96a6",
      name: "Lunch Bag Kids",
      image: "/dummy/category7.webp",
      categoryId: "4bea0680-9151-4372-9b5d-b8dc0f9e77b8",
    },
  ],
  product: [
    {
      id: "d0e1028e-d972-4b8b-9f23-6617b2f08ffe",
      name: "Stretch Mark Serum",
      slug: "stretch-mark-serum",
      images: ["/dummy/product1.webp"],
      stock: 100,
      regularPrice: 259000,
      weight: 0.8,
      subCategoryId: "389ee9dc-20b2-43ee-9a54-6e40cd121bda",
      description: `
        GabaG Beauty - Stretch Mark Serum Essence - Memudarkan Dalam 28 Hari | Stretchmark ibu hamil | BPOM

        Memudarkan Stretch Mark dalam 28 Hari

        GabaG Beauty - Stretch Mark Serum Essence - Memudarkan Stretchmark Dalam 28 Hari - Skincare Aman Ibu Hamil dan Menyusui BPOM Halal

        Kenapa pilih GabaG Beauty Stretch Mark Serum Essence - dengan DERMAROLLER ? 

        ESSENCE YANG MENGHIDRASI, SERUM DENGAN MENGOPTIMALKAN.


        Keunggulan dan Manfaat  Stretch Mark Serum Essence GabaG  : 

        - Mengandung bahan aktif vitamin E terbaik dengan tingkat konsentrasi lebih tinggi lebih  cepat dan efektif melembapkan dan memperbaiki regenerasi sel kulit. 

        - Mencegah timbulnya stretchmark dan membuat stretch mark terbukti memudar dalam 28 hari ! 

        - Kulit tampak lebih sehat dan cerah.

        - efektif melembapkan kulit dan mencegah terjadinya stretchmark 

        - Mengencangkan & memperkuat elastisitas kulit secara maksimal. 

        - ⁠formula ESSENCE SERUM memudarkan stretchmark dalam 28 hari

        - ⁠wangi yg menenangkan

        - ⁠dilengkapi DERMAROLLER yg membantu regenerasi kulit lebih cepat.

        - ⁠halal dan aman untuk remaja, ibu hamil dan menyusui. 

        - ⁠BPOM registered  : NA18230104995

        - isi 100ml



        Hero Ingridient : 

        - Shea Butter > antioksidan yg mencegah kerusakan kulit dari paparan radikal bebas

        - ⁠avocado oil > penghalang lipid, menutrisi dan melembapkan kulit

        - ⁠high vitamin E > membantu pembentukan kolagen, hingga meningkatkan kelembapan dan elastisitas kulit, memperbaiki kerusakan epidermis kulit



        #stretchmark #memudarkanstretchmark

        #mencegahstretchmark

        #stretchmarkserumgabag
      `,
    },
    {
      id: "eedda1db-e4a6-4470-96cb-f191fe460bbe",
      name: "Thermal Bag Executive Petunia",
      slug: "thermal-bag-executive-petunia",
      images: ["/dummy/product3.jpg"],
      stock: 78,
      regularPrice: 549000,
      discount: 24,
      weight: 0.7,
      subCategoryId: "3d4761d8-087a-4022-974c-59fe60cda9dd",
      description: `
        Gabag - Tas Asi - Coolerbag - Thermal Bag - Executive Petunia

        untuk tas custom nama, bisa di sku Gabag - Thermal Bag - Cooler Bag - Custom Nama (Produk Terpisah)


        Gabag Petunia Executive series dari Gabag dengan warna hitam dan di padukan dengan motif bunga pada bagian tali nya, sehingga bisa netral saat dipakai dengan warna pakaian yang bermotif/bercorak/polos. 

        - Cooler bag / thermal bag berada pada bagian bawah.

        - Coolerbag bisa di lepas pasang dari bagian atasnya/diaperbagnya.

        - Terdapat handle pada bagian atas tas agar memudahkan saat membawanya. 

        - Tersedia pocket samping serta tali panjang.

        - Capacity : 8-10 botol ukuran 100 ml

        - Dimensi : P. 30,5 cm x L. 16 cm x T. 39 cm (T. Cooler bag 15,5 cm)
      `,
    },
    {
      id: "12114520-e75f-465b-84c2-98bc70d8ca0f",
      name: "Backpack Cooler Bag 2 in 1 (Laptop Fit)",
      slug: "backpack-cooler-bag-2-in-1-laptop-fit",
      images: [
        "/dummy/product2.webp",
        "/dummy/product1.webp",
        "/dummy/product3.jpg",
        "/dummy/product4.jpeg",
        "/dummy/product5.jpg",
        "/dummy/product6.webp",
      ],
      discount: 30,
      hasVariant: true,
      weight: 0.5,
      subCategoryId: '3d4761d8-087a-4022-974c-59fe60cda9dd',
      description: `
        GabaG Tas Asi - Backpack Cooler Bag 2 in 1 Hazel / Zenia ( Laptop Fit) 

        - LAPISAN THERMAL BERKUALITAS DAN TEBAL

        - BAHAN FOOD GRADE DAN NON TOXIC

        - AMAN UNTUK BAWA ASI, BEKAL, MINUMAN, DLL



        untuk tas custom nama, bisa di sku berbeda ( chat admin terlebih dahulu) 



        Tersedia 2 Pilihan

        - Hazel

        - Zenia



        Gabag Backpack Series

        tas yang memiliki 2 fungsi sebagai cooler bag atau/dan diaper bag.

        Terdapat dua wadah utama: bawah untuk menyimpan asi (cooler bag), atas untuk menaruh

        keperluan si kecil seperti baju, popok, mainan dll sehingga bisa berfungsi menjadi diaper bag.

        muat notebook 11 inc dan memiliki detail kantong pada bagian depan,



        Dengan warna hijau dan perpaduan coklat pada gesper. Bisa membawa ASIP/MPASIP/Lunch box pada bagian cooler sekaligus perlengkapan lain pada bagian atas. Terdapat Luggage Slot pada bagian belakang.



        Features:

        -	Gratis 2 pcs ice gel besar yang dapat menahan dingin selama 20 jam dan panas selama 4 jam

        -	Model dan pilihan warna Gabag yang stylish, modern, serta praktis

        -	Model Ransel

        -	Memiliki kantong pada bagian depan, handle strap dan kompartemen bagian bawah tas

        -	Anti bocor

        -	Diaper bag size: Panjang 29 x Lebar 15 x Tinggi 25 cm

        -	Thermal bag size: Panjang 29 x Lebar 15 x Tinggi 10 cm

        -	Garansi 6 bulan (dari pembelian, garansi sleting dan jahitan)

        -	Muat 8 – 10 botol ukuran 100ml



        Isi Paket: 

        -	2 buah Ice Gel Pack 500gr

        -	1 buah tas cover
      `,
    },
    {
      id: "eabeef49-8f36-46dd-a24a-3574c0d4d105",
      name: "Backpack Sling Double Compartment",
      slug: "backpack-sling-double-compartment",
      images: ["/dummy/product4.jpeg"],
      hasVariant: true,
      weight: 0.6,
      subCategoryId: '3d4761d8-087a-4022-974c-59fe60cda9dd',
      description: `
      GabaG Tas Asi - Cooler Bag - Backpack Sling Double Compartment Ryu / Adina

      - LAPISAN THERMAL BERKUALITAS DAN TEBAL

      - BAHAN FOOD GRADE DAN NON TOXIC

      - AMAN UNTUK BAWA ASI, BEKAL, MINUMAN, DLL


      untuk tas custom nama, di SKU berbeda , bisa di sku Gabag - Thermal Bag - Cooler Bag - Custom Nama ( boleh chat admin)


      Ryu Gabag Backpack Series dan Adina Gabag Backpack Series

      Berikan kemudahan untuk membawa perlengkapan si kecil saat Anda bepergian dengan menggunakan tas berkualitas persembahan dari Gabag. Tas ini memiliki kapasitas muatan hingga 6 botol susu berukuran 100ml. Didalamnya terdapat dua buah ice gel. 

      Desainnya yang fungsional dan fashionable dapat Anda pakai dengan 3 style (RYU) , yakni cross body/menyilang, sling, backpack. 

      dan Adina dapat dipakai dengan 2 style yaitu backpack dan sling. 



      Dilengkapi berbagai saku/kantong tambahan, sehingga mudah bagi Anda untuk mengatur isi tas agar lebih rapi.

      Features:

      -	Gratis 2pcs ice gel besar yang dapat menahan dingin selama 20 jam dan panas selama 4 jam

      -	Model dan pilihan warna Gabag yang stylish, modern, serta praktis

      -	Model Sling Bag, Cross Body, dan Backpack ( RYU )

      -	Model Sling Bag dan Backpack (  ADINA )

      -	Anti bocor



      ukuran Ryu

      -	Diaper bag size: Panjang 26 x Lebar 15 x Tinggi 35 cm

      -	Thermal bag size: Panjang 26 x Lebar 15 x Tinggi 22 cm



      ukuran Adina

      -	Dimensi : P. 30 x L. 19 x T. 26 cm

      -	Garansi 6 bulan (dari pembelian, garansi sleting dan jahitan)

      -	Muat 6 - 8 botol ukuran 100ml



      Isi Paket:  

      -	2 buah Ice Gel Pack 500gr

      -	1 buah tas cover
      `,
    },
    {
      id: "b6c82fc0-1e4e-44b7-bc75-8fa842aeab3e",
      name: "Pombag",
      slug: "pombag",
      images: ["/dummy/product6.webp"],
      regularPrice: 100400,
      stock: 342,
      weight: 0.8,
      subCategoryId: '3d4761d8-087a-4022-974c-59fe60cda9dd',
      description: `
        Gabag - Pombag - Bag Penyimpanan Sparepart Breastpump

        Pombag 5 varian :

        - Pombag Gen 2 Canary

        - Pombag Gen 2 Dax

        - Pombag Charcoal 

        - Pombag sky kolibri 

        - Pombag Filo


        Kamu bisa lakukan FRIDGE HACK dengan POMP BAG, Moms!



        Lelah kan moms kalau harus steril corong, valve, diafragma setiap kali selesai pumping? Tenang aja, kini ada POMP BAG.



        Pomp Bag berguna untuk menyimpan peralatan pumping moms di kulkas selama 24 jam tanpa harus di sterilisasi lho moms, Ukurannya sangat lebar sehingga muat menyimpan untuk 2 set peralatan pumping. 

        - Terdapat wet sheet untuk mengeringkan dan menjaga peralatan tetap steril

        - Dilapisi oleh lapisan thermal by GabaG sehingga menjaga suhu tetap stabil dan terhindar dari pertumbuhan bakteri 

        -  Terdiri dari 2 compartement ( untuk memisahkan peralatan yg basah dan yg kering)

        - Foldable, bisa di lipat dan praktis, ga makan tempat.



        -Ukuran Pomp Bag saat terbuka: P 27,5 cm x L 1 cmx T 36,5 cm

        - Ukuran Pomp Bag saat terlipat : P 13 cm x L 4 cm x T 18,5 cm 



        Notes: Setelah 24 jam digunakan, peralatan pumping tetap harus di cuci & sterilisasi ya.
      `,
    },
    {
      id: "b19c3894-fc54-423f-b582-363ccb5974a4",
      name: "Sling Single Compartment (Gaia/Cinnamon)",
      slug: "sling-single-compartment",
      images: ["/dummy/product5.jpg"],
      stock: 49,
      discount: 14,
      regularPrice: 345000,
      weight: 0.7,
      subCategoryId: '3d4761d8-087a-4022-974c-59fe60cda9dd',
      description: `
      Cooler Bag ASI Gabag GAIA - single sling compartment- tas asi besar cocok untuk Pompa ASI Elektrik | tas bekal | tas bayi

        - LAPISAN THERMAL BERKUALITAS DAN TEBAL

        - BAHAN FOOD GRADE DAN NON TOXIC

        - AMAN UNTUK BAWA ASI, BEKAL, MINUMAN, DLL



        Tas GAIA dari GabaG merupakan cooler bag yang dapat dijadikan penyimpanan ASI atau lunch bag. variasi warna dan motif yang elegan dengan sentuhan bahan synthetic leather serta leakproof. 

        Cooler bag mempunyai lapisan thermal khusus yang dapat menjaga suhu dingin tetap stabil selama 20 jam dan hangat selama 4 jam.



        Dapat menyimpan 10 - 15 kantong ASI Ukuran 100ml

        Lapisan thermal anti bocor

        Dapat digunakan secara sling ataupun hand bag

        Bagian tali sling dapat di lepas pasang

        Bergaransi 6 bulan dari pembelian

        FREE 2 pcs ice gel ukuran 500gr 

        FREE Cover bag



        Ukuran tas: 

        25 cm x 15,5cm x 22cm
      `,
    },
  ],
  variant: [
    {
      id: "09b5e768-8f14-4281-ac40-d677b51903ed",
      productId: "12114520-e75f-465b-84c2-98bc70d8ca0f",
      name: "Hazel",
      image: "/dummy/product2var1.webp",
      stock: 50,
      regularPrice: 350000,
    },
    {
      id: "50a66dbe-7c0b-443a-91e9-f01808819083",
      productId: "12114520-e75f-465b-84c2-98bc70d8ca0f",
      name: "Zenia",
      image: "/dummy/product2var2.jpeg",
      stock: 78,
      regularPrice: 350000,
    },
    {
      id: "5eafe12c-fb06-4f1f-b605-e5d3f9ae1ab7",
      productId: "eabeef49-8f36-46dd-a24a-3574c0d4d105",
      name: "Ryu",
      image: "/dummy/product2var2.jpeg",
      stock: 78,
      regularPrice: 390000,
    },
    {
      id: "a90519d4-7320-4962-9465-94755b7f9bfe",
      productId: "eabeef49-8f36-46dd-a24a-3574c0d4d105",
      name: "Adina",
      image: "/dummy/product2var2.jpeg",
      stock: 78,
      regularPrice: 350000,
    },
  ],
};
