import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useExchange, WALLET_ACCOUNTS } from '../context/ExchangeContext';
import { LedgerTransaction, WalletAccountType } from '../types/exchange';
import {
  CoinIcon,
  formatFiat,
  formatPrice,
  USDT_SUPPORTED_NETWORKS,
} from './CoinIcon';

const SUPPORTED_ASSETS = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'USDC', 'XRP', 'TRX'];

export const ActivityTimelineView: React.FC<{
  compact?: boolean;
  defaultAssetFilter?: string;
}> = ({ compact = false, defaultAssetFilter = 'ALL' }) => {
  const {
    transactions,
    setSelectedTxDetail,
    settings,
    getAssetPriceUsd,
    switchAccountVerificationMode,
    syncReadOnlyExchangeApi,
    importTransactions,
    showToast,
  } = useExchange();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'transfer' | 'deposit' | 'withdraw' | 'convert' | 'spot' | 'futures' | 'earn' | 'p2p'
  >('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Completed' | 'Pending' | 'Cancelled'>('ALL');
  const [assetFilter, setAssetFilter] = useState<string>(defaultAssetFilter);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'session' | 'sample'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showImportBox, setShowImportBox] = useState<boolean>(false);
  const [importPayloadText, setImportPayloadText] = useState<string>('');
  const pageSize = compact ? 6 : 10;

  const exportStatementFile = (format: 'csv' | 'json') => {
    const filename = `nexustrade-statement-${new Date().toISOString().slice(0, 10)}.${format}`;
    let content = '';
    let mime = 'application/json';
    if (format === 'json') {
      content = JSON.stringify(filteredTransactions, null, 2);
    } else {
      mime = 'text/csv;charset=utf-8;';
      const header = 'id,refId,type,asset,amount,fee,status,timestamp,note\n';
      const rows = filteredTransactions
        .map(
          (t) =>
            `"${t.id}","${t.refId}","${t.type}","${t.asset}",${t.amount},${t.fee},"${t.status}","${new Date(
              t.timestamp
            ).toISOString()}","${(t.note || '').replace(/"/g, '""')}"`
        )
        .join('\n');
      content = header + rows;
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredTransactions.length} records to ${filename}`);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importPayloadText);
      const list = Array.isArray(parsed) ? parsed : parsed?.transactions || [parsed];
      const normalized: LedgerTransaction[] = list
        .filter((item: any) => item && typeof item.amount === 'number' && item.asset)
        .map((item: any, idx: number) => ({
          id: item.id || `imp-${Date.now()}-${idx}`,
          refId: item.refId || `IMP-${Math.floor(10000000 + Math.random() * 90000000)}`,
          type: item.type || 'deposit',
          asset: String(item.asset).toUpperCase(),
          amount: Number(item.amount),
          fee: Number(item.fee || 0),
          status: item.status || 'Completed',
          timestamp: item.timestamp || Date.now(),
          note: item.note || 'Imported Verified Statement Record',
          importedVerified: true,
          isSampleData: false,
          isDemo: true,
        }));
      if (normalized.length === 0) {
        showToast('No valid transaction records found in JSON input.');
        return;
      }
      const added = importTransactions(normalized);
      showToast(`Imported ${added} verified statement record(s) into SQLite ledger.`);
      setImportPayloadText('');
      setShowImportBox(false);
    } catch {
      showToast('Invalid JSON statement format.');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'spot') {
          if (tx.type !== 'spot_buy' && tx.type !== 'spot_sell') return false;
        } else if (typeFilter === 'futures') {
          if (tx.type !== 'futures_open' && tx.type !== 'futures_close') return false;
        } else if (typeFilter === 'earn') {
          if (tx.type !== 'earn_subscribe' && tx.type !== 'earn_redeem') return false;
        } else if (typeFilter === 'p2p') {
          if (tx.type !== 'p2p_buy' && tx.type !== 'p2p_sell') return false;
        } else if (tx.type !== typeFilter) {
          return false;
        }
      }

      if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
        return false;
      }

      if (assetFilter !== 'ALL' && tx.asset !== assetFilter && tx.secondaryAsset !== assetFilter) {
        return false;
      }

      if (sourceFilter === 'sample' && !tx.isSampleData) return false;
      if (sourceFilter === 'session' && tx.isSampleData) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRef = tx.refId.toLowerCase().includes(q);
        const matchNote = tx.note.toLowerCase().includes(q);
        const matchAsset = tx.asset.toLowerCase().includes(q);
        const matchNet = (tx.network || '').toLowerCase().includes(q);
        const matchAmt = String(tx.amount).includes(q);
        if (!matchRef && !matchNote && !matchAsset && !matchNet && !matchAmt) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, statusFilter, assetFilter, sourceFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, safePage, pageSize]);

  // Group paginated transactions chronologically by Month-Year AND Date
  const groupedByMonthAndDate = useMemo(() => {
    const monthGroups: {
      monthLabel: string;
      totalCount: number;
      dateGroups: { dateLabel: string; items: LedgerTransaction[] }[];
    }[] = [];
    const monthMap = new Map<
      string,
      {
        monthLabel: string;
        totalCount: number;
        dateGroups: { dateLabel: string; items: LedgerTransaction[] }[];
        dateMap: Map<string, LedgerTransaction[]>;
      }
    >();

    for (const tx of paginatedTransactions) {
      const d = new Date(tx.timestamp);
      const monthLabel = d.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      const dateLabel = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      if (!monthMap.has(monthLabel)) {
        const entry = {
          monthLabel,
          totalCount: 0,
          dateGroups: [] as { dateLabel: string; items: LedgerTransaction[] }[],
          dateMap: new Map<string, LedgerTransaction[]>(),
        };
        monthMap.set(monthLabel, entry);
        monthGroups.push(entry);
      }

      const mEntry = monthMap.get(monthLabel)!;
      mEntry.totalCount += 1;

      if (!mEntry.dateMap.has(dateLabel)) {
        const dItems: LedgerTransaction[] = [];
        mEntry.dateMap.set(dateLabel, dItems);
        mEntry.dateGroups.push({ dateLabel, items: dItems });
      }
      mEntry.dateMap.get(dateLabel)!.push(tx);
    }

    return monthGroups;
  }, [paginatedTransactions]);

  const handleFilterChange = (setter: () => void) => {
    setter();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3">
      {/* Search + Asset, Status, Source & Statement Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#202630] rounded-xl px-3.5 h-9 border border-[#2B3139] focus-within:border-[#F0B90B]">
          <Search className="w-3.5 h-3.5 text-[#848E9C] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
            placeholder="Search reference ID, type, network, or note..."
            className="w-full bg-transparent text-[12px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleFilterChange(() => setSearchQuery(''))}
              className="text-[#848E9C] hover:text-[#EAECEF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={assetFilter}
            onChange={(e) => handleFilterChange(() => setAssetFilter(e.target.value))}
            className="h-9 px-2.5 rounded-xl bg-[#202630] border border-[#2B3139] text-[11px] font-semibold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
            aria-label="Filter by Asset"
          >
            <option value="ALL">All Assets</option>
            {SUPPORTED_ASSETS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(() => setStatusFilter(e.target.value as any))}
            className="h-9 px-2.5 rounded-xl bg-[#202630] border border-[#2B3139] text-[11px] font-semibold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => handleFilterChange(() => setSourceFilter(e.target.value as any))}
            className="h-9 px-2.5 rounded-xl bg-[#202630] border border-[#2B3139] text-[11px] font-semibold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
            aria-label="Filter by Activity Source"
          >
            <option value="all">All Records ({transactions.length})</option>
            <option value="session">Session / Imported</option>
            <option value="sample">8M Statement Data</option>
          </select>

          <button
            type="button"
            onClick={() => exportStatementFile('csv')}
            className="h-9 px-2.5 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#F0B90B] text-[11px] font-semibold text-[#EAECEF] hover:text-[#F0B90B] transition-colors"
            title="Export CSV Statement"
          >
            CSV
          </button>

          <button
            type="button"
            onClick={() => exportStatementFile('json')}
            className="h-9 px-2.5 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#F0B90B] text-[11px] font-semibold text-[#EAECEF] hover:text-[#F0B90B] transition-colors"
            title="Export JSON Statement"
          >
            JSON
          </button>

          <button
            type="button"
            onClick={() => setShowImportBox((v) => !v)}
            className="h-9 px-2.5 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#F0B90B] text-[11px] font-semibold text-[#F0B90B] transition-colors"
          >
            Import
          </button>
        </div>
      </div>

      {/* Collapsible Statement Import Panel */}
      {showImportBox && (
        <div className="p-3.5 rounded-2xl bg-[#202630] border border-[#2B3139] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#EAECEF]">
              Import Verified Account Statement (JSON Array or Object)
            </span>
            <button
              type="button"
              onClick={() => setShowImportBox(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            rows={3}
            value={importPayloadText}
            onChange={(e) => setImportPayloadText(e.target.value)}
            placeholder='[{"type":"deposit","asset":"USDT","amount":5000,"note":"External Statement Deposit"}]'
            className="w-full p-2.5 rounded-xl bg-[#181A20] font-mono text-[11px] text-[#EAECEF] focus:outline-none border border-[#2B3139] focus:border-[#F0B90B]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleImportJson}
              className="px-3.5 py-1.5 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-[11px] font-bold"
            >
              Verify &amp; Import Statement
            </button>
          </div>
        </div>
      )}

      {/* Category Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All Types' },
          { id: 'transfer', label: 'Transfers' },
          { id: 'deposit', label: 'Deposits' },
          { id: 'withdraw', label: 'Withdrawals' },
          { id: 'convert', label: 'Conversions' },
          { id: 'spot', label: 'Spot Trades' },
          { id: 'futures', label: 'Futures' },
          { id: 'earn', label: 'Earn' },
          { id: 'p2p', label: 'P2P' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleFilterChange(() => setTypeFilter(tab.id as any))}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
              typeFilter === tab.id
                ? 'bg-[#2B3139] text-[#F0B90B]'
                : 'bg-[#202630] text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Honest Empty State vs Monthly & Date Grouped List */}
      {transactions.length === 0 ? (
        <div className="p-6 text-center bg-[#202630]/60 rounded-2xl border border-[#2B3139] space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#2B3139] text-[#EAECEF] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5 text-[#F0B90B]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-[14px] font-bold text-[#EAECEF]">
              No Verified Account Statement Loaded
            </h4>
            <p className="text-[12px] text-[#848E9C] leading-relaxed">
              Your account is currently in <strong>Unverified Empty Mode (0.00 USDT)</strong>.
              NexusTrade never fabricates transaction records for unverified accounts. Load a
              verified account statement, sync a Read-Only Exchange API, or import a JSON statement
              below.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => switchAccountVerificationMode('verified_statement')}
              className="px-3.5 py-2 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-[12px] font-bold"
            >
              Load Verified 16,845.00 USDT Statement (8M)
            </button>
            <button
              type="button"
              onClick={() => syncReadOnlyExchangeApi()}
              className="px-3.5 py-2 rounded-xl bg-[#2B3139] text-[#EAECEF] text-[12px] font-semibold hover:text-[#F0B90B]"
            >
              Sync Read-Only Exchange API
            </button>
            <button
              type="button"
              onClick={() => setShowImportBox(true)}
              className="px-3.5 py-2 rounded-xl bg-[#2B3139] text-[#EAECEF] text-[12px] font-semibold hover:text-[#F0B90B]"
            >
              Import Statement (.JSON)
            </button>
          </div>
        </div>
      ) : groupedByMonthAndDate.length === 0 ? (
        <div className="py-12 text-center text-[12px] text-[#848E9C] bg-[#202630]/40 rounded-2xl border border-[#2B3139]/60">
          No activity records match the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMonthAndDate.map((monthGroup) => (
            <div key={monthGroup.monthLabel} className="space-y-2">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#202630] text-[11px] font-bold text-[#EAECEF]">
                <span>{monthGroup.monthLabel}</span>
                <span className="font-mono tabular-nums text-[#848E9C]">
                  {monthGroup.totalCount} record(s)
                </span>
              </div>

              <div className="space-y-2 pl-1">
                {monthGroup.dateGroups.map((dateGroup) => (
                  <div key={dateGroup.dateLabel} className="space-y-1">
                    <div className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#848E9C]">
                      {dateGroup.dateLabel}
                    </div>

                    <div className="divide-y divide-[#2B3139]/60">
                      {dateGroup.items.map((tx) => {
                        const isTransfer = tx.type === 'transfer';
                        const isOut =
                          tx.type === 'withdraw' ||
                          tx.type === 'spot_sell' ||
                          tx.type === 'p2p_sell';
                        const txUsdVal = tx.amount * getAssetPriceUsd(tx.asset);

                        return (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() => setSelectedTxDetail(tx)}
                            className="w-full py-2.5 flex items-center justify-between text-left hover:bg-[#202630]/60 px-2 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[#202630] flex items-center justify-center shrink-0">
                                {isTransfer ? (
                                  <ArrowRightLeft className="w-4 h-4 text-[#F0B90B]" />
                                ) : isOut ? (
                                  <ArrowUpRight className="w-4 h-4 text-[#F6465D]" />
                                ) : (
                                  <ArrowDownLeft className="w-4 h-4 text-[#2EBD85]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[13px] font-bold text-[#EAECEF] truncate">
                                  {tx.note}
                                </div>
                                <div className="text-[11px] font-mono tabular-nums text-[#848E9C] flex flex-wrap items-center gap-x-1.5">
                                  <span>
                                    {new Date(tx.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span>·</span>
                                  <span>{tx.refId}</span>
                                  <span>·</span>
                                  <span className="text-[#848E9C]">
                                    {tx.importedVerified
                                      ? 'Verified Statement'
                                      : tx.isSampleData
                                      ? '8M Statement'
                                      : 'Session Ledger'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right font-mono tabular-nums shrink-0 ml-3">
                              <div
                                className={`text-[13px] font-bold ${
                                  tx.type === 'withdraw' || tx.type === 'p2p_sell'
                                    ? 'text-[#F6465D]'
                                    : isTransfer
                                    ? 'text-[#EAECEF]'
                                    : 'text-[#2EBD85]'
                                }`}
                              >
                                {tx.type === 'withdraw' || tx.type === 'p2p_sell'
                                  ? '-'
                                  : isTransfer
                                  ? ''
                                  : '+'}
                                {formatPrice(tx.amount, tx.asset === 'USDT' ? 2 : 4)} {tx.asset}
                              </div>
                              <div className="text-[10px] text-[#848E9C]">
                                ≈ {formatFiat(txUsdVal, settings.fiat)} · {tx.status}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="pt-2 border-t border-[#2B3139] flex items-center justify-between text-[11px]">
        <span className="text-[#848E9C] font-mono tabular-nums">
          Showing {filteredTransactions.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, filteredTransactions.length)} of{' '}
          {filteredTransactions.length} records
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold ${
              safePage <= 1
                ? 'bg-[#202630]/50 text-[#5E6673] cursor-not-allowed'
                : 'bg-[#202630] text-[#EAECEF] hover:bg-[#2B3139]'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>

          <span className="px-2 py-1 font-mono tabular-nums font-semibold text-[#EAECEF]">
            {safePage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold ${
              safePage >= totalPages
                ? 'bg-[#202630]/50 text-[#5E6673] cursor-not-allowed'
                : 'bg-[#202630] text-[#EAECEF] hover:bg-[#2B3139]'
            }`}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DepositWithdrawModals: React.FC = () => {
  const {
    isDepositMethodSheetOpen,
    setDepositMethodSheetOpen,
    depositModalState,
    openDepositModal,
    closeDepositModal,
    withdrawModalState,
    closeWithdrawModal,
    requestDeposit,
    requestWithdraw,
    wallets,
    historyModalOpen,
    setHistoryModalOpen,
    selectedTxDetail,
    setSelectedTxDetail,
    settings,
    getAssetPriceUsd,
    setExchangeTab,
    setTradeSubTab,
    setPayModalOpen,
    showToast,
  } = useExchange();

  // Deposit Form State
  const [depAsset, setDepAsset] = useState<string>(depositModalState.asset || 'USDT');
  const [depNetworkId, setDepNetworkId] = useState<string>('TRC20');
  const [depAmount, setDepAmount] = useState<string>('1000');
  const [depTargetAccount, setDepTargetAccount] = useState<WalletAccountType>('spot');

  // Withdraw Form State
  const [wdrAsset, setWdrAsset] = useState<string>(withdrawModalState.asset || 'USDT');
  const [wdrNetworkId, setWdrNetworkId] = useState<string>('TRC20');
  const [wdrAddress, setWdrAddress] = useState<string>('');
  const [wdrAmount, setWdrAmount] = useState<string>('');
  const [wdrSourceAccount, setWdrSourceAccount] = useState<WalletAccountType>('spot');
  const [wdrError, setWdrError] = useState<string | null>(null);

  const selectedDepNet =
    USDT_SUPPORTED_NETWORKS.find((n) => n.id === depNetworkId) || USDT_SUPPORTED_NETWORKS[0];
  const selectedWdrNet =
    USDT_SUPPORTED_NETWORKS.find((n) => n.id === wdrNetworkId) || USDT_SUPPORTED_NETWORKS[0];

  const wdrAvailable = wallets[wdrSourceAccount]?.[wdrAsset]?.available || 0;

  return (
    <>
      {/* 1. Select Deposit Method Bottom Sheet */}
      {isDepositMethodSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setDepositMethodSheetOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-4 pb-safe-bottom animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#EAECEF]">
                Select Deposit Method
              </h3>
              <button
                type="button"
                onClick={() => setDepositMethodSheetOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close deposit method sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 pb-1">
              <button
                type="button"
                onClick={() => {
                  setDepositMethodSheetOpen(false);
                  setDepAsset('USDT');
                  openDepositModal('USDT');
                }}
                className="w-full p-3.5 rounded-2xl border border-[#2B3139] bg-[#202630]/80 hover:border-[#F0B90B] flex items-center gap-3.5 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#EAECEF]">
                    Deposit Asset
                  </div>
                  <div className="text-[11px] text-[#848E9C] mt-0.5">
                    Simulate crypto deposit across TRC20, ERC20, BEP20, Solana &amp; Arbitrum
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDepositMethodSheetOpen(false);
                  setPayModalOpen(true);
                }}
                className="w-full p-3.5 rounded-2xl border border-[#2B3139] bg-[#202630]/80 hover:border-[#F0B90B] flex items-center gap-3.5 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#EAECEF]">
                    Receive Via Nexus Pay
                  </div>
                  <div className="text-[11px] text-[#848E9C] mt-0.5">
                    Receive crypto instantly from other NexusTrade users
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDepositMethodSheetOpen(false);
                  setExchangeTab('trade');
                  setTradeSubTab('p2p');
                }}
                className="w-full p-3.5 rounded-2xl border border-[#2B3139] bg-[#202630]/80 hover:border-[#F0B90B] flex items-center gap-3.5 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#EAECEF]">
                    P2P Trading
                  </div>
                  <div className="text-[11px] text-[#848E9C] mt-0.5">
                    Buy directly from verified merchants. Local payment
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDepositMethodSheetOpen(false);
                  setDepAsset('USDT');
                  openDepositModal('USDT');
                }}
                className="w-full p-3.5 rounded-2xl border border-[#2B3139] bg-[#202630]/80 hover:border-[#F0B90B] flex items-center gap-3.5 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#EAECEF]">
                    Buy with {settings.fiat}
                  </div>
                  <div className="text-[11px] text-[#848E9C] mt-0.5">
                    Buy crypto via bank transfer, card and simulated portfolio funding
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Deposit Crypto Modal */}
      {depositModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
          <div className="max-w-[430px] w-full mx-auto flex items-center justify-between px-4 h-12 border-b border-[#2B3139]/70 shrink-0">
            <button
              type="button"
              onClick={closeDepositModal}
              className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[16px] font-bold text-[#EAECEF]">Deposit Crypto</h2>
            <div className="w-8" />
          </div>

          <div className="max-w-[430px] w-full mx-auto flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
            <div className="p-3 rounded-xl bg-[#202630] border border-[#2B3139] text-[11px] text-[#848E9C] flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#F0B90B] shrink-0 mt-0.5" />
              <span>
                Preview Portfolio Simulation: Credited funds update your internal ledger
                immediately without broadcasting external blockchain transactions.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#848E9C] mb-2">
                Select Coin
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SUPPORTED_ASSETS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDepAsset(a)}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-bold border transition-colors ${
                      depAsset === a
                        ? 'bg-[#F0B90B]/15 border-[#F0B90B] text-[#EAECEF]'
                        : 'bg-[#202630] border-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    <CoinIcon asset={a} size="xs" />
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#848E9C] mb-2">
                Select Network ({depAsset})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {USDT_SUPPORTED_NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setDepNetworkId(net.id)}
                    className={`p-3 rounded-xl text-left border transition-colors ${
                      depNetworkId === net.id
                        ? 'bg-[#2B3139] text-[#EAECEF] border-[#F0B90B]'
                        : 'bg-[#202630] border-[#2B3139] text-[#848E9C] hover:border-[#474D57]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#EAECEF]">
                        {net.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#2EBD85]">{net.status}</span>
                    </div>
                    <div className="text-[10px] font-mono tabular-nums mt-1 text-[#848E9C]">
                      {net.confirmations} · {net.estimatedArrival} · Min {net.minDeposit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#848E9C] mb-1.5">
                Credit To Wallet
              </label>
              <select
                value={depTargetAccount}
                onChange={(e) => setDepTargetAccount(e.target.value as WalletAccountType)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#202630] border border-[#2B3139] text-[13px] font-semibold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
              >
                {WALLET_ACCOUNTS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-[#202630] space-y-2 border border-[#2B3139]">
              <div className="flex items-center justify-between text-[11px] text-[#848E9C]">
                <span className="font-bold text-[#EAECEF]">
                  Demo Exchange Ledger Deposit ({selectedDepNet.name})
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] font-mono text-[10px] font-bold">
                  DEMO LEDGER ONLY
                </span>
              </div>
              <p className="text-[11px] text-[#848E9C] leading-relaxed">
                No blockchain deposit address is fabricated in Demo Exchange Mode. Crediting a
                deposit below updates only your isolated internal Demo Portfolio Ledger (
                {selectedDepNet.standard}). Real custodial exchange deposit addresses require an
                authenticated exchange custody backend.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-medium text-[#848E9C]">
                  Demo Deposit Amount ({depAsset})
                </label>
                <div className="flex gap-1.5">
                  {['500', '1000', '5000', '10000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepAmount(preset)}
                      className="px-2 py-0.5 rounded-lg bg-[#2B3139] hover:bg-[#363C45] text-[11px] font-mono tabular-nums font-semibold text-[#EAECEF]"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                step="any"
                min="0"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#202630] border border-[#2B3139] font-mono tabular-nums text-[15px] font-bold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const amt = parseFloat(depAmount);
                const res = requestDeposit({
                  asset: depAsset,
                  network: selectedDepNet.name,
                  amount: amt,
                  toAccount: depTargetAccount,
                });
                if (res.ok) {
                  closeDepositModal();
                }
              }}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-[14px] transition-colors"
            >
              Credit Demo Ledger Deposit ({depAmount || '0'} {depAsset})
            </button>
          </div>
        </div>
      )}

      {/* 3. Withdraw / Send Crypto Modal */}
      {withdrawModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
          <div className="max-w-[430px] w-full mx-auto flex items-center justify-between px-4 h-12 border-b border-[#2B3139]/70 shrink-0">
            <button
              type="button"
              onClick={closeWithdrawModal}
              className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[15px] font-bold text-[#EAECEF] truncate">
              Exchange Custodial Withdrawal
            </h2>
            <div className="w-8" />
          </div>

          <div className="max-w-[430px] w-full mx-auto flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[11px] text-[#EAECEF] leading-relaxed">
              <strong className="text-[#F0B90B]">Custody Boundary Notice:</strong> Withdrawing from
              an exchange account is a custodial exchange action. A self-custody wallet (EIP-1193,
              Solana, or Bitcoin) cannot authorize a centralized exchange withdrawal. Without an
              authenticated Exchange Withdrawal API backend, submitting below records an internal{' '}
              <strong>Demo Ledger Entry</strong> only and does not broadcast to any blockchain.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#848E9C] mb-1.5">
                  Asset
                </label>
                <select
                  value={wdrAsset}
                  onChange={(e) => {
                    setWdrAsset(e.target.value);
                    setWdrError(null);
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-[#202630] border border-[#2B3139] text-[13px] font-bold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                >
                  {SUPPORTED_ASSETS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#848E9C] mb-1.5">
                  From Wallet
                </label>
                <select
                  value={wdrSourceAccount}
                  onChange={(e) => {
                    setWdrSourceAccount(e.target.value as WalletAccountType);
                    setWdrError(null);
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-[#202630] border border-[#2B3139] text-[13px] font-semibold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                >
                  {WALLET_ACCOUNTS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.shortLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#848E9C] mb-1.5">
                Network
              </label>
              <div className="grid grid-cols-2 gap-2">
                {USDT_SUPPORTED_NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setWdrNetworkId(net.id)}
                    className={`p-2.5 rounded-xl text-left border transition-colors ${
                      wdrNetworkId === net.id
                        ? 'bg-[#2B3139] text-[#F0B90B] border-[#F0B90B]'
                        : 'bg-[#202630] border-[#2B3139] text-[#848E9C] hover:border-[#474D57]'
                    }`}
                  >
                    <div className="text-[12px] font-bold text-[#EAECEF]">
                      {net.name}
                    </div>
                    <div className="text-[10px] font-mono tabular-nums">Fee: {net.withdrawFee}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#848E9C] mb-1.5">
                Recipient Label / Destination Address (Demo Ledger Record)
              </label>
              <input
                type="text"
                value={wdrAddress}
                onChange={(e) => {
                  setWdrAddress(e.target.value);
                  setWdrError(null);
                }}
                placeholder="Enter recipient address or demo account label"
                className="w-full h-11 px-3.5 rounded-xl bg-[#202630] border border-[#2B3139] font-mono text-[12px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none focus:border-[#F0B90B]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-[#848E9C] font-medium">Withdrawal Amount</span>
                <span className="font-mono tabular-nums text-[#848E9C]">
                  Available:{' '}
                  <strong className="text-[#EAECEF]">
                    {formatPrice(wdrAvailable, wdrAsset === 'USDT' ? 2 : 4)} {wdrAsset}
                  </strong>
                </span>
              </div>
              <div className="relative flex items-center bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-xl px-3.5 h-11">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={wdrAmount}
                  onChange={(e) => {
                    setWdrAmount(e.target.value);
                    setWdrError(null);
                  }}
                  placeholder="0.00"
                  className="w-full bg-transparent font-mono tabular-nums text-[14px] font-bold text-[#EAECEF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setWdrAmount(String(wdrAvailable))}
                  className="text-[12px] font-bold text-[#F0B90B] ml-2"
                >
                  Max
                </button>
              </div>
            </div>

            {wdrError && (
              <div className="p-3 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 text-[12px] text-[#F6465D]">
                {wdrError}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const res = requestWithdraw({
                  asset: wdrAsset,
                  network: selectedWdrNet.name,
                  address: wdrAddress,
                  amount: parseFloat(wdrAmount),
                  fromAccount: wdrSourceAccount,
                });
                if (!res.ok) {
                  setWdrError(res.message);
                } else {
                  setWdrAddress('');
                  setWdrAmount('');
                  closeWithdrawModal();
                }
              }}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-[14px] transition-colors"
            >
              Record Demo Ledger Withdrawal
            </button>
          </div>
        </div>
      )}

      {/* 4. Full Six-Month Transaction History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
          <div className="max-w-2xl w-full mx-auto flex items-center justify-between px-4 h-12 border-b border-[#2B3139]/70 shrink-0">
            <button
              type="button"
              onClick={() => setHistoryModalOpen(false)}
              className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-[15px] font-bold text-[#EAECEF]">
                Activity &amp; Transaction History
              </h2>
              <p className="text-[10px] text-[#848E9C]">
                Preview Portfolio · Chronological Timeline
              </p>
            </div>
            <div className="w-8" />
          </div>

          <div className="max-w-2xl w-full mx-auto flex-1 overflow-y-auto overscroll-contain p-4">
            <ActivityTimelineView />
          </div>
        </div>
      )}

      {/* 5. Transaction Detail Modal (Requirement 4) */}
      {selectedTxDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedTxDetail(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#2B3139] p-5 space-y-4 pb-safe-bottom animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1 sm:hidden" />
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#EAECEF]">
                Transaction Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTxDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close transaction details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4 border-y border-[#2B3139]">
              <div className="w-11 h-11 rounded-full bg-[#2EBD85]/15 text-[#2EBD85] flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6" />
              </div>
              <div className="text-2xl font-mono tabular-nums font-extrabold text-white">
                {formatPrice(selectedTxDetail.amount, selectedTxDetail.asset === 'USDT' ? 2 : 4)}{' '}
                {selectedTxDetail.asset}
              </div>
              <div className="text-[12px] font-mono tabular-nums text-[#848E9C] mt-0.5">
                ≈{' '}
                {formatFiat(
                  selectedTxDetail.amount * getAssetPriceUsd(selectedTxDetail.asset),
                  settings.fiat
                )}
              </div>
              <div className="text-[12px] font-semibold text-[#2EBD85] mt-1">
                {selectedTxDetail.status}
              </div>
            </div>

            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-[#848E9C]">Internal Reference ID</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedTxDetail.refId);
                    showToast('Reference ID copied');
                  }}
                  className="font-mono tabular-nums font-semibold text-[#EAECEF] hover:text-[#F0B90B] flex items-center gap-1"
                >
                  <span>{selectedTxDetail.refId}</span>
                  <Copy className="w-3 h-3 text-[#848E9C]" />
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Record Classification</span>
                <span className="font-semibold text-[#EAECEF]">
                  {selectedTxDetail.importedVerified
                    ? 'Imported Activity Record'
                    : selectedTxDetail.isSampleData
                    ? 'Sample Data (8-Month Timeline)'
                    : 'Simulated Session Activity'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Transaction Type</span>
                <span className="font-semibold uppercase text-[#EAECEF]">
                  {selectedTxDetail.type.replace('_', ' ')}
                </span>
              </div>
              {selectedTxDetail.fromAccount && (
                <div className="flex justify-between">
                  <span className="text-[#848E9C]">From Wallet</span>
                  <span className="font-semibold text-[#EAECEF]">
                    {WALLET_ACCOUNTS.find((a) => a.id === selectedTxDetail.fromAccount)?.label ||
                      selectedTxDetail.fromAccount}
                  </span>
                </div>
              )}
              {selectedTxDetail.toAccount && (
                <div className="flex justify-between">
                  <span className="text-[#848E9C]">To Wallet</span>
                  <span className="font-semibold text-[#EAECEF]">
                    {WALLET_ACCOUNTS.find((a) => a.id === selectedTxDetail.toAccount)?.label ||
                      selectedTxDetail.toAccount}
                  </span>
                </div>
              )}
              {selectedTxDetail.secondaryAsset && selectedTxDetail.secondaryAmount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#848E9C]">Counterparty Amount</span>
                  <span className="font-mono tabular-nums font-semibold text-[#EAECEF]">
                    {formatPrice(selectedTxDetail.secondaryAmount, 4)}{' '}
                    {selectedTxDetail.secondaryAsset}
                  </span>
                </div>
              )}
              {selectedTxDetail.price !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#848E9C]">Execution Price</span>
                  <span className="font-mono tabular-nums text-[#EAECEF]">
                    {formatPrice(selectedTxDetail.price)}
                  </span>
                </div>
              )}
              {selectedTxDetail.network && (
                <div className="flex justify-between">
                  <span className="text-[#848E9C]">Network</span>
                  <span className="font-mono text-[#EAECEF]">
                    {selectedTxDetail.network}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Fee</span>
                <span className="font-mono tabular-nums text-[#EAECEF]">
                  {selectedTxDetail.fee} {selectedTxDetail.asset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Date &amp; Time</span>
                <span className="font-mono tabular-nums text-[#EAECEF]">
                  {new Date(selectedTxDetail.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-[#2B3139] text-[#EAECEF]">
                {selectedTxDetail.note}
              </div>
              <div className="text-[11px] text-[#848E9C]">
                Note: This record belongs to the internal simulated ledger. No external blockchain
                transaction hash is generated.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxDetail(null)}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-[14px] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
