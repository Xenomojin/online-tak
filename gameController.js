class GameEndException {
  constructor(exceptionProxy) {
    this.message = exceptionProxy.toString();
    console.log(this.message);
    alert(this.message);
    exceptionProxy.destroy();
  }
}

class GameController {
  constructor() {
    document.getElementById("drop_zone_black").innerHTML = "<em>drop zone</em>";
    document.getElementById("drop_zone_white").innerHTML = "<em>drop zone</em>";

    this.playerBlack = new Player("black");
    this.playerWhite = new Player("white");
  }

  reset(boardSize = 5, lives = 3, time = 120, whiteNext = false) {
    console.log("reset game");

    this.gameEndException = undefined;
    this.piecesHistory = [[]];
    this.historyCursor = 0;
    this.boardSize = boardSize;
    this.whiteNext = whiteNext;

    pyodide.runPython(`
      team_white = Team("white", ${boardSize}, ${lives}, ${time})
      team_black = Team("black", ${boardSize}, ${lives}, ${time})

      tak_controller = TakController(team_white, team_black, board_size=${boardSize})
    `);

    document.getElementById("script_output_black").innerText = "";
    document.getElementById("script_output_white").innerText = "";

    this.playerBlack.start();
    this.playerWhite.start();
    this.playerBlack.updateDisplays();
    this.playerWhite.updateDisplays();

    this.updateActivePlayer();
  }

  step() {
    if (this.gameEndException != undefined) {
      console.log(`can't run step: game has already ended`);
      return;
    }

    let success;
    if (this.whiteNext) {
      success = this.playerWhite.step();
    } else {
      success = this.playerBlack.step();
    }

    if (success) {
      if (this.gameEndException == undefined) {
        this.whiteNext = !this.whiteNext;
        this.updateActivePlayer();
      }

      this.piecesHistory.push(
        JSON.parse(pyodide.runPython(`tak_controller.tak.board.pieces_json()`)),
      );
      this.historyCursor = this.piecesHistory.length - 1;

      const newPieces = this.piecesHistory[this.historyCursor];
      if (this.historyCursor >= 1) {
        const oldPieces = this.piecesHistory[this.historyCursor - 1];

        for (const newPiece of newPieces) {
          let newPieceIsAddition = true;
          for (const oldPiece of oldPieces) {
            if (
              newPiece.kind == oldPiece.kind &&
              newPiece.color == oldPiece.color &&
              newPiece.pos[0] == oldPiece.pos[0] &&
              newPiece.pos[1] == oldPiece.pos[1] &&
              newPiece.pos[2] == oldPiece.pos[2]
            ) {
              newPieceIsAddition = false;
              break;
            }
          }
          if (newPieceIsAddition) {
            newPiece.outline = "#e66149";
          } else {
            newPiece.outline = "#777";
          }
        }
      } else {
        for (const newPiece of newPieces) {
          newPiece.outline = "#777";
        }
      }
    }
  }

  endGame(gameEndExceptionProxy) {
    this.gameEndException = new GameEndException(exceptionProxy);
  }

  updateActivePlayer() {
    if (this.whiteNext) {
      this.playerWhite.clockDisplay.classList.add("active");
      this.playerBlack.clockDisplay.classList.remove("active");
    } else {
      this.playerBlack.clockDisplay.classList.add("active");
      this.playerWhite.clockDisplay.classList.remove("active");
    }
  }
}
