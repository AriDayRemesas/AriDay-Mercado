import { writeFile } from "node:fs/promises";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ars";
const MARKUP = 0.1;
const OUTPUT_PATH = new URL("../rate.json", import.meta.url);

async function fetchRate() {
  const response = await fetch(COINGECKO_URL);
  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const data = await response.json();
  const price = Number.parseFloat(data?.tether?.ars);

  if (!Number.isFinite(price)) {
    throw new Error("Precio inválido recibido desde CoinGecko.");
  }

  const finalRate = Number((price * (1 + MARKUP)).toFixed(2));

  return {
    source: "coingecko",
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
