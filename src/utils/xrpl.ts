// XRPL utility functions

export type SearchType = 'address' | 'transaction' | 'token' | 'unknown';

/**
 * Decode hex currency code to readable string
 * XRPL uses 40-character hex strings for non-standard currency codes
 */
export function decodeCurrencyCode(currency: string): string {
  if (!currency || currency === 'XRP' || currency.length !== 40) {
    return currency;
  }
  
  try {
    let decoded = '';
    for (let i = 0; i < currency.length; i += 2) {
      const byte = parseInt(currency.substr(i, 2), 16);
      if (byte !== 0) decoded += String.fromCharCode(byte);
    }
    return decoded.trim() || currency.substring(0, 6);
  } catch (e) {
    return currency.substring(0, 6);
  }
}

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
 * Parse token format (CURRENCY.rISSUER or CURRENCY+rISSUER)
 */
export function parseTokenQuery(query: string): { currency: string; issuer: string } | null {
  const cleanQuery = query.trim();
  
  // Format: CURRENCY.rISSUER or CURRENCY+rISSUER
  const match = cleanQuery.match(/^([A-Za-z0-9]{3,40})[.+](r[A-Za-z0-9]{24,34})$/);
  if (match) {
    return {
      currency: match[1],
      issuer: match[2]
    };
  }
  
  return null;
}

/**
 * Determines the type of XRPL search query
 */
