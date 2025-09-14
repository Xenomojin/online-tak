class Player {
  constructor(color) {
    this.color = color;
    if (color == "white") {
      this.color_opponent = "black";
    } else {
      this.color_opponent = "white";
    }
    this.clockDisplay = document.getElementById("clock_" + color);
    this.outputConsole = document.getElementById("script_output_" + color);
    this.dropZone = document.getElementById("drop_zone_" + color);
  }

  loadScript(file) {
    this.globals = undefined;
    this.dropZone.innerText = "";

    const reader = new FileReader();
    reader.onload = (event) => {
      this.dropZone.innerText = file.name;
      this.globals = pyodide.globals.get("dict")();
      pyodide.runPython(event.target.result, { globals: this.globals });
    };
    console.log(`loading script "${file.name}" for ${this.color}`);
    reader.readAsText(file);
  }

  captureOutput() {
    pyodide.setStdout({
      batched: (message) => (this.outputConsole.innerHTML += message + "<br>"),
    });
    pyodide.setStderr({
      batched: (message) => (this.outputConsole.innerText += message + "<br>"),
    });
  }

  start() {
    this.captureOutput();
    pyodide.runPython(
      `
        import time

        before = time.time()

        try:
            start(team_${this.color}, team_${this.color_opponent})
        except Exception as err:
            print(str(err))

        team_${this.color}.use_time(time.time() - before)
      `,
      { globals: this.globals, locals: pyodide.globals },
    );
    this.updateClockDisplay();
  }

  step() {
    this.captureOutput();
    const lives_before = pyodide.runPython(`team_${this.color}.get_lives()`);
    const endException = pyodide.runPython(
      `
      import time

      endException = None
      before = time.time()

      action = None
      try:
          action = step(tak_controller.tak.board.copy())
          if action is None:
            raise ValueError
      except Exception as err:
          print(str(err))
          team_${this.color}.use_lives()

      team_${this.color}.use_time(time.time() - before)

      if team_${this.color}.get_lives() <= 0 or team_${this.color}.get_time() <= 0:
          endException = GameEndException(losing_team=team_${this.color}, winning_team=team_${this.color_opponent})
      elif action is not None:
          try:
              tak_controller.next_move(team_${this.color}, action)
          except GameEndException as end:
              print(str(end))
              endException = end
          except Exception as err:
              print(str(err))
              team_${this.color}.use_lives()

      endException
    `,
      { globals: this.globals, locals: pyodide.globals },
    );
    const lives_after = pyodide.runPython(`team_${this.color}.get_lives()`);
    if (lives_after < lives_before) {
      console.log(`${this.color} lost a live (${lives_after} left)`);
    } else {
      white_next = !white_next;
    }
    if (endException != undefined) {
      endGame(endException);
    }
    this.updateClockDisplay();
  }

  updateClockDisplay() {
    const seconds = pyodide.runPython(`team_${this.color}.get_time()`);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    const formattedHundredths = hundredths.toString().padStart(2, "0");

    this.clockDisplay.innerText = `${formattedMinutes}:${formattedSeconds}.${formattedHundredths}`;
  }
}

function endGame(endException) {
  let winnerColor;
  if (endException.winning_team != undefined) {
    winnerColor = endException.winning_team.get_color();
  }
  let loserColor;
  if (endException.losing_team != undefined) {
    loserColor = endException.losing_team.get_color();
  }
  console.log(
    `game ended (winner: ${winnerColor}, looser: ${loserColor}, draw: ${endException.draw})`,
  );
  endException.destroy();
  gameState = "finished";
}

function dropHandlerWhite(event) {
  event.preventDefault();

  if (gameState != "loading") {
    const file = event.dataTransfer.files[0];
    player_white.loadScript(file);
  }
}

function dropHandlerBlack(event) {
  event.preventDefault();

  if (gameState != "loading") {
    const file = event.dataTransfer.files[0];
    player_black.loadScript(file);
  }
}

function dragOverHandler(event) {
  event.preventDefault();
}

