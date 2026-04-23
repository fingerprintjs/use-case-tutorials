import fs from "fs";

const rentals = JSON.parse(
  fs.readFileSync("./server/data/rentals.json", "utf-8")
);

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function getRentals() {
  const shuffled = shuffle(rentals);
  return { success: true, rentals: shuffled };
}
