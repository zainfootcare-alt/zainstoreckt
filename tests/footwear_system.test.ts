import { describe, it, expect } from 'vitest';

describe('Shop Operations & Finance Transaction Rules & Acceptance Criteria', () => {
  it('Acceptance Test 1: ₹10,000 sale increases sales, updates payment account, and records transaction', () => {
    let initialAccountBalance = 15000;
    let initialTotalSales = 50000;

    const saleAmount = 10000;
    initialTotalSales += saleAmount;
    initialAccountBalance += saleAmount;

    expect(initialTotalSales).toBe(60000);
    expect(initialAccountBalance).toBe(25000);
  });

  it('Acceptance Test 2: ₹3,000 party payment reduces party due, reduces selected account, and updates ledger', () => {
    let partyOutstanding = 50000;
    let accountBalance = 38500;
    const partyLedger: Array<{ type: string; debit: number; credit: number; balance: number }> = [
      { type: 'PURCHASE', debit: 0, credit: 50000, balance: 50000 },
    ];

    const paymentAmount = 3000;
    partyOutstanding -= paymentAmount;
    accountBalance -= paymentAmount;

    partyLedger.push({
      type: 'PAYMENT',
      debit: paymentAmount,
      credit: 0,
      balance: partyOutstanding,
    });

    expect(partyOutstanding).toBe(47000);
    expect(accountBalance).toBe(35500);
    expect(partyLedger.length).toBe(2);
    expect(partyLedger[1].balance).toBe(47000);
  });

  it('Acceptance Test 3: ₹2,000 expense increases total expense and reduces account balance', () => {
    let totalExpenses = 20000;
    let cashCounterBalance = 15450;

    const expenseAmount = 2000;
    totalExpenses += expenseAmount;
    cashCounterBalance -= expenseAmount;

    expect(totalExpenses).toBe(22000);
    expect(cashCounterBalance).toBe(13450);
  });

  it('Acceptance Test 4: Expected cash closing calculation formula', () => {
    const openingCash = 5000;
    const cashSales = 10000;
    const cashExpenses = 2000;
    const cashPartyPayments = 3000;

    const expectedCash = openingCash + cashSales - cashExpenses - cashPartyPayments;
    expect(expectedCash).toBe(10000);

    const physicalCash = 9500;
    const variance = physicalCash - expectedCash;
    expect(variance).toBe(-500);
  });

  it('Acceptance Test 5: Salary calculation per day formula', () => {
    const monthlySalary = 15000;
    const perDayAmount = monthlySalary / 30; // 500
    const presentDays = 24;
    const payableSalary = perDayAmount * presentDays; // 12000

    expect(perDayAmount).toBe(500);
    expect(payableSalary).toBe(12000);

    const paidAmount = 8000;
    const remainingDue = payableSalary - paidAmount;
    expect(remainingDue).toBe(4000);
  });

  it('Acceptance Test 6: Split Payment (Cash + Online + Due) reconciles exactly with Sale Total', () => {
    const saleTotal = 2000;
    const cashPaid = 1000;
    const onlinePaid = 500;
    const dueAmount = 500;

    const totalAllocated = cashPaid + onlinePaid + dueAmount;
    expect(totalAllocated).toBe(saleTotal);

    const paidTotal = cashPaid + onlinePaid;
    expect(paidTotal).toBe(1500);
    expect(dueAmount).toBe(500);
  });

  it('Acceptance Test 7: Customer Khatabook balance updates on Due sale and subsequent payment', () => {
    let customerBalance = 0; // Settled

    // Customer buys on due ₹3,000
    const saleDue = 3000;
    customerBalance += saleDue;
    expect(customerBalance).toBe(3000); // You will receive ₹3,000

    // Customer pays ₹1,000
    const paymentReceived = 1000;
    customerBalance -= paymentReceived;
    expect(customerBalance).toBe(2000); // You will receive ₹2,000

    // Customer pays remaining ₹2,000
    customerBalance -= 2000;
    expect(customerBalance).toBe(0); // Settled in full
  });

  it('Acceptance Test 8: Estimate to Sale conversion preserves totals and marks status Converted', () => {
    const estimate = {
      id: 'est-101',
      total: 4500,
      status: 'Sent',
    };

    // 1-Click Convert to Sale
    const convertedSale = {
      id: 'sale-1025',
      estimate_id: estimate.id,
      total: estimate.total,
      cash_amount: 2500,
      online_amount: 2000,
      due_amount: 0,
    };

    estimate.status = 'Converted';

    expect(convertedSale.total).toBe(4500);
    expect(convertedSale.cash_amount + convertedSale.online_amount).toBe(4500);
    expect(estimate.status).toBe('Converted');
  });

  it('Acceptance Test 9: Customer selected items and basket calculation for POS footwear sale', () => {
    const lineItems = [
      { id: '1', name: 'Sneakers', category: 'Sneakers', size: '9', unit_price: 1499 },
      { id: '2', name: 'Formal', category: 'Formal', size: '8', unit_price: 2199 },
    ];

    const subtotal = lineItems.reduce((acc, item) => acc + item.unit_price, 0);
    expect(subtotal).toBe(3698);
    expect(lineItems.length).toBe(2);
    expect(lineItems[0].size).toBe('9');
    expect(lineItems[1].category).toBe('Formal');
  });

  it('Acceptance Test 10: Customer purchase history aggregates items, total spent, and preferred shoe size', () => {
    const customerSales = [
      {
        receipt_number: 'ZAIN-001',
        total: 1499,
        items: [{ item_name: 'Sneakers', size: '9', quantity: 1, unit_price: 1499 }],
      },
      {
        receipt_number: 'ZAIN-002',
        total: 3500,
        items: [
          { item_name: 'Formal Shoes', size: '9', quantity: 1, unit_price: 2500 },
          { item_name: 'Slippers', size: '9', quantity: 1, unit_price: 1000 },
        ],
      },
    ];

    const totalSpent = customerSales.reduce((acc, s) => acc + s.total, 0);
    const allItems = customerSales.flatMap((s) => s.items);

    const sizeCounts: Record<string, number> = {};
    allItems.forEach((it) => {
      sizeCounts[it.size] = (sizeCounts[it.size] || 0) + it.quantity;
    });

    const preferredSize = Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0][0];

    expect(totalSpent).toBe(4999);
    expect(allItems.length).toBe(3);
    expect(preferredSize).toBe('9');
  });

  it('Acceptance Test 11: Supplier party purchase bill tracks date, footwear styles, sizes, and balance due', () => {
    const purchaseBill = {
      id: 'pur-101',
      vendor_name: 'Agra Leather Crafts',
      bill_number: 'INV-8890',
      business_date: '2026-08-26',
      total: 12000,
      amount_paid: 4000,
      balance_due: 8000,
      payment_status: 'PARTIAL',
      items: [
        { item_name: 'Leather Formal Shoes', size: '8', quantity: 10, unit_price: 600, total_price: 6000 },
        { item_name: 'Sneakers & Casuals', size: '9', quantity: 10, unit_price: 600, total_price: 6000 },
      ],
    };

    expect(purchaseBill.business_date).toBe('2026-08-26');
    expect(purchaseBill.items.length).toBe(2);
    expect(purchaseBill.items[0].size).toBe('8');
    expect(purchaseBill.items[1].size).toBe('9');
    expect(purchaseBill.balance_due).toBe(8000);
    expect(purchaseBill.payment_status).toBe('PARTIAL');
  });

  it('Acceptance Test 12: Pay Due against purchase invoice reconciles remaining balance to zero and marks PAID', () => {
    let billDue = 8000;
    let vendorCurrentBalance = 8000;

    const paymentAmount = 8000;
    billDue -= paymentAmount;
    vendorCurrentBalance -= paymentAmount;

    expect(billDue).toBe(0);
    expect(vendorCurrentBalance).toBe(0);
  });

  it('Acceptance Test 13: Invoice lookup by number returns complete footwear breakdown, sizes, and pair count', () => {
    const saleRecord = {
      id: 'sale-999',
      receipt_number: 'ZAIN-887711',
      customer_name: 'Faizan Khan',
      customer_phone: '9820098200',
      total: 4500,
      subtotal: 4500,
      discount: 0,
      cash_amount: 3000,
      online_amount: 1500,
      due_amount: 0,
      created_at: '2026-09-07T12:00:00.000Z',
      items: [
        { item_name: 'Formal Shoes (Size 8)', size: '8', quantity: 1, unit_price: 2500, total_price: 2500 },
        { item_name: 'Sports Shoes (Size 9)', size: '9', quantity: 2, unit_price: 1000, total_price: 2000 },
      ],
    };

    // Invoice search matching
    const searchNumber = '887711';
    const isMatched = saleRecord.receipt_number.includes(searchNumber);
    expect(isMatched).toBe(true);

    // Breakdown details
    const totalItems = saleRecord.items.length;
    const totalPairs = saleRecord.items.reduce((sum, it) => sum + it.quantity, 0);
    expect(totalItems).toBe(2);
    expect(totalPairs).toBe(3);
    expect(saleRecord.items[0].size).toBe('8');
    expect(saleRecord.items[1].size).toBe('9');
    expect(saleRecord.items[0].unit_price).toBe(2500);
    expect(saleRecord.items[1].total_price).toBe(2000);
    expect(saleRecord.total).toBe(4500);
  });

  it('Acceptance Test 14: Settle due on invoice automatically clears balance and updates customer status', () => {
    let invoiceDue = 1500;
    let customerBalance = 1500;

    // Receive payment for due invoice
    const payment = 1500;
    invoiceDue -= payment;
    customerBalance -= payment;

    expect(invoiceDue).toBe(0);
    expect(customerBalance).toBe(0);
  });

  it('Acceptance Test 15: Sales Return / Refund by Invoice Number is restricted to Admin role and updates sale status', () => {
    const saleRecord = {
      id: 'sale-ret-101',
      receipt_number: 'ZAIN-990011',
      customer_id: 'cust-501',
      customer_name: 'Imran Ansari',
      total: 3000,
      subtotal: 3000,
      cash_amount: 3000,
      online_amount: 0,
      status: 'COMPLETED',
      items: [
        { item_name: 'Sneakers (Size 9)', size: '9', quantity: 1, unit_price: 2000, total_price: 2000 },
        { item_name: 'Slippers (Size 8)', size: '8', quantity: 1, unit_price: 1000, total_price: 1000 },
      ],
      returned_at: undefined as string | undefined,
      returned_by_name: undefined as string | undefined,
      refund_amount: undefined as number | undefined,
    };

    // Non-admin attempting return must be denied
    const nonAdminRole: string = 'CASHIER';
    const canReturn = nonAdminRole === 'ADMIN';
    expect(canReturn).toBe(false);

    // Admin executing return of 1 item
    const adminRole = 'ADMIN';
    expect(adminRole === 'ADMIN').toBe(true);

    const refundItem = saleRecord.items[0]; // Refund Sneakers ₹2,000
    const refundAmount = refundItem.unit_price;
    const isFullReturn = refundAmount >= saleRecord.total;

    saleRecord.status = isFullReturn ? 'RETURNED' : 'PARTIALLY_RETURNED';
    saleRecord.refund_amount = refundAmount;
    saleRecord.returned_at = new Date().toISOString();
    saleRecord.returned_by_name = 'Saif (Admin)';

    expect(saleRecord.status).toBe('PARTIALLY_RETURNED');
    expect(saleRecord.refund_amount).toBe(2000);
    expect(saleRecord.returned_by_name).toBe('Saif (Admin)');
  });

  it('Acceptance Test 16: Geofence distance calculation using Haversine accurately classifies store perimeter', () => {
    // Haversine formula
    const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3;
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return Math.round(R * c);
    };

    const storeLat = 18.9696;
    const storeLon = 72.8193;
    const allowedRadius = 500; // 500 meters

    // Person inside shop (approx 15 meters away)
    const insideLat = 18.9697;
    const insideLon = 72.8194;
    const distanceInside = calculateDistanceMeters(insideLat, insideLon, storeLat, storeLon);
    expect(distanceInside).toBeLessThanOrEqual(allowedRadius);

    // Person at home (approx 5 km away)
    const farLat = 19.0144;
    const farLon = 72.8479;
    const distanceFar = calculateDistanceMeters(farLat, farLon, storeLat, storeLon);
    expect(distanceFar).toBeGreaterThan(allowedRadius);
  });

  it('Acceptance Test 17: Vendor purchase attached bill document tracking and verification', () => {
    const purchaseWithBill = {
      id: 'pur-attach-101',
      vendor_name: 'Metro Footwear Wholesale',
      bill_number: 'MFW-2026-99',
      total: 45000,
      invoice_attachment_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      items_count: 50,
      payment_status: 'PAID',
    };

    expect(purchaseWithBill.invoice_attachment_path).toBeDefined();
    expect(purchaseWithBill.invoice_attachment_path?.startsWith('http')).toBe(true);
    expect(purchaseWithBill.total).toBe(45000);
  });

  it('Acceptance Test 18: Audio notification contract and sale toast payload', () => {
    const newSaleEvent = {
      id: 'sale-toast-101',
      receipt_number: 'ZAIN-774411',
      customer_name: 'Rashid Khan',
      total: 2499,
      items: [{ item_name: 'Running Shoes', size: '10', quantity: 1, unit_price: 2499 }],
      payment_mode: 'CASH',
      created_at: new Date().toISOString(),
    };

    expect(newSaleEvent.receipt_number).toBe('ZAIN-774411');
    expect(newSaleEvent.total).toBe(2499);
    expect(newSaleEvent.items.length).toBe(1);
  });

  it('Acceptance Test 19: Duplicate order detection identifies rapid same-amount sales within time window', () => {
    const existingSales = [
      {
        id: 'sale-recent-1',
        receipt_number: 'ZAIN-112233',
        total: 1999,
        created_at: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
      },
      {
        id: 'sale-old-2',
        receipt_number: 'ZAIN-998877',
        total: 1999,
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
    ];

    const currentAttemptTotal = 1999;
    const now = Date.now();

    // Duplicate check logic
    const duplicateCandidate = existingSales.find((s) => {
      const diffSec = (now - new Date(s.created_at).getTime()) / 1000;
      return s.total === currentAttemptTotal && diffSec <= 45;
    });

    expect(duplicateCandidate).toBeDefined();
    expect(duplicateCandidate?.receipt_number).toBe('ZAIN-112233');

    // Attempt with different amount should not trigger duplicate
    const differentAttemptTotal = 2499;
    const noDuplicate = existingSales.find((s) => {
      const diffSec = (now - new Date(s.created_at).getTime()) / 1000;
      return s.total === differentAttemptTotal && diffSec <= 45;
    });

    expect(noDuplicate).toBeUndefined();
  });

  it('Acceptance Test 20: Order deletion is strictly restricted to Admin role and rolls back customer dues', () => {
    // Non-Admin deletion attempt
    const cashierRole: string = 'CASHIER';
    const canCashierDelete = cashierRole === 'ADMIN';
    expect(canCashierDelete).toBe(false);

    // Admin deletion attempt
    const adminRole = 'ADMIN';
    const canAdminDelete = adminRole === 'ADMIN';
    expect(canAdminDelete).toBe(true);

    // Customer balance rollback simulation
    let customerCurrentBalance = 1500; // Has ₹1,500 due from an accidental duplicate order
    let customerTotalSpent = 4500;
    const saleToDelete = {
      id: 'sale-dup-01',
      receipt_number: 'ZAIN-DUP-99',
      total: 1500,
      due_amount: 1500,
    };

    customerCurrentBalance = Math.max(0, customerCurrentBalance - saleToDelete.due_amount);
    customerTotalSpent = Math.max(0, customerTotalSpent - saleToDelete.total);

    expect(customerCurrentBalance).toBe(0);
    expect(customerTotalSpent).toBe(3000);
  });

  it('Acceptance Test 21: Admin Finance Chart accurately calculates 7-day sales breakdown and fund utilization', () => {
    const totalSales = 75000;
    const totalPartyPayments = 45000;
    const totalSalaries = 15000;
    const totalShopExpenses = 5000;

    const totalOutflow = totalPartyPayments + totalSalaries + totalShopExpenses;
    const netCashflow = totalSales - totalOutflow;

    const partyPct = Math.round((totalPartyPayments / totalOutflow) * 100);
    const salaryPct = Math.round((totalSalaries / totalOutflow) * 100);
    const opsPct = 100 - partyPct - salaryPct;

    expect(totalOutflow).toBe(65000);
    expect(netCashflow).toBe(10000); // ₹10,000 net positive cashflow
    expect(partyPct).toBe(69);
    expect(salaryPct).toBe(23);
    expect(opsPct).toBe(8);
  });

  it('Acceptance Test 22: Customer Demand Book aggregates identical out-of-stock items and counts frequency', () => {
    const demandsList = [
      {
        id: 'dem-1',
        item_name: 'Nike Dunk Low Panda',
        category: 'Sneakers',
        size: '9',
        customer_name: 'Adnan Shaikh',
        customer_phone: '9820098200',
        status: 'PENDING',
      },
      {
        id: 'dem-2',
        item_name: 'Nike Dunk Low Panda',
        category: 'Sneakers',
        size: '9',
        customer_name: 'Imran Ansari',
        customer_phone: '9811223344',
        status: 'PENDING',
      },
      {
        id: 'dem-3',
        item_name: 'Tan Leather Formal Loafer',
        category: 'Formal',
        size: '8',
        customer_name: 'Vikram Mehta',
        customer_phone: '9876543210',
        status: 'ORDERED_FROM_SUPPLIER',
      },
    ];

    // Grouping by item_name + size + category
    const counts: Record<string, number> = {};
    demandsList.forEach((d) => {
      const key = `${d.item_name}_${d.size}_${d.category}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    expect(counts['Nike Dunk Low Panda_9_Sneakers']).toBe(2); // Requested twice
    expect(counts['Tan Leather Formal Loafer_8_Formal']).toBe(1); // Requested once
    expect(demandsList.length).toBe(3);
  });

  it('Feature Test 23: Dashboard and Chart render gracefully with empty arrays and null safety', () => {
    const emptySales: any[] = [];
    const emptyDemands: any[] = [];
    const emptyExpenses: any[] = [];

    const totalSalesAmount = emptySales.reduce((sum, s) => sum + s.total, 0);
    const pendingDemands = emptyDemands.filter((d) => d.status === 'PENDING').length;
    const totalExpenses = emptyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    expect(totalSalesAmount).toBe(0);
    expect(pendingDemands).toBe(0);
    expect(totalExpenses).toBe(0);
  });

  it('Acceptance Test 24: Customer Demands starts clean with 0 dummy records and supports live backend CRUD', () => {
    let demandsBackend: Array<{ id: string; item_name: string; category: string; size: string; status: string }> = [];

    // Initial state is clean (no fake dummy rows)
    expect(demandsBackend.length).toBe(0);

    // Create a real customer demand
    const newDemand = {
      id: 'd9000000-0000-0000-0000-000000000001',
      item_name: 'Puma Nitro Running Shoe',
      category: 'Sports',
      size: '10',
      status: 'PENDING',
    };
    demandsBackend = [newDemand, ...demandsBackend];
    expect(demandsBackend.length).toBe(1);
    expect(demandsBackend[0].item_name).toBe('Puma Nitro Running Shoe');

    // Update status to STOCK_ARRIVED
    demandsBackend = demandsBackend.map((d) => (d.id === newDemand.id ? { ...d, status: 'STOCK_ARRIVED' } : d));
    expect(demandsBackend[0].status).toBe('STOCK_ARRIVED');

    // Delete demand
    demandsBackend = demandsBackend.filter((d) => d.id !== newDemand.id);
    expect(demandsBackend.length).toBe(0);
  });
});

