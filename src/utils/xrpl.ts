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
 * Check if an address is an AMM account
 */
export async function isAMMAccount(address: string): Promise<boolean> {
  try {
    const accountInfo = await rpcRequest('account_info', [{ 
      account: address, 
      ledger_index: 'validated' 
    }]);
    
    return !!accountInfo.result?.account_data?.AMMID;
  } catch (error) {
    return false;
  }
}

/**
 * Fetch all AMM pools from XRPL
 */
export async function fetchAllAMMPools(limit: number = 50) {
  try {
    const pools: any[] = [];
    let marker = undefined;
    let count = 0;
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loops
    
    // Use ledger_data to get ALL ledger entries, then filter for AMM
    while (count < limit && iterations < maxIterations) {
      iterations++;
      
      const request: any = {
        ledger_index: 'validated',
        limit: 256 // Maximum for non-binary requests
      };
      
      if (marker) {
        request.marker = marker;
      }
      
      try {
        const response = await rpcRequest('ledger_data', [request]);
        
        if (response.error || !response.result) {
          console.warn('RPC returned error or no result, stopping pagination');
          break;
        }
        
        const state = response.result.state || [];
        
        // Filter for AMM entries only
        const ammEntries = state.filter((entry: any) => entry.LedgerEntryType === 'AMM');
        
        for (const entry of ammEntries) {
          const asset1 = entry.Amount;
          const asset2 = entry.Amount2;
          
          // Format tokens
          const token1 = typeof asset1 === 'string' 
            ? { symbol: 'XRP', amount: dropsToXrp(asset1), currency: 'XRP' }
            : { 
                symbol: asset1?.currency || 'Unknown', 
                amount: asset1?.value || '0',
                currency: asset1?.currency,
                issuer: asset1?.issuer 
              };

          const token2 = typeof asset2 === 'string'
            ? { symbol: 'XRP', amount: dropsToXrp(asset2), currency: 'XRP' }
            : { 
                symbol: asset2?.currency || 'Unknown', 
                amount: asset2?.value || '0',
                currency: asset2?.currency,
                issuer: asset2?.issuer 
              };

          // Calculate price
          const amount1 = parseFloat(token1.amount);
          const amount2 = parseFloat(token2.amount);
          const price = amount1 > 0 ? (amount2 / amount1).toFixed(8) : '0';

          pools.push({
            address: entry.Account,
            ammId: entry.AMMID,
            token1,
            token2,
            price,
            fee: entry.TradingFee ? (parseInt(entry.TradingFee) / 1000).toFixed(3) + '%' : '0%',
            lpToken: entry.LPTokenBalance?.value || '0'
          });
          
          count++;
          if (count >= limit) break;
        }
        
        marker = response.result.marker;
        
        // If we have enough pools or no more data, break
        if (count >= limit || !marker) {
          break;
        }
      } catch (err) {
        // If individual request fails, log and stop pagination
        console.warn('Request failed, stopping pagination:', err);
        break;
      }
    }
    
    return pools;
  } catch (error) {
    console.error('Error fetching AMM pools:', error);
    throw error;
  }
}

/**
 * Fetch AMM pool data from XRPL Cluster API
 */
export async function fetchPoolData(address: string) {
  try {
    // First get account info to get AMMID
    const accountInfo = await rpcRequest('account_info', [{ 
      account: address, 
      ledger_index: 'validated' 
    }]);
    
    if (accountInfo.error) {
      throw new Error(accountInfo.error);
    }

    const ammId = accountInfo.result?.account_data?.AMMID;
    
    if (!ammId) {
      throw new Error('Not an AMM account');
    }

    // Get AMM info using amm_info method
    const ammInfo = await rpcRequest('amm_info', [{ 
      amm_account: address 
    }]);
    
    if (ammInfo.error) {
      throw new Error(ammInfo.error);
    }

    const amm = ammInfo.result?.amm;
    
    // Get recent transactions for the pool
    const accountTx = await rpcRequest('account_tx', [{ 
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 20
    }]);

    // Parse AMM data
    const asset1 = amm?.amount;
    const asset2 = amm?.amount2;
    
    // Format token data
    const token1 = typeof asset1 === 'string' 
      ? { symbol: 'XRP', amount: dropsToXrp(asset1), logo: '/amm/images/xrp.svg' }
      : { 
          symbol: asset1?.currency || 'Unknown', 
          amount: asset1?.value || '0',
          issuer: asset1?.issuer,
          logo: '/amm/images/default.png' 
        };

    const token2 = typeof asset2 === 'string'
      ? { symbol: 'XRP', amount: dropsToXrp(asset2), logo: '/amm/images/xrp.svg' }
      : { 
          symbol: asset2?.currency || 'Unknown', 
          amount: asset2?.value || '0',
          issuer: asset2?.issuer,
          logo: '/amm/images/default.png' 
        };

    // Parse transactions
    const transactions = accountTx.result?.transactions?.map((tx: any) => {
      const txData = tx.tx || tx;
      const meta = tx.meta;
      
      return {
        hash: txData.hash,
        type: txData.TransactionType,
        account: txData.Account,
        date: txData.date ? rippleTimeToDate(txData.date) : '--',
        status: meta?.TransactionResult || 'unknown'
      };
    }).filter((tx: any) => 
      tx.type === 'AMMDeposit' || 
      tx.type === 'AMMWithdraw' || 
      tx.type === 'Payment'
    ) || [];

    return {
      ammId,
      address,
      token1,
      token2,
      fee: amm?.trading_fee ? (parseInt(amm.trading_fee) / 1000).toFixed(3) + '%' : '--',
      lpTokenBalance: amm?.lp_token?.value || '0',
      transactions
    };
  } catch (error) {
    console.error('Error fetching pool data:', error);
    throw error;
  }
}
