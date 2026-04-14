import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const totalProducts = await prisma.product.count()
    const totalStockObj = await prisma.product.aggregate({ _sum: { stock: true } })
    const totalStock = totalStockObj._sum.stock || 0

    const totalOrders = await prisma.order.count()
    const revenueObj = await prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } })
    const totalRevenue = revenueObj._sum.totalAmount || 0

    const mostViewedProduct = await prisma.product.findFirst({
        orderBy: { views: 'desc' },
        select: { title: true, views: true }
    })

    // Get mostly sold products
    const topSellersQuery = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    })

    const topSellers = await Promise.all(topSellersQuery.map(async (ts) => {
        const p = await prisma.product.findUnique({ where: { id: ts.productId }, select: { title: true } })
        return { title: p?.title || 'Borrados', quantity: ts._sum.quantity || 0 }
    }))

    return NextResponse.json({
        totalProducts,
        totalStock,
        totalOrders,
        totalRevenue,
        mostViewedProduct: mostViewedProduct || { title: 'N/A', views: 0 },
        topSellers
    })
}
