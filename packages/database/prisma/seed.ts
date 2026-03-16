import { config } from "dotenv";
import { resolve } from "path";

// Load .env from the monorepo root
config({ path: resolve(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── High-quality Unsplash bike images ─────────────────────────────────
const IMAGES = {
  road: [
    "https://images.unsplash.com/photo-1656166295713-f616617cf261?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601536564038-825eef50efc5?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1562409211-d16682be4c48?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591549915159-31e15700c708?q=80&w=1600&auto=format&fit=crop",
  ],
  gravel: [
    "https://images.unsplash.com/photo-1684936505930-d8cc0d9f3896?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606075015184-ca2c3d2992db?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1690957388018-f7f45098f659?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1617660118159-c1c58acd2904?q=80&w=1600&auto=format&fit=crop",
  ],
  mountain: [
    "https://images.unsplash.com/photo-1635126039432-1742dbb90506?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535369643553-a33e0d1ac81d?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1435226148432-67c26cc5cbaf?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1609976969605-5d9bf2cb246c?q=80&w=1600&auto=format&fit=crop",
  ],
  electric: [
    "https://images.unsplash.com/photo-1624865162000-4d6cd5e2c242?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622598473264-81a98f1c7be5?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618987688327-dc0b28888fe4?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1628591087564-d18c07cb7bfc?q=80&w=1600&auto=format&fit=crop",
  ],
};

async function main() {
  console.log("🚲 Seeding Professional Canyon-style bicycle data...\n");

  // Clean existing data
  await prisma.configuratorOption.deleteMany();
  await prisma.configuratorCategory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // ─── Categories ─────────────────────────────────────────────────────────
  const road = await prisma.category.create({
    data: { name: "Road", slug: "road", description: "Engineered for speed on tarmac. Aerodynamic frames, lightweight carbon, and race-ready geometry." },
  });
  const gravel = await prisma.category.create({
    data: { name: "Gravel", slug: "gravel", description: "Built for adventure beyond the pavement. Versatile geometry for mixed terrain." },
  });
  const mountain = await prisma.category.create({
    data: { name: "Mountain", slug: "mountain", description: "Dominate any trail. Full-suspension and hardtail options for every riding style." },
  });
  const electric = await prisma.category.create({
    data: { name: "Electric", slug: "electric", description: "Amplified performance with cutting-edge motor technology. Ride further, faster." },
  });

  console.log("✅ Categories created\n");

  // ─── Products ───────────────────────────────────────────────────────────
  const products = [
    // ── Road Bikes ──
    {
      name: "Aeroad CFR",
      slug: "aeroad-cfr",
      description: "The ultimate aero road bike. CFR-grade carbon delivers a frame weight of just 780g. Wind tunnel tested, World Tour proven.",
      categoryId: road.id,
      isFeatured: true,
      variants: [
        { sku: "AERO-CFR-BLK-S", name: "Stealth Black", price: 8999, color: "Stealth Black", size: "S", weight: 6.9, img: IMAGES.road[0] },
        { sku: "AERO-CFR-WHT-M", name: "Polar White", price: 9299, color: "Polar White", size: "M", weight: 7.1, img: IMAGES.road[1] },
      ],
      specs: [
        { group: "Frame", name: "Frame Material", value: "CFR Carbon (780g)" },
        { group: "Drivetrain", name: "Groupset", value: "SRAM RED AXS 12-speed" },
        { group: "Wheels", name: "Wheelset", value: "Zipp 404 Firecrest" },
      ],
      config: [
        {
          name: "Frame Color",
          options: [
            { name: "Stealth Black", price: 0, image: IMAGES.road[0] },
            { name: "Polar White", price: 300, image: IMAGES.road[1] },
            { name: "Racing Red", price: 500, image: IMAGES.road[2] },
          ]
        },
        {
          name: "Wheelset",
          options: [
            { name: "DT Swiss ARC 1400", price: 0 },
            { name: "Zipp 404 Firecrest", price: 800 },
            { name: "Zipp 808 Firecrest", price: 1400 },
          ]
        },
        {
          name: "Groupset",
          options: [
            { name: "Shimano Ultegra Di2", price: 0 },
            { name: "Shimano Dura-Ace Di2", price: 1500 },
            { name: "SRAM RED AXS", price: 1800 },
          ]
        }
      ]
    },
    {
      name: "Ultimate CF SLX",
      slug: "ultimate-cf-slx",
      description: "The purest climbing bike. Featherweight CF SLX carbon frame engineered for maximum stiffness-to-weight ratio.",
      categoryId: road.id,
      isFeatured: true,
      variants: [
        { sku: "ULT-SLX-BLK-S", name: "Carbon Black", price: 6499, color: "Carbon Black", size: "S", weight: 6.5, img: IMAGES.road[1] },
      ],
      specs: [
        { group: "Frame", name: "Frame Material", value: "CF SLX Carbon (820g)" },
        { group: "Drivetrain", name: "Groupset", value: "Shimano Dura-Ace Di2" },
      ],
      config: [
        {
          name: "Frame Color",
          options: [
            { name: "Carbon Black", price: 0, image: IMAGES.road[1] },
            { name: "Infrared", price: 200, image: IMAGES.road[2] },
          ]
        },
        {
          name: "Wheelset",
          options: [
            { name: "DT Swiss PRC 1400", price: 0 },
            { name: "Lightweight Meilenstein", price: 3500 },
          ]
        }
      ]
    },
    {
        name: "Speedmax CF",
        slug: "speedmax-cf",
        description: "Time trial and triathlon weapon. Extreme aerodynamics meet integrated storage solutions.",
        categoryId: road.id,
        isFeatured: false,
        variants: [
          { sku: "SPD-CF-BLK-M", name: "Stealth", price: 5499, color: "Stealth", size: "M", weight: 8.4, img: IMAGES.road[2] },
        ],
        specs: [
          { group: "Frame", name: "Frame Material", value: "CF Carbon, TT-specific" },
        ],
        config: [
          {
            name: "Aerobar Setup",
            options: [
              { name: "Standard Extensions", price: 0 },
              { name: "Pro Carbon Mono-Grip", price: 600 },
            ]
          },
          {
            name: "Hydration System",
            options: [
              { name: "Front Bottle Only", price: 0 },
              { name: "Integrated Frame Reservoir", price: 250 },
            ]
          }
        ]
    },
    {
        name: "Endurace CF SL",
        slug: "endurace-cf-sl",
        description: "Endurance road bike for riders who demand comfort without sacrificing speed.",
        categoryId: road.id,
        isFeatured: false,
        variants: [
          { sku: "END-SL-BLK-M", name: "Desert Grey", price: 3999, color: "Desert Grey", size: "M", weight: 7.8, img: IMAGES.road[3] },
        ],
        specs: [
          { group: "Frame", name: "Frame Material", value: "CF SL Carbon" },
        ],
        config: [
          {
            name: "Seatpost",
            options: [
              { name: "Canyon SP0042 CF", price: 0 },
              { name: "VCLS 2.0 Vibration Absorbing", price: 250 },
            ]
          }
        ]
    },

    // ── Gravel Bikes ──
    {
      name: "Grail CF SLX",
      slug: "grail-cf-slx",
      description: "The gravel race bike redefined. Double-decker handlebar design for superior control.",
      categoryId: gravel.id,
      isFeatured: true,
      variants: [
        { sku: "GRL-SLX-GRN-M", name: "Forest Green", price: 5999, color: "Forest Green", size: "M", weight: 7.6, img: IMAGES.gravel[0] },
      ],
      specs: [
        { group: "Frame", name: "Frame Material", value: "CF SLX Carbon" },
      ],
      config: [
        {
          name: "Cockpit Type",
          options: [
            { name: "Grail CP0018 Hoverbar", price: 0 },
            { name: "Race-Flat Integrated Bar", price: 150 },
          ]
        },
        {
          name: "Tires",
          options: [
            { name: "Schwalbe G-One Allround 40mm", price: 0 },
            { name: "Schwalbe G-One Bite 45mm", price: 40 },
          ]
        }
      ]
    },
    {
        name: "Grizl CF SL",
        slug: "grizl-cf-sl",
        description: "The ultimate bikepacking gravel bike. Built for multi-day adventures.",
        categoryId: gravel.id,
        isFeatured: false,
        variants: [
          { sku: "GRZ-SL-SND-M", name: "Sand Storm", price: 4299, color: "Sand Storm", size: "M", weight: 8.8, img: IMAGES.gravel[1] },
        ],
        specs: [
          { group: "Frame", name: "Frame Material", value: "CF SL Carbon" },
        ],
        config: [
          {
            name: "Bikepacking Kit",
            options: [
              { name: "None", price: 0 },
              { name: "Apidura X Canyon Full Set", price: 450 },
              { name: "Fender & Rack Mounts", price: 80 },
            ]
          }
        ]
    },
    {
        name: "Grail AL",
        slug: "grail-al",
        description: "All the Grail performance DNA in an accessible aluminium package.",
        categoryId: gravel.id,
        isFeatured: false,
        variants: [
          { sku: "GRL-AL-BLU-M", name: "Deep Blue", price: 1999, color: "Deep Blue", size: "M", weight: 9.2, img: IMAGES.gravel[2] },
        ],
        specs: [
          { group: "Frame", name: "Frame Material", value: "6061 Aluminium" },
        ],
        config: [
            {
              name: "Pedals",
              options: [
                { name: "Flat VP Components", price: 0 },
                { name: "Shimano XT SPD", price: 120 },
              ]
            }
        ]
    },
    {
        name: "Grizl AL",
        slug: "grizl-al",
        description: "Adventure-ready aluminium gravel bike. Designed to carry you and your gear across continents.",
        categoryId: gravel.id,
        isFeatured: false,
        variants: [
          { sku: "GRZ-AL-OLV-M", name: "Olive Grey", price: 1699, color: "Olive Grey", size: "M", weight: 10.2, img: IMAGES.gravel[3] },
        ],
        specs: [
          { group: "Frame", name: "Frame Material", value: "6061 Aluminium" },
        ],
        config: [
            {
              name: "Fork Option",
              options: [
                { name: "Canyon Carbon Adventure", price: 0 },
                { name: "Rudy RockShox Suspension Fork", price: 600 },
              ]
            }
        ]
    },

    // ── Mountain Bikes ──
    {
      name: "Spectral CF",
      slug: "spectral-cf",
      description: "All-mountain trail weapon. 150mm of perfectly tuned suspension.",
      categoryId: mountain.id,
      isFeatured: true,
      variants: [
        { sku: "SPC-CF-BLK-M", name: "Undyed Black", price: 5499, color: "Undyed Black", size: "M", weight: 13.5, img: IMAGES.mountain[0] },
      ],
      specs: [
        { group: "Suspension", name: "Fork", value: "Fox 36 Float Factory, 150mm" },
      ],
      config: [
        {
          name: "Suspension Package",
          options: [
            { name: "Fox Performance Elite", price: 0 },
            { name: "Fox Factory (Kashima)", price: 900 },
            { name: "RockShox Flight Attendant", price: 1800 },
          ]
        },
        {
            name: "Brakes",
            options: [
              { name: "SRAM Code R", price: 0 },
              { name: "Shimano XTR 4-Piston", price: 400 },
            ]
        }
      ]
    },
    {
        name: "Strive CFR",
        slug: "strive-cfr",
        description: "Purpose-built enduro race bike. Shapeshifter technology switches between climb and descend modes.",
        categoryId: mountain.id,
        isFeatured: false,
        variants: [
          { sku: "STR-CFR-BLK-M", name: "Stealth", price: 7999, color: "Stealth", size: "M", weight: 14.2, img: IMAGES.mountain[1] },
        ],
        specs: [
          { group: "Frame", name: "Frame Material", value: "CFR Carbon w/ Shapeshifter" },
        ],
        config: [
          {
            name: "Wheel Setup",
            options: [
              { name: "Full 29er DT Swiss", price: 0 },
              { name: "Mullet (29F/27.5R)", price: 100 },
            ]
          }
        ]
    },
    {
        name: "Neuron CF",
        slug: "neuron-cf",
        description: "The do-it-all trail bike. 130mm of plush suspension in a lightweight carbon frame.",
        categoryId: mountain.id,
        isFeatured: false,
        variants: [
          { sku: "NEU-CF-GRY-M", name: "Lunar Grey", price: 3999, color: "Lunar Grey", size: "M", weight: 12.8, img: IMAGES.mountain[2] },
        ],
        specs: [
          { group: "Frame", name: "Frame Material", value: "CF Carbon" },
        ],
        config: [
            {
              name: "Tires",
              options: [
                { name: "Maxxis Forekaster", price: 0 },
                { name: "Schwalbe Nobby Nic", price: 20 },
              ]
            }
        ]
    },
    {
        name: "Lux World Cup",
        slug: "lux-world-cup",
        description: "Cross-country race bike at the pinnacle. Designed for XC World Cup racing.",
        categoryId: mountain.id,
        isFeatured: false,
        variants: [
          { sku: "LUX-WC-BLK-M", name: "Factory Racing", price: 9999, color: "Factory Racing", size: "M", weight: 9.6, img: IMAGES.mountain[3] },
        ],
        specs: [
          { group: "Weight", name: "Total Weight", value: "9.6 kg" },
        ],
        config: [
            {
              name: "Dropper Post",
              options: [
                { name: "None (Carbon Seatpost)", price: 0 },
                { name: "RockShox Reverb AXS", price: 750 },
              ]
            }
        ]
    },

    // ── Electric Bikes ──
    {
      name: "Neuron:ONfly",
      slug: "neuron-onfly",
      description: "The lightest electric mountain bike ever made. Bosch SX motor weighing just 2kg with 55Nm.",
      categoryId: electric.id,
      isFeatured: true,
      variants: [
        { sku: "NON-FLY-BLK-M", name: "Shadow Black", price: 5999, color: "Shadow Black", size: "M", weight: 17.5, img: IMAGES.electric[0] },
      ],
      specs: [
        { group: "Motor", name: "Motor", value: "Bosch Performance Line SX" },
      ],
      config: [
        {
          name: "Battery Upgrade",
          options: [
            { name: "Bosch PowerTube 400Wh", price: 0 },
            { name: "Bosch PowerTube 600Wh", price: 400 },
          ]
        },
        {
          name: "Display",
          options: [
            { name: "Internal Top Tube LED", price: 0 },
            { name: "Kiox 300 Handlebar Mount", price: 150 },
          ]
        }
      ]
    },
    {
        name: "Spectral:ON",
        slug: "spectral-on",
        description: "Full-power electric enduro. Bosch CX motor with 85Nm torque and 750Wh battery.",
        categoryId: electric.id,
        isFeatured: false,
        variants: [
          { sku: "SPC-ON-BLK-M", name: "Carbon Black", price: 7499, color: "Carbon Black", size: "M", weight: 22.5, img: IMAGES.electric[1] },
        ],
        specs: [
          { group: "Motor", name: "Motor", value: "Bosch Performance Line CX" },
        ],
        config: [
            {
              name: "Charger",
              options: [
                { name: "Standard 2A Charger", price: 0 },
                { name: "Fast 6A Charger", price: 120 },
              ]
            }
        ]
    },
    {
        name: "Pathlite:ON",
        slug: "pathlite-on",
        description: "Premium electric touring bike for urban commutes and weekend adventures.",
        categoryId: electric.id,
        isFeatured: false,
        variants: [
          { sku: "PTH-ON-SLV-M", name: "Silver Grey", price: 3999, color: "Silver Grey", size: "M", weight: 24.5, img: IMAGES.electric[2] },
        ],
        specs: [
          { group: "Motor", name: "Motor", value: "Bosch Performance Line CX" },
        ],
        config: [
            {
              name: "Accessories",
              options: [
                { name: "Standard Rear Rack", price: 0 },
                { name: "Canyon Pannier Set", price: 180 },
              ]
            }
        ]
    },
    {
        name: "Endurace:ON",
        slug: "endurace-on",
        description: "The world's lightest electric road bike. Fazua Ride 60 motor system.",
        categoryId: electric.id,
        isFeatured: false,
        variants: [
          { sku: "END-ON-BLK-M", name: "Stealth", price: 6499, color: "Stealth", size: "M", weight: 12.9, img: IMAGES.electric[3] },
        ],
        specs: [
          { group: "Motor", name: "Motor", value: "Fazua Ride 60" },
        ],
        config: [
            {
              name: "Groupset",
              options: [
                { name: "Shimano 105 Di2", price: 0 },
                { name: "Shimano Ultegra Di2", price: 1200 },
              ]
            }
        ]
    },
  ];

  for (const prod of products) {
    const product = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        categoryId: prod.categoryId,
        isFeatured: prod.isFeatured,
      },
    });

    // Create Configurator Options
    if (prod.config) {
        for (const cat of prod.config) {
            await prisma.configuratorCategory.create({
                data: {
                    name: cat.name,
                    productId: product.id,
                    options: {
                        create: cat.options.map(opt => ({
                            name: opt.name,
                            price: opt.price,
                            image: (opt as any).image || null,
                        }))
                    }
                }
            });
        }
    }

    // Create variants with images and inventory
    for (const v of prod.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          color: v.color,
          size: v.size,
          weight: v.weight,
        },
      });

      // Image
      await prisma.productImage.create({
        data: {
          url: v.img!,
          alt: `${prod.name} - ${v.color}`,
          isPrimary: true,
          productVariantId: variant.id,
        },
      });

      // Inventory
      await prisma.inventory.create({
        data: {
          productVariantId: variant.id,
          quantity: Math.floor(Math.random() * 46) + 5, // 5-50
          reserved: 0,
        },
      });
    }

    // Specifications
    for (const spec of prod.specs) {
      await prisma.productSpecification.create({
        data: {
          productId: product.id,
          group: spec.group,
          name: spec.name,
          value: spec.value,
        },
      });
    }

    console.log(`  ✅ ${prod.name} (+Config)`);
  }

  // ─── Dealers ───────────────────────────────────────────────────────────
  console.log("\n📍 Seeding Dealers...");
  const dealers = [
    {
      name: "Canyon Factory Service",
      address: "Karl-Tesche-Straße 12",
      city: "Koblenz",
      state: "RP",
      country: "Germany",
      zipCode: "56073",
      latitude: 50.3601,
      longitude: 7.5889,
      phone: "+49 261 404000",
      email: "service@canyon.com",
    },
    {
      name: "Canyon US Experience Center",
      address: "5600 El Camino Real",
      city: "Carlsbad",
      state: "CA",
      country: "USA",
      zipCode: "92008",
      latitude: 33.1284,
      longitude: -117.3118,
      phone: "(833) 226-9661",
      email: "us-service@canyon.com",
    },
    {
      name: "Premium Velo Partner - NYC",
      address: "123 Hudson St",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10013",
      latitude: 40.7208,
      longitude: -74.0071,
      phone: "(212) 555-0198",
      email: "nyc@premiumvelo.com",
    },
    {
      name: "London Cycle Hub",
      address: "24 Old Brompton Rd",
      city: "London",
      state: "London",
      country: "UK",
      zipCode: "SW7 3DL",
      latitude: 51.4934,
      longitude: -0.1764,
      phone: "+44 20 7581 1234",
    }
  ];

  for (const dealer of dealers) {
    await prisma.dealer.create({ data: dealer });
  }

  console.log(`✅ Seeded ${dealers.length} Dealers!`);

  console.log(`\n🎉 Seeded ${products.length} products with unique dynamic configurators!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
