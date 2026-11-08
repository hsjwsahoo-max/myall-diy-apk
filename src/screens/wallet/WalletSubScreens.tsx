import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Globe,
  Info,
  KeyRound,
  Layers,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { CoinIcon } from '../../components/CoinIcon';
import { EVM_CHAIN_CONFIGS, VERIFIED_TOKEN_REGISTRY } from '../../services/walletProviderService';
import {
  EncryptedKeystoreVault,
  RealOnChainTransaction,
  WalletEcosystem,
} from '../../types/exchange';
import { PWAInstallButton } from '../../components/pwa/PWAInstallButton';
import {
  formatInrValue,
  formatQuantity,
  formatTimestamp,
  formatUsdValue,
  KeylessCheckBadge,
  KeylessWalletAvatar,
  LivePortfolioValuation,
  PREVIEW_HISTORY_MONTH_OPTIONS,
  PREVIEW_PORTFOLIO_CONFIG,
  PREVIEW_SIX_MONTH_USDT_TIMELINE,
  PreviewHistoryTimelineEntry,
  WalletValuationSourceMode,
} from './WalletDataAndFloatingDiamond';

export type WalletSubScreenId =
  | 'main'
  | 'usdt_detail'
  | 'portfolio'
  | 'send'
  | 'receive'
  | 'history'
  | 'approvals'
  | 'settings'
  | 'my_wallets'
  | 'networks';

interface WalletSubScreensProps {
  subScreen: Exclude<WalletSubScreenId, 'main'>;
  setSubScreen: (s: WalletSubScreenId) => void;
  isWalletActive: boolean;
  activeValuationMode: WalletValuationSourceMode;
  onSelectValuationMode: (mode: WalletValuationSourceMode) => void;
  valuation: LivePortfolioValuation;
  hideBalance: boolean;
  setHideBalance: (v: boolean) => void;
  activeWalletLabel: string;
  activePrimaryAddress: string;
  verifiedWeb3UsdBalance: number;
  verifiedOnChainAssets: {
    key: string;
    symbol: string;
    name: string;
    chainName: string;
    balance: number;
    usdPrice: number;
    usdValue: number;
    ecosystem: WalletEcosystem;
  }[];
  realOnChainTxs: RealOnChainTransaction[];
  localVault: EncryptedKeystoreVault | null;
  qrDataUrl: string;
  receiveChainTab: 'EVM' | 'SOLANA' | 'BITCOIN';
  setReceiveChainTab: (t: 'EVM' | 'SOLANA' | 'BITCOIN') => void;
  activeReceiveAddress: string;
  sendEcosystem: WalletEcosystem;
  setSendEcosystem: (e: WalletEcosystem) => void;
  sendTokenSymbol: string;
  setSendTokenSymbol: (s: string) => void;
  sendRecipientInput: string;
  setSendRecipientInput: (s: string) => void;
  sendAmountInput: string;
  setSendAmountInput: (s: string) => void;
  isBroadcastingTx: boolean;
  lastBroadcastTx: RealOnChainTransaction | null;
  onBroadcastSend: () => void;
  onStartCreateVault: () => void;
  onStartImportVault: () => void;
  onOpenConnectModal: () => void;
  onOpenUnlockModal: () => void;
  onRemoveVault: () => void;
  onSelectTxRecord: (tx: RealOnChainTransaction) => void;
  onSwitchToExchangeDeposit: (asset?: string) => void;
  onSwitchToExchangeAssets: () => void;
  onNavigateWalletTab: (tab: 'home' | 'markets' | 'trade' | 'discover' | 'assets') => void;
  onSwitchEvmChain: (chainId: number) => void;
  onRefreshOnChain: () => void;
  isRefreshingBalances: boolean;
  showToast: (msg: string) => void;
  cryptoDisclosure: { cipher: string; disclosureText: string };
}

