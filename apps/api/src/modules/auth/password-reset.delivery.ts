interface PasswordResetDelivery {
  email: string;
  token: string;
}

const testDeliveries: PasswordResetDelivery[] = [];

async function deliverPasswordReset(
  email: string,
  token: string,
): Promise<void> {
  if (process.env["NODE_ENV"] === "test") {
    testDeliveries.push({ email, token });
  }
}

function getLatestPasswordResetDeliveryForTest(
  email: string,
): PasswordResetDelivery | undefined {
  return [...testDeliveries].reverse().find((delivery) => delivery.email === email);
}

function clearPasswordResetDeliveriesForTest(): void {
  testDeliveries.length = 0;
}

export {
  deliverPasswordReset,
  getLatestPasswordResetDeliveryForTest,
  clearPasswordResetDeliveriesForTest,
};
