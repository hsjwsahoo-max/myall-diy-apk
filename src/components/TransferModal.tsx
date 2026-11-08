import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ChevronRight,
  FileText,
  Info,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { useExchange, WALLET_ACCOUNTS } from '../context/ExchangeContext';
import { LedgerTransaction, WalletAccountType } from '../types/exchange';
import { CoinIcon, formatFiat, formatPrice } from './CoinIcon';

const SUPPORTED_TRANSFER_COINS = [
  { asset: 'USDT', name: 'TetherUS' },
  { asset: 'BTC', name: 'Bitcoin' },
  { asset: 'ETH', name: 'Ethereum' },
  { asset: 'BNB', name: 'BNB' },
  { asset: 'SOL', name: 'Solana' },
  { asset: 'USDC', name: 'USD Coin' },
  { asset: 'XRP', name: 'XRP' },
  { asset: 'TRX', name: 'TRON' },
];

export const TransferModal: React.FC = () => {
  const {
    transferModalState,
    closeTransferModal,
    wallets,
    getAssetPriceUsd,
    executeTransfer,
    settings,
    setHistoryModalOpen,
    setSelectedTxDetail,
    setExchangeTab,
    setAssetsSubTab,
    showToast,
  } = useExchange();

  const [fromAccount, setFromAccount] = useState<WalletAccountType>('spot');
  const [toAccount, setToAccount] = useState<WalletAccountType>('usdm_futures');
  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [amountInput, setAmountInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sub-modals inside Transfer workflow (matching Video 1 0:16-0:27 & 0:39-0:41)
  const [walletPickerTarget, setWalletPickerTarget] = useState<'from' | 'to' | null>(null);
  const [isCoinPickerOpen, setIsCoinPickerOpen] = useState<boolean>(false);
  const [coinSearchQuery, setCoinSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>(['USDT', 'BTC', 'BNB']);
  const [isPreviewConfirmOpen, setIsPreviewConfirmOpen] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<LedgerTransaction | null>(null);

  useEffect(() => {
    if (transferModalState.isOpen) {
      setFromAccount(transferModalState.defaultFrom || 'spot');
      setToAccount(transferModalState.defaultTo || 'usdm_futures');
      setSelectedAsset(transferModalState.defaultAsset || 'USDT');
      setAmountInput('');
      setErrorMsg(null);
      setWalletPickerTarget(null);
      setIsCoinPickerOpen(false);
      setIsPreviewConfirmOpen(false);
      setCompletedTx(null);
    }
  }, [transferModalState]);

  const availableBalance = useMemo(() => {
    return wallets[fromAccount]?.[selectedAsset]?.available || 0;
  }, [wallets, fromAccount, selectedAsset]);

  const lockedBalance = useMemo(() => {
    return wallets[fromAccount]?.[selectedAsset]?.locked || 0;
  }, [wallets, fromAccount, selectedAsset]);

  const assetPriceUsdt = getAssetPriceUsd(selectedAsset);
  const parsedAmount = parseFloat(amountInput);
  const isValidAmount =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= availableBalance + 1e-9 &&
    fromAccount !== toAccount;

  if (!transferModalState.isOpen) return null;

  const fromMeta = WALLET_ACCOUNTS.find((a) => a.id === fromAccount)!;
  const toMeta = WALLET_ACCOUNTS.find((a) => a.id === toAccount)!;
  const coinMeta = SUPPORTED_TRANSFER_COINS.find((c) => c.asset === selectedAsset) || {
    asset: selectedAsset,
    name: selectedAsset,
  };

  const handleSwapWallets = () => {
    const prevFrom = fromAccount;
    setFromAccount(toAccount);
    setToAccount(prevFrom);
    setAmountInput('');
    setErrorMsg(null);
  };

  const handleSelectWallet = (walletId: WalletAccountType) => {
    if (walletPickerTarget === 'from') {
      if (walletId === toAccount) {
        setToAccount(fromAccount);
      }
      setFromAccount(walletId);
    } else if (walletPickerTarget === 'to') {
      if (walletId === fromAccount) {
        setFromAccount(toAccount);
      }
      setToAccount(walletId);
    }
    setWalletPickerTarget(null);
    setErrorMsg(null);
  };

  const handleMaxClick = () => {
    if (availableBalance <= 0) {
      setAmountInput('0');
      return;
    }
    setAmountInput(String(availableBalance));
    setErrorMsg(null);
  };

  const handleConfirmClick = () => {
    setErrorMsg(null);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter an amount greater than 0.');
      return;
    }
    if (parsedAmount > availableBalance + 1e-9) {
      setErrorMsg(`Amount exceeds available balance (${availableBalance} ${selectedAsset}).`);
      return;
    }
    if (fromAccount === toAccount) {
      setErrorMsg('From and To accounts must be different.');
      return;
    }
    setIsPreviewConfirmOpen(true);
  };

  const handleExecuteTransfer = () => {
    const res = executeTransfer({
      fromAccount,
      toAccount,
      asset: selectedAsset,
      amount: parsedAmount,
    });
    if (!res.ok) {
      setErrorMsg(res.message);
      setIsPreviewConfirmOpen(false);
      return;
    }
    setIsPreviewConfirmOpen(false);
    if (res.tx) {
      setCompletedTx(res.tx);
    }
  };

  const filteredCoins = SUPPORTED_TRANSFER_COINS.filter(
    (c) =>
      c.asset.toLowerCase().includes(coinSearchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(coinSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
      {/* Top Bar (Matches Video 1 0:14) */}
      <div className="max-w-[430px] w-full mx-auto flex items-center justify-between px-4 h-12 border-b border-[#2B3139]/70 shrink-0">
        <button
          type="button"
          onClick={closeTransferModal}
          className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-[16px] font-bold tracking-tight text-[#EAECEF]">Transfer</h2>
        <button
          type="button"
          onClick={() => {
            closeTransferModal();
            setHistoryModalOpen(true);
          }}
          className="w-8 h-8 -mr-1.5 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630] transition-colors"
          title="Transfer History"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Main Transfer Body */}
      <div className="max-w-[430px] w-full mx-auto flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* From / To Card (Video 1 0:14-0:21) */}
          <div className="bg-[#202630] border border-[#2B3139]/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex-1 space-y-3">
              {/* From Row */}
              <button
                type="button"
                onClick={() => setWalletPickerTarget('from')}
                className="w-full flex items-center justify-between text-left group min-h-[34px]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#848E9C] w-10">From</span>
                  <span className="text-[14px] font-semibold text-[#EAECEF]">
                    {fromMeta.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#848E9C] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="border-t border-[#2B3139]" />

              {/* To Row */}
              <button
                type="button"
                onClick={() => setWalletPickerTarget('to')}
                className="w-full flex items-center justify-between text-left group min-h-[34px]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#848E9C] w-10">To</span>
                  <span className="text-[14px] font-semibold text-[#EAECEF]">
                    {toMeta.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#848E9C] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapWallets}
              className="w-9 h-9 rounded-xl bg-[#2B3139] flex items-center justify-center text-[#EAECEF] hover:bg-[#363C45] active:scale-95 transition-all shrink-0"
              aria-label="Swap From and To Wallets"
            >
              <ArrowUpDown className="w-4 h-4 text-[#F0B90B]" />
            </button>
          </div>

          {/* Coin Selector (Video 1 0:22-0:27) */}
          <div>
            <label className="block text-[12px] font-medium text-[#848E9C] mb-1.5">Coin</label>
            <button
              type="button"
              onClick={() => setIsCoinPickerOpen(true)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#202630] border border-[#2B3139]/80 flex items-center justify-between hover:border-[#474D57] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CoinIcon asset={selectedAsset} size="sm" />
                <span className="text-[14px] font-bold text-[#EAECEF]">{selectedAsset}</span>
                <span className="text-[12px] text-[#848E9C]">{coinMeta.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#848E9C]" />
            </button>
          </div>

          {/* Amount Input with Max & Available Balance (Video 1 0:28-0:36) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-[#848E9C]">Amount</label>
              <span className="text-[11px] text-[#848E9C]">
                Zero fee · Instant internal transfer
              </span>
            </div>

            <div className="relative flex items-center bg-[#202630] border border-[#2B3139] rounded-xl px-3.5 h-12 focus-within:border-[#F0B90B] transition-colors">
              <input
                type="number"
                step="any"
                min="0"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="0.00"
                className="w-full bg-transparent text-[16px] font-mono tabular-nums font-bold text-[#EAECEF] placeholder-[#5E6673] focus:outline-none"
              />
              <div className="flex items-center gap-2.5 shrink-0 ml-2">
                <span className="text-[12px] font-semibold text-[#848E9C]">
                  {selectedAsset}
                </span>
                <div className="w-px h-4 bg-[#2B3139]" />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-[12px] font-bold text-[#F0B90B] hover:opacity-85 px-1 py-1"
                >
                  Max
                </button>
              </div>
            </div>

            {/* USD Approximation & Available Row */}
            <div className="mt-2 space-y-1">
              {Number.isFinite(parsedAmount) && parsedAmount > 0 && (
                <div className="text-[12px] font-mono tabular-nums text-[#848E9C]">
                  ≈ {formatFiat(parsedAmount * assetPriceUsdt, settings.fiat)}
                </div>
              )}
              <div className="flex items-center justify-between text-[12px] text-[#848E9C]">
                <span className="flex items-center gap-1">
                  Available{' '}
                  <strong className="font-mono tabular-nums text-[#EAECEF]">
                    {formatPrice(availableBalance, selectedAsset === 'USDT' ? 2 : 6)} {selectedAsset}
                  </strong>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        `Available: ${formatPrice(availableBalance, 4)} ${selectedAsset} · Locked in orders: ${formatPrice(lockedBalance, 4)} ${selectedAsset}`
                      )
                    }
                    className="p-0.5 text-[#848E9C] hover:text-[#EAECEF] rounded"
                    aria-label="Available balance details"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-[11px] font-semibold text-[#F0B90B] hover:underline"
                >
                  Transfer All
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 text-[12px] text-[#F6465D]">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Confirm Transfer CTA */}
        <div className="pt-4 pb-2">
          <button
            type="button"
            disabled={!isValidAmount}
            onClick={handleConfirmClick}
            className={`w-full h-11 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center ${
              isValidAmount
                ? 'bg-[#F0B90B] text-[#181A20] hover:bg-[#FCD535] active:scale-[0.99]'
                : 'bg-[#2B3139] text-[#5E6673] cursor-not-allowed'
            }`}
          >
            Confirm Transfer
          </button>
        </div>
      </div>

      {/* SUB-MODAL 1: Select a wallet (Video 1 0:16-0:21) */}
      {walletPickerTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center pt-safe-top"
          onClick={() => setWalletPickerTarget(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] max-h-[calc(100dvh-var(--safe-area-top)-16px)] flex flex-col overflow-hidden pb-safe-bottom animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto mt-2.5" />
            <div className="flex items-center justify-between px-4 h-12 border-b border-[#2B3139]/70 shrink-0">
              <h3 className="text-[15px] font-bold text-[#EAECEF]">
                Select a wallet ({walletPickerTarget === 'from' ? 'From' : 'To'})
              </h3>
              <button
                type="button"
                onClick={() => setWalletPickerTarget(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close wallet selector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain p-4 space-y-2">
              {WALLET_ACCOUNTS.map((acc) => {
                const bal = wallets[acc.id]?.[selectedAsset]?.available || 0;
                const isSelected =
                  (walletPickerTarget === 'from' && fromAccount === acc.id) ||
                  (walletPickerTarget === 'to' && toAccount === acc.id);

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectWallet(acc.id)}
                    className={`w-full p-3.5 rounded-xl flex items-center justify-between text-left border transition-colors ${
                      isSelected
                        ? 'bg-[#2B3139] border-[#F0B90B]'
                        : 'bg-[#181A20]/70 border-[#2B3139]/60 hover:border-[#474D57]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#202630] flex items-center justify-center text-[#EAECEF]">
                        <Wallet className="w-4 h-4 text-[#F0B90B]" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#EAECEF]">
                          {acc.label}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-[#848E9C] mt-0.5">
                          {formatPrice(bal, selectedAsset === 'USDT' ? 2 : 6)} {selectedAsset}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#F0B90B]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: Coin Picker Modal (Video 1 0:25-0:27) */}
      {isCoinPickerOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
          <div className="max-w-[430px] w-full mx-auto px-4 h-12 flex items-center gap-3 border-b border-[#2B3139]/70 shrink-0">
            <div className="flex-1 flex items-center gap-2 bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-xl px-3 h-9">
              <Search className="w-4 h-4 text-[#848E9C] shrink-0" />
              <input
                type="text"
                value={coinSearchQuery}
                onChange={(e) => setCoinSearchQuery(e.target.value)}
                placeholder="Search coin..."
                className="w-full bg-transparent text-[12px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
                autoFocus
              />
              {coinSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCoinSearchQuery('')}
                  className="text-[#848E9C] hover:text-[#EAECEF]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsCoinPickerOpen(false)}
              className="text-[12px] font-semibold text-[#F0B90B] px-1.5 py-1.5"
            >
              Cancel
            </button>
          </div>

          <div className="max-w-[430px] w-full mx-auto flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
            {searchHistory.length > 0 && !coinSearchQuery && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#848E9C] uppercase tracking-wider">
                    Search History
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchHistory([])}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                    aria-label="Clear search history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(item);
                        setIsCoinPickerOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#202630] border border-[#2B3139] text-[12px] font-semibold text-[#EAECEF] hover:border-[#F0B90B]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-[11px] font-semibold text-[#848E9C] uppercase tracking-wider mb-2">
                Coin List
              </div>
              <div className="divide-y divide-[#2B3139]/60">
                {filteredCoins.map((c) => {
                  const bal = wallets[fromAccount]?.[c.asset]?.available || 0;
                  const usdVal = bal * getAssetPriceUsd(c.asset);
                  return (
                    <button
                      key={c.asset}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(c.asset);
                        if (!searchHistory.includes(c.asset)) {
                          setSearchHistory((prev) => [c.asset, ...prev.slice(0, 5)]);
                        }
                        setIsCoinPickerOpen(false);
                      }}
                      className="w-full py-3 flex items-center justify-between text-left hover:bg-[#202630]/60 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CoinIcon asset={c.asset} size="md" />
                        <div>
                          <div className="text-[14px] font-bold text-[#EAECEF]">
                            {c.asset}
                          </div>
                          <div className="text-[11px] text-[#848E9C]">{c.name}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="text-[14px] font-bold text-[#EAECEF]">
                          {formatPrice(bal, c.asset === 'USDT' ? 2 : 4)}
                        </div>
                        <div className="text-[11px] text-[#848E9C]">
                          ≈ {formatFiat(usdVal, settings.fiat)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: Transfer Preview & Confirmation Sheet (Requirement 3.E steps 9-10) */}
      {isPreviewConfirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center pt-safe-top"
          onClick={() => setIsPreviewConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[430px] max-h-[calc(100dvh-var(--safe-area-top)-16px)] overflow-y-auto bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-4 pb-safe-bottom animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#EAECEF]">Confirm Internal Transfer</h3>
              <button
                type="button"
                onClick={() => setIsPreviewConfirmOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close transfer preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 border-y border-[#2B3139]">
              <div className="text-[11px] text-[#848E9C] mb-1">Transfer Amount</div>
              <div className="text-2xl font-mono tabular-nums font-extrabold text-[#EAECEF]">
                {parsedAmount} {selectedAsset}
              </div>
              <div className="text-[12px] font-mono tabular-nums text-[#848E9C] mt-0.5">
                ≈ {formatFiat(parsedAmount * assetPriceUsdt, settings.fiat)}
              </div>
            </div>

            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">From Account</span>
                <span className="font-semibold text-[#EAECEF]">{fromMeta.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">To Account</span>
                <span className="font-semibold text-[#EAECEF]">{toMeta.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Transfer Fee</span>
                <span className="font-mono tabular-nums text-[#2EBD85] font-semibold">
                  0.00 {selectedAsset} (Free)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Execution Ledger</span>
                <span className="font-mono text-[#EAECEF]">
                  Simulated Portfolio · Internal Ledger
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewConfirmOpen(false)}
                className="flex-1 h-11 rounded-xl bg-[#2B3139] hover:bg-[#363C45] text-[#EAECEF] text-[13px] font-semibold transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="flex-1 h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-[13px] font-bold transition-colors"
              >
                Confirm &amp; Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: Transfer Successful Bottom Sheet (Exact reproduction of Video 1 0:39-0:41) */}
      {completedTx && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center pt-safe-top">
          <div className="w-full max-w-[430px] max-h-[calc(100dvh-var(--safe-area-top)-16px)] overflow-y-auto bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 text-center space-y-4 pb-safe-bottom animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />

            <div className="w-14 h-14 rounded-full bg-[#2EBD85]/15 border-2 border-[#2EBD85] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-[#2EBD85]" strokeWidth={3} />
            </div>

            <div>
              <div className="text-[14px] font-semibold text-[#EAECEF]">
                Transfer Successful
              </div>
              <div className="text-2xl font-mono tabular-nums font-extrabold text-white mt-1">
                {completedTx.amount} {completedTx.asset}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#848E9C] mt-1">
                Ref: {completedTx.refId} · {fromMeta.shortLabel} → {toMeta.shortLabel}
              </div>
            </div>

            {/* "You may want to use the following products: Futures" card from Video 1 0:40 */}
            <div className="text-left space-y-2 pt-3 border-t border-[#2B3139]">
              <div className="text-[11px] text-[#848E9C]">
                You may want to use the following products
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeTransferModal();
                    if (toAccount === 'usdm_futures' || toAccount === 'coinm_futures') {
                      setExchangeTab('assets');
                      setAssetsSubTab('futures');
                    } else {
                      setExchangeTab('futures');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#F0B90B] flex items-center gap-2 text-[12px] font-semibold text-[#EAECEF] transition-colors"
                >
                  <span className="w-2 h-2 rounded-xs bg-[#F0B90B]" />
                  Futures
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tx = completedTx;
                    closeTransferModal();
                    setSelectedTxDetail(tx);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#474D57] text-[12px] font-semibold text-[#EAECEF] transition-colors"
                >
                  View Receipt
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={closeTransferModal}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-[14px] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
