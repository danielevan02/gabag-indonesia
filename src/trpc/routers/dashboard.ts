import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";

export const dashboardRouter = createTRPCRouter({
  // Get dashboard statistics
  getStats: baseProcedure.query(async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: {
        paymentStatus: {
          not: null,
        },
      },
    });

    // Get orders this month
    const ordersThisMonth = await prisma.order.count({
      where: {
        paymentStatus: {
          not: null,
        },
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get orders last month
    const ordersLastMonth = await prisma.order.count({
      where: {
        paymentStatus: {
          not: null,
        },
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Calculate order growth percentage
    const orderGrowth = ordersLastMonth > 0
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
      : 0;

    // Get total revenue (paid orders only)
    const paidOrders = await prisma.order.findMany({
      where: {
        isPaid: true,
      },
      select: {
        totalPrice: true,
      },
    });

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    );

    // Get revenue this month
    const paidOrdersThisMonth = await prisma.order.findMany({
      where: {
        isPaid: true,
        paidAt: {
          gte: startOfMonth,
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const revenueThisMonth = paidOrdersThisMonth.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    );

    // Get revenue last month
    const paidOrdersLastMonth = await prisma.order.findMany({
      where: {
        isPaid: true,
        paidAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const revenueLastMonth = paidOrdersLastMonth.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    );

    // Calculate revenue growth percentage
    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 0;

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: "user",
      },
    });

    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        paymentStatus: "pending",
      },
    });

    // Get delivered orders
    const deliveredOrders = await prisma.order.count({
      where: {
        isDelivered: true,
      },
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        paymentStatus: {
          not: null,
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 10,
        },
      },
      take: 5,
      orderBy: {
        stock: "asc",
      },
      select: {
        id: true,
        name: true,
        stock: true,
        slug: true,
      },
    });

    return serializeType({
      totalOrders,
      ordersThisMonth,
      orderGrowth,
      totalRevenue,
      revenueThisMonth,
      revenueGrowth,
      totalProducts,
      totalCustomers,
      pendingOrders,
      deliveredOrders,
      recentOrders,
      lowStockProducts,
    });
  }),

  // Get revenue chart data (last 7 days)
  getRevenueChart: baseProcedure.query(async () => {
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: {
        isPaid: true,
        paidAt: {
          gte: last7Days,
        },
      },
      select: {
        totalPrice: true,
        paidAt: true,
      },
      orderBy: {
        paidAt: "asc",
      },
    });

    // Group by date
    const revenueByDate = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      revenueByDate.set(dateStr, 0);
    }

    orders.forEach((order) => {
      if (order.paidAt) {
        const dateStr = order.paidAt.toISOString().split("T")[0];
        const currentRevenue = revenueByDate.get(dateStr) || 0;
        revenueByDate.set(dateStr, currentRevenue + Number(order.totalPrice));
      }
    });

    const chartData = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return serializeType(chartData);
  }),

  // Get orders chart data (last 7 days)
  getOrdersChart: baseProcedure.query(async () => {
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: {
          not: null,
        },
        createdAt: {
          gte: last7Days,
        },
      },
      select: {
        createdAt: true,
        paymentStatus: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const ordersByDate = new Map<string, { total: number; paid: number; pending: number }>();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      ordersByDate.set(dateStr, { total: 0, paid: 0, pending: 0 });
    }

    orders.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      const current = ordersByDate.get(dateStr);
      if (current) {
        current.total += 1;
        if (order.paymentStatus === "settlement" || order.paymentStatus === "capture") {
          current.paid += 1;
        } else if (order.paymentStatus === "pending") {
          current.pending += 1;
        }
      }
    });

    const chartData = Array.from(ordersByDate.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    return serializeType(chartData);
  }),
});
