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
    
    // Parse balance from drops (1 XRP = 1,000,000 drops)
    const balance = accountInfo.result?.account_data?.Balance 
      ? (parseInt(accountInfo.result.account_data.Balance) / 1000000).toFixed(2)
      : '0';
    
    // Parse transactions
    const transactions = accountTx.result?.transactions?.map((tx: any) => ({
      hash: tx.tx?.hash || tx.hash,
      type: tx.tx?.TransactionType || 'Unknown',
      amount: tx.tx?.Amount ? (typeof tx.tx.Amount === 'string' ? (parseInt(tx.tx.Amount) / 1000000).toFixed(2) + ' XRP' : 'Token') : '--',
      date: tx.tx?.date ? new Date((tx.tx.date + 946684800) * 1000).toLocaleString('ru-RU') : '--'
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
    
    return data.result;
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
