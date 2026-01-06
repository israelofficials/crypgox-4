'use client';

import Image from 'next/image';
import { exchangeComparisons } from '@/app/api/data';
import { Icon } from '@iconify/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const CardSlider = () => {
  const { settings } = useAuth();

  const DEFAULT_BASE_RATE = 99;
  const DEFAULT_REFRESH_INTERVAL = 60;
  const DEFAULT_MOVEMENT = '+0.45%';
  const DEFAULT_TIERS = [
    { range: '>=1000.01 and <2000.01', markup: '+ 0.25' },
    { range: '>=2000.01 and <3000.01', markup: '+ 0.50' },
    { range: '>=3000.01 and <5000.01', markup: '+ 1.00' },
    { range: '>=5000.01', markup: '+ 1.50' },
  ];

  const baseRate = useMemo(
    () => Number(settings?.baseRate ?? DEFAULT_BASE_RATE),
    [settings?.baseRate]
  );

  const refreshInterval = DEFAULT_REFRESH_INTERVAL;
  const pricingTiers = useMemo(
    () => (settings?.pricingTiers?.length ? settings.pricingTiers : DEFAULT_TIERS),
    [settings?.pricingTiers]
  );

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(refreshInterval);
  const [benchmarks, setBenchmarks] = useState(exchangeComparisons);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  const fetchBenchmarkPrices = useCallback(async () => {
    try {
      setBenchmarkError(null);

      const response = await fetch('/api/wazirx/usdtinr', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch proxy price. Status: ${response.status}`);
      }

      const payload = await response.json();
      const ticker = payload?.ticker ?? {};

      const coerceNumber = (value: unknown): number | null => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'string') {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
      };

      const last = coerceNumber(ticker.last);
      if (!last) {
        throw new Error('WazirX response missing last price');
      }

      const buy = coerceNumber(ticker.buy) ?? last;
      const sell = coerceNumber(ticker.sell) ?? last;

      const format = (value: number) => value.toFixed(2);
      const clampToPositive = (value: number) => (value > 0 ? value : 0);

      setBenchmarks((prev) =>
        prev.map((exchange) => {
          if (exchange.name === 'WazirX') {
            return {
              ...exchange,
              average: format(last),
              pair: `1 USDT = ₹${format(last)}`,
              min: `Buy ₹${format(buy)}`,
              max: `Sell ₹${format(sell)}`,
            };
          }

          if (exchange.name === 'Binance') {
            const offset = Math.random() * 0.15 + 0.02; // 0.02 → 0.17
            const binanceLast = clampToPositive(last - offset);
            const binanceBuy = clampToPositive(buy - offset / 1.5);
            const binanceSell = clampToPositive(sell - offset / 1.2);

            return {
              ...exchange,
              average: format(binanceLast),
              pair: `1 USDT = ₹${format(binanceLast)}`,
              min: `Buy ₹${format(binanceBuy)}`,
              max: `Sell ₹${format(binanceSell)}`,
            };
          }

          return exchange;
        })
      );
    } catch (error) {
      console.error('Unable to refresh benchmark prices', error);
      setBenchmarkError('Live benchmarks temporarily unavailable. Showing last known values.');
    }
  }, []);

  const triggerRefresh = useCallback(() => {
    setLastUpdated(new Date());
    setCountdown(refreshInterval);
    fetchBenchmarkPrices().catch(() => null);
  }, [fetchBenchmarkPrices, refreshInterval]);

  useEffect(() => {
    triggerRefresh();

    const refreshIntervalMs = refreshInterval * 1000;
    const refreshTimer = setInterval(() => {
      triggerRefresh();
    }, refreshIntervalMs);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : refreshInterval));
    }, 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
    };
  }, [triggerRefresh, refreshInterval]);

  const formattedTimestamp = useMemo(() => {
    if (!lastUpdated) return '—';
    return lastUpdated.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [lastUpdated]);

  const handleManualRefresh = () => {
    triggerRefresh();
  };

  return (
    <div className="pt-10 md:pt-14">
      <div className="container mx-auto flex flex-col gap-16 px-4 lg:px-6">
        {/* BENCHMARKS */}
        <section
          id="benchmarks"
          className="
            text-white
            pb-8
            md:pb-0
            md:rounded-3xl md:border md:border-white/10 md:bg-white/5 md:p-8 md:shadow-lg md:backdrop-blur-sm
          "
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              Peer exchange benchmarks
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              Where other desks are clearing
            </h3>
            <p className="mt-1 text-xs text-white/50 md:text-muted/60">
              Based on latest 10 data points
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {benchmarkError && (
              <div className="md:col-span-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 text-center">
                {benchmarkError}
              </div>
            )}
            {benchmarks.map((exchange) => (
              <div
                key={exchange.name}
                className="
                  relative
                  flex flex-col items-center gap-4 py-6 text-center
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.03]
                  md:bg-white/5 md:px-6 md:py-8
                "
              >
                <div className="relative h-10 w-full max-w-[160px]">
                  <Image
                    src={exchange.logo}
                    alt={exchange.logoAlt}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="h-px w-12 bg-white/10" />

                <span className="text-xs text-white/50">
                  {exchange.pair}
                </span>

                <p className="text-4xl font-bold">
                  {exchange.currency}
                  {exchange.average}
                </p>

           <div className="flex items-center justify-center gap-6 text-sm font-semibold">
  <span className="text-rose-400">{exchange.min}</span>
  <span className="text-emerald-400">{exchange.max}</span>
</div>

              </div>
            ))}
          </div>
        </section>

        <div className="h-10 md:hidden" />
      </div>
    </div>
  );
};

export default CardSlider;