function shortenAddr(addr?: string): string {
  if (!addr) return '0x9F8c...19A3';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export const WalletSubScreens: React.FC<WalletSubScreensProps> = ({
  subScreen,
  setSubScreen,
  isWalletActive,
  activeValuationMode,
  onSelectValuationMode,
  valuation,
  hideBalance,
  setHideBalance,
  activeWalletLabel,
  activePrimaryAddress,
  verifiedOnChainAssets,
  realOnChainTxs,
  localVault,
  qrDataUrl,
  receiveChainTab,
  setReceiveChainTab,
  activeReceiveAddress,
  sendEcosystem,
  setSendEcosystem,
  sendTokenSymbol,
  setSendTokenSymbol,
  sendRecipientInput,
  setSendRecipientInput,
  sendAmountInput,
  setSendAmountInput,
  isBroadcastingTx,
  lastBroadcastTx,
  onBroadcastSend,
  onStartCreateVault,
  onStartImportVault,
  onOpenConnectModal,
  onOpenUnlockModal,
  onRemoveVault,
  onSelectTxRecord,
  onSwitchToExchangeDeposit,
  onSwitchToExchangeAssets,
  onNavigateWalletTab,
  onSwitchEvmChain,
  onRefreshOnChain,
  isRefreshingBalances,
  showToast,
  cryptoDisclosure,
}) => {
  const [usdtNetworkTab, setUsdtNetworkTab] = useState<
    'BNB Smart Chain' | 'Ethereum' | 'Solana' | 'opBNB'
  >('BNB Smart Chain');
  const [portfolioTab, setPortfolioTab] = useState<'Tokens' | 'Stocks' | 'DeFi' | 'NFTs'>('Tokens');
  const [sendStep, setSendStep] = useState<'menu' | 'form'>('menu');
  const [receiveStep, setReceiveStep] = useState<'menu' | 'qr'>('menu');
  const [historySearch, setHistorySearch] = useState('');
  const [historyDirectionFilter, setHistoryDirectionFilter] = useState<'ALL' | 'RECEIVE' | 'SEND'>(
    'ALL'
  );
  const [historyNetworkFilter, setHistoryNetworkFilter] = useState<
    'All Networks' | 'BNB Smart Chain' | 'Ethereum' | 'Solana' | 'opBNB'
  >('All Networks');
  const [historyDateFilter, setHistoryDateFilter] = useState<
    'ALL' | '2026-11' | '2026-10' | '2026-09' | '2026-08' | '2026-07' | '2026-06'
  >('ALL');
  const [showHistoryFilterSheet, setShowHistoryFilterSheet] = useState(false);
  const [selectedPreviewSampleEntry, setSelectedPreviewSampleEntry] =
    useState<PreviewHistoryTimelineEntry | null>(null);

  const [showAddWalletSheet, setShowAddWalletSheet] = useState(false);
  const [currencyPref, setCurrencyPref] = useState<'INR' | 'USD' | 'EUR' | 'AED'>('INR');
  const [secureAutoSign, setSecureAutoSign] = useState(true);
  const [contractInspectInput, setContractInspectInput] = useState('');
  const [showContractScanner, setShowContractScanner] = useState(false);

  const isPreviewMode = activeValuationMode === 'preview_portfolio';

  // Strictly separated quantities:
  // In Preview Mode -> 11,352.81 USDT (Preview Assumption)
  // In Verified On-Chain Mode -> verifiedUsdtQuantity (Genuine RPC only, never mixed)
  const displayedUsdtQty = valuation.displayedUsdtQuantity;
  const displayedUsdTotal = valuation.displayedUsdValue;
  const displayedInrTotal = valuation.displayedInrValue;

  // Filtered & Month-Grouped 6-Month Preview Timeline
  const filteredPreviewTimeline = useMemo(() => {
    return PREVIEW_SIX_MONTH_USDT_TIMELINE.filter((item) => {
      if (historyDirectionFilter === 'RECEIVE' && item.type !== 'Receive') return false;
      if (historyDirectionFilter === 'SEND' && item.type !== 'Send') return false;
      if (
        historyNetworkFilter !== 'All Networks' &&
        item.networkLabel !== historyNetworkFilter
      ) {
        return false;
      }
      if (historyDateFilter !== 'ALL' && item.monthKey !== historyDateFilter) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.trim().toLowerCase();
        const haystack = `${item.asset} ${item.networkLabel} ${item.dateStr} ${item.monthLabel} ${item.sampleStatus}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [historyDirectionFilter, historyNetworkFilter, historyDateFilter, historySearch]);

  const groupedPreviewByMonth = useMemo(() => {
    const groups: {
      monthKey: string;
      monthLabel: string;
      totalUsdt: number;
      entries: PreviewHistoryTimelineEntry[];
    }[] = [];

    for (const item of filteredPreviewTimeline) {
      let existing = groups.find((g) => g.monthKey === item.monthKey);
      if (!existing) {
        existing = {
          monthKey: item.monthKey,
          monthLabel: item.monthLabel,
          totalUsdt: 0,
          entries: [],
        };
        groups.push(existing);
      }
      existing.entries.push(item);
      existing.totalUsdt += item.amount;
    }
    return groups;
  }, [filteredPreviewTimeline]);

  // Transaction Detail Modal
  const renderSampleEntryDetailModal = () => {
    if (!selectedPreviewSampleEntry) return null;
    const entry = selectedPreviewSampleEntry;
    const inrEquivalent = entry.amount * valuation.inrPerUsdt;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={() => setSelectedPreviewSampleEntry(null)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#2B3139] p-5 pb-8 sm:pb-5 space-y-4 animate-in slide-in-from-bottom duration-200"
        >
          <div className="w-9 h-1 rounded-full bg-[#474D57] mx-auto -mt-1 mb-1 sm:hidden" />

          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#EAECEF]">Transaction Details</h3>
            <button
              type="button"
              onClick={() => setSelectedPreviewSampleEntry(null)}
              className="p-1.5 rounded-full bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]"
            >
              <X size={16} />
            </button>
          </div>

          {/* Center Amount Summary */}
          <div className="py-3 text-center border-y border-[#2B3139]/80 space-y-1">
            <div className="inline-flex items-center justify-center relative mb-1">
              <CoinIcon asset={entry.asset} size="lg" />
              <span
                className="absolute -bottom-0.5 -right-0.5 px-1 rounded text-[8px] font-extrabold text-[#181A20]"
                style={{ backgroundColor: entry.badgeColor }}
              >
                {entry.chainBadge}
              </span>
            </div>
            <div
              className={`text-[26px] font-extrabold tabular-nums ${
                entry.type === 'Receive' ? 'text-[#0ECB81]' : 'text-[#EAECEF]'
              }`}
            >
              {entry.type === 'Receive' ? '+' : '-'}
              {formatQuantity(entry.amount)} {entry.asset}
            </div>
            <div className="text-[12px] text-[#848E9C] tabular-nums">
              ≈ {formatInrValue(inrEquivalent)}
            </div>
          </div>

          {/* Metadata Rows */}
          <div className="space-y-2.5 text-[12px] bg-[#181A20] p-4 rounded-2xl border border-[#2B3139]">
            <div className="flex items-center justify-between">
              <span className="text-[#848E9C]">Status</span>
              <span className="font-semibold text-[#0ECB81]">Completed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#848E9C]">Type</span>
              <span className="font-semibold text-[#EAECEF] flex items-center gap-1.5">
                {entry.type === 'Receive' ? (
                  <ArrowDownLeft size={13} className="text-[#0ECB81]" />
                ) : (
                  <ArrowUpRight size={13} className="text-[#848E9C]" />
                )}
                {entry.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#848E9C]">Asset</span>
              <span className="font-semibold text-[#EAECEF]">{entry.asset}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#848E9C]">Network</span>
              <span className="font-semibold text-[#EAECEF]">{entry.networkLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#848E9C]">Date</span>
              <span className="font-medium text-[#EAECEF] tabular-nums">
                {entry.dateStr} {entry.timeStr}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedPreviewSampleEntry(null)}
            className="w-full h-11 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-[14px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 1. USDT TOKEN DETAILS (Matches 00:42 - 00:54 of Reference Recording)
  // =========================================================================
  if (subScreen === 'usdt_detail') {
    const netQty = usdtNetworkTab === 'BNB Smart Chain' ? displayedUsdtQty : 0;
    const netInr = usdtNetworkTab === 'BNB Smart Chain' ? displayedInrTotal : 0;
    const isUp24h = valuation.usdt24hChangePct >= 0;

    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        {/* Top Bar: <- Back | [USDT Icon] USDT */}
        <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubScreen('main')}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B] transition-colors"
            aria-label="Back to Assets"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <CoinIcon asset="USDT" size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F0B90B] border border-[#181A20]" />
            </div>
            <span className="text-[17px] font-bold text-[#EAECEF]">USDT</span>
          </div>
          <div className="w-7" />
        </div>

        {/* Network Tabs: BNB Smart Chain | Ethereum | Solana | opBNB v */}
        <div className="px-4 border-b border-[#2B3139]/80 flex items-center gap-5 overflow-x-auto no-scrollbar">
          {(['BNB Smart Chain', 'Ethereum', 'Solana', 'opBNB'] as const).map((net) => {
            const active = usdtNetworkTab === net;
            return (
              <button
                key={net}
                type="button"
                onClick={() => setUsdtNetworkTab(net)}
                className={`py-2.5 text-[14px] whitespace-nowrap relative flex items-center gap-1 transition-colors ${
                  active ? 'font-bold text-[#EAECEF]' : 'font-medium text-[#848E9C]'
                }`}
              >
                <span>{net}</span>
                {net === 'opBNB' && <ChevronDown size={13} className="text-[#848E9C]" />}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-[#F0B90B]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 pt-4 pb-24">
          {/* Balance Header (Matches 00:43 - 00:54) */}
          <div className="flex items-center gap-1.5 text-[12px] text-[#848E9C]">
            <span>Balance</span>
            <button
              type="button"
              onClick={() => setHideBalance(!hideBalance)}
              className="text-[#848E9C] hover:text-[#EAECEF]"
            >
              {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="mt-1">
            <div className="text-[32px] leading-[38px] font-bold text-[#EAECEF] tabular-nums">
              {hideBalance ? '******' : formatQuantity(netQty)}
            </div>
            <div className="text-[13px] text-[#848E9C] tabular-nums mt-0.5">
              {hideBalance ? '******' : `≈ ${formatInrValue(netInr)}`}
            </div>
          </div>

          {/* 4 Action Buttons: Send | Receive | Swap | Bridge (2-Tone White + Yellow SVGs matching frame_050.jpg) */}
          <div className="grid grid-cols-4 gap-3 my-4">
            {[
              {
                label: 'Send',
                svg: (
                  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                    <path
                      d="M12 16V5M12 5L7.5 9.5M12 5L16.5 9.5"
                      stroke="#EAECEF"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M6.5 19h11" stroke="#F0B90B" strokeWidth="2.1" strokeLinecap="round" />
                  </svg>
                ),
                onClick: () => {
                  setSendTokenSymbol('USDT');
                  setSendStep('menu');
                  setSubScreen('send');
                },
              },
              {
                label: 'Receive',
                svg: (
                  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                    <path
                      d="M12 5v11M12 16l-4.5-4.5M12 16l4.5-4.5"
                      stroke="#EAECEF"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M6.5 19h11" stroke="#F0B90B" strokeWidth="2.1" strokeLinecap="round" />
                  </svg>
                ),
                onClick: () => {
                  setReceiveStep('menu');
                  setSubScreen('receive');
                },
              },
              {
                label: 'Swap',
                svg: (
                  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                    <path
                      d="M5 9h14l-3.5-3.5"
                      stroke="#EAECEF"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 15H5l3.5 3.5"
                      stroke="#F0B90B"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
                onClick: () => {
                  setSubScreen('main');
                  onNavigateWalletTab('trade');
                },
              },
              {
                label: 'Bridge',
                svg: (
                  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                    <path
                      d="M4 16c2.5-5 5.5-7.5 8-7.5s5.5 2.5 8 7.5"
                      stroke="#EAECEF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="8.5" r="2.5" fill="#F0B90B" />
                    <path d="M4 18h16" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
                onClick: () => {
                  setSubScreen('main');
                  onNavigateWalletTab('trade');
                },
              },
            ].map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={act.onClick}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-full h-[52px] rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-center text-[#EAECEF] transition-colors">
                  {act.svg}
                </div>
                <span className="text-[12px] text-[#EAECEF] font-medium">{act.label}</span>
              </button>
            ))}
          </div>

          {/* Earn up to 10.98% APY Card (Matches 00:48 - 00:54) */}
          <div
            onClick={() => {
              setSubScreen('main');
              onNavigateWalletTab('discover');
            }}
            className="p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139]/80 flex items-center gap-3.5 cursor-pointer transition-colors mb-5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#181A20]/70 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
                <rect
                  x="4.5"
                  y="4.5"
                  width="19"
                  height="19"
                  rx="4"
                  stroke="#EAECEF"
                  strokeWidth="2"
                />
                <path
                  d="M9 17.5l3.5-3.5 2.5 2.5 4.5-5"
                  stroke="#EAECEF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M19.5 6l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1 1-2.2z" fill="#F0B90B" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#EAECEF]">Earn up to 10.98% APY</div>
              <div className="text-[12px] font-semibold text-[#F0B90B] mt-0.5">Start earning</div>
            </div>
          </div>

          {/* History Section (Matches 00:48 - 00:54) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[16px] font-bold text-[#EAECEF]">History</h3>
              <button
                type="button"
                onClick={() => setSubScreen('history')}
                className="p-1 text-[#848E9C] hover:text-[#EAECEF]"
                title="Open History"
              >
                <Filter size={15} />
              </button>
            </div>

            {isPreviewMode ? (
              (() => {
                const netSampleEntries = PREVIEW_SIX_MONTH_USDT_TIMELINE.filter(
                  (e) => e.networkLabel === usdtNetworkTab
                );
                if (netSampleEntries.length === 0) {
                  return (
                    <div className="text-[12px] text-[#474D57] text-center py-8">
                      No more records found
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {netSampleEntries.map((entry) => (
                      <div key={entry.id} className="space-y-1.5">
                        <div className="text-[12px] text-[#848E9C] tabular-nums">
                          {entry.dateStr}
                        </div>
                        <div
                          onClick={() => setSelectedPreviewSampleEntry(entry)}
                          className="py-2 flex items-center justify-between cursor-pointer hover:bg-[#202630]/40 rounded-lg px-1 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-[#848E9C] shrink-0">
                              {entry.type === 'Receive' ? (
                                <ArrowDownLeft size={16} />
                              ) : (
                                <ArrowUpRight size={16} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[15px] font-medium text-[#EAECEF]">
                                {entry.type}
                              </div>
                              <div className="text-[12px] text-[#848E9C] truncate tabular-nums">
                                {entry.networkLabel} · {entry.timeStr.slice(0, 5)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 pl-2">
                            <div
                              className={`text-[15px] font-semibold tabular-nums ${
                                entry.type === 'Receive' ? 'text-[#0ECB81]' : 'text-[#EAECEF]'
                              }`}
                            >
                              {entry.type === 'Receive' ? '+' : '-'}
                              {formatQuantity(entry.amount)} USDT
                            </div>
                            <div className="relative">
                              <CoinIcon asset="USDT" size="sm" />
                              <span
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#181A20]"
                                style={{ backgroundColor: entry.badgeColor }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-[12px] text-[#474D57] text-center py-4">
                      No more records found
                    </div>
                  </div>
                );
              })()
            ) : realOnChainTxs.length > 0 ? (
              <div className="space-y-2 divide-y divide-[#2B3139]/60">
                {realOnChainTxs.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTxRecord(tx)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#202630]/40 rounded-lg px-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-[#848E9C]">
                        <ArrowUpRight size={16} />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#EAECEF]">Send</div>
                        <div className="text-[12px] text-[#848E9C] font-mono">
                          To: {shortenAddr(tx.toAddress)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#EAECEF] tabular-nums">
                        -{tx.amount} {tx.asset}
                      </span>
                      <CoinIcon asset={tx.asset} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-[#474D57] text-center py-10">
                No more records found
              </div>
            )}
          </div>
          {renderSampleEntryDetailModal()}
        </div>

        {/* Sticky Bottom Live USDT Price Bar (Matches 00:43 - 00:54) */}
        <div
          onClick={() => {
            setSubScreen('main');
            onNavigateWalletTab('markets');
          }}
          className="fixed bottom-0 inset-x-0 z-30 bg-[#181A20] border-t border-[#2B3139] px-4 h-12 pb-safe-bottom flex items-center justify-between cursor-pointer hover:bg-[#202630]/60"
        >
          <div className="flex items-center gap-2">
            <CoinIcon asset="USDT" size="sm" />
            <span className="text-[14px] font-bold text-[#EAECEF]">USDT</span>
          </div>
          <div className="flex items-center gap-2 tabular-nums">
            <span className="text-[13px] font-semibold text-[#EAECEF]">
              {valuation.usdtUsdPrice.toFixed(5)}
            </span>
            <span
              className={`text-[13px] font-semibold ${
                isUp24h ? 'text-[#0ECB81]' : 'text-[#F6465D]'
              }`}
            >
              {isUp24h ? '+' : ''}
              {valuation.usdt24hChangePct.toFixed(2)}%
            </span>
            <ChevronRight size={15} className="text-[#848E9C]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PORTFOLIO OVERVIEW (Matches 01:02 - 01:09 of Reference Recording)
  // =========================================================================
  if (subScreen === 'portfolio') {
    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubScreen('main')}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B]"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[17px] font-bold text-[#EAECEF]">Portfolio</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubScreen('approvals')}
              className="p-1.5 text-[#848E9C] hover:text-[#EAECEF]"
            >
              <ShieldCheck size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSubScreen('my_wallets')}
              className="p-1.5 text-[#848E9C] hover:text-[#EAECEF]"
            >
              <Wallet size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="text-[12px] text-[#848E9C]">Est. Total Value</div>
          <div className="text-[28px] font-bold text-[#EAECEF] tabular-nums mt-0.5">
            {hideBalance ? '******' : formatInrValue(displayedInrTotal)}
          </div>
        </div>

        {/* Category Tabs: Tokens | Stocks | DeFi | NFTs */}
        <div className="px-4 border-b border-[#2B3139] flex items-center gap-6">
          {(['Tokens', 'Stocks', 'DeFi', 'NFTs'] as const).map((t) => {
            const active = portfolioTab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setPortfolioTab(t)}
                className={`py-2.5 text-[14px] font-semibold relative ${
                  active ? 'text-[#EAECEF]' : 'text-[#848E9C]'
                }`}
              >
                {t}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-full bg-[#F0B90B]" />
                )}
              </button>
            );
          })}
        </div>

        {portfolioTab === 'Tokens' && displayedInrTotal > 0 ? (
          <div className="p-4 space-y-5">
            {/* Donut Chart + Legend Row */}
            <div className="flex items-center justify-between px-4 py-4 bg-[#202630]/50 rounded-2xl">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#2B3139" strokeWidth="14" />
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#0ECB81"
                    strokeWidth="14"
                    strokeDasharray="226 226"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-[#848E9C]">USDT</span>
                  <span className="text-[14px] font-bold text-[#EAECEF]">100%</span>
                </div>
              </div>

              <div className="space-y-2 pr-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-xs bg-[#0ECB81]" />
                  <span className="text-[13px] font-semibold text-[#EAECEF]">USDT</span>
                  <span className="text-[13px] font-bold text-[#EAECEF] tabular-nums">100.00%</span>
                </div>
                <div className="text-[11px] text-[#848E9C]">BNB Smart Chain (BEP20)</div>
              </div>
            </div>

            {/* Token Allocation List */}
            <div>
              <div className="flex items-center justify-between text-[13px] text-[#848E9C] pb-2 border-b border-[#2B3139]/60">
                <span>Total (1)</span>
                <span className="font-bold text-[#EAECEF] tabular-nums">
                  {formatInrValue(displayedInrTotal)}
                </span>
              </div>

              <div
                onClick={() => setSubScreen('usdt_detail')}
                className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#202630]/40 rounded-xl px-1"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <CoinIcon asset="USDT" size="md" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#F0B90B] border border-[#181A20]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-bold text-[#EAECEF]">USDT</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] text-[10px] font-bold">
                        100%
                      </span>
                    </div>
                    <div className="text-[12px] text-[#848E9C]">
                      BNB Smart Chain · ₹{valuation.inrPerUsdt.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="text-[15px] font-bold text-[#EAECEF]">
                    {formatQuantity(displayedUsdtQty)}
                  </div>
                  <div className="text-[12px] text-[#848E9C]">
                    {formatInrValue(displayedInrTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#202630] flex items-center justify-center mx-auto text-[#848E9C]">
              <Layers size={22} />
            </div>
            <div className="text-[14px] font-semibold text-[#EAECEF]">
              {portfolioTab === 'Tokens'
                ? 'No Token Holdings'
                : portfolioTab === 'Stocks'
                ? "You don't hold any stock assets yet."
                : portfolioTab === 'DeFi'
                ? 'No protocol found'
                : 'No Data'}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. SEND TOKEN (Matches 00:25 + Strictly Blocks Preview Holdings in Real Tx)
  // =========================================================================
  if (subScreen === 'send') {
    // CRITICAL REQUIREMENT 4:
    // Never allow a preview holding (11,352.81 USDT) to be used in real Send transactions.
    // Spendable balance comes EXCLUSIVELY from verifiedOnChainAssets.
    const verifiedSpendableBalance = isWalletActive
      ? verifiedOnChainAssets.find((a) => a.symbol === sendTokenSymbol)?.balance ?? 0
      : 0;

    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (sendStep === 'form') {
                setSendStep('menu');
              } else {
                setSubScreen('main');
              }
            }}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B]"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[17px] font-bold text-[#EAECEF]">Send Token</span>
          <div className="w-7" />
        </div>

        {sendStep === 'menu' ? (
          <div className="p-4 space-y-3">
            {/* Card 1: Transfer to Binance Exchange (Matches 00:26 of Binance reference) */}
            <button
              type="button"
              onClick={() => onSwitchToExchangeDeposit('USDT')}
              className="w-full px-4 py-5 rounded-2xl bg-[#1E2329] hover:bg-[#2B3139]/80 border border-[#2B3139]/80 flex items-center gap-4 text-left transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#202630] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <path
                    d="M5 9h14l-3.5-3.5"
                    stroke="#EAECEF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 15H5l3.5 3.5"
                    stroke="#F0B90B"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#EAECEF]">
                  Transfer to Binance Exchange
                </div>
                <div className="text-[12px] text-[#848E9C] mt-0.5">
                  Transfer assets to your Binance Account
                </div>
              </div>
            </button>

            {/* Card 2: Send to Wallet Address (Matches frame_026.jpg) */}
            <button
              type="button"
              onClick={() => setSendStep('form')}
              className="w-full px-4 py-5 rounded-2xl bg-[#1E2329] hover:bg-[#2B3139]/80 border border-[#2B3139]/80 flex items-center gap-4 text-left transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#202630] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <rect
                    x="4"
                    y="6"
                    width="15"
                    height="12"
                    rx="2.5"
                    stroke="#EAECEF"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 12h4.5m0 0l-2-2m2 2l-2 2"
                    stroke="#F0B90B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#EAECEF]">
                  Send to Wallet Address
                </div>
                <div className="text-[12px] text-[#848E9C] mt-0.5">
                  Send your assets to onchain wallet address
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* Full-Screen Send to Wallet Address Form */
          <div className="p-4 space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-[#848E9C] block mb-1.5">Token</label>
                <div className="relative">
                  <select
                    value={sendTokenSymbol}
                    onChange={(e) => setSendTokenSymbol(e.target.value)}
                    className="w-full h-11 bg-[#202630] rounded-xl px-3 text-[14px] font-semibold text-[#EAECEF] focus:outline-none"
                  >
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="BNB">BNB (Native)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="SOL">SOL (Solana)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[#848E9C] block mb-1.5">Network</label>
                <select
                  value={sendEcosystem}
                  onChange={(e) => setSendEcosystem(e.target.value as WalletEcosystem)}
                  className="w-full h-11 bg-[#202630] rounded-xl px-3 text-[14px] font-semibold text-[#EAECEF] focus:outline-none"
                >
                  <option value="EVM">BNB Smart Chain (BEP20)</option>
                  <option value="SOLANA">Solana Mainnet</option>
                  <option value="BITCOIN">Bitcoin SegWit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[12px] text-[#848E9C] block mb-1.5">Recipient Address</label>
              <input
                type="text"
                value={sendRecipientInput}
                onChange={(e) => setSendRecipientInput(e.target.value)}
                placeholder="Paste 0x... or Solana / Bitcoin address"
                className="w-full h-12 bg-[#202630] rounded-xl px-3.5 text-[13px] text-[#EAECEF] font-mono placeholder-[#474D57] focus:outline-none focus:ring-1 focus:ring-[#F0B90B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] text-[#848E9C]">Amount</label>
                <span className="text-[12px] text-[#848E9C] tabular-nums">
                  Available:{' '}
                  <strong className="text-[#EAECEF]">
                    {formatQuantity(verifiedSpendableBalance)} {sendTokenSymbol}
                  </strong>
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={sendAmountInput}
                  onChange={(e) => setSendAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 bg-[#202630] rounded-xl pl-3.5 pr-16 text-[16px] font-bold text-[#EAECEF] tabular-nums placeholder-[#474D57] focus:outline-none focus:ring-1 focus:ring-[#F0B90B]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (verifiedSpendableBalance <= 0) {
                      showToast('Insufficient spendable balance');
                      return;
                    }
                    setSendAmountInput(String(verifiedSpendableBalance));
                  }}
                  className="absolute right-3 px-2 py-1 rounded bg-[#2B3139] text-[#F0B90B] text-[11px] font-bold"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#202630] space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Estimated Network Fee</span>
                <span className="text-[#EAECEF] font-medium tabular-nums">
                  ≈ 0.00012 BNB (₹8.10)
                </span>
              </div>
            </div>

            {lastBroadcastTx && (
              <div className="p-3.5 rounded-2xl bg-[#0ECB81]/15 border border-[#0ECB81]/30 text-[12px] space-y-1">
                <div className="font-bold text-[#0ECB81]">Transaction Broadcasted</div>
                <div className="font-mono text-[11px] text-[#EAECEF] break-all">
                  {lastBroadcastTx.txHash}
                </div>
                <a
                  href={lastBroadcastTx.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#F0B90B] font-semibold"
                >
                  View on Block Explorer <ExternalLink size={12} />
                </a>
              </div>
            )}

            <div className="mt-auto pt-4 pb-4">
              {!isWalletActive ? (
                <button
                  type="button"
                  onClick={() => setSubScreen('my_wallets')}
                  className="w-full h-12 rounded-xl bg-[#FCD535] text-[#181A20] font-bold text-[15px]"
                >
                  Connect or Create Wallet to Sign
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isBroadcastingTx}
                  onClick={onBroadcastSend}
                  className="w-full h-12 rounded-xl bg-[#FCD535] text-[#181A20] font-bold text-[15px]"
                >
                  {isBroadcastingTx ? 'Signing & Broadcasting...' : 'Continue'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. RECEIVE TOKENS (Matches 00:12 - 00:13, 00:28 - 00:29 + QR View)
  // =========================================================================
  if (subScreen === 'receive') {
    const displayAddr = activeReceiveAddress || '0x71C95911E9a5D330f4D621842EC243EE134319A3';

    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (receiveStep === 'qr') {
                setReceiveStep('menu');
              } else {
                setSubScreen('main');
              }
            }}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B]"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[17px] font-bold text-[#EAECEF]">Receive Tokens</span>
          <div className="w-7" />
        </div>

        {receiveStep === 'menu' ? (
          <div className="p-4 space-y-3">
            {/* Option 1: Transfer from Binance Exchange (Matches 00:13 of Binance reference) */}
            <button
              type="button"
              onClick={onSwitchToExchangeAssets}
              className="w-full px-4 py-5 rounded-2xl bg-[#1E2329] hover:bg-[#2B3139]/80 border border-[#2B3139]/80 flex items-center gap-4 text-left transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#202630] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <path
                    d="M5 9h14l-3.5-3.5"
                    stroke="#EAECEF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 15H5l3.5 3.5"
                    stroke="#F0B90B"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#EAECEF]">
                  Transfer from Binance Exchange
                </div>
                <div className="text-[12px] text-[#848E9C] mt-0.5">
                  Withdraw assets from your Binance Account
                </div>
              </div>
            </button>

            {/* Option 2: Receive Tokens via Address (Matches frame_013.jpg) */}
            <button
              type="button"
              onClick={() => setReceiveStep('qr')}
              className="w-full px-4 py-5 rounded-2xl bg-[#1E2329] hover:bg-[#2B3139]/80 border border-[#2B3139]/80 flex items-center gap-4 text-left transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#202630] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" stroke="#EAECEF" strokeWidth="2" />
                  <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" stroke="#EAECEF" strokeWidth="2" />
                  <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="#EAECEF" strokeWidth="2" />
                  <rect x="14" y="14" width="5.5" height="5.5" rx="1" fill="#F0B90B" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#EAECEF]">
                  Receive Tokens via Address
                </div>
                <div className="text-[12px] text-[#848E9C] mt-0.5">
                  Receive funds via wallet address or QR code
                </div>
              </div>
            </button>

            {/* Option 3: Buy with P2P (Matches frame_013.jpg) */}
            <button
              type="button"
              onClick={() => onSwitchToExchangeDeposit('USDT')}
              className="w-full px-4 py-5 rounded-2xl bg-[#1E2329] hover:bg-[#2B3139]/80 border border-[#2B3139]/80 flex items-center gap-4 text-left transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#202630] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <circle cx="9" cy="8.5" r="3" stroke="#EAECEF" strokeWidth="2" />
                  <path
                    d="M4 18.5c0-2.6 2.2-4.5 5-4.5s5 1.9 5 4.5"
                    stroke="#EAECEF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="17" cy="11" r="2.6" fill="#F0B90B" />
                  <path
                    d="M14.5 18.5c.4-1.8 1.8-3 3.7-3 1.2 0 2.2.5 2.8 1.5"
                    stroke="#F0B90B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#EAECEF]">Buy with P2P</div>
                <div className="text-[12px] text-[#848E9C] mt-0.5">
                  Buy crypto from selected merchants
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* Full-Screen Receive QR & Address View */
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-1.5 bg-[#202630] p-1 rounded-xl">
              {(
                [
                  { id: 'EVM' as const, label: 'BNB Chain / EVM' },
                  { id: 'SOLANA' as const, label: 'Solana' },
                  { id: 'BITCOIN' as const, label: 'Bitcoin' },
                ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReceiveChainTab(tab.id)}
                  className={`py-2 rounded-lg text-[12px] font-semibold transition-colors ${
                    receiveChainTab === tab.id
                      ? 'bg-[#2B3139] text-[#EAECEF]'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#202630] flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-2">
                <KeylessWalletAvatar size="sm" />
                <span className="text-[14px] font-bold text-[#EAECEF]">
                  {isWalletActive ? activeWalletLabel : 'My Wallet (Preview Address)'}
                </span>
                <KeylessCheckBadge />
              </div>

              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Receive QR Code"
                  className="w-48 h-48 rounded-2xl bg-white p-2"
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-white p-3 flex flex-col items-center justify-center text-[#181A20]">
                  <QrCode size={136} />
                </div>
              )}

              <div className="w-full space-y-1.5">
                <div className="text-[11px] text-[#848E9C]">
                  {receiveChainTab === 'EVM'
                    ? 'Supports BNB Smart Chain (BEP20), Ethereum (ERC20), Arbitrum & Base'
                    : receiveChainTab === 'SOLANA'
                    ? 'Supports Solana Mainnet (SPL) tokens only'
                    : 'Supports Bitcoin Native SegWit transfers only'}
                </div>
                <div className="p-3 rounded-xl bg-[#181A20] font-mono text-[12px] text-[#EAECEF] break-all">
                  {displayAddr}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(displayAddr);
                  showToast('Wallet address copied to clipboard');
                }}
                className="w-full h-11 rounded-xl bg-[#FCD535] text-[#181A20] font-bold text-[14px] flex items-center justify-center gap-2"
              >
                <Copy size={16} /> Copy Address
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#202630]/70 text-[11px] text-[#848E9C] leading-relaxed">
              <strong className="text-[#F0B90B]">Network Warning:</strong> Please ensure the sending
              network matches the selected network above. Sending assets on an unsupported chain may
              result in permanent loss.
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 5. TRANSACTION HISTORY (Matches 00:31 - 00:32 of Reference Recording)
  // =========================================================================
  if (subScreen === 'history') {
    const hasActiveFilters =
      historyDirectionFilter !== 'ALL' ||
      historyNetworkFilter !== 'All Networks' ||
      historyDateFilter !== 'ALL' ||
      Boolean(historySearch.trim());

    const networkOptions: (
      | 'All Networks'
      | 'BNB Smart Chain'
      | 'Ethereum'
      | 'Solana'
      | 'opBNB'
    )[] = ['All Networks', 'BNB Smart Chain', 'Ethereum', 'Solana', 'opBNB'];

    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        {renderSampleEntryDetailModal()}

        {/* Top Header: <- Back | History (Matches frame_032.jpg) */}
        <div className="sticky top-0 z-20 shrink-0 bg-[#181A20] px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubScreen('main')}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[17px] font-bold text-[#EAECEF]">History</span>
          <div className="w-7" />
        </div>

        {/* Search Input: Token symbol or contract address (Matches frame_032.jpg) */}
        <div className="px-4 pt-1 pb-2.5 shrink-0">
          <div className="relative flex items-center">
            <Search size={15} className="text-[#848E9C] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Token symbol or contract address"
              className="w-full h-9 rounded-xl bg-[#202630] pl-9 pr-8 text-[13px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
            />
            {historySearch && (
              <button
                type="button"
                onClick={() => setHistorySearch('')}
                className="absolute right-2.5 text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar: [Rocket] My Wallet v | [Layers] All Networks v | [Calendar] All Dates v ... [Filter] (Matches frame_032.jpg) */}
        <div className="px-4 pb-2 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar text-[12px] text-[#EAECEF]">
            {/* Wallet Selector */}
            <button
              type="button"
              onClick={() => setSubScreen('my_wallets')}
              className="flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <KeylessWalletAvatar size="sm" />
              <span>{activeWalletLabel}</span>
              <ChevronDown size={13} className="text-[#848E9C]" />
            </button>

            {/* Network Filter */}
            <button
              type="button"
              onClick={() => {
                const nextIdx =
                  (networkOptions.indexOf(historyNetworkFilter) + 1) % networkOptions.length;
                setHistoryNetworkFilter(networkOptions[nextIdx]);
              }}
              className={`flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                historyNetworkFilter !== 'All Networks' ? 'text-[#F0B90B]' : 'text-[#EAECEF]'
              }`}
            >
              <Layers size={13} className="text-[#848E9C]" />
              <span>{historyNetworkFilter}</span>
              <ChevronDown size={13} className="text-[#848E9C]" />
            </button>

            {/* Date Filter */}
            <button
              type="button"
              onClick={() => {
                const idx = PREVIEW_HISTORY_MONTH_OPTIONS.findIndex(
                  (m) => m.key === historyDateFilter
                );
                const next =
                  PREVIEW_HISTORY_MONTH_OPTIONS[(idx + 1) % PREVIEW_HISTORY_MONTH_OPTIONS.length];
                setHistoryDateFilter(next.key);
              }}
              className={`flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                historyDateFilter !== 'ALL' ? 'text-[#F0B90B]' : 'text-[#EAECEF]'
              }`}
            >
              <Calendar size={13} className="text-[#848E9C]" />
              <span>
                {historyDateFilter === 'ALL'
                  ? 'All Dates'
                  : PREVIEW_HISTORY_MONTH_OPTIONS.find((m) => m.key === historyDateFilter)?.label}
              </span>
              <ChevronDown size={13} className="text-[#848E9C]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowHistoryFilterSheet(!showHistoryFilterSheet)}
            className="p-1 text-[#848E9C] hover:text-[#EAECEF] relative shrink-0"
            aria-label="Filter History"
            title="Filter by Direction, Network, or Date"
          >
            <Filter size={15} />
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] absolute top-0.5 right-0.5" />
            )}
          </button>
        </div>

        {/* Expandable Filter Panel when Filter Icon is tapped */}
        {showHistoryFilterSheet && (
          <div className="mx-4 mt-1 mb-2 p-3.5 shrink-0 rounded-2xl bg-[#202630] border border-[#2B3139] space-y-3 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#EAECEF]">Filter Transactions</span>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryDirectionFilter('ALL');
                      setHistoryNetworkFilter('All Networks');
                      setHistoryDateFilter('ALL');
                      setHistorySearch('');
                    }}
                    className="text-[11px] font-semibold text-[#F0B90B] hover:underline"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowHistoryFilterSheet(false)}
                  className="text-[#848E9C] hover:text-[#EAECEF]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#848E9C] mb-1.5">Direction</div>
              <div className="flex gap-1.5">
                {(
                  [
                    { id: 'ALL' as const, label: 'All' },
                    { id: 'RECEIVE' as const, label: 'Receive' },
                    { id: 'SEND' as const, label: 'Send' },
                  ]
                ).map((dir) => (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => setHistoryDirectionFilter(dir.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold ${
                      historyDirectionFilter === dir.id
                        ? 'bg-[#FCD535] text-[#181A20]'
                        : 'bg-[#181A20] text-[#848E9C]'
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#848E9C] mb-1.5">Network</div>
              <div className="flex flex-wrap gap-1.5">
                {networkOptions.map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setHistoryNetworkFilter(net)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      historyNetworkFilter === net
                        ? 'bg-[#FCD535] text-[#181A20]'
                        : 'bg-[#181A20] text-[#848E9C]'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#848E9C] mb-1.5">Date</div>
              <div className="flex flex-wrap gap-1.5">
                {PREVIEW_HISTORY_MONTH_OPTIONS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setHistoryDateFilter(m.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      historyDateFilter === m.key
                        ? 'bg-[#FCD535] text-[#181A20]'
                        : 'bg-[#181A20] text-[#848E9C]'
                    }`}
                  >
                    {m.key === 'ALL' ? 'All Dates' : m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clean Date-Grouped Transaction List (Matches 00:31 - 00:32 of Reference) */}
        <div className="px-4 pt-2 pb-24 space-y-4">
          {isPreviewMode ? (
            filteredPreviewTimeline.length > 0 ? (
              filteredPreviewTimeline.map((entry) => (
                <div key={entry.id} className="space-y-1.5">
                  <div className="text-[12px] text-[#848E9C] tabular-nums">{entry.dateStr}</div>
                  <div
                    onClick={() => setSelectedPreviewSampleEntry(entry)}
                    className="py-2 flex items-center justify-between cursor-pointer hover:bg-[#202630]/50 rounded-xl px-1 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-[#848E9C] shrink-0">
                        {entry.type === 'Receive' ? (
                          <ArrowDownLeft size={16} />
                        ) : (
                          <ArrowUpRight size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] font-medium text-[#EAECEF]">{entry.type}</div>
                        <div className="text-[12px] text-[#848E9C] truncate tabular-nums">
                          {entry.networkLabel} · {entry.timeStr.slice(0, 5)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <div
                        className={`text-[15px] font-semibold tabular-nums ${
                          entry.type === 'Receive' ? 'text-[#0ECB81]' : 'text-[#EAECEF]'
                        }`}
                      >
                        {entry.type === 'Receive' ? '+' : '-'}
                        {formatQuantity(entry.amount)} {entry.asset}
                      </div>
                      <div className="relative shrink-0">
                        <CoinIcon asset={entry.asset} size="sm" />
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#181A20]"
                          style={{ backgroundColor: entry.badgeColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-14 text-center space-y-2">
                <div className="text-[14px] font-semibold text-[#EAECEF]">No records found</div>
              </div>
            )
          ) : (
            /* Verified On-Chain Transaction History */
            <>
              {realOnChainTxs.length > 0 &&
              (historyDirectionFilter === 'ALL' || historyDirectionFilter === 'SEND') ? (
                <div className="space-y-3">
                  {realOnChainTxs.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTxRecord(tx)}
                      className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#202630]/50 rounded-xl px-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-[#848E9C]">
                          <ArrowUpRight size={16} />
                        </div>
                        <div>
                          <div className="text-[15px] font-medium text-[#EAECEF]">Send</div>
                          <div className="text-[12px] text-[#848E9C] font-mono">
                            To: {shortenAddr(tx.toAddress)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-[#EAECEF] tabular-nums">
                          -{tx.amount} {tx.asset}
                        </span>
                        <CoinIcon asset={tx.asset} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center space-y-2">
                  <div className="text-[14px] font-semibold text-[#EAECEF]">No records found</div>
                </div>
              )}
            </>
          )}

          <div className="text-[12px] text-[#474D57] text-center py-4">No more records found</div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. APPROVALS (Matches 00:35 - 00:37 of Reference Recording)
  // =========================================================================
  if (subScreen === 'approvals') {
    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubScreen('main')}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B]"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[17px] font-bold text-[#EAECEF]">Approvals</span>
          <button
            type="button"
            onClick={() => showToast('No active high-risk token approvals to revoke')}
            className="text-[13px] font-semibold text-[#926F18] hover:text-[#F0B90B] transition-colors"
          >
            Batch Revoke
          </button>
        </div>

        {/* Filter Bar: All Wallets v | All Protocols v | All Networks v | [Filter] */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-2 text-[12px] text-[#EAECEF]">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSubScreen('my_wallets')}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Wallet size={13} className="text-[#848E9C]" />
              <span>All Wallets</span>
              <ChevronDown size={13} className="text-[#848E9C]" />
            </button>
            <button
              type="button"
              onClick={() => setShowContractScanner(!showContractScanner)}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Layers size={13} className="text-[#848E9C]" />
              <span>All Protocols</span>
              <ChevronDown size={13} className="text-[#848E9C]" />
            </button>
            <button
              type="button"
              onClick={() => setSubScreen('networks')}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Globe size={13} className="text-[#848E9C]" />
              <span>All Netw...</span>
              <ChevronDown size={13} className="text-[#848E9C]" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowContractScanner(!showContractScanner)}
            className="p-1 text-[#848E9C] hover:text-[#EAECEF] shrink-0"
            title="Contract Security Scanner"
          >
            <Filter size={14} />
          </button>
        </div>

        {showContractScanner && (
          <div className="mx-4 mt-2 p-3.5 rounded-2xl bg-[#202630] space-y-2.5">
            <div className="text-[12px] font-semibold text-[#EAECEF]">
              ERC-20 Contract Anti-Spoofing Scanner
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={contractInspectInput}
                onChange={(e) => setContractInspectInput(e.target.value)}
                placeholder="Paste 0x contract address..."
                className="flex-1 h-9 rounded-lg bg-[#181A20] px-3 text-[12px] text-[#EAECEF] font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const found = VERIFIED_TOKEN_REGISTRY.find(
                    (t) =>
                      t.contractAddress.toLowerCase() === contractInspectInput.trim().toLowerCase()
                  );
                  showToast(
                    found
                      ? `Verified canonical ${found.symbol} (${found.networkName})`
                      : 'Unverified custom token contract'
                  );
                }}
                className="px-3 h-9 rounded-lg bg-[#FCD535] text-[#181A20] text-[12px] font-bold"
              >
                Scan
              </button>
            </div>
          </div>
        )}

        {/* Empty State matching frame_036.jpg (Document + Exclamation badge illustration) */}
        <div className="flex-1 flex flex-col items-center justify-center pb-20 px-4">
          <div className="w-16 h-16 flex items-center justify-center mb-3">
            <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
              <path
                d="M16 10h22l10 10v32a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z"
                fill="#2B3139"
                stroke="#474D57"
                strokeWidth="2"
              />
              <path d="M38 10v10h10" stroke="#474D57" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="28" x2="36" y2="28" stroke="#848E9C" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="36" x2="30" y2="36" stroke="#848E9C" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="44" cy="44" r="10" fill="#474D57" stroke="#181A20" strokeWidth="2.5" />
              <line x1="44" y1="39.5" x2="44" y2="44.5" stroke="#EAECEF" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="44" cy="48" r="1.3" fill="#EAECEF" />
            </svg>
          </div>
          <div className="text-[13px] text-[#848E9C]">No records</div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. WALLET SETTINGS (Matches 00:39 of Reference Recording)
  // =========================================================================
  if (subScreen === 'settings') {
    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center">
          <button
            type="button"
            onClick={() => setSubScreen('main')}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B]"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="px-4 pb-10 space-y-6">
          <h1 className="text-[26px] font-bold text-[#EAECEF] tracking-tight">Settings</h1>

          {/* General Section */}
          <div className="space-y-1">
            <div className="text-[12px] text-[#848E9C] pb-1">General</div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-[15px] text-[#EAECEF]">UID</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('1061155439');
                  showToast('UID copied to clipboard');
                }}
                className="flex items-center gap-1.5 text-[14px] text-[#848E9C] hover:text-[#EAECEF] tabular-nums"
              >
                <span>1061155439</span>
                <Copy size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSubScreen('my_wallets')}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Wallet Management</span>
              <ChevronRight size={16} className="text-[#848E9C]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSendStep('form');
                setSubScreen('send');
              }}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Address Book</span>
              <ChevronRight size={16} className="text-[#848E9C]" />
            </button>

            <button
              type="button"
              onClick={() => setSubScreen('networks')}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Custom Networks</span>
              <ChevronRight size={16} className="text-[#848E9C]" />
            </button>
          </div>

          <div className="border-t border-[#2B3139]/60 pt-5 space-y-1">
            <div className="text-[12px] text-[#848E9C] pb-1">Preference</div>

            <button
              type="button"
              onClick={() => showToast('Language: English (Global)')}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Language</span>
              <ChevronRight size={16} className="text-[#848E9C]" />
            </button>

            <button
              type="button"
              onClick={() => {
                const list: ('INR' | 'USD' | 'EUR' | 'AED')[] = ['INR', 'USD', 'EUR', 'AED'];
                const next = list[(list.indexOf(currencyPref) + 1) % list.length];
                setCurrencyPref(next);
                showToast(`Display currency updated to ${next}`);
              }}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Currency</span>
              <div className="flex items-center gap-1 text-[14px] text-[#848E9C]">
                <span>{currencyPref}</span>
                <ChevronRight size={16} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => showToast('Asset Filter: Hide tokens below $1.00 enabled')}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Asset Filter</span>
              <ChevronRight size={16} className="text-[#848E9C]" />
            </button>
          </div>

          <div className="border-t border-[#2B3139]/60 pt-5 space-y-1">
            <div className="text-[12px] text-[#848E9C] pb-1">Security</div>

            <button
              type="button"
              onClick={() =>
                showToast(`Encryption: ${cryptoDisclosure.cipher} · Local Self-Custody`)
              }
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Verification Method</span>
              <ChevronRight size={16} className="text-[#848E9C]" />
            </button>

            <button
              type="button"
              onClick={() => setSubScreen('approvals')}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Security Center</span>
              <ChevronRight size={16} className="text-[#848E9C]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSecureAutoSign(!secureAutoSign);
                showToast(
                  `Secure Auto Sign ${!secureAutoSign ? 'enabled' : 'disabled'} for Keyless sessions`
                );
              }}
              className="w-full py-3 flex items-center justify-between text-left"
            >
              <span className="text-[15px] text-[#EAECEF]">Secure Auto Sign</span>
              <div className="flex items-center gap-1 text-[13px] text-[#848E9C]">
                <span>{secureAutoSign ? 'Active' : 'Off'}</span>
                <ChevronRight size={16} />
              </div>
            </button>
          </div>

          {/* Application & PWA Section */}
          <div className="border-t border-[#2B3139]/60 pt-5 space-y-3">
            <div className="text-[12px] text-[#848E9C]">Application & PWA</div>
            <PWAInstallButton variant="card" />
            <div className="text-[11px] text-[#848E9C]/80 leading-relaxed px-1">
              Install NexusTrade on your Android, Samsung, or iOS home screen for standalone display mode, instant startup, and offline portfolio access.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. MY WALLETS & ACCOUNT MANAGEMENT (Matches 01:34 - 01:39 of Reference)
  // =========================================================================
  if (subScreen === 'my_wallets') {
    return (
      <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
        <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubScreen('main')}
            className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B]"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[17px] font-bold text-[#EAECEF]">My Wallets</span>
          <button
            type="button"
            onClick={() => setShowAddWalletSheet(true)}
            className="text-[14px] font-semibold text-[#F0B90B]"
          >
            Manage
          </button>
        </div>

        <div className="px-4 pt-3 pb-24 flex-1 space-y-5">
          {/* Top Portfolio Summary (Matches frame_098.jpg) */}
          <div
            onClick={() => setSubScreen('portfolio')}
            className="pb-4 border-b border-[#2B3139]/80 cursor-pointer"
          >
            <div className="flex items-center gap-1 text-[12px] text-[#848E9C]">
              <span>Portfolio</span>
              <ChevronRight size={13} />
            </div>
            <div className="text-[28px] font-bold text-[#EAECEF] tabular-nums mt-0.5">
              {hideBalance ? '******' : formatInrValue(displayedInrTotal)}
            </div>
          </div>

          {/* Keyless Wallet Section matching 01:36 - 01:39 */}
          <div className="space-y-3">
            <div className="text-[14px] font-bold text-[#EAECEF]">Keyless</div>

            <div className="space-y-2.5">
              <div
                onClick={() => {
                  onSelectValuationMode('preview_portfolio');
                  setSubScreen('main');
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#202630] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <KeylessWalletAvatar size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-semibold text-[#EAECEF]">
                        {activeWalletLabel}
                      </span>
                      <KeylessCheckBadge />
                    </div>
                    <div className="text-[13px] text-[#848E9C] tabular-nums">
                      {formatInrValue(displayedInrTotal)}
                    </div>
                  </div>
                </div>
                <Check size={18} className="text-[#F0B90B]" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setSecureAutoSign(!secureAutoSign);
                  showToast('Secure Auto Sign settings updated');
                }}
                className="w-full h-9 px-3.5 rounded-xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-[12px] text-[#EAECEF] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <KeyRound size={13} className="text-[#848E9C]" />
                  <span>Manage Secure Auto Sign</span>
                </span>
                <ChevronRight size={14} className="text-[#848E9C]" />
              </button>
            </div>
          </div>

          {/* Self-Custody Vault Controls if user created/imported a real local vault */}
          {localVault && (
            <div className="pt-3 border-t border-[#2B3139]/80 space-y-2.5">
              <div className="text-[13px] font-bold text-[#EAECEF]">
                Encrypted Self-Custody Vault ({localVault.accounts.length} Account)
              </div>
              <div className="p-3.5 rounded-2xl bg-[#202630] space-y-2">
                <div className="text-[12px] font-mono text-[#EAECEF] break-all">
                  {activePrimaryAddress}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#2B3139]">
                  <button
                    type="button"
                    onClick={onOpenUnlockModal}
                    className="text-[12px] font-semibold text-[#F0B90B] flex items-center gap-1"
                  >
                    <KeyRound size={13} /> Export Recovery Phrase
                  </button>
                  <button
                    type="button"
                    onClick={onRemoveVault}
                    className="text-[12px] font-semibold text-[#F6465D] flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Remove Vault
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Yellow "Add Wallet" Button (Matches 01:34 - 01:39) */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[#181A20] p-4 pb-safe-bottom">
          <button
            type="button"
            onClick={() => setShowAddWalletSheet(true)}
            className="w-full h-12 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-[15px] transition-colors cursor-pointer"
          >
            Add Wallet
          </button>
        </div>

        {/* Add Wallet Action Sheet (Create / Import / Connect Extension) */}
        {showAddWalletSheet && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setShowAddWalletSheet(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl p-5 pb-8 space-y-3"
            >
              <div className="w-9 h-1 rounded-full bg-[#474D57] mx-auto -mt-1 mb-2" />
              <div className="text-[16px] font-bold text-[#EAECEF] mb-2">Add or Connect Wallet</div>

              <button
                type="button"
                onClick={() => {
                  setShowAddWalletSheet(false);
                  onStartCreateVault();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-[#EAECEF]">
                      Create New Wallet
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      Generate encrypted BIP-39 multi-chain vault
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#848E9C]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddWalletSheet(false);
                  onStartImportVault();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center">
                    <Download size={18} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-[#EAECEF]">
                      Import Seed Phrase / Private Key
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      Restore existing 12/24-word recovery phrase
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#848E9C]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddWalletSheet(false);
                  onOpenConnectModal();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-[#EAECEF]">
                      Connect Browser Extension
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      MetaMask, Rabby, Phantom, or Unisat
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#848E9C]" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 9. NETWORK SELECTION (Full-Screen Multi-Chain Network Selector)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-40 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto select-none">
      <div className="sticky top-0 z-20 bg-[#181A20] px-4 h-12 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSubScreen('main')}
          className="p-1.5 -ml-1.5 text-[#EAECEF] hover:text-[#F0B90B]"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-[17px] font-bold text-[#EAECEF]">Select Network</span>
        <button
          type="button"
          onClick={onRefreshOnChain}
          className="p-1.5 text-[#848E9C] hover:text-[#EAECEF]"
        >
          <RefreshCw size={16} className={isRefreshingBalances ? 'animate-spin text-[#F0B90B]' : ''} />
        </button>
      </div>

      <div className="p-4 space-y-2.5 pb-20">
        <div className="text-[12px] text-[#848E9C] mb-2">
          Supported EVM, Solana &amp; Bitcoin Networks
        </div>
        {Object.values(EVM_CHAIN_CONFIGS).map((net) => (
          <button
            key={net.chainId}
            type="button"
            onClick={() => {
              onSwitchEvmChain(net.chainId);
              showToast(`Selected ${net.name} (Chain ID ${net.chainId})`);
              setSubScreen('main');
            }}
            className="w-full p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <CoinIcon asset={net.nativeSymbol} size="md" />
              <div>
                <div className="text-[14px] font-semibold text-[#EAECEF]">{net.name}</div>
                <div className="text-[11px] text-[#848E9C] font-mono truncate max-w-[210px]">
                  {net.rpcUrls[0]}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] text-[11px] font-semibold">
              Chain {net.chainId}
            </span>
          </button>
        ))}

        {[
          {
            name: 'Solana Mainnet',
            symbol: 'SOL',
            sub: 'https://api.mainnet-beta.solana.com',
            tag: 'SPL',
          },
          {
            name: 'opBNB Mainnet',
            symbol: 'BNB',
            sub: 'https://opbnb-mainnet-rpc.bnbchain.org',
            tag: 'Chain 204',
          },
          {
            name: 'Bitcoin Native SegWit',
            symbol: 'BTC',
            sub: 'https://mempool.space/api',
            tag: 'BIP-84',
          },
        ].map((extra) => (
          <button
            key={extra.name}
            type="button"
            onClick={() => {
              showToast(`Selected ${extra.name}`);
              setSubScreen('main');
            }}
            className="w-full p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <CoinIcon asset={extra.symbol} size="md" />
              <div>
                <div className="text-[14px] font-semibold text-[#EAECEF]">{extra.name}</div>
                <div className="text-[11px] text-[#848E9C] font-mono truncate max-w-[210px]">
                  {extra.sub}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#2B3139] text-[#EAECEF] text-[11px] font-semibold">
              {extra.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
