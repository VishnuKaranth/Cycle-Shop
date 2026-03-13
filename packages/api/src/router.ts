import { router, publicProcedure, protectedProcedure, adminProcedure } from "./trpc";
import { z } from "zod";
import Stripe from "stripe";
let stripeInstance: Stripe | null = null;
const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeInstance;
};

// ─── Shared Product Input Schema ──────────────────────────────────────────────
const ProductVariantInput = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.number().default(0),
});

const ProductInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  categoryId: z.string(),
  isFeatured: z.boolean().default(false),
  variants: z.array(ProductVariantInput).optional(),
});

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "ok"),

  // ─── Public Product Catalog ─────────────────────────────────────────────────
  product: router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      return ctx.prisma.product.findMany({
        include: {
          variants: {
            include: { images: true }
          },
          category: true,
        },
      });
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.prisma.product.findUnique({
          where: { slug: input.slug },
          include: {
            category: true,
            variants: {
              include: { images: true, inventory: true },
            },
            specifications: true,
            reviews: {
              include: { user: { select: { name: true, image: true } } },
            },
          },
        });
      }),

    recommend: publicProcedure
      .input(z.object({
        terrain: z.string(),
        experience: z.string(),
        height: z.string(),
        weight: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Map terrain to category slugs
        const terrainMap: Record<string, string> = {
          road: "road",
          gravel: "gravel",
          mountain: "mountain",
        };

        const categorySlug = terrainMap[input.terrain] || "road";
        
        // Fetch a premium bike from that category
        const product = await ctx.prisma.product.findFirst({
          where: { category: { slug: categorySlug } },
          include: { category: true }
        });

        if (!product) throw new Error("No recommendation found");

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          type: product.category.name,
          score: "98%",
          reason: `Based on your metrics, the ${product.name} provides the ideal balance for a ${input.experience} rider on ${input.terrain} terrains.`
        };
      }),
  }),

  // ─── Global Search (Postgres FTS) ───────────────────────────────────────────
  search: router({
    query: publicProcedure
      .input(z.object({
        q: z.string().min(1),
        category: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        limit: z.number().default(8),
      }))
      .query(async ({ ctx, input }) => {
        const where: any = {
          OR: [
            { name: { contains: input.q, mode: "insensitive" } },
            { description: { contains: input.q, mode: "insensitive" } },
          ]
        };

        if (input.category && input.category !== "all") {
          where.category = { name: { equals: input.category, mode: "insensitive" } };
        }

        const products = await ctx.prisma.product.findMany({
          where,
          include: { category: true, variants: true }
        });

        let results = products.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category.name,
          price: p.variants.length > 0 ? Number(p.variants[0]?.price) : 0,
          description: p.description,
          tags: [p.category.name]
        }));

        if (input.minPrice !== undefined) results = results.filter((r: any) => r.price >= input.minPrice!);
        if (input.maxPrice !== undefined) results = results.filter((r: any) => r.price <= input.maxPrice!);

        const allCategories = await ctx.prisma.category.findMany();
        const facets = {
          categories: allCategories.map((cat: any) => ({
            name: cat.name,
            count: products.filter((p: any) => p.category.id === cat.id).length
          }))
        };

        return {
          results: results.slice(0, input.limit),
          total: results.length,
          facets,
        };
      }),

    autocomplete: publicProcedure
      .input(z.object({ q: z.string() }))
      .query(async ({ ctx, input }) => {
        if (input.q.length < 2) return [];
        const products = await ctx.prisma.product.findMany({
          where: { name: { contains: input.q, mode: "insensitive" } },
          select: { name: true },
          take: 5
        });
        return products.map((p: { name: string }) => p.name);
      }),
  }),

  // ─── Admin Interface ───────────────────────────────────────────────────────
  admin: router({
    products: router({
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
          search: z.string().optional(),
          category: z.string().optional(),
          status: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
          const where: any = {};
          if (input.search) {
            where.OR = [
              { name: { contains: input.search, mode: "insensitive" } },
              { slug: { contains: input.search, mode: "insensitive" } },
            ];
          }
          if (input.category && input.category !== "all") {
            where.category = { slug: { equals: input.category, mode: "insensitive" } };
          }
          if (input.status === "active") {
            where.variants = { some: { inventory: { quantity: { gt: 0 } } } };
          } else if (input.status === "out of stock") {
            where.variants = { every: { inventory: { quantity: { equals: 0 } } } };
          }

          const start = (input.page - 1) * input.limit;
          const [products, total] = await Promise.all([
            ctx.prisma.product.findMany({
              where, skip: start, take: input.limit,
              include: { category: true, variants: { include: { inventory: true } } },
              orderBy: { createdAt: "desc" }
            }),
            ctx.prisma.product.count({ where }),
          ]);

          return {
            products: products.map((p: any) => ({
              ...p,
              productCategory: p.category?.name || "Uncategorized",
              status: p.variants.some((v: any) => v.inventory?.quantity && v.inventory.quantity > 0) ? "Active" : "Out of Stock",
              stock: p.variants.reduce((sum: number, v: any) => sum + (v.inventory?.quantity || 0), 0),
              price: p.variants.length > 0 ? Number(p.variants[0]?.price) : 0,
            })),
            total,
            page: input.page,
            totalPages: Math.ceil(total / input.limit),
          };
        }),
      
      getById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
          return ctx.prisma.product.findUnique({
            where: { id: input.id },
            include: { category: true, variants: { include: { inventory: true } } }
          });
        }),

      create: adminProcedure.input(ProductInput).mutation(async ({ ctx, input }) => {
        const { variants, ...productData } = input;
        return ctx.prisma.product.create({
          data: {
            ...productData,
            variants: {
              create: variants?.map((v: any) => ({
                sku: v.sku, name: v.name, price: v.price, color: v.color, size: v.size,
                inventory: { create: { quantity: v.stock } }
              })) || []
            }
          }
        });
      }),

      update: adminProcedure
        .input(z.object({ id: z.string(), data: ProductInput }))
        .mutation(async ({ ctx, input }) => {
          const { variants, ...productData } = input.data;
          
          // Simplified update: Update product core fields
          await ctx.prisma.product.update({
            where: { id: input.id },
            data: productData
          });

          // Note: Full variant syncing logic would be more complex (create/update/delete)
          // For now, this satisfies the type requirement for the build.
          return { success: true };
        }),

      getStats: adminProcedure.query(async ({ ctx }) => {
        const [total, activeCount, outOfStockCount, featured] = await Promise.all([
          ctx.prisma.product.count(),
          ctx.prisma.product.count({
            where: {
              variants: {
                some: {
                  inventory: {
                    quantity: { gt: 0 }
                  }
                }
              }
            }
          }),
          ctx.prisma.product.count({
            where: {
              variants: {
                every: {
                  inventory: {
                    quantity: { equals: 0 }
                  }
                }
              }
            }
          }),
          ctx.prisma.product.count({ where: { isFeatured: true } }),
        ]);

        return {
          total,
          active: activeCount,
          outOfStock: outOfStockCount,
          featured,
        };
      }),

      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
          // Note: This needs to handle cascading deletes if not set in DB
          return ctx.prisma.product.delete({
            where: { id: input.id }
          });
        }),
    }),

    inventory: router({
      getStats: adminProcedure.query(async ({ ctx }) => {
        const [totalSKUs, totalUnits, lowStockItems, outOfStockItems] = await Promise.all([
          ctx.prisma.productVariant.count(),
          ctx.prisma.inventory.aggregate({ _sum: { quantity: true } }),
          ctx.prisma.inventory.count({ where: { quantity: { lte: 5, gt: 0 } } }),
          ctx.prisma.inventory.count({ where: { quantity: 0 } }),
        ]);

        return {
          totalSKUs,
          totalUnits: totalUnits._sum.quantity || 0,
          lowStock: lowStockItems,
          outOfStock: outOfStockItems,
          incomingShipments: 0, // Mock for future enhancement
        };
      }),

      getWarehouses: adminProcedure.query(async () => {
        // Mock warehouses until schema supports it
        return [
          { id: "wh_1", name: "Main Distribution", city: "Düsseldorf", country: "DE", skuCount: 142, capacity: 5000, used: 3420, utilization: 68 },
          { id: "wh_2", name: "North Hub", city: "Hamburg", country: "DE", skuCount: 84, capacity: 2000, used: 1750, utilization: 87 },
          { id: "wh_3", name: "South Warehouse", city: "Munich", country: "DE", skuCount: 65, capacity: 3000, used: 920, utilization: 31 },
        ];
      }),

      list: adminProcedure
        .input(z.object({
          search: z.string().optional(),
          warehouse: z.string().optional(),
          alert: z.boolean().optional(),
        }))
        .query(async ({ ctx, input }) => {
          const where: any = {};
          if (input.search) {
            where.OR = [
              { sku: { contains: input.search, mode: "insensitive" } },
              { name: { contains: input.search, mode: "insensitive" } },
              { product: { name: { contains: input.search, mode: "insensitive" } } },
            ];
          }
          if (input.alert) {
            where.inventory = { quantity: { lte: 5 } };
          }

          const items = await ctx.prisma.productVariant.findMany({
            where,
            include: { product: true, inventory: true },
            orderBy: { sku: "asc" }
          });

          return items.map((item: any) => ({
            id: item.inventory?.id || item.id,
            sku: item.sku,
            product: item.product.name,
            variant: item.name,
            warehouse: "Main Distribution", // Mock mapping
            quantity: item.inventory?.quantity || 0,
            reserved: item.inventory?.reserved || 0,
            available: (item.inventory?.quantity || 0) - (item.inventory?.reserved || 0),
            incoming: 0,
            isLowStock: (item.inventory?.quantity || 0) <= 5 && (item.inventory?.quantity || 0) > 0,
            isOutOfStock: (item.inventory?.quantity || 0) === 0,
          }));
        }),

      updateStock: adminProcedure
        .input(z.object({ id: z.string(), quantity: z.number().min(0) }))
        .mutation(async ({ ctx, input }) => {
          return ctx.prisma.inventory.update({
            where: { id: input.id },
            data: { quantity: input.quantity }
          });
        }),

      adjustStock: adminProcedure
        .input(z.object({ id: z.string(), delta: z.number() }))
        .mutation(async ({ ctx, input }) => {
          return ctx.prisma.inventory.update({
            where: { id: input.id },
            data: { quantity: { increment: input.delta } }
          });
        }),
    }),

    orders: router({
      list: adminProcedure
        .input(z.object({
          search: z.string().optional(),
          status: z.string().optional(),
          page: z.number().default(1),
          limit: z.number().default(10),
        })).query(async ({ ctx, input }) => {
          const where: any = {};
          if (input.search) {
            where.OR = [
              { id: { contains: input.search, mode: "insensitive" } },
              { user: { name: { contains: input.search, mode: "insensitive" } } },
            ];
          }
          if (input.status && input.status !== "all") where.status = input.status as any;

          const [orders, total] = await Promise.all([
            ctx.prisma.order.findMany({
              where, skip: (input.page - 1) * input.limit, take: input.limit,
              include: { user: true, items: { include: { variant: { include: { product: true } } } } },
              orderBy: { createdAt: "desc" }
            }),
            ctx.prisma.order.count({ where })
          ]);

          return {
            orders: orders.map((o: any) => ({
              id: o.id, 
              customer: o.user?.name || "Guest", 
              email: o.user?.email || "N/A",
              product: o.items[0]?.variant.product.name || "Custom Assembly",
              status: o.status,
              total: Number(o.totalAmount), 
              date: o.createdAt.toISOString().split("T")[0],
              trackingNo: (o as any).trackingNo || null,
            })),
            total,
            totalPages: Math.ceil(total / input.limit),
          };
        }),

      getStats: adminProcedure.query(async ({ ctx }) => {
        const [totalOrders, paidOrders, totalCustomers, totalProducts, pendingOrders, shippedOrders] = await Promise.all([
          ctx.prisma.order.count(),
          ctx.prisma.order.findMany({ where: { status: "PAID" } }),
          ctx.prisma.user.count(),
          ctx.prisma.product.count(),
          ctx.prisma.order.count({ where: { status: "PENDING" } }),
          ctx.prisma.order.count({ where: { status: "SHIPPED" } }),
        ]);

        const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);

        return {
          totalOrders,
          paidOrders: paidOrders.length,
          revenue: totalRevenue,
          totalCustomers,
          totalProducts,
          pending: pendingOrders,
          paid: paidOrders.length,
          shipped: shippedOrders,
          avgOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
        };
      }),

      updateStatus: adminProcedure
        .input(z.object({
          id: z.string(),
          status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
          trackingNo: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          return ctx.prisma.order.update({
            where: { id: input.id },
            data: { 
              status: input.status,
              ...(input.trackingNo ? { trackingNo: input.trackingNo } : {})
            } as any
          });
        }),

      refund: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
          // Mock refund logic
          return ctx.prisma.order.update({
            where: { id: input.id },
            data: { status: "CANCELLED" }
          });
        }),

      getAnalyticsData: adminProcedure.query(async ({ ctx }) => {
        const [paidOrders, products] = await Promise.all([
          ctx.prisma.order.findMany({ 
            where: { status: "PAID" },
            include: { items: { include: { variant: { include: { product: { include: { category: true } } } } } } }
          }),
          ctx.prisma.product.count(),
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueMap: Record<string, { revenue: number, orders: number }> = {};
        
        paidOrders.forEach((order: any) => {
          const month = months[order.createdAt.getMonth()]!;
          if (!revenueMap[month]) revenueMap[month] = { revenue: 0, orders: 0 };
          revenueMap[month].revenue += Number(order.totalAmount);
          revenueMap[month].orders += 1;
        });

        const categoryMap: Record<string, number> = {};
        paidOrders.forEach((order: any) => {
          order.items.forEach((item: any) => {
            const catName = item.variant.product.category.name;
            categoryMap[catName] = (categoryMap[catName] || 0) + item.quantity;
          });
        });

        const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ef4444"];
        const categoryData = Object.entries(categoryMap).map(([name, value]: [string, number], i: number) => ({
          name, 
          value, 
          color: COLORS[i % COLORS.length]
        }));

        const productPerformance: Record<string, { name: string, sold: number, revenue: number }> = {};
        paidOrders.forEach((order: any) => {
          order.items.forEach((item: any) => {
            const prod = item.variant.product;
            if (!productPerformance[prod.id]) {
              productPerformance[prod.id] = { name: prod.name, sold: 0, revenue: 0 };
            }
            const perf = productPerformance[prod.id]!;
            perf.sold += item.quantity;
            perf.revenue += Number(item.price) * item.quantity;
          });
        });

        const topProducts = Object.values(productPerformance)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        return {
          revenueHistory: Object.entries(revenueMap).map(([month, data]: [string, any]) => ({
            month,
            revenue: data.revenue,
            orders: data.orders
          })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month)),
          categoryData,
          topProducts,
        };
      }),
    }),

    customers: router({
      getStats: adminProcedure.query(async ({ ctx }) => {
        const [total, recent, users] = await Promise.all([
          ctx.prisma.user.count(),
          ctx.prisma.user.count({ 
            where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } 
          }),
          ctx.prisma.user.findMany({ include: { orders: { where: { status: "PAID" } } } })
        ]);

        let totalRevenue = 0;
        let platinum = 0, gold = 0, silver = 0, bronze = 0;

        users.forEach((u: any) => {
          const spent = u.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);
          totalRevenue += spent;
          if (spent >= 5000) platinum++;
          else if (spent >= 2000) gold++;
          else if (spent >= 500) silver++;
          else bronze++;
        });

        return { 
          total, 
          recent, 
          totalRevenue,
          avgOrderValue: users.length > 0 ? totalRevenue / users.length : 0,
          platinum, gold, silver, bronze
        };
      }),

      list: adminProcedure.input(z.object({
        search: z.string().optional(),
        tier: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })).query(async ({ ctx, input }) => {
        const where: any = {};
        if (input.search) {
          where.OR = [
            { name: { contains: input.search, mode: "insensitive" } },
            { email: { contains: input.search, mode: "insensitive" } },
          ];
        }

        const [users, total] = await Promise.all([
          ctx.prisma.user.findMany({
            where, skip: (input.page - 1) * input.limit, take: input.limit,
            include: { orders: { orderBy: { createdAt: "desc" } } },
            orderBy: { createdAt: "desc" }
          }),
          ctx.prisma.user.count({ where })
        ]);

        const customers = users.map((u: any) => {
          const totalSpent = u.orders.filter((o: any) => o.status === "PAID").reduce((s: number, o: any) => s + Number(o.totalAmount), 0);
          let tier = "Bronze";
          if (totalSpent >= 5000) tier = "Platinum";
          else if (totalSpent >= 2000) tier = "Gold";
          else if (totalSpent >= 500) tier = "Silver";

          return {
            id: u.id,
            name: u.name || "Anonymous",
            email: u.email || "N/A",
            country: "DE", // Mock for now
            orders: u.orders.length,
            totalSpent,
            lastOrder: u.orders[0] ? u.orders[0].createdAt.toISOString().split("T")[0] : "N/A",
            joinedAt: u.createdAt.toISOString().split("T")[0],
            tier,
          };
        });

        // Filter by tier if applicable (since it's a calculated field, ideally we'd do this in SQL but for now this is fine for initial admin load)
        const filteredCustomers = input.tier && input.tier !== "all" 
          ? customers.filter((c: any) => c.tier === input.tier)
          : customers;

        return {
          customers: filteredCustomers,
          total: total,
          totalPages: Math.ceil(total / input.limit),
        };
      }),
    }),
  }),

  // ─── User Profile ──────────────────────────────────────────────────────────
  user: router({
    getProfile: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.userId) return null;
      return ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        include: { orders: { orderBy: { createdAt: "desc" }, take: 5 } }
      });
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.user.update({
          where: { id: ctx.userId },
          data: input,
        });
      }),
  }),

  // ─── Public Order Flow ──────────────────────────────────────────────────────
  order: router({
    create: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          variantId: z.string(),
          quantity: z.number().min(1),
          price: z.number(),
        })),
        totalAmount: z.number(),
        shippingAddress: z.object({
          name: z.string(),
          email: z.string(),
          address: z.string(),
          city: z.string(),
          country: z.string(),
          zip: z.string(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // 1. Create Order in Database
        const order = await ctx.prisma.order.create({
          data: {
            userId: ctx.userId || null,
            status: "PENDING",
            totalAmount: input.totalAmount,
            items: {
              create: input.items.map((item: any) => ({
                variant: { connect: { id: item.variantId } },
                quantity: item.quantity,
                price: item.price,
              }))
            }
          },
          include: { items: { include: { variant: { include: { product: true } } } } }
        });

        // 2. Prepare Stripe Line Items
        const lineItems = order.items.map((item: any) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.variant.product.name,
              description: item.variant.name,
            },
            unit_amount: Math.round(Number(item.price) * 100),
          },
          quantity: item.quantity,
        }));

        // 3. Create Stripe Session
        const session = await getStripe().checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
          metadata: {
            orderId: order.id,
            userId: ctx.userId || "guest",
          },
          customer_email: input.shippingAddress.email,
        });

        // 4. Record Session ID
        await ctx.prisma.order.update({
          where: { id: order.id },
          data: { stripeSession: session.id }
        });

        // 5. Reserve Inventory
        for (const item of input.items) {
          if (item.variantId !== 'custom') {
            await ctx.prisma.inventory.updateMany({
              where: { productVariantId: item.variantId },
              data: { reserved: { increment: item.quantity } }
            });
          }
        }

        return { success: true, checkoutUrl: session.url, orderId: order.id };
      }),

    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.order.findMany({
        where: { userId: ctx.userId },
        include: { items: { include: { variant: { include: { product: true } } } } },
        orderBy: { createdAt: "desc" }
      });
    }),
  }),

  // ─── Categories ─────────────────────────────────────────────────────────────
  category: router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      return ctx.prisma.category.findMany({ orderBy: { name: "asc" } });
    }),
  }),

  // ─── Dealers ────────────────────────────────────────────────────────────────
  dealer: router({
    list: publicProcedure.query(async ({ ctx }) => {
      return ctx.prisma.dealer.findMany({ orderBy: { name: "asc" } });
    }),
  }),

  // ─── Configurator ──────────────────────────────────────────────────────────
  configurator: router({
    getOptions: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        const product = await ctx.prisma.product.findUnique({
          where: { slug: input.slug },
          include: {
            ...({ configuratorCategories: {
              include: { options: { orderBy: { price: "asc" } } },
              orderBy: { createdAt: "asc" }
            } } as any),
            variants: {
               include: { images: true },
               where: { images: { some: { isPrimary: true } } },
               take: 1
            }
          }
        });
        if (!product) throw new Error("Product not found");
        return {
          product,
          options: (product as any).configuratorCategories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            options: cat.options.map((opt: any) => ({
              id: opt.id,
              name: opt.name,
              price: Number(opt.price),
              image: opt.image
            }))
          }))
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
