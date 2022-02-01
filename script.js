"use strict";
// Database
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

// For fetching latest data once
async function fetchLatestTrade(cryptoTypeUpper, fiatTypeUpper) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${cryptoTypeUpper}${fiatTypeUpper}`
    );
    const obj = await response.json();
    const { time, price } = obj[obj.length - 1];
    DOMMod.updateData(time, price);
  } catch {
    alert(
      "Failed to get the info. Maybe the pair you chose is not available on Binance."
    );
  }
}

// WebSocket management
const socketMod = (function () {
  let _socket;

  const addSocket = (cryptoTypeUpper, fiatTypeUpper) => {
    const crypto = cryptoTypeUpper.toLowerCase();
    const fiat = fiatTypeUpper.toLowerCase();

    _socket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${crypto}${fiat}@trade`
    );

    _socket.onopen = function () {
      fetchLatestTrade(cryptoTypeUpper, fiatTypeUpper); // To get the latest price without waiting new trades to happen
      console.log(
        `[open] Connection established for ${cryptoTypeUpper}/${fiatTypeUpper}`
      );
    };

    _socket.onmessage = ({ data }) => {
      console.log(
        `[message] Message received for ${cryptoTypeUpper}/${fiatTypeUpper}`
      );
      const { T: time, p: price } = JSON.parse(data);
      DOMMod.updateData(time, price);
    };

    _socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(
          `[close] Connection for ${cryptoTypeUpper}/${fiatTypeUpper} closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.log(
          `[close] Connection for ${cryptoTypeUpper}/${fiatTypeUpper} died, code=${event.code} reason=${event.reason}`
        );
      }
    };

    _socket.onerror = function (error) {
      console.log(`[error] ${error.message}`);
    };
  };

  const closeSocket = () => {
    _socket.close();
  };
  return { addSocket, closeSocket };
})();

// DOM module
const DOMMod = (function () {
  const _cryptoType = document.getElementById("crypto-type");
  const _fiatType = document.getElementById("fiat-type");
  const _timeEl = document.getElementById("time");
  const _priceEl = document.getElementById("price");

  const _handleTypeChange = (event) => {
    console.log(`You have chosen: ${_cryptoType.value}/${_fiatType.value}`);
    _timeEl.textContent = `Time stamp: loading...`;
    _priceEl.textContent = `${_cryptoType.value}/${_fiatType.value}: loading...`;

    socketMod.closeSocket();
    socketMod.addSocket(_cryptoType.value, _fiatType.value);
  };

  const init = () => {
    for (const coin of cryptoList) {
      const option = document.createElement("option");
      option.value = coin.symbol;
      option.textContent = `${coin.name} (${coin.symbol})`;
      _cryptoType.appendChild(option);
    }

    for (const coin of fiatList) {
      const option = document.createElement("option");
      option.value = coin.symbol;
      option.textContent = `${coin.name} (${coin.symbol})`;
      _fiatType.appendChild(option);
    }

    _fiatType.addEventListener("change", _handleTypeChange);
    _cryptoType.addEventListener("change", _handleTypeChange);
  };

  const updateData = (time, price) => {
    const timeString = new Date(time).toLocaleString();
    const priceNum = parseFloat(price);

    _timeEl.textContent = `Time stamp: ${timeString}`;
    _priceEl.textContent = `${_cryptoType.value}/${_fiatType.value}: ${priceNum}`;
  };

  return { init, updateData };
})();

// Main flow
DOMMod.init();
socketMod.addSocket("BTC", "BUSD");
