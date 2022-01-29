async function fetchLatestTrade() {
  const response = await fetch(
    "https://api.binance.com/api/v3/trades?symbol=BNBUSDT"
  );
  const obj = await response.json();
  return obj[0];
}

// for testing
async function fetchAvgPrice() {
  const response = await fetch(
    "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT"
  );
  const obj = await response.json();
  return obj;
}

// Main flow
const timeEl = document.getElementById("time");
const priceEl = document.getElementById("price");

setInterval(() => {
  fetchLatestTrade().then(({ time, price }) => {
    const timeString = time && new Date(time).toLocaleString();
    const priceNum = price && parseFloat(price);

    timeEl.textContent = `Time stamp: ${timeString}`;
    priceEl.textContent = `BTC/USDT: ${priceNum}`;
  });
}, 1000);
