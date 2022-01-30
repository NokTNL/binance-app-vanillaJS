/* async function fetchLatestTrade() {
  const response = await fetch(
    `https://api.binance.com/api/v3/trades?symbol=${cryptoType.value}${fiatType.value}`
  );
  const obj = await response.json();
  return obj[0];
} */

const timeEl = document.getElementById("time");
const priceEl = document.getElementById("price");
const cryptoType = document.getElementById("crypto-type");
const fiatType = document.getElementById("fiat-type");

let socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@aggTrade");

socket.onopen = function (e) {
  console.log("[open] Connection established");
};

socket.onmessage = ({ data }) => {
  console.log(`[message] Message received`);
  const { p, T } = JSON.parse(data); // data received in JSON\
  const timeString = new Date(T).toLocaleString();
  const priceNum = parseFloat(p).toFixed(2);

  timeEl.textContent = `Time stamp: ${timeString}`;
  priceEl.textContent = `${cryptoType.value}/${fiatType.value}: ${priceNum}`;
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
