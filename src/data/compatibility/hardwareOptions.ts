export interface HardwareOption {
  label: string;
  category: string;
  isPopular?: boolean;
}

export const POPULAR_CPUS: HardwareOption[] = [
  // AMD Ryzen Laptops (incluyendo series U y H/HX)
  { label: 'AMD Ryzen 5 3500U', category: 'AMD Laptop (U-Series)' },
  { label: 'AMD Ryzen 7 3700U', category: 'AMD Laptop (U-Series)' },
  { label: 'AMD Ryzen 3 3200U', category: 'AMD Laptop (U-Series)' },
  { label: 'AMD Ryzen 5 4500U', category: 'AMD Laptop (U-Series)' },
  { label: 'AMD Ryzen 7 4700U', category: 'AMD Laptop (U-Series)' },
  { label: 'AMD Ryzen 5 5500U', category: 'AMD Laptop (U-Series)' },
  { label: 'AMD Ryzen 7 5700U', category: 'AMD Laptop (U-Series)' },
  { label: 'AMD Ryzen 5 5600H', category: 'AMD Laptop (H-Gaming)' },
  { label: 'AMD Ryzen 7 5800H', category: 'AMD Laptop (H-Gaming)' },
  { label: 'AMD Ryzen 7 6800H', category: 'AMD Laptop (H-Gaming)' },
  { label: 'AMD Ryzen 7 7735HS', category: 'AMD Laptop (HS/HX)' },
  { label: 'AMD Ryzen 7 7840HS', category: 'AMD Laptop (HS/HX)' },
  { label: 'AMD Ryzen 9 7940HS / 7945HX', category: 'AMD Laptop (HS/HX)' },
  { label: 'AMD Ryzen 7 8845HS', category: 'AMD Laptop (HS/HX)' },

  // AMD Ryzen Desktop (7000 / 8000 / 9000 / 5000)
  { label: 'AMD Ryzen 7 7800X3D', category: 'AMD Ryzen 7000 Desktop', isPopular: true },
  { label: 'AMD Ryzen 7 5800X3D', category: 'AMD Ryzen 5000 Desktop', isPopular: true },
  { label: 'AMD Ryzen 5 7600X / 7600', category: 'AMD Ryzen 7000 Desktop', isPopular: true },
  { label: 'AMD Ryzen 7 7700X / 7700', category: 'AMD Ryzen 7000 Desktop' },
  { label: 'AMD Ryzen 9 7950X3D / 7950X', category: 'AMD Ryzen 7000 Desktop' },
  { label: 'AMD Ryzen 7 9700X / 9800X3D', category: 'AMD Ryzen 9000 Desktop' },
  { label: 'AMD Ryzen 5 5600X / 5600', category: 'AMD Ryzen 5000 Desktop', isPopular: true },
  { label: 'AMD Ryzen 7 5700X / 5800X', category: 'AMD Ryzen 5000 Desktop' },
  { label: 'AMD Ryzen 9 5900X / 5950X', category: 'AMD Ryzen 5000 Desktop' },
  { label: 'AMD Ryzen 5 3600 / 3600X', category: 'AMD Ryzen 3000 Desktop' },
  { label: 'AMD Ryzen 7 3700X / 3800X', category: 'AMD Ryzen 3000 Desktop' },
  { label: 'AMD Ryzen 5 2600 / 1600', category: 'AMD Ryzen 1000/2000 Desktop' },

  // Intel Core Desktop (12th, 13th, 14th Gen & Ultra)
  { label: 'Intel Core i7-14700K / 14700KF', category: 'Intel 14th Gen Desktop', isPopular: true },
  { label: 'Intel Core i7-13700K / 13700KF', category: 'Intel 13th Gen Desktop', isPopular: true },
  { label: 'Intel Core i5-13600K / 13600KF', category: 'Intel 13th Gen Desktop', isPopular: true },
  { label: 'Intel Core i5-14600K / 14600KF', category: 'Intel 14th Gen Desktop' },
  { label: 'Intel Core i9-14900K / 13900K', category: 'Intel 13th/14th Gen Desktop' },
  { label: 'Intel Core i5-12600K / 12600KF', category: 'Intel 12th Gen Desktop' },
  { label: 'Intel Core i5-12400 / 12400F', category: 'Intel 12th Gen Desktop', isPopular: true },
  { label: 'Intel Core i7-12700K / 12700KF', category: 'Intel 12th Gen Desktop' },
  { label: 'Intel Core Ultra 7 265K / Ultra 9 285K', category: 'Intel Core Ultra' },

  // Intel Core Laptops (H / HX / U-Series)
  { label: 'Intel Core i7-13700H / 13700HX', category: 'Intel Laptop Gaming (H/HX)', isPopular: true },
  { label: 'Intel Core i5-13500H / 12500H', category: 'Intel Laptop Gaming (H/HX)' },
  { label: 'Intel Core i7-12700H / 12800HX', category: 'Intel Laptop Gaming (H/HX)' },
  { label: 'Intel Core i9-13900HX / 14900HX', category: 'Intel Laptop Gaming (H/HX)' },
  { label: 'Intel Core Ultra 7 155H / Ultra 9 185H', category: 'Intel Core Ultra Laptop' },
  { label: 'Intel Core i5-1135G7 / i7-1165G7', category: 'Intel Laptop U-Series' },
  { label: 'Intel Core i5-10210U / i7-10510U', category: 'Intel Laptop U-Series' },
  { label: 'Intel Core i5-8250U / i7-8550U', category: 'Intel Laptop U-Series' },

  // Intel Core Generaciones Anteriores (Desktop)
  { label: 'Intel Core i5-11400 / 10400', category: 'Intel 10th/11th Gen' },
  { label: 'Intel Core i7-10700K / 11700K', category: 'Intel 10th/11th Gen' },
  { label: 'Intel Core i7-9700K / i5-9400F', category: 'Intel 9th Gen' },
  { label: 'Intel Core i7-8700K / i7-7700K', category: 'Intel 7th/8th Gen' },
  { label: 'Intel Core i5-7400 / i5-6500', category: 'Intel 6th/7th Gen' }
];

