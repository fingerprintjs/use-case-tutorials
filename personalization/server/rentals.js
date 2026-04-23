import fs from "fs";

export async function getRentals() {
  const rentals = JSON.parse(
    fs.readFileSync("./server/data/rentals.json", "utf-8")
  );

  const shuffled = shuffle(rentals);
  return { success: true, rentals: shuffled };
}

// --- Helper functions ---
// Shuffle an array
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
