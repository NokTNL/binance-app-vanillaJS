const cryptoType = document.getElementById("crypto-type");
const fiatType = document.getElementById("fiat-type");
const timeEl = document.getElementById("time");
const priceEl = document.getElementById("price");

let socket;

function addSocket(cryptoTypeUpper, fiatTypeUpper) {
  const crypto = cryptoTypeUpper.toLowerCase();
  const fiat = fiatTypeUpper.toLowerCase();

  socket = new WebSocket(
    `wss://stream.binance.com:9443/ws/${crypto}${fiat}@aggTrade`
  );

  timeEl.textContent = `Time stamp: loading...`;
  priceEl.textContent = `${cryptoTypeUpper}/${fiatTypeUpper}: loading...`;

  socket.onopen = function (e) {
    console.log("[open] Connection established");
  };

  socket.onmessage = ({ data }) => {
    console.log(`[message] Message received`);
    handleData(data);
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

function handleData(data) {
  const { p, T } = JSON.parse(data); // data received in JSON
  const timeString = new Date(T).toLocaleString();
  const priceNum = parseFloat(p).toFixed(2);

  timeEl.textContent = `Time stamp: ${timeString}`;
  priceEl.textContent = `${cryptoType.value}/${fiatType.value}: ${priceNum}`;
}

function handleTypeChange(event) {
  console.log(`You have chosen: ${event.target.value}`);
  socket.close();
  addSocket(cryptoType.value, fiatType.value);
}

// Main flow
addSocket(cryptoType.value, fiatType.value);

fiatType.addEventListener("change", handleTypeChange);
cryptoType.addEventListener("change", handleTypeChange);
