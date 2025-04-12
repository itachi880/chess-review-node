const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const app = express();
const port = 3000;

// Endpoint to analyze PGN using Stockfish
app.post("/analyze", express.json(), (req, res) => {
  const pgn = req.body.pgn;

  // Start Stockfish
  const stockfish = spawn(path.join(__dirname, "stockfish", "stockfish17.exe"));

  // Prepare Stockfish commands
  stockfish.stdin.write("uci\n");
  stockfish.stdin.write("isready\n");
  stockfish.stdin.write(`position fen ${getMovesList(pgn)}\n`); // You may need to format the PGN to FEN if needed.
  stockfish.stdin.write("go depth 10\n"); // Analyze for 10 moves deep (or change depth)
  stockfish.stdin.write("quit\n");

  let output = "";
  stockfish.stdout.on("data", (data) => {
    output += data.toString();
  });

  stockfish.stderr.on("data", (data) => {
    console.error(`Stockfish error: ${data}`);
  });

  stockfish.on("close", (code) => {
    if (code === 0) {
      res.json({ analysis: output });
    } else {
      res.status(500).json({ error: "Stockfish crashed or failed to run." });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
function getMovesList(pgn = "") {
  /**
   * assuming there is 2 lines empty between the moves and metadata;
   */
  return pgn.split("\n\n")[1] || pgn;
}
