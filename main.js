function dropHandlerWhite(event) {
  event.preventDefault();

  const file = event.dataTransfer.files[0];
  gameController.playerWhite.loadScript(file);
}

function dropHandlerBlack(event) {
  event.preventDefault();

  const file = event.dataTransfer.files[0];
  gameController.playerBlack.loadScript(file);
}

function dragOverHandler(event) {
  event.preventDefault();
}

function onkeydownHandler(event) {
  if (event.key === " ") {
    gameController.step();
  } else if (event.key === "r") {
    gameController.reset();
  } else if (event.key === "ArrowLeft" && gameController.historyCursor > 0) {
    gameController.historyCursor -= 1;
  } else if (
    event.key === "ArrowRight" &&
    gameController.historyCursor < gameController.piecesHistory.length - 1
  ) {
    gameController.historyCursor += 1;
  }
}

let pyodide;

let gameController;

async function setup() {
  const canvas = createCanvas(700, 700, WEBGL);
  canvas.addClass("accent_border");
  angleMode(DEGREES);

  pyodide = await loadPyodide();
  pyodide.FS.writeFile("Tak.py", await (await fetch("Tak.py")).text());
  pyodide.FS.writeFile(
    "TakController.py",
    await (await fetch("TakController.py")).text(),
  );
  pyodide.FS.writeFile("Team.py", await (await fetch("Team.py")).text());
  await pyodide.loadPackage("numpy");

  pyodide.runPython(`
    from Team import *
    from Tak import *
    from TakController import *

    import time
    import traceback
  `);
  console.log("pyodide ready");

  gameController = new GameController();
  gameController.reset();
}