function onkeydownHandler(event) {
  if (event.key === " " && player_white.globals && player_black.globals) {
    if (gameState === "ready") {
      console.log("start bots");
      player_black.start();
      player_white.start();
      gameState = "playing";
    } else if (gameState === "playing") {
      if (white_next) {
        player_white.step();
      } else {
        player_black.step();
      }

      pieces = JSON.parse(
        pyodide.runPython(`tak_controller.tak.board.pieces_json()`),
      );
    }
  } else if (event.key === "r") {
    reset();
    gameState = "ready";
  }
}

function reset(board_size = 5, lives = 3, time = 120) {
  pieces = [];
  globalThis.board_size = board_size;
  pyodide.runPython(`
    team_white = Team("white", ${board_size}, ${lives}, ${time})
    team_black = Team("black", ${board_size}, ${lives}, ${time})

    tak_controller = TakController(team_white, team_black, board_size=${board_size})
`);
  white_next = false;
  document.getElementById("script_output_black").innerText = "";
  document.getElementById("script_output_white").innerText = "";
  console.log(`reset board`);
}

let player_black;
let player_white;

let white_next;

let pyodide;

let pieces = [];
let board_size = 5;

// loading, ready, playing, finished
let gameState = "loading";

function setup() {
  player_black = new Player("black");
  player_white = new Player("white");

  loadPyodide()
    .then((p) => {
      pyodide = p;
      const gameLogicBinary = Uint8Array.fromBase64(GAME_LOGIC);
      pyodide.unpackArchive(gameLogicBinary, "tar");
      return pyodide.loadPackage("numpy");
    })
    .then((np) => {
      pyodide.runPython(`
        from Team import *
        from Tak import *
        from TakController import *
      `);
      document.getElementById("drop_zone_black").innerText = "";
      document.getElementById("drop_zone_white").innerText = "";
      console.log("pyodide ready");
      reset();
      gameState = "ready";
    });

  let canvas = document.getElementById("canvas");
  createCanvas(700, 700, WEBGL, canvas);
  angleMode(DEGREES);
}

function draw() {
  const TILE_WIDTH = 80;
  const STONE_WIDTH = 70;
  const STONE_HEIGHT = 20;
  const CAPSTONE_RADIUS = 25;

  background("#D4FFF7");

  orbitControl();

  translate(
    -((board_size - 1) * TILE_WIDTH) / 2,
    0,
    -((board_size - 1) * TILE_WIDTH) / 2,
  );

  push();
  fill("#E6C453");
  stroke("#67520F");
  for (let i = 0; i < board_size; i++) {
    for (let j = 0; j < board_size; j++) {
      push();
      translate(i * TILE_WIDTH, 50, j * TILE_WIDTH);
      box(TILE_WIDTH, 100, TILE_WIDTH);
      pop();
    }
  }
  pop();

  for (const piece of pieces) {
    push();
    if (piece.kind == "stone") {
      translate(
        piece.pos[0] * TILE_WIDTH,
        -(piece.pos[2] * STONE_HEIGHT + STONE_HEIGHT / 2),
        piece.pos[1] * TILE_WIDTH,
      );
      if (piece.color == "black") {
        fill("black");
        stroke("white");
      } else {
        fill("white");
        stroke("black");
      }
      box(STONE_WIDTH, STONE_HEIGHT, STONE_WIDTH);
    } else if (piece.kind == "wall") {
      translate(
        piece.pos[0] * TILE_WIDTH,
        -(piece.pos[2] * STONE_HEIGHT + STONE_WIDTH / 2),
        piece.pos[1] * TILE_WIDTH,
      );
      if (piece.color == "black") {
        fill("black");
        stroke("white");
      } else {
        fill("white");
        stroke("black");
      }
      rotateY(45);
      box(STONE_WIDTH, STONE_WIDTH, STONE_HEIGHT);
    } else {
      translate(
        piece.pos[0] * TILE_WIDTH,
        -(piece.pos[2] * STONE_HEIGHT + STONE_WIDTH / 2),
        piece.pos[1] * TILE_WIDTH,
      );
      if (piece.color == "black") {
        fill("black");
        stroke("black");
      } else {
        fill("white");
        stroke("white");
      }
      cylinder(CAPSTONE_RADIUS, STONE_WIDTH);
    }
    pop();
  }
}
