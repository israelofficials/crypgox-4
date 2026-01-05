import { NextResponse } from 'next/server'

const WAZIRX_TICKER_ENDPOINT = 'https://api.wazirx.com/api/v2/tickers/usdtinr'

export async function GET() {
  try {
    const response = await fetch(WAZIRX_TICKER_ENDPOINT, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Unable to fetch WazirX price feed.' },
        { status: response.status }
      )
    }

    const payload = await response.json()

    return NextResponse.json({
      source: 'wazirx',
      fetchedAt: Date.now(),
      ticker: {
        buy: payload?.ticker?.buy ?? null,
        sell: payload?.ticker?.sell ?? null,
        last: payload?.ticker?.last ?? null,
      },
    })
  } catch (error) {
    console.error('WazirX proxy error', error)
    return NextResponse.json({ message: 'Failed to reach WazirX price feed.' }, { status: 502 })
  }
}
