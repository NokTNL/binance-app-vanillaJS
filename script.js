async function fetchLatestTrade(cryptoTypeUpper, fiatTypeUpper) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/aggTrades?symbol=${cryptoTypeUpper}${fiatTypeUpper}`
    );
    const obj = await response.json();
    const { T, p } = obj[0];
    handleData(T, p);
  } catch {
    alert(
      "Failed to get the info. Maybe the pair you chose is not available on Binance."
    );
  }
}

function addSocket(cryptoTypeUpper, fiatTypeUpper) {
  const crypto = cryptoTypeUpper.toLowerCase();
  const fiat = fiatTypeUpper.toLowerCase();

  socket = new WebSocket(
    `wss://stream.binance.com:9443/ws/${crypto}${fiat}@aggTrade`
  );

  socket.onopen = function () {
    // fetchPrecision(cryptoTypeUpper, fiatTypeUpper);
    fetchLatestTrade(cryptoTypeUpper, fiatTypeUpper); // To get the latest price without waiting new trades to happen
    console.log("[open] Connection established");
  };

  socket.onmessage = ({ data }) => {
    console.log(`[message] Message received`);
    const { T, p } = JSON.parse(data);
    handleData(T, p);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
      );
    } else {
      console.log(
        `[close] Connection died, code=${event.code} reason=${event.reason}`
      );
    }
  };

  socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
  };
}

function handleData(time, price) {
  const timeString = new Date(time).toLocaleString();
  const priceNum = parseFloat(price);

  timeEl.textContent = `Time stamp: ${timeString}`;
  priceEl.textContent = `${cryptoType.value}/${fiatType.value}: ${priceNum}`;
}

function handleTypeChange(event) {
  console.log(`You have chosen: ${event.target.value}`);
  timeEl.textContent = `Time stamp: loading...`;
  priceEl.textContent = `${cryptoType.value}/${fiatType.value}: loading...`;

  socket.close();
  addSocket(cryptoType.value, fiatType.value);
}

// Main flow
const cryptoType = document.getElementById("crypto-type");
const fiatType = document.getElementById("fiat-type");
const timeEl = document.getElementById("time");
const priceEl = document.getElementById("price");

const cryptoList = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "Binance Coin" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "SHIB", name: "SHIBA INU" },
];

const fiatList = [
  { symbol: "BUSD", name: "US Dollar" },
  { symbol: "EUR", name: "Euro" },
  { symbol: "GBP", name: "British Pound" },
];

for (coin of cryptoList) {
  const option = document.createElement("option");
  option.value = coin.symbol;
  option.textContent = `${coin.name} (${coin.symbol})`;
  cryptoType.appendChild(option);
}

for (coin of fiatList) {
  const option = document.createElement("option");
  option.value = coin.symbol;
  option.textContent = `${coin.name} (${coin.symbol})`;
  fiatType.appendChild(option);
}

let socket;
fetchLatestTrade(cryptoType.value, fiatType.value);
addSocket(cryptoType.value, fiatType.value);

fiatType.addEventListener("change", handleTypeChange);
cryptoType.addEventListener("change", handleTypeChange);
