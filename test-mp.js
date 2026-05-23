require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

async function debug() {
    const prisma = new PrismaClient();
    try {
        const product = await prisma.product.findFirst();
        if (!product) {
            console.log("No products found in database!");
            return;
        }
        
        console.log("Using product:", product.id);
        
        const payload = {
            amount: product.price,
            currency: "CLP",
            concept: "Compra de prueba",
            email: "test@example.com",
            orderId: `test-${Date.now()}`,
            customerName: "Juan Perez",
            customerPhone: "123456789",
            shippingAddress: "Calle Falsa 123",
            items: [
                {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    quantity: 1
                }
            ]
        };

        const res = await fetch('http://localhost:3000/api/mercadopago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Status Code:", res.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