export const POPULAR_GPUS: HardwareOption[] = [
  // NVIDIA RTX 40 Series
  { label: 'NVIDIA GeForce RTX 4090', category: 'NVIDIA RTX 40 Series' },
  { label: 'NVIDIA GeForce RTX 4080 SUPER / 4080', category: 'NVIDIA RTX 40 Series' },
  { label: 'NVIDIA GeForce RTX 4070 Ti SUPER / 4070 Ti', category: 'NVIDIA RTX 40 Series' },
  { label: 'NVIDIA GeForce RTX 4070 SUPER / 4070', category: 'NVIDIA RTX 40 Series', isPopular: true },
  { label: 'NVIDIA GeForce RTX 4060 Ti', category: 'NVIDIA RTX 40 Series', isPopular: true },
  { label: 'NVIDIA GeForce RTX 4060 (Desktop)', category: 'NVIDIA RTX 40 Series', isPopular: true },
  { label: 'NVIDIA GeForce RTX 4060 Laptop GPU', category: 'NVIDIA Laptop RTX 40', isPopular: true },
  { label: 'NVIDIA GeForce RTX 4050 Laptop GPU', category: 'NVIDIA Laptop RTX 40', isPopular: true },

  // NVIDIA RTX 30 Series
  { label: 'NVIDIA GeForce RTX 3080 / 3080 Ti', category: 'NVIDIA RTX 30 Series' },
  { label: 'NVIDIA GeForce RTX 3070 / 3070 Ti', category: 'NVIDIA RTX 30 Series', isPopular: true },
  { label: 'NVIDIA GeForce RTX 3060 Ti', category: 'NVIDIA RTX 30 Series', isPopular: true },
  { label: 'NVIDIA GeForce RTX 3060 (Desktop/Laptop)', category: 'NVIDIA RTX 30 Series', isPopular: true },
  { label: 'NVIDIA GeForce RTX 3050 (Desktop/Laptop)', category: 'NVIDIA RTX 30 Series' },

  // NVIDIA RTX 20 & GTX Series
  { label: 'NVIDIA GeForce RTX 2060 / 2060 Super', category: 'NVIDIA RTX 20 Series' },
  { label: 'NVIDIA GeForce RTX 2070 / 2080', category: 'NVIDIA RTX 20 Series' },
  { label: 'NVIDIA GeForce GTX 1660 Super / Ti', category: 'NVIDIA GTX Series' },
  { label: 'NVIDIA GeForce GTX 1060 (6GB / 3GB)', category: 'NVIDIA GTX Series' },
  { label: 'NVIDIA GeForce GTX 1050 Ti', category: 'NVIDIA GTX Series' },

  // AMD Radeon Series
  { label: 'AMD Radeon RX 7900 XTX / 7900 XT', category: 'AMD Radeon RX 7000' },
  { label: 'AMD Radeon RX 7800 XT / 7700 XT', category: 'AMD Radeon RX 7000', isPopular: true },
  { label: 'AMD Radeon RX 7600 / 7600 XT', category: 'AMD Radeon RX 7000', isPopular: true },
  { label: 'AMD Radeon RX 6900 XT / 6800 XT', category: 'AMD Radeon RX 6000' },
  { label: 'AMD Radeon RX 6700 XT / 6750 XT', category: 'AMD Radeon RX 6000', isPopular: true },
  { label: 'AMD Radeon RX 6600 / 6600 XT', category: 'AMD Radeon RX 6000' },
  { label: 'AMD Radeon RX 580 / 570', category: 'AMD Radeon RX 500' },

  // Gráficas Integradas
  { label: 'AMD Radeon Vega 8 (Ryzen 3500U / 2500U)', category: 'Gráficos Integrados (iGPU)' },
  { label: 'AMD Radeon 680M / 780M / 890M', category: 'Gráficos Integrados (iGPU)' },
  { label: 'Intel Iris Xe Graphics', category: 'Gráficos Integrados (iGPU)' },
  { label: 'Intel UHD Graphics 620 / 630 / 770', category: 'Gráficos Integrados (iGPU)' }
];
