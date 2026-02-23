import { writeFile } from "node:fs/promises";

const BINANCE_URL =
  "https://api.binance.com/api/v3/ticker/price?symbol=USDTARS";
const MARKUP = 0.1;
const OUTPUT_PATH = new URL("../rate.json", import.meta.url);

async function fetchRate() {
  const response = await fetch(BINANCE_URL);
  if (!response.ok) {
    throw new Error(`Binance error: ${response.status}`);
  }

  const data = await response.json();
  const price = Number.parseFloat(data.price);

  if (!Number.isFinite(price)) {
    throw new Error("Precio inválido recibido desde Binance.");
  }

  const finalRate = Number((price * (1 + MARKUP)).toFixed(2));

  return {
    source: "binance",
    base: "USDT",
    quote: "ARS",
    price: Number(price.toFixed(2)),
    markup: MARKUP,
    final_rate: finalRate,
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const rate = await fetchRate();
  await writeFile(OUTPUT_PATH, `${JSON.stringify(rate, null, 2)}\n`, "utf-8");
  console.log("rate.json actualizado");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
