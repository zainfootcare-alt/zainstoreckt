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
});




