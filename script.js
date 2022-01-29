async function fetchLatestTrade() {
  const response = await fetch(
    `https://api.binance.com/api/v3/trades?symbol=${cryptoType.value}${fiatType.value}`
  );
  const obj = await response.json();
  return obj[0];
}

// Main flow
const timeEl = document.getElementById("time");
const priceEl = document.getElementById("price");
const cryptoType = document.getElementById("crypto-type");
const fiatType = document.getElementById("fiat-type");

setInterval(() => {
  fetchLatestTrade().then(({ time, price }) => {
    const timeString = time && new Date(time).toLocaleString();
    const priceNum = price && parseFloat(price).toFixed(2);

    timeEl.textContent = `Time stamp: ${timeString}`;
    priceEl.textContent = `${cryptoType.value}/${fiatType.value}: ${priceNum}`;
  });
}, 1000);
