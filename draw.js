function draw() {
  const TILE_WIDTH = 80;
  const STONE_WIDTH = 65;
  const STONE_HEIGHT = 20;
  const CAPSTONE_RADIUS = 25;

  background("#d4fff7");

  orbitControl();

  translate(
    -((gameController.boardSize - 1) * TILE_WIDTH) / 2,
    0,
    -((gameController.boardSize - 1) * TILE_WIDTH) / 2,
  );

  push();
  stroke("#67520f");
  for (let i = 0; i < gameController.boardSize; i++) {
    for (let j = 0; j < gameController.boardSize; j++) {
      if ((i + j) % 2 == 0) {
        fill("#e6c453");
      } else {
        fill("#dfb320");
      }
      push();
      translate(j * TILE_WIDTH, 50, i * TILE_WIDTH);
      box(TILE_WIDTH, 100, TILE_WIDTH);
      pop();
    }
  }
  pop();

  push();
  noStroke();
  fill("#9cf788");
  translate(-TILE_WIDTH / 2, 0, -TILE_WIDTH / 2);
  sphere(4, 4, 4);
  pop();

  for (const piece of gameController.piecesHistory[
    gameController.historyCursor
  ]) {
    push();
    if (piece.kind == "stone") {
      stroke(piece.outline);
      translate(
        piece.pos[1] * TILE_WIDTH,
        -(piece.pos[2] * STONE_HEIGHT + STONE_HEIGHT / 2),
        piece.pos[0] * TILE_WIDTH,
      );
      fill(piece.color);
      box(STONE_WIDTH, STONE_HEIGHT, STONE_WIDTH);
    } else if (piece.kind == "wall") {
      stroke(piece.outline);
      translate(
        piece.pos[1] * TILE_WIDTH,
        -(piece.pos[2] * STONE_HEIGHT + STONE_WIDTH / 2),
        piece.pos[0] * TILE_WIDTH,
      );
      fill(piece.color);
      rotateY(45);
      box(STONE_WIDTH, STONE_WIDTH, STONE_HEIGHT);
    } else {
      noStroke();
      translate(
        piece.pos[1] * TILE_WIDTH,
        -(piece.pos[2] * STONE_HEIGHT + STONE_WIDTH / 2),
        piece.pos[0] * TILE_WIDTH,
      );
      fill(piece.color);
      cylinder(CAPSTONE_RADIUS, STONE_WIDTH);

      stroke(piece.outline);

      push();
      translate(0, -STONE_WIDTH / 2, 0);
      drawCircleOutline(CAPSTONE_RADIUS, 24);
      pop();

      push();
      translate(0, STONE_WIDTH / 2, 0);
      drawCircleOutline(CAPSTONE_RADIUS, 24);
      pop();
    }
    pop();
  }
}

function drawCircleOutline(radius, segments) {
  beginShape(LINES);
  for (let i = 0; i <= segments; i++) {
    let angle1 = map(i, 0, segments, 0, 360);
    let angle2 = map(i + 1, 0, segments, 0, 360);

    let x1 = radius * cos(angle1);
    let y1 = 0;
    let z1 = radius * sin(angle1);

    let x2 = radius * cos(angle2);
    let y2 = 0;
    let z2 = radius * sin(angle2);

    vertex(x1, y1, z1);
    vertex(x2, y2, z2);
  }
  endShape();
}
