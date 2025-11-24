// XRPL utility functions

export type SearchType = 'address' | 'transaction' | 'unknown';

/**
 * Convert drops to XRP (1 XRP = 1,000,000 drops)
 */
export function dropsToXrp(drops: string | number): string {
  const dropsNum = typeof drops === 'string' ? parseInt(drops) : drops;
  return (dropsNum / 1000000).toFixed(6);
}

/**
 * Convert Ripple epoch time to human readable date
 * Ripple epoch starts at 2000-01-01T00:00:00Z (946684800 Unix timestamp)
 */
export function rippleTimeToDate(rippleTime: number): string {
  const unixTime = (rippleTime + 946684800) * 1000;
  return new Date(unixTime).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

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

const RPC_URL = 'https://xrplcluster.com';

export interface XRPLError {
  error: string;
  message?: string;
}

/**
 * Make RPC request to XRPL Cluster
 */
async function rpcRequest(method: string, params: any[]) {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params })
    });
    
    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('RPC request error:', error);
    throw error;
  }
}

/**
 * Fetch address data from XRPL Cluster API
 */
export async function fetchAddressData(address: string) {
  try {
    // Get account info
    const accountInfo = await rpcRequest('account_info', [{ 
      account: address, 
      ledger_index: 'validated' 
    }]);
    
    if (accountInfo.error) {
      throw new Error(accountInfo.error);
    }
    
    // Get account transactions
    const accountTx = await rpcRequest('account_tx', [{ 
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 10
    }]);
    
    // Parse balance from drops
    const balance = accountInfo.result?.account_data?.Balance 
      ? dropsToXrp(accountInfo.result.account_data.Balance)
      : '0';
    
    // Parse transactions
    const transactions = accountTx.result?.transactions?.map((tx: any) => ({
      hash: tx.tx?.hash || tx.hash,
      type: tx.tx?.TransactionType || 'Unknown',
      amount: tx.tx?.Amount ? (typeof tx.tx.Amount === 'string' ? dropsToXrp(tx.tx.Amount) + ' XRP' : 'Token') : '--',
      date: tx.tx?.date ? rippleTimeToDate(tx.tx.date) : '--'
    })) || [];
    
    return {
      balance,
      tokens: accountInfo.result?.account_data?.OwnerCount || 0,
      transactions
    };
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
    const data = await rpcRequest('tx', [{ 
      transaction: txHash, 
      binary: false 
    }]);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    const result = data.result;
    
    // Parse and format the transaction data
    return {
      ...result,
      // Convert Amount from drops to XRP
      amount: result.Amount && typeof result.Amount === 'string' 
        ? dropsToXrp(result.Amount) 
        : result.Amount,
      // Convert Fee from drops to XRP
      fee: result.Fee ? dropsToXrp(result.Fee) : null,
      // Convert date from Ripple epoch to readable format
      date: result.date ? rippleTimeToDate(result.date) : null,
      // Keep original status or use meta.TransactionResult
      status: result.status || result.meta?.TransactionResult || result.validated ? 'success' : 'pending'
    };
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
    const data = await rpcRequest('gateway_balances', [{ 
      account: address, 
      strict: true 
    }]);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching pool data:', error);
    throw error;
  }
}