export function detectSearchType(query: string): SearchType {
  const trimmedQuery = query.trim();
  
  // Check if it's a token (currency.issuer or currency+issuer format)
  if (parseTokenQuery(trimmedQuery)) {
    return 'token';
  }
  
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
    const maxIterations = 150; // Increased to scan more ledger entries for all AMM pools
    
    console.log('Starting AMM pool fetch...');
    
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
        console.log(`Iteration ${iterations}: Got ${state.length} ledger entries`);
        
        // Filter for AMM entries only
        const ammEntries = state.filter((entry: any) => entry.LedgerEntryType === 'AMM');
        console.log(`Found ${ammEntries.length} AMM entries in this batch`);
        
        if (ammEntries.length > 0) {
          console.log('Sample AMM entry:', ammEntries[0]);
        }
        
        for (const entry of ammEntries) {
          // Use Asset and Asset2 from real XRPL data structure
          const asset1 = entry.Asset;
          const asset2 = entry.Asset2;
          
          // Format tokens - check if it's XRP (no issuer) or token (has issuer)
          const token1 = asset1?.currency === 'XRP' || !asset1?.issuer
            ? { symbol: 'XRP', amount: '0', currency: 'XRP' }
            : { 
                symbol: asset1.currency || 'Unknown', 
                amount: '0',
                currency: asset1.currency,
                issuer: asset1.issuer 
              };

          const token2 = asset2?.currency === 'XRP' || !asset2?.issuer
            ? { symbol: 'XRP', amount: '0', currency: 'XRP' }
            : { 
                symbol: asset2.currency || 'Unknown', 
                amount: '0',
                currency: asset2.currency,
                issuer: asset2.issuer 
              };

          // Decode hex currency codes using utility function
          token1.symbol = decodeCurrencyCode(token1.currency);
          token2.symbol = decodeCurrencyCode(token2.currency);

          pools.push({
            address: entry.Account,
            ammId: entry.AMMID || 'N/A',
            token1,
            token2,
            price: '0', // Price requires amm_info request
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
    
    console.log(`Finished fetching pools. Total found: ${pools.length}`);
    return pools;
  } catch (error) {
    console.error('Error fetching AMM pools:', error);
    throw error;
  }
}

/**
 * Fetch contributors (LP token holders) for an AMM pool
 */
export async function fetchPoolContributors(ammAccount: string, lpTokenCurrency: string) {
  try {
    console.log('Fetching contributors for AMM:', ammAccount);
    
    // Use account_lines to get all trustlines from the AMM account
    const response = await rpcRequest('account_lines', [{ 
      account: ammAccount,
      ledger_index: 'validated'
    }]);
    
    if (response.error || !response.result) {
      console.error('Failed to fetch account lines:', response.error);
      return [];
    }
    
    const lines = response.result.lines || [];
    console.log(`Found ${lines.length} trustlines for AMM account`);
    
    // Filter and map to contributors
    const contributors = lines
      .filter((line: any) => {
        // LP tokens have positive balance from AMM perspective (negative from holder)
        const balance = parseFloat(line.balance);
        return balance < 0; // Negative balance means the other account holds the tokens
      })
      .map((line: any) => ({
        address: line.account,
        lpTokens: Math.abs(parseFloat(line.balance)).toFixed(6)
      }))
      .filter((c: any) => parseFloat(c.lpTokens) > 0);
    
    console.log(`Found ${contributors.length} contributors with LP tokens`);
    
    // Sort by LP tokens (highest first)
    contributors.sort((a, b) => parseFloat(b.lpTokens) - parseFloat(a.lpTokens));
    
    return contributors.slice(0, 10); // Return top 10
  } catch (error) {
    console.error('Error fetching pool contributors:', error);
    return [];
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
          symbol: decodeCurrencyCode(asset1?.currency || 'Unknown'), 
          amount: asset1?.value || '0',
          issuer: asset1?.issuer,
          logo: '/amm/images/default.png' 
        };

    const token2 = typeof asset2 === 'string'
      ? { symbol: 'XRP', amount: dropsToXrp(asset2), logo: '/amm/images/xrp.svg' }
      : { 
          symbol: decodeCurrencyCode(asset2?.currency || 'Unknown'), 
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

/**
 * Get issued tokens from an address
 */
export async function getIssuedTokens(address: string) {
  try {
    const lines = await rpcRequest('account_lines', [{ 
      account: address,
      limit: 200,
      ledger_index: 'validated'
    }]);
    
    if (lines.error) {
      return [];
    }
    
    // Get tokens where balance is negative (issued by this account)
    const issuedTokens = (lines.result?.lines || [])
      .filter((line: any) => parseFloat(line.balance) < 0)
      .map((line: any) => ({
        currency: line.currency,
        issuer: address,
        totalIssued: Math.abs(parseFloat(line.balance))
      }));
    
    return issuedTokens;
  } catch (error) {
    console.error('Error getting issued tokens:', error);
    return [];
  }
}

/**
 * Fetch token data (trustlines, holders, transactions)
 */
export async function fetchTokenData(currency: string, issuer: string) {
  try {
    console.log('Fetching token data for:', currency, issuer);
    
    // Get issuer account info
    const issuerInfo = await rpcRequest('account_info', [{ 
      account: issuer,
      ledger_index: 'validated'
    }]);
    
    if (issuerInfo.error) {
      throw new Error(issuerInfo.error);
    }
    
    // Get all trustlines for this token (holders)
    const lines = await rpcRequest('account_lines', [{ 
      account: issuer,
      limit: 200,
      ledger_index: 'validated'
    }]);
    
    if (lines.error) {
      console.error('Error fetching account lines:', lines.error);
      return {
        currency,
        issuer,
        issuerInfo: issuerInfo.result.account_data,
        totalSupply: 0,
        holdersCount: 0,
        topHolders: [],
        transactions: []
      };
    }
    
    // Filter trustlines for this specific currency
    const tokenHolders = (lines.result?.lines || [])
      .filter((line: any) => line.currency === currency && parseFloat(line.balance) < 0)
      .map((line: any) => ({
        account: line.account,
        balance: Math.abs(parseFloat(line.balance)),
        limit: line.limit
      }))
      .sort((a: any, b: any) => b.balance - a.balance);
    
    // Calculate total supply (sum of all negative balances)
    const totalSupply = tokenHolders.reduce((sum: number, holder: any) => sum + holder.balance, 0);
    
    // Get recent transactions involving this token
    const transactions = await rpcRequest('account_tx', [
      { 
        account: issuer, 
        limit: 20,
        ledger_index_min: -1,
        ledger_index_max: -1
      }
    ]);
    
    // Filter transactions for this currency
    const tokenTransactions = (transactions.result?.transactions || [])
      .filter((tx: any) => {
        const meta = tx.tx;
        if (meta.Amount && typeof meta.Amount === 'object') {
          return meta.Amount.currency === currency && meta.Amount.issuer === issuer;
        }
        return false;
      });
    
    return {
      currency,
      issuer,
      issuerInfo: issuerInfo.result.account_data,
      totalSupply,
      holdersCount: tokenHolders.length,
      topHolders: tokenHolders.slice(0, 10),
      transactions: tokenTransactions
    };
  } catch (error) {
    console.error('Error in fetchTokenData:', error);
    throw error;
  }
}
