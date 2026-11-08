import React, { useState } from 'react';
import {
  Globe,
  Headphones,
  Menu,
  MessageSquare,
  PieChart,
  ScanLine,
} from 'lucide-react';
import { DepositWithdrawModals } from './components/DepositWithdrawModals';
import { OverlaysAndDrawers } from './components/OverlaysAndDrawers';
import { TransferModal } from './components/TransferModal';
import {
  NexusTradeEmblem,
  NTBottomNavIcon,
  NTIconContainer,
  NTSegmentedControl,
} from './components/ui/DesignSystem';
import { ExchangeProvider, useExchange } from './context/ExchangeContext';
import { AssetsScreen } from './screens/AssetsScreen';
import { FuturesScreen } from './screens/FuturesScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MarketsScreen } from './screens/MarketsScreen';
import { TradeScreen } from './screens/TradeScreen';
import { Web3WalletViews } from './screens/Web3WalletViews';
import { AppMode, ExchangeNavTab, WalletNavTab } from './types/exchange';
import { PWAInstallButton } from './components/pwa/PWAInstallButton';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

const ExchangeWorkspace: React.FC = () => {
  const {
    appMode,
    setAppMode,
    exchangeTab,
    setExchangeTab,
    walletTab,
    setWalletTab,
    toastMessage,
    setProfileDrawerOpen,
    setMessagesModalOpen,
    setPayModalOpen,
  } = useExchange();

  const [walletSplashVisible, setWalletSplashVisible] = useState(false);

  const handleModeChange = (nextMode: AppMode) => {
    if (nextMode === appMode) return;
    if (nextMode === 'wallet') {
      setWalletSplashVisible(true);
      window.setTimeout(() => {
        setWalletSplashVisible(false);
      }, 420);
    }
    setAppMode(nextMode);
  };

  const exchangeNavItems: {
    id: ExchangeNavTab;
    label: string;
  }[] = [
    { id: 'home', label: 'Home' },
    { id: 'markets', label: 'Markets' },
    { id: 'trade', label: 'Trade' },
    { id: 'futures', label: 'Futures' },
    { id: 'assets', label: 'Assets' },
  ];

  const walletNavItems: {
    id: WalletNavTab;
    label: string;
  }[] = [
    { id: 'home', label: 'Home' },
    { id: 'markets', label: 'Markets' },
    { id: 'trade', label: 'Trade' },
    { id: 'discover', label: 'Discover' },
    { id: 'assets', label: 'Assets' },
  ];

  const isWalletAssetsScreen = appMode === 'wallet' && walletTab === 'assets';
  const isWalletTradeScreen = appMode === 'wallet' && walletTab === 'trade';

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-[#181A20] text-[#EAECEF] flex flex-col selection:bg-[#FCD535] selection:text-[#181A20]">
      {/* Offline Status Bar Banner */}
      <OfflineIndicator />

      {/* Mode Switch Transition Overlay ("Welcome to NEXUSTRADE Wallet" - matches 00:34 & 01:52) */}
      {walletSplashVisible && (
        <div className="fixed inset-0 z-50 bg-[#181A20] flex flex-col items-center justify-center gap-3 animate-in fade-in duration-150">
          <NexusTradeEmblem size={56} />
          <div className="text-center">
            <div className="text-xs font-medium text-[#848E9C] tracking-wide">Welcome to</div>
            <div className="text-xl font-bold text-[#EAECEF] tracking-tight mt-0.5">
              <span className="text-[#FCD535]">NEXUSTRADE</span> Wallet
            </div>
          </div>
        </div>
      )}

      {/* Top Sticky Global Header — Standardized 44px height + Safe-Area Top (Hidden on Wallet Trade per frame_058) */}
      {!isWalletTradeScreen && (
        <header className="sticky top-0 z-30 bg-[#181A20]/95 backdrop-blur-md pt-safe-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 h-11 flex items-center justify-between gap-2">
            {/* Left Action Icons: Hamburger Menu + Support Headset */}
            <div className="flex items-center gap-2 shrink-0 min-w-[64px]">
              <NTIconContainer
                onClick={() => setProfileDrawerOpen(true)}
                badgeDot={appMode === 'exchange'}
                aria-label="Open menu and profile"
              >
                <Menu className="w-5 h-5" />
              </NTIconContainer>

              {!isWalletAssetsScreen && (
                <NTIconContainer
                  onClick={() => setMessagesModalOpen(true)}
                  aria-label="Nexus Support Desk"
                  title="24/7 Nexus Support"
                >
                  <Headphones className="w-[19px] h-[19px]" />
                </NTIconContainer>
              )}
            </div>

            {/* Center Title on Wallet Assets OR Exchange | Wallet Segmented Control */}
            <div className="flex items-center justify-center shrink-0">
              {isWalletAssetsScreen ? (
                <span className="text-[17px] font-semibold text-[#EAECEF] tracking-tight">
                  Assets
                </span>
              ) : (
                <NTSegmentedControl<AppMode>
                  options={[
                    { id: 'exchange', label: 'Exchange' },
                    { id: 'wallet', label: 'Wallet' },
                  ]}
                  value={appMode}
                  onChange={handleModeChange}
                  size="sm"
                />
              )}
            </div>

            {/* Right Action Icons — Context-Aware for Exchange vs Wallet vs Wallet Assets */}
            <div className="flex items-center justify-end gap-2 shrink-0 min-w-[64px]">
              <PWAInstallButton variant="header" />
              {appMode === 'exchange' ? (
                <>
                  <NTIconContainer
                    onClick={() => setMessagesModalOpen(true)}
                    badgeDot
                    aria-label="Messages and Notifications"
                    title="Messages"
                  >
                    <MessageSquare className="w-[18px] h-[18px]" />
                  </NTIconContainer>

                  <NTIconContainer
                    onClick={() => setPayModalOpen(true)}
                    aria-label="QR Scanner & Nexus Pay"
                    title="QR Scanner & Nexus Pay"
                  >
                    <ScanLine className="w-[18px] h-[18px]" />
                  </NTIconContainer>
                </>
              ) : isWalletAssetsScreen ? (
                <>
                  <NTIconContainer
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('nexus:wallet-subscreen', { detail: 'networks' })
                      )
                    }
                    aria-label="Select Network"
                    title="Select Network"
                  >
                    <Globe className="w-[19px] h-[19px]" />
                  </NTIconContainer>

                  <NTIconContainer
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('nexus:wallet-subscreen', { detail: 'portfolio' })
                      )
                    }
                    aria-label="Portfolio Allocation"
                    title="Portfolio Allocation"
                  >
                    <PieChart className="w-[19px] h-[19px]" />
                  </NTIconContainer>
                </>
              ) : (
                <>
                  <NTIconContainer
                    onClick={() => setPayModalOpen(true)}
                    aria-label="QR Scanner"
                    title="Scan QR Code"
                  >
                    <ScanLine className="w-[19px] h-[19px]" />
                  </NTIconContainer>

                  <NTIconContainer
                    onClick={() => setMessagesModalOpen(true)}
                    badgeCount={1}
                    aria-label="Wallet Notifications"
                    title="Notifications"
                  >
                    <MessageSquare className="w-[19px] h-[19px]" />
                  </NTIconContainer>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Container — Standardized Padding & Safe Bottom Nav Clearance */}
      <main
        className={`flex-1 w-full max-w-7xl mx-auto pb-safe-nav ${
          appMode === 'exchange' && (exchangeTab === 'home' || exchangeTab === 'markets')
            ? 'px-[var(--nt-page-px)] sm:px-5 pt-1.5'
            : 'px-0 sm:px-5'
        }`}
      >
        {appMode === 'exchange' ? (
          <>
            {exchangeTab === 'home' && <HomeScreen />}
            {exchangeTab === 'markets' && <MarketsScreen />}
            {exchangeTab === 'trade' && <TradeScreen />}
            {exchangeTab === 'futures' && <FuturesScreen />}
            {exchangeTab === 'assets' && <AssetsScreen />}
          </>
        ) : (
          <Web3WalletViews />
        )}
      </main>

      {/* Bottom Primary Navigation Bar — Exact 54px + Safe-Area Bottom & 2-Tone Reference Icons */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#181A20]/98 backdrop-blur-md border-t border-[#2B3139]/65 pb-safe-bottom">
        <div className="max-w-lg mx-auto px-1 h-[54px] grid grid-cols-5 items-center">
          {appMode === 'exchange'
            ? exchangeNavItems.map((item) => {
                const active = exchangeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExchangeTab(item.id)}
                    className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
                      active ? 'text-[#EAECEF]' : 'text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    <NTBottomNavIcon tab={item.id} active={active} />
                    <span
                      className={`text-[10px] leading-none tracking-tight ${
                        active ? 'font-semibold text-[#EAECEF]' : 'font-medium text-[#848E9C]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })
            : walletNavItems.map((item) => {
                const active = walletTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWalletTab(item.id)}
                    className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
                      active ? 'text-[#EAECEF]' : 'text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    <NTBottomNavIcon tab={item.id} active={active} />
                    <span
                      className={`text-[10px] leading-none tracking-tight ${
                        active ? 'font-semibold text-[#EAECEF]' : 'font-medium text-[#848E9C]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
        </div>
      </nav>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#2B3139] text-[#EAECEF] text-xs font-semibold shadow-2xl border border-[#F0B90B]/30 max-w-[92vw] text-center animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Global Modals & Drawers */}
      <TransferModal />
      <DepositWithdrawModals />
      <OverlaysAndDrawers />
    </div>
  );
};

export function App() {
  return (
    <ExchangeProvider>
      <ExchangeWorkspace />
    </ExchangeProvider>
  );
}

export default App;
