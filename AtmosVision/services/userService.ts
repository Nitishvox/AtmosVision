
// A simple in-memory user store. In a real application, this would be
// a call to a backend authentication service.

/**
 * Checks if an email is valid for login. For this demo, any email is accepted.
 * @param email The email to verify.
 * @returns A promise that resolves to true.
 */
export const verifyUser = async (email: string): Promise<boolean> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  // For this version, we are allowing any email to proceed.
  return true;
};
