"use client";

import { trpc } from "@/trpc/client";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  CheckCircle,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: revenueChart } = trpc.dashboard.getRevenueChart.useQuery();
  const { data: ordersChart } = trpc.dashboard.getOrdersChart.useQuery();

  if (isLoading) {
    return (
      <div className="form-page">
        <div className="flex justify-center items-center flex-1">
          <Loader className="animate-spin h-6 w-6" />
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="form-page">
      <div className="flex flex-col my-5 flex-1 overflow-scroll px-1 gap-3">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your store performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            description={`${formatCurrency(stats?.revenueThisMonth || 0)} this month`}
            icon={DollarSign}
            trend={{
              value: stats?.revenueGrowth || 0,
              isPositive: (stats?.revenueGrowth || 0) >= 0,
            }}
            iconColor="text-green-600"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            description={`${stats?.ordersThisMonth || 0} orders this month`}
            icon={ShoppingCart}
            trend={{
              value: stats?.orderGrowth || 0,
              isPositive: (stats?.orderGrowth || 0) >= 0,
            }}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            description="Active products in catalog"
            icon={Package}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            description="Registered users"
            icon={Users}
            iconColor="text-orange-600"
          />
        </div>

        {/* Order Status Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                Orders awaiting payment
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delivered Orders
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.deliveredOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Last 7 days revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {revenueChart?.map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              (item.revenue / Math.max(...(revenueChart?.map((d) => d.revenue) || [1]))) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-24 text-right">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Orders Trend</CardTitle>
              <CardDescription>Last 7 days orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ordersChart?.map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 items-center">
                        <span className="text-xs text-muted-foreground">Total:</span>
                        <span className="text-sm font-medium">{item.total}</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <span className="text-xs text-green-600">Paid:</span>
                        <span className="text-sm font-medium text-green-600">{item.paid}</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <span className="text-xs text-yellow-600">Pending:</span>
                        <span className="text-sm font-medium text-yellow-600">{item.pending}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Low Stock */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/order/${order.id}`}
                          className="font-medium text-sm hover:underline"
                        >
                          {order.id}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {order.user?.name || "Guest"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-medium">
                          {formatCurrency(Number(order.totalPrice))}
                        </span>
                        <Badge
                          variant={
                            order.paymentStatus === "settlement" ||
                            order.paymentStatus === "capture"
                              ? "default"
                              : order.paymentStatus === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products with stock {"<="} 10</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                  stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <Link
                        href={`/admin/catalog/product/${product.id}`}
                        className="font-medium text-sm hover:underline flex-1 truncate"
                      >
                        {product.name}
                      </Link>
                      <Badge
                        variant={product.stock === 0 ? "destructive" : "secondary"}
                      >
                        {product.stock} in stock
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    All products have sufficient stock
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}