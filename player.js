class Player {
  constructor(color) {
    this.color = color;
    if (color == "white") {
      this.colorOpponent = "black";
    } else {
      this.colorOpponent = "white";
    }
    this.clockDisplay = document.getElementById("clock_" + color);
    this.outputConsole = document.getElementById("script_output_" + color);
    this.dropZone = document.getElementById("drop_zone_" + color);
  }

  loadScript(file) {
    if (this.globals != undefined) {
      this.globals.destroy();
      this.globals = undefined;
    }
    this.dropZone.innerText = "";

    const reader = new FileReader();
    reader.onload = (event) => {
      this.dropZone.innerText = file.name;
      this.globals = pyodide.globals.get("dict")();
      pyodide.runPython(event.target.result, {
        globals: this.globals,
        filename: this.dropZone.innerText,
      });
      this.start();
    };
    console.log(`loading script "${file.name}" for ${this.color}`);
    reader.readAsText(file);
  }

  captureOutput() {
    pyodide.setStdout({
      batched: (message) => {
        this.outputConsole.innerHTML += message + "<br>";
        this.outputConsole.scrollTop = this.outputConsole.scrollHeight;
      },
    });
    pyodide.setStderr({
      batched: (message) => {
        this.outputConsole.innerHTML +=
          '<span class="error">' + message + "</span><br>";
        this.outputConsole.scrollTop = this.outputConsole.scrollHeight;
      },
    });
  }

  start() {
    if (this.globals == undefined) {
      console.log(`can't run start: ${this.color} has no script attached`);
      return;
    }
    console.log(`start ${this.color} bot`);

    this.captureOutput();
    pyodide.runPython(
      `
        import time

        before = time.time()

        try:
            start(team_${this.color}, team_${this.colorOpponent})
        except Exception as err:
            traceback.print_exception(err)

        team_${this.color}.use_time(time.time() - before)
      `,
      {
        globals: this.globals,
        locals: pyodide.globals,
        filename: "run_start.py",
      },
    );

    this.updateClockDisplay();
  }

  step() {
    if (this.globals == undefined) {
      console.log(`can't run step: ${this.color} has no script attached`);
      return;
    }

    this.captureOutput();
    const livesBefore = pyodide.runPython(`team_${this.color}.get_lives()`);
    const exceptionProxy = pyodide.runPython(
      `
      gameEndException = None
      before = time.time()

      action = None
      try:
          action = step(tak_controller.tak.board.copy())
          if action is None:
            raise ValueError
      except Exception as err:
          traceback.print_exception(err)
          team_${this.color}.use_lives()

      team_${this.color}.use_time(time.time() - before)

      if team_${this.color}.get_lives() <= 0:
          gameEndException = GameEndException(winning_team=team_${this.colorOpponent}, cause="No lives left")
      elif team_${this.color}.get_time() <= 0:
          gameEndException = GameEndException(winning_team=team_${this.colorOpponent}, cause="Out of time")
      elif action is not None:
          try:
              tak_controller.next_move(team_${this.color}, action)
          except GameEndException as end:
              gameEndException = end
          except Exception as err:
              traceback.print_exception(err)
              team_${this.color}.use_lives()

      gameEndException
    `,
      {
        globals: this.globals,
        locals: pyodide.globals,
        filename: "run_step.py",
      },
    );

    const livesAfter = pyodide.runPython(`team_${this.color}.get_lives()`);
    if (livesAfter < livesBefore) {
      console.log(`${this.color} lost a live (${livesAfter} left)`);
    }

    this.updateClockDisplay();

    if (exceptionProxy != undefined) {
      return new GameEndException(exceptionProxy);
    } else {
      return undefined;
    }
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

  setActive() {
    this.clockDisplay.classList.toggle("active");
    this.outputConsole.classList.toggle("active");
    this.dropZone.classList.toggle("active");
  }

  setInactive() {
    this.clockDisplay.classList.remove("active");
    this.outputConsole.classList.remove("active");
    this.dropZone.classList.remove("active");
  }
}
