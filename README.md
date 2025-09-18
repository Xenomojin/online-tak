# Online-Tak

Online-Tak ist ein webbasierter Tak-Client in dem Python-Bots gegeneinander antreten können.

## Regeln
Bis auf eine Ausnahme gelten die standardmäßigen [Tak-Regeln](https://ustak.org/play-beautiful-game-tak): Das platzieren eines gegnerischen Steines im ersten Zug entfällt.

Zusätzlich ist jeder Bot durch eine Gesamtzeit und Leben beschränkt.
Fällt eines der beiden auf 0 verliert der Bot sofort. Von der Gesamtzeit wird jegliche Rechenzeit abgezogen, die der Bot aufwendet. Ein Leben verliert der Bot immer dann, wenn er einen ungültigen Zug durchführen möchte oder bei der Berechnung ein Fehler auftritt.

## API
Ein Bot besteht aus lediglich einer Python-Datei mit den folgenen Funktionen:

- ```python
  start(my_team: Team, opponent_team: Team)
  ```
  `Team` ist eine Klasse aus dem Modul `Team` und enthält die Teamfarbe, übrige Leben, übrige Zeit und übrige Steine.

  Jeglicher globaler State muss beim Aufruf von `start` zurückgesetzt werden.

- ```python
  step(board: Board) -> str
  ```
  Gibt den gewünschten Zug zurück.

  `Board` ist eine Klasse aus dem Modul `Tak` und kann mit `i,j` indiziert werden um einen Stack (`list[Piece]`) zu erhalten.
  Der Koordinatenursprung des Brettes befindet sich links oben. `i` bezeichnet die Zeile und `j` die Spalte.

  Ein Zug muss eine der folgenden Formen haben:
  - `PS;(i,j)` um einen Stein zu platzieren
  - `PW;(i,j)` um eine Wand zu platzieren
  - `PC;(i,j)` um einen Capstone zu plazieren
  - `MO;(i,j);D;(C, ...)` um Steine in Richtung `D = N, W, S, E` zu bewegen. Nach dem Ursprungsstein werden `C` Steine abgeworfen.

Neben den Modulen `Tak` und `Team` können auch ein Großteil der built-in Module sowie `numpy` importiert werden.

## Nutzungshinweise
Die Python-Bot-Datei kann nach Laden der Webseite per Drag&Drop in dem als _drop zone_ ausgewiesenem Feld abgelegt werden. Die `start` Funktion wird dann automatisch ausgeführt.

Mit <kbd>Space</kbd> wird der nächste Zug gespielt. Dazu wird die `step` Funktion des Bots aufgerufen, der als nächstes am Zug ist (an der Hervorhebung der verbliebenen Gesamtzeit des jeweiligen Bots zu erkennen).

Mit <kbd>r</kbd> wird das Spiel (inkl. Zeit und Leben) zurückgesetzt. Für bereits geladene Bots wird die `start` Funktion erneut aufgerufen. Falls abweichende Spielkonfigurationen gewählt werden sollen, kann dazu die `gameController.reset` Funktion in der JS-Konsole mit entsprechenen Parametern ausgeführt werden.

Mit <kbd>&larr;</kbd> und <kbd>&rarr;</kbd> kann durch vergangene Züge navigiert weden.
