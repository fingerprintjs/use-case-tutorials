import fs from "fs";

export async function getRentals() {
  const rentals = JSON.parse(
    fs.readFileSync("./server/data/rentals.json", "utf-8")
  );

  rentals.sort(() => Math.random() - 0.5);

  return { success: true, rentals };
}
