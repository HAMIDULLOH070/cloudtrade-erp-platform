import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.activityLog.deleteMany({});
  await prisma.cloudMetric.deleteMany({});
  await prisma.cloudResource.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.warehouseZone.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('Seeding Roles...');
  const roles = [
    { name: 'Admin', description: 'Tizimga to\'liq kirish huquqiga ega administrator' },
    { name: 'Manager', description: 'Faqat hisobotlarni ko\'rish va tasdiqlash huquqiga ega menejer' },
    { name: 'Warehouse Staff', description: 'Ombor operatsiyalari, zaxira hisobi va ko\'chirish xodimi' },
    { name: 'Sales Staff', description: 'Sotuv kanallari, mijozlar, lidlar va sotuv buyurtmalari xodimi' },
    { name: 'Accountant', description: 'Moliyaviy hisobotlar, fakturalar, to\'lovlar va xarajatlar hisobchisi' }
  ];

  const roleMap: Record<string, string> = {};
  for (const role of roles) {
    const createdRole = await prisma.role.create({ data: role });
    roleMap[role.name] = createdRole.id;
  }

  console.log('Seeding Users...');
  const salt = bcrypt.genSaltSync(10);
  const usersData = [
    { email: 'admin@cloudtrade.com', password: 'Admin12345', firstName: 'Jahongir', lastName: 'Karimov', roleName: 'Admin' },
    { email: 'manager@cloudtrade.com', password: 'Manager123', firstName: 'Sarvinoz', lastName: 'Rahimova', roleName: 'Manager' },
    { email: 'warehouse@cloudtrade.com', password: 'Warehouse123', firstName: 'Mirodil', lastName: 'Toshmatov', roleName: 'Warehouse Staff' },
    { email: 'sales@cloudtrade.com', password: 'Sales123', firstName: 'Ezoza', lastName: 'Sodiqova', roleName: 'Sales Staff' },
    { email: 'accountant@cloudtrade.com', password: 'Accountant123', firstName: 'Ravshan', lastName: 'Alimov', roleName: 'Accountant' }
  ];

  const userMap: Record<string, string> = {};
  for (const u of usersData) {
    const hashedPassword = bcrypt.hashSync(u.password, salt);
    const createdUser = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: roleMap[u.roleName]
      }
    });
    userMap[u.roleName] = createdUser.id;
  }

  console.log('Seeding Uzbek Suppliers (15)...');
  const supplierNames = [
    "O'zbek Tekstil Group MChJ", 'Buxoro Ip-Kalava Aksiyadorlik Jamiyati', 'Samarqand Mayin Tola',
    'Andijon Tikuvchilik Fabrikasi', 'Farg\'ona Denim MChJ', 'Marg\'ilon Ipakchilik Klasteri',
    'Namangan Trikotaj MChJ', 'Qo\'qon Paypoq Tikuvchilik', 'Jizzax Ip-Mato Klasteri',
    'Surxon Paxta sanoat holding', 'Qashqadaryo Tekstil Invest', 'Xorazm Jun-Mato Kombinati',
    'Sirdaryo Tugma-Trim Co', 'Toshkent Trim Aksessuarlari', 'Navoiy Weaves'
  ];
  const suppliers = [];
  for (let i = 0; i < supplierNames.length; i++) {
    const sup = await prisma.supplier.create({
      data: {
        name: supplierNames[i],
        contactName: `Ta'minotchi Vakili ${i + 1}`,
        email: `contact@${supplierNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.uz`,
        phone: `+998-90-123-45${10 + i}`,
        address: `${100 + i * 12} Sanoat ko'chasi, Toshkent, O'zbekiston`
      }
    });
    suppliers.push(sup);
  }

  console.log('Seeding Uzbek Customers (30)...');
  const customerNames = [
    'Toshkent Grand Modalar MChJ', 'Chorsu Kiyim-Kechak Savdo', 'Farhod Savdo Butik',
    'Sardor Wear', 'Kamola Kids', 'Shaxlo Butik', 'Bobur Grand Distribution', 'Samarqand Tola Chorsu',
    'Buxoro Ipak yo\'li retail', 'G\'iyos Chorsu Butik', 'E-Moda Tashkent', 'Premium Kids Toshkent',
    'Milliylik Butigi', 'Nafosat Dizayn', 'Maftuna Fashion Group', 'O\'zbek Liboslari', 'Sifat Tikuv',
    'Dunyo Modasi Chorsu', 'Toshkent City Retail', 'Eko Kiyim Toshkent', 'Vodiy Chirog\'i', 'Moda Lider',
    'Dizayn Express', 'Tikuvchilik Express', 'Elegance Tashkent', 'Zamon Wear', 'Zamonaviy Ayol',
    'Maftuna Butik', 'Sharq Liboslari', 'UzDistribution'
  ];
  const customerCategories = ['B2B Butik', 'Ulgurji savdogar', 'Univermag', 'E-savdo'];
  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
    const cust = await prisma.customer.create({
      data: {
        name: customerNames[i],
        contactName: `Menejer ${i + 1}`,
        email: `buyer@${customerNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.uz`,
        phone: `+998-93-321-65${10 + i}`,
        address: `${500 + i * 7} Amir Temur shoh ko'chasi, Toshkent, O'zbekiston`,
        category: customerCategories[i % customerCategories.length],
        creditLimit: i % 5 === 0 ? 80000 : 25000,
        debt: 0
      }
    });
    customers.push(cust);
  }

  console.log('Seeding WMS Zones...');
  const zones = [
    { name: 'A zona - Futbolkalar va ko\'ylaklar', code: 'ZONE-A', capacity: 15000, currentUsage: 0, description: 'Futbolkalar va asosiy ustki kiyimlar' },
    { name: 'B zona - Shimlar va jinsilar', code: 'ZONE-B', capacity: 12000, currentUsage: 0, description: 'Jinsilar va paxta shimlar' },
    { name: 'C zona - Ustki kiyimlar', code: 'ZONE-C', capacity: 8000, currentUsage: 0, description: 'Kurtkalar va qalin xudilar' },
    { name: 'Qaytarilgan tovarlar zonasi', code: 'ZONE-R', capacity: 3000, currentUsage: 0, description: 'Audit kutilayotgan qaytarilgan tovarlar' },
    { name: 'Premium tovarlar zonasi', code: 'ZONE-P', capacity: 5000, currentUsage: 0, description: 'Yuqori rentabelli katalog kiyimlari' }
  ];
  const warehouseZones = [];
  for (const zone of zones) {
    const createdZone = await prisma.warehouseZone.create({ data: zone });
    warehouseZones.push(createdZone);
  }

  console.log('Seeding Products (50)...');
  const clothingCategories = [
    { name: 'Futbolkalar', zoneCode: 'ZONE-A', priceMin: 12, priceMax: 22, costMin: 4, costMax: 7 },
    { name: 'Jinsilar', zoneCode: 'ZONE-B', priceMin: 40, priceMax: 70, costMin: 15, costMax: 28 },
    { name: 'Kurtkalar', zoneCode: 'ZONE-C', priceMin: 85, priceMax: 160, costMin: 32, costMax: 68 },
    { name: 'Ko\'ylaklar', zoneCode: 'ZONE-A', priceMin: 30, priceMax: 50, costMin: 11, costMax: 19 },
    { name: 'Ko\'ylak-yubkalar', zoneCode: 'ZONE-P', priceMin: 60, priceMax: 120, costMin: 22, costMax: 48 },
    { name: 'Sport kiyimlari', zoneCode: 'ZONE-B', priceMin: 45, priceMax: 85, costMin: 18, costMax: 35 },
    { name: 'Bolalar kiyimlari', zoneCode: 'ZONE-R', priceMin: 15, priceMax: 35, costMin: 6, costMax: 14 },
    { name: 'Formalar', zoneCode: 'ZONE-C', priceMin: 50, priceMax: 95, costMin: 20, costMax: 40 },
    { name: 'Aksessuarlar', zoneCode: 'ZONE-R', priceMin: 10, priceMax: 25, costMin: 3, costMax: 9 }
  ];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Qora', 'To\'q ko\'k', 'Kulrang', 'Zaytun rang', 'To\'q qizil', 'Sutrang', 'Ko\'k'];

  const products = [];
  let skuCounter = 2000;
  for (let i = 0; i < 50; i++) {
    const cat = clothingCategories[i % clothingCategories.length];
    const size = sizes[i % sizes.length];
    const color = colors[i % colors.length];
    const supplier = suppliers[i % suppliers.length];
    const cost = Math.round((Math.random() * (cat.costMax - cat.costMin) + cat.costMin) * 100) / 100;
    const price = Math.round((cost * (1.8 + Math.random() * 0.4)) * 100) / 100;
    const productName = `${color} ${cat.name} - ${size}`;

    const prod = await prisma.product.create({
      data: {
        name: productName,
        sku: `CT-${cat.name.substring(0, 2).toUpperCase()}-${skuCounter++}`,
        description: `${supplier.name} tomonidan ishlab chiqarilgan yuqori sifatli ulgurji ${productName.toLowerCase()}.`,
        category: cat.name,
        size,
        color,
        price,
        cost,
        quantityInStock: 0,
        lowStockThreshold: 15,
        supplierId: supplier.id
      }
    });
    products.push(prod);
  }

  console.log('Seeding CRM Leads...');
  const leadSources = ['Tavsiya', 'Ko\'rgazma', 'Veb-sayt', 'Sovuq qo\'ng\'iroq'];
  const leadStatuses = ['NEW', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  for (let i = 0; i < 40; i++) {
    const customer = customers[i % customers.length];
    await prisma.lead.create({
      data: {
        customerId: customer.id,
        status: leadStatuses[i % leadStatuses.length],
        value: Math.round((6000 + Math.random() * 20000) * 100) / 100,
        source: leadSources[i % leadSources.length],
        notes: `Savdo kampaniyasi muzokaralaridan olingan batafsil ma'lumotlar.`
      }
    });
  }

  // 3 Years of Business Operations Dates setup (2023 - 2026)
  const currentDate = new Date();
  console.log('Seeding Expenses for 3 years (36 months)...');
  const expenseCategories = ['Ijara', 'Kommunal', 'Logistika', 'Marketing', 'Oyliklar', 'Ofis'];
  const baseExpenses = [
    { title: 'Ombor ijarasi', category: 'Ijara', amount: 9000 },
    { title: 'Elektr va suv', category: 'Kommunal', amount: 1400 },
    { title: 'Logistika va yetkazib berish', category: 'Logistika', amount: 5000 },
    { title: 'Raqamli reklamalar', category: 'Marketing', amount: 3000 },
    { title: 'Xodimlar oylik maoshi', category: 'Oyliklar', amount: 25000 },
    { title: 'Ofis va dasturiy ta\'minot ijarasi', category: 'Ofis', amount: 1100 }
  ];

  for (let m = 0; m < 36; m++) {
    const expenseDate = new Date();
    expenseDate.setMonth(currentDate.getMonth() - m);
    for (const exp of baseExpenses) {
      await prisma.expense.create({
        data: {
          title: `${exp.title} - ${expenseDate.toLocaleString('uz-UZ', { month: 'short' })} ${expenseDate.getFullYear()}`,
          category: exp.category,
          amount: Math.round((exp.amount * (0.95 + Math.random() * 0.1)) * 100) / 100,
          date: expenseDate
        }
      });
    }
  }

  console.log('Seeding Purchase Orders (80) & incoming movements...');
  let poCounter = 8000;
  let movementLogs = [];
  for (let i = 0; i < 80; i++) {
    const supplier = suppliers[i % suppliers.length];
    const poDate = new Date();
    poDate.setMonth(currentDate.getMonth() - (i % 36)); // spread across 36 months!
    poDate.setDate(1 + (i % 28));

    const status = i < 70 ? 'RECEIVED' : 'PENDING';
    const poProductsCount = Math.floor(Math.random() * 3) + 2;
    const selectedProducts = [];
    const usedIndices = new Set();
    while (selectedProducts.length < poProductsCount) {
      const randIdx = Math.floor(Math.random() * products.length);
      if (!usedIndices.has(randIdx)) {
        selectedProducts.push(products[randIdx]);
        usedIndices.add(randIdx);
      }
    }

    let totalPOAmount = 0;
    const itemsData = selectedProducts.map(p => {
      const qty = (Math.floor(Math.random() * 7) + 5) * 20; // 100 to 220 units
      const costAmount = p.cost;
      totalPOAmount += qty * costAmount;
      return { productId: p.id, quantity: qty, cost: costAmount };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-${poCounter++}`,
        supplierId: supplier.id,
        status,
        totalAmount: Math.round(totalPOAmount * 100) / 100,
        poDate,
        items: {
          create: itemsData.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost
          }))
        }
      }
    });

    if (status === 'RECEIVED') {
      for (const item of itemsData) {
        const p = products.find(prod => prod.id === item.productId)!;
        const targetZone = 'ZONE-A';

        await prisma.product.update({
          where: { id: p.id },
          data: { quantityInStock: { increment: item.quantity } }
        });

        movementLogs.push({
          productId: p.id,
          quantity: item.quantity,
          type: 'INCOMING',
          toZone: targetZone,
          referenceId: po.id,
          userId: userMap['Warehouse Staff'],
          createdAt: poDate
        });
      }
    }
  }

  console.log('Seeding Sales Orders (100) with 3-year date distribution...');
  let orderCounter = 9000;
  let invoiceCounter = 7000;
  let paymentCounter = 5000;

  for (let i = 0; i < 100; i++) {
    const customer = customers[i % customers.length];
    const orderDate = new Date();
    orderDate.setMonth(currentDate.getMonth() - (i % 36)); // spread across 36 months!
    orderDate.setDate(1 + (i % 28));

    let status = 'COMPLETED';
    if (i >= 85 && i < 95) status = 'PENDING';
    if (i >= 95) status = 'CANCELLED';

    const orderProductsCount = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    const usedIndices = new Set();
    while (selectedProducts.length < orderProductsCount) {
      const randIdx = Math.floor(Math.random() * products.length);
      if (!usedIndices.has(randIdx)) {
        selectedProducts.push(products[randIdx]);
        usedIndices.add(randIdx);
      }
    }

    let subtotal = 0;
    const itemsData = selectedProducts.map(p => {
      const qty = (Math.floor(Math.random() * 4) + 1) * 15; // 15 to 60 units
      subtotal += qty * p.price;
      return { productId: p.id, quantity: qty, price: p.price };
    });

    const discount = i % 8 === 0 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
    const tax = Math.round((subtotal - discount) * 0.12 * 100) / 100; // 12% standard tax
    const totalAmount = Math.round((subtotal - discount + tax) * 100) / 100;

    const salesOrder = await prisma.order.create({
      data: {
        orderNumber: `SO-${orderCounter++}`,
        customerId: customer.id,
        status,
        subtotal: Math.round(subtotal * 100) / 100,
        discount,
        tax,
        totalAmount,
        orderDate,
        items: {
          create: itemsData.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    if (status === 'COMPLETED') {
      for (const item of itemsData) {
        const p = products.find(prod => prod.id === item.productId)!;
        const sourceZone = 'ZONE-A';

        await prisma.product.update({
          where: { id: p.id },
          data: { quantityInStock: { decrement: item.quantity } }
        });

        movementLogs.push({
          productId: p.id,
          quantity: item.quantity,
          type: 'OUTGOING',
          fromZone: sourceZone,
          referenceId: salesOrder.id,
          userId: userMap['Sales Staff'],
          createdAt: orderDate
        });
      }

      // Invoice status: PAID, UNPAID, PARTIAL, OVERDUE
      let invoiceStatus = 'PAID';
      if (i >= 50 && i < 65) invoiceStatus = 'UNPAID';
      if (i >= 65 && i < 75) invoiceStatus = 'PARTIAL';
      if (i >= 75 && i < 85) invoiceStatus = 'OVERDUE';

      const dueDate = new Date(orderDate);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${invoiceCounter++}`,
          orderId: salesOrder.id,
          amount: salesOrder.totalAmount,
          status: invoiceStatus,
          dueDate,
          issuedDate: orderDate,
          createdAt: orderDate
        }
      });

      if (invoiceStatus === 'PAID') {
        await prisma.payment.create({
          data: {
            paymentNumber: `PAY-${paymentCounter++}`,
            invoiceId: invoice.id,
            amount: invoice.amount,
            paymentMethod: ['Bank o\'tkazmasi', 'Kredit karta', 'Naqd pul'][i % 3],
            paymentDate: orderDate,
            reference: `REF-TX-${100000 + i}`,
            createdAt: orderDate
          }
        });
      } else if (invoiceStatus === 'PARTIAL') {
        const partialAmount = Math.round(invoice.amount * 0.4 * 100) / 100;
        await prisma.payment.create({
          data: {
            paymentNumber: `PAY-${paymentCounter++}`,
            invoiceId: invoice.id,
            amount: partialAmount,
            paymentMethod: 'Bank o\'tkazmasi',
            paymentDate: orderDate,
            reference: `REF-PARTIAL-${100000 + i}`,
            createdAt: orderDate
          }
        });
        await prisma.customer.update({
          where: { id: customer.id },
          data: { debt: { increment: invoice.amount - partialAmount } }
        });
      } else {
        // UNPAID or OVERDUE
        await prisma.customer.update({
          where: { id: customer.id },
          data: { debt: { increment: invoice.amount } }
        });
      }
    }
  }

  console.log('Inserting Stock movements...');
  for (const mov of movementLogs) {
    await prisma.inventoryMovement.create({ data: mov });
  }

  // Stock Adjustment moves to verify WMS ADJUSTMENT
  for (let i = 0; i < 20; i++) {
    const product = products[i % products.length];
    const adjustDate = new Date();
    adjustDate.setMonth(currentDate.getMonth() - (i % 36));

    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        type: 'ADJUSTMENT',
        fromZone: 'ZONE-A',
        referenceId: `ADJ-SYS-${100 + i}`,
        userId: userMap['Warehouse Staff'],
        createdAt: adjustDate
      }
    });
  }

  console.log('Updating zone capacity statistics...');
  for (const zone of warehouseZones) {
    const sumRes = await prisma.product.aggregate({
      _sum: { quantityInStock: true },
      where: {
        category: zone.code === 'ZONE-A' ? 'Futbolkalar' :
                  zone.code === 'ZONE-B' ? 'Jinsilar' :
                  zone.code === 'ZONE-C' ? 'Kurtkalar' : 'Ko\'ylak-yubkalar'
      }
    });
    const usage = sumRes._sum.quantityInStock || 120;
    await prisma.warehouseZone.update({
      where: { id: zone.id },
      data: { currentUsage: usage }
    });
  }

  console.log('Seeding Cloud Resources (DEGRADED, ACTIVE, INACTIVE)...');
  const cloudResources = [
    { name: 'CloudTrade VPC (Virtual tarmoq)', type: 'tarmoq', status: 'ACTIVE', ipAddress: '10.0.0.0/16', zone: 'us-east-1' },
    { name: 'Ochiq quyi tarmoq A', type: 'tarmoq', status: 'ACTIVE', ipAddress: '10.0.1.0/24', zone: 'us-east-1a' },
    { name: 'Yaqob quyi tarmoq A (Yopiq)', type: 'tarmoq', status: 'DEGRADED', ipAddress: '10.0.2.0/24', zone: 'us-east-1a' },
    { name: 'Ilova yuklamasini taqsimlovchi', type: 'tarmoq', status: 'ACTIVE', ipAddress: 'alb-10293.elb.amazonaws.com', zone: 'us-east-1' },
    { name: 'Bulutli WAF xavfsizlik devori', type: 'xavfsizlik', status: 'ACTIVE', ipAddress: '-', zone: 'us-east-1' },
    { name: 'CloudFront CDN tarmog\'i (AQSH)', type: 'tarmoq', status: 'INACTIVE', ipAddress: 'd3r82348u7.cloudfront.net', zone: 'us-east-1' },
    { name: 'ERP Primary Server (A tugun)', type: 'hisoblash', status: 'ACTIVE', ipAddress: '10.0.2.45', zone: 'us-east-1a' }
  ];
  for (const res of cloudResources) {
    await prisma.cloudResource.create({ data: res });
  }

  console.log('Seeding Cloud telemetry metrics logs (120)...');
  for (let i = 0; i < 120; i++) {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - (i * 15));
    await prisma.cloudMetric.create({
      data: {
        timestamp,
        cpuUsage: Math.round((20 + Math.sin(i / 6) * 10 + Math.random() * 5) * 100) / 100,
        memoryUsage: 55.4,
        diskUsage: 42.8,
        apiResponseTime: Math.round((130 + Math.sin(i / 5) * 30 + Math.random() * 20) * 10) / 10,
        apiUptime: 99.98,
        requestsCount: 150,
        errorsCount: 0,
        activeConnections: 250
      }
    });
  }

  console.log('Seeding audit logs...');
  const logs = [
    { action: 'Tizimga kirish', details: 'Administrator tizimga kirdi.' },
    { action: 'Buyurtma yaratish', details: 'Sotuv xodimi SO-9010 buyurtmasini joylashtirdi.' },
    { action: 'To\'lov yozish', details: 'Hisobchi INV-7020 faktura to\'lovini tasdiqladi.' },
    { action: 'Zaxira ko\'chirish', details: 'Ombor xodimi TR-0192 ko\'chirishini amalga oshirdi.' }
  ];
  for (let i = 0; i < 60; i++) {
    const l = logs[i % logs.length];
    const logDate = new Date();
    logDate.setHours(logDate.getHours() - i);
    await prisma.activityLog.create({
      data: {
        userId: userMap['Admin'],
        action: l.action,
        details: l.details,
        timestamp: logDate
      }
    });
  }

  console.log('Seed database completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
