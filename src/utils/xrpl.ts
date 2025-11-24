// XRPL utility functions

export type SearchType = 'address' | 'transaction' | 'unknown';

/**
 * Determines the type of XRPL search query
 */
export function detectSearchType(query: string): SearchType {
  const trimmedQuery = query.trim();
  
  // XRPL transaction hash is typically 64 characters (hex)
  if (/^[A-Fa-f0-9]{64}$/.test(trimmedQuery)) {
    return 'transaction';
  }
  
  // XRPL addresses start with 'r' and are typically 25-35 characters
  if (/^r[a-zA-Z0-9]{24,34}$/.test(trimmedQuery)) {
    return 'address';
  }
  
  return 'unknown';
}

const API_BASE = 'https://xrplcluster.com';

export interface XRPLError {
  error: string;
  message?: string;
}

/**
 * Fetch address data from XRPL Cluster API
 */
export async function fetchAddressData(address: string) {
  try {
    const response = await fetch(`${API_BASE}/address/${address}`);
    if (!response.ok) {
      throw new Error('Address not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching address data:', error);
    throw error;
  }
}

/**
 * Fetch transaction data from XRPL Cluster API
 */
export async function fetchTransactionData(txHash: string) {
  try {
    const response = await fetch(`${API_BASE}/transaction/${txHash}`);
    if (!response.ok) {
      throw new Error('Transaction not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw error;
  }
}

/**
 * Fetch pool data from XRPL Cluster API
 */
export async function fetchPoolData(address: string) {
  try {
    const response = await fetch(`${API_BASE}/pool/${address}`);
    if (!response.ok) {
      throw new Error('Pool not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching pool data:', error);
    throw error;
  }
}
