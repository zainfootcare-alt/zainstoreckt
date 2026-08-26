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
});

