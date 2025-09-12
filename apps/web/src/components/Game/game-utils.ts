import type { Socket } from 'socket.io-client';

// Constants
export const HEX_SIZE = 50;
export const CANVAS_SIZE = 800;
export const DEBUG = true; // Enabled for debugging
export const FLASH_DURATION = 1000; // 1 second total
export const FLASH_CYCLES = 5; // 5 flashes
export const FLASH_INTERVAL = FLASH_DURATION / (FLASH_CYCLES * 2); // 100ms per half-cycle
//Game state variables
export let currentRadius = 3;
export let gameState = 'start';
export let currentPlayer = 1;
export let astronautPos, alienPos;
export let lastKnownAstronaut: any = null;
export let lastKnownAlien: any = null;
export let astronautRevealed = false;
export let alienRevealed = false;
export let selectingShoot = false;
export let gameStarted = false;
export let astronautWins = 0;
export let alienWins = 0;
export let astronautImg, alienImg, skullImg, cardImg;
export let moveCount = 0;
export let waitingForSecondMove = false;
export let astronautPendingMove: any = null;
export let alienPendingMove: any = null;
export let astronautInitialPos: any = null;
export let alienInitialPos: any = null;
export let collisionOccurred = false;
export let collisionHappened = false; // Flag for between-turn message
export let showCollisionMessage = false;
export let flashOpponent = false;
export let shotInvulnerable = false; // Flag for between-turn message
export let flashStartTime = 0;
export let flashCount = 0;
export let deadPlayerPos1 = null;
export let deadPlayerPos2 = null;
export let cardPos: any = null;
export let lastCardPos: any = null; // Track the last card position
export let astronautCards = 0;
export let alienCards = 0;
export let astronautImmune = false;
export let alienImmune = false;
export let astronautJustPickedCard = false; // Track if Astro picked a card
export let alienJustPickedCard = false; // Track if Alien picked a card
export let grid: Hex[] = [];
export const gridSet = new Set(); // For faster lookups
export let disappearedHexes = [];
export let astroShotFrom = null;
export let astroShotDir = null;
// Hex class
export class Hex {
  q: number;
  r: number;
  s: number;

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
    this.s = -q - r;
  }

  equals(other: Hex) {
    return other
      ? this.q === other.q && this.r === other.r && this.s === other.s
      : false;
  }

  distanceTo(other: Hex) {
    return (
      (Math.abs(this.q - other.q) +
        Math.abs(this.r - other.r) +
        Math.abs(this.s - other.s)) /
      2
    );
  }

  neighbors() {
    const directions = [
      new Hex(1, 0),
      new Hex(1, -1),
      new Hex(0, -1),
      new Hex(-1, 0),
      new Hex(-1, 1),
      new Hex(0, 1),
    ];
    return directions.map((dir) => new Hex(this.q + dir.q, this.r + dir.r));
  }

  toString() {
    return `${this.q},${this.r}`;
  }
}

// Grid generation
export function generateGrid() {
  grid = [];
  gridSet.clear();
  for (let q = -currentRadius; q <= currentRadius; q++) {
    const r1 = Math.max(-currentRadius, -q - currentRadius);
    const r2 = Math.min(currentRadius, -q + currentRadius);
    for (let r = r1; r <= r2; r++) {
      const hex = new Hex(q, r);
      grid.push(hex);
      gridSet.add(hex.toString());
    }
  }

  if (DEBUG) console.log(`Grid generated, size: ${grid.length}`);
}

export function initializeGame(p: p5) {
  try {
    currentRadius = 3;
    moveCount = 0;
    waitingForSecondMove = false;
    astronautPendingMove = null;
    alienPendingMove = null;
    astronautInitialPos = null;
    alienInitialPos = null;
    collisionOccurred = false;
    collisionHappened = false;
    showCollisionMessage = false;
    flashOpponent = false;
    shotInvulnerable = false;
    flashStartTime = 0;
    flashCount = 0;
    disappearedHexes = [];
    deadPlayerPos1 = null;
    deadPlayerPos2 = null;
    astronautCards = 0;
    alienCards = 0;
    astronautImmune = false;
    alienImmune = false;
    astronautJustPickedCard = false;
    alienJustPickedCard = false;
    lastCardPos = null;
    astroShotFrom = null;
    astroShotDir = null;
    generateGrid();
    if (grid.length === 0) {
      throw new Error('Grid generation failed: No hexes created');
    }
    astronautPos = p.random(grid);
    do {
      alienPos = p.random(grid);
    } while (
      astronautPos.distanceTo(alienPos) < 3 ||
      astronautPos.equals(alienPos)
    );
    lastKnownAstronaut = new Hex(astronautPos.q, astronautPos.r);
    lastKnownAlien = new Hex(alienPos.q, alienPos.r);
    astronautRevealed = true;
    alienRevealed = true;
    spawnCard(p);
    updateCardUI();
    gameState = 'start';
    gameStarted = false;
    currentPlayer = 1; // Ensure Astro goes first
    document.getElementById('cover').style.display = 'none';
    document.getElementById('startBtn').style.display = 'inline';
    document.getElementById('startBtn').innerText = 'Shoot';
    document.getElementById('restartBtn').style.display = 'none';
  } catch (error) {
    console.error('initializeGame failed:', error.message, error.stack);
  }
}

// Drawing functions
export function draw(p: p5) {
  if (!grid || grid.length === 0) {
    console.error('No valid grid data in draw');
    return;
  }
  p.background(0);
  // drawOutOfPlayHexes();
  // drawZoneContractionWarning();
  drawGrid(p);
  drawCard(p);
  drawDeadPlayer(p);
  drawPlayers(p);
  // drawShootHighlight();

  // Handle flashing for immune opponent
  if (flashOpponent) {
    const elapsed = p.millis() - flashStartTime;
    if (elapsed > FLASH_DURATION) {
      flashOpponent = false;
      p.noLoop();
    } else {
      flashCount = p.floor(elapsed / FLASH_INTERVAL);
      p.redraw(); // Keep drawing to animate flash
    }
  }
}

// const PI = 3.14159;
// const TWO_PI = 2 * PI;

function drawGrid(p: p5) {
  p.stroke(100);
  p.noFill();
  grid.forEach((hex) => drawHex(p, hex));
}

function drawHex(p: p5, hex: Hex) {
  const center = hexToPixel(hex);
  p.beginShape();
  for (let i = 0; i < 6; i++) {
    const angle = (p.TWO_PI / 6) * i + p.PI / 6;
    p.vertex(
      center.x + HEX_SIZE * p.cos(angle),
      center.y + HEX_SIZE * p.sin(angle),
    );
  }
  p.endShape(p.CLOSE);
}

// Coordinate conversion
function hexToPixel(hex: Hex) {
  const x = HEX_SIZE * Math.sqrt(3) * (hex.q + hex.r / 2);
  const y = ((HEX_SIZE * 3) / 2) * hex.r;
  return { x: x + CANVAS_SIZE / 2, y: y + CANVAS_SIZE / 2 };
}

function pixelToHex(x: number, y: number) {
  console.log(x);
  x = (x - CANVAS_SIZE / 2) / HEX_SIZE;
  y = (y - CANVAS_SIZE / 2) / HEX_SIZE;
  const q = (Math.sqrt(3) / 3) * x - (1 / 3) * y;
  const r = (2 / 3) * y;
  return roundHex(new Hex(q, r));
}

function roundHex(frac: Hex) {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(frac.s);
  const dq = Math.abs(q - frac.q);
  const dr = Math.abs(r - frac.r);
  const ds = Math.abs(s - frac.s);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  else s = -q - r;
  return new Hex(q, r);
}

// Spawn card function
function spawnCard(p: p5) {
  if (!grid || grid.length === 0) return;
  const possibleHexes = grid.filter(
    (h) =>
      !h.equals(astronautPos) &&
      !h.equals(alienPos) &&
      !disappearedHexes.some((d: Hex) => d.equals(h)) &&
      (!lastCardPos || !h.equals(lastCardPos)),
  );
  const preferred = possibleHexes.filter(
    (h) => h.distanceTo(astronautPos) >= 2 && h.distanceTo(alienPos) >= 2,
  );
  if (preferred.length > 0) {
    cardPos = p.random(preferred);
  } else if (possibleHexes.length > 0) {
    cardPos = p.random(possibleHexes);
  } else {
    cardPos = null;
  }
  if (DEBUG && cardPos)
    console.log(`Card spawned at (${cardPos.q}, ${cardPos.r})`);
  else if (DEBUG) console.log('No valid position for card spawn');
}

function isInGrid(hex: Hex) {
  return gridSet.has(hex.toString());
}

// Game logic
export function mousePressed(
  p: p5,
  socketRef: React.MutableRefObject<Socket | null>,
  gameId: string,
  data: any,
) {
  socketRef.current?.emit('updateGame', { gameId: gameId, move: 'move' });

  if (document.getElementById('cover').style.display !== 'none') {
    document.getElementById('cover').style.display = 'none';
    updateUI();
    p.redraw();
    return;
  }
  console.log('data', data);

  const clickedHex = pixelToHex(p.mouseX, p.mouseY);
  if (!isInGrid(clickedHex)) return;

  if (gameState === 'start') {
    if (currentPlayer !== 1) return; // Only Astro can start
    gameStarted = true;
    gameState = 'player1Turn';
    currentPlayer = 1;
    document.getElementById('startBtn').style.display = 'inline';
    updateUI();
    p.redraw();
    if (DEBUG) console.log('Game started by first move');
  }

  if (!gameStarted || gameState === 'gameOver') return;

  if (selectingShoot) {
    // if (
    //   getCurrentPos()
    //     .neighbors()
    //     .some((n) => n.equals(clickedHex))
    // ) {
    //   shootInDirection(clickedHex);
    // }
  } else {
    if (
      getCurrentPos()
        .neighbors()
        .some((n) => n.equals(clickedHex))
    ) {
      if (currentPlayer === 1) {
        astronautInitialPos = new Hex(astronautPos.q, astronautPos.r); // Save position before move
        astronautPendingMove = clickedHex;
        if (DEBUG)
          console.log(
            `Astro intends to move to (${clickedHex.q}, ${clickedHex.r}) from (${astronautInitialPos.q}, ${astronautInitialPos.r})`,
          );
      } else {
        alienInitialPos = new Hex(alienPos.q, alienPos.r); // Save position before move
        alienPendingMove = clickedHex;
        if (DEBUG)
          console.log(
            `Alien intends to move to (${clickedHex.q}, ${clickedHex.r}) from (${alienInitialPos.q}, ${alienInitialPos.r})`,
          );
      }
      endTurn(p);
      p.redraw();
    }
  }
}

function getCurrentPos() {
  return currentPlayer === 1 ? astronautPos : alienPos;
}

function getOpponentPos() {
  return currentPlayer === 1 ? alienPos : astronautPos;
}

export function updateUI() {
  updateScores();
  updateCardUI();
}

function updateScores() {
  document.querySelector('#astronaut-score .score-number').innerText =
    astronautWins;
  document.querySelector('#alien-score .score-number').innerText = alienWins;
}

function updateCardUI() {
  const astroContainer = document.getElementById('astronaut-cards');
  astroContainer.innerHTML = 'Astro Cards: ';
  for (let i = 0; i < 3; i++) {
    const img = document.createElement('img');
    img.src =
      'https://png.pngtree.com/png-vector/20220824/ourmid/pngtree-pixel-art-credit-card-icon-design-vector-png-image_6122166.png';
    img.className = 'card-icon';
    if (i >= astronautCards) img.className += ' uncollected';
    astroContainer.appendChild(img);
  }
  const alienContainer = document.getElementById('alien-cards');
  alienContainer.innerHTML = 'Alien Cards: ';
  for (let i = 0; i < 3; i++) {
    const img = document.createElement('img');
    img.src =
      'https://png.pngtree.com/png-vector/20220824/ourmid/pngtree-pixel-art-credit-card-icon-design-vector-png-image_6122166.png';
    img.className = 'card-icon';
    if (i >= alienCards) img.className += ' uncollected';
    alienContainer.appendChild(img);
  }
}

function drawPlayers(p: p5) {
  if (gameState === 'start') {
    drawPlayer(astronautPos, p, 1);
    drawPlayer(alienPos, p, 2);
  } else if (gameState !== 'gameOver') {
    if (currentPlayer === 1) {
      drawPlayer(astronautPos, p, 1);
      // if (lastKnownAlien && alienImg && alienRevealed) {
      if (lastKnownAlien) {
        console.log('lastknownalien');
        const center = hexToPixel(lastKnownAlien);
        if (!flashOpponent || (flashOpponent && flashCount % 2 === 0)) {
          // p.image(alienImg, center.x - 36, center.y - 36, 72, 72);
          // p.noTint();

          p.stroke(0);
          p.strokeWeight(4);
          p.fill(255, 0, 0, 50);
          drawHex(p, alienPos);
          p.pop();
          p.strokeWeight(1);
          p.stroke(100);
        }
      }
    } else {
      drawPlayer(alienPos, p, 2);
      // if (lastKnownAstronaut && astronautImg && astronautRevealed) {
      if (lastKnownAstronaut) {
        const center = hexToPixel(lastKnownAstronaut);
        if (!flashOpponent || (flashOpponent && flashCount % 2 === 0)) {
          // p.tint(255, 128); // 50% opacity
          // p.image(astronautImg, center.x - 80, center.y - 105, 180, 180);
          // p.noTint();

          p.stroke(0);
          p.strokeWeight(4);
          p.fill(173, 261, 230, 100);
          drawHex(p, astronautPos);
          p.pop();
          p.strokeWeight(1);
          p.stroke(100);
        }
      }
    }
  } else {
    if (
      isInGrid(astronautPos) &&
      !astronautPos.equals(deadPlayerPos1) &&
      !astronautPos.equals(deadPlayerPos2)
    ) {
      drawPlayer(astronautPos, p, 1);
    }
    if (
      isInGrid(alienPos) &&
      !alienPos.equals(deadPlayerPos1) &&
      !alienPos.equals(deadPlayerPos2)
    ) {
      drawPlayer(alienPos, p, 2);
    }
  }
}

function drawPlayer(hex: Hex, p: p5, player: number) {
  const center = hexToPixel(hex);
  if (
    (player === 1 && currentPlayer === 1) ||
    (player === 2 && currentPlayer === 2)
  ) {
    p.stroke(player === 1 ? 0 : 255, 0, player === 1 ? 255 : 0, 255);
    p.strokeWeight(4);
    drawHex(p, hex);
    p.strokeWeight(1);
    p.stroke(100);
  }
  if (player === 1 && astronautImg) {
    p.image(astronautImg, center.x - 80, center.y - 105, 180);
  } else if (player === 2 && alienImg) {
    p.image(alienImg, center.x - 36, center.y - 36, 72, 72);
  } else {
    p.fill(player === 1 ? 0 : 255, 0, player === 1 ? 255 : 0);
    drawHex(p, hex);
  }
}

function drawCard(p: p5) {
  if (cardPos && cardImg) {
    const center = hexToPixel(cardPos);
    p.image(cardImg, center.x - 37.5, center.y - 37.5, 75, 75);
  } else {
    const center = hexToPixel(cardPos);
    p.noStroke();
    p.fill(0, 200, 0); // green
    p.rect(center.x - 26, center.y - 15, 55, 35, 8);
  }
}

function endTurn(p: p5) {
  if (selectingShoot) {
    selectingShoot = false;
    document.getElementById('startBtn').innerText = 'Shoot';
  }

  if (waitingForSecondMove) {
    // apply moves if any
    let appliedAstro = false;
    let appliedAlien = false;
    if (astronautPendingMove) {
      astronautPos = astronautPendingMove;
      astronautPendingMove = null;
      appliedAstro = true;
    }
    if (alienPendingMove) {
      alienPos = alienPendingMove;
      alienPendingMove = null;
      appliedAlien = true;
    }
    // check collision
    if (astronautPos.equals(alienPos)) {
      const collidedTile = new Hex(astronautPos.q, astronautPos.r);
      if (appliedAstro) astronautPos = astronautInitialPos;
      if (appliedAlien) alienPos = alienInitialPos;
      lastKnownAstronaut = collidedTile;
      astronautRevealed = true;
      lastKnownAlien = collidedTile;
      alienRevealed = true;
      showCollisionMessage = true;
      if (DEBUG)
        console.log(
          `Collision at (${collidedTile.q}, ${collidedTile.r}), players bounced back`,
        );
    } else {
      // no collision, check card pickups
      if (cardPos) {
        if (astronautPos.equals(cardPos)) {
          astronautCards++;
          astronautImmune = true;
          astronautJustPickedCard = true;
          lastKnownAstronaut = new Hex(astronautPos.q, astronautPos.r);
          astronautRevealed = true;
          lastCardPos = new Hex(cardPos.q, cardPos.r);
          cardPos = null;
          spawnCard(p);
          updateCardUI();
          if (DEBUG)
            console.log(
              `Astro collected card at (${astronautPos.q}, ${astronautPos.r}), cards: ${astronautCards}, immune: true, last known set to (${lastKnownAstronaut.q}, ${lastKnownAstronaut.r})`,
            );
          if (astronautCards >= 3) {
            endGame(p, 'Astro Wins by collecting 3 cards!', 1);
            return;
          }
        } else if (alienPos.equals(cardPos)) {
          alienCards++;
          alienImmune = true;
          alienJustPickedCard = true;
          lastKnownAlien = new Hex(alienPos.q, alienPos.r);
          alienRevealed = true;
          lastCardPos = new Hex(cardPos.q, cardPos.r);
          cardPos = null;
          spawnCard(p);
          updateCardUI();
          if (DEBUG)
            console.log(
              `Alien collected card at (${alienPos.q}, ${alienPos.r}), cards: ${alienCards}, immune: true, last known set to (${lastKnownAlien.q}, ${lastKnownAlien.r})`,
            );
          if (alienCards >= 3) {
            endGame(p, 'Alien Wins by collecting 3 cards!', 2);
            return;
          }
        }
      }
    }
    // reset immunity if not just picked
    if (astronautImmune && !astronautJustPickedCard) {
      astronautImmune = false;
      if (DEBUG) console.log('Astro immunity expired after move');
    }
    if (alienImmune && !alienJustPickedCard) {
      alienImmune = false;
      if (DEBUG) console.log('Alien immunity expired after move');
    }
    astronautJustPickedCard = false;
    alienJustPickedCard = false;

    // Resolve deferred Astro shot if any
    if (astroShotFrom) {
      const dir = astroShotDir;
      let position = new Hex(astroShotFrom.q, astroShotFrom.r);
      const opponentTargetPos = alienPos;
      const opponentImmune = alienImmune;

      if (DEBUG)
        console.log(
          `Resolving deferred Astro shot from (${astroShotFrom.q}, ${astroShotFrom.r}) in direction (${dir.q}, ${dir.r}), opponent at (${opponentTargetPos.q}, ${opponentTargetPos.r}), immune: ${opponentImmune}`,
        );

      while (isInGrid(position)) {
        position = new Hex(position.q + dir.q, position.r + dir.r);
        if (DEBUG)
          console.log(`Checking position (${position.q}, ${position.r})`);

        if (cardPos && position.equals(cardPos)) {
          if (DEBUG) console.log(`Card hit at (${position.q}, ${position.r})`);
          lastCardPos = new Hex(cardPos.q, cardPos.r); // Save last card position
          cardPos = null;
          spawnCard(p);
          updateCardUI();
          if (DEBUG) console.log(`Card destroyed, new card spawned`);
          astroShotFrom = null;
          astroShotDir = null;
          break;
        }

        if (position.equals(opponentTargetPos)) {
          if (DEBUG)
            console.log(
              `Opponent hit at (${position.q}, ${position.r}), immune: ${opponentImmune}`,
            );
          if (!opponentImmune) {
            // Opponent hit and not immune, end game
            gameState = 'gameOver';
            deadPlayerPos1 = opponentTargetPos;
            astronautWins++;
            updateScores();
            document.getElementById('restartBtn').style.display = 'inline';
            document.getElementById('startBtn').style.display = 'none';
            if (DEBUG)
              console.log(
                `Astro wins! Total: Astro=${astronautWins}, Alien=${alienWins}`,
              );
            astroShotFrom = null;
            astroShotDir = null;
            p.redraw();
            return;
          } else {
            // Opponent immune, flash and continue
            if (DEBUG) console.log('Shot blocked by immunity');
            shotInvulnerable = true;
            flashOpponent = true;
            flashStartTime = p.millis();
            flashCount = 0;
            p.loop(); // Enable loop for flashing
            astroShotFrom = null;
            astroShotDir = null;
            break;
          }
        }
      }

      // Shot missed
      if (DEBUG) console.log('Deferred shot missed');
      astroShotFrom = null;
      astroShotDir = null;
    }

    // zone contraction
    if (gameState !== 'gameOver') {
      moveCount++;
      if (moveCount % 8 === 0 && currentRadius > 1) {
        // contractZone();
      }
    }
    waitingForSecondMove = false;
    currentPlayer = 1;
    if (gameState !== 'gameOver') {
      document.getElementById('cover').style.display = 'flex';
      document.getElementById('cover').innerText =
        'Astro turn\n(Click to continue)';
    }
  } else {
    waitingForSecondMove = true;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    document.getElementById('cover').style.display = 'flex';
    document.getElementById('cover').innerText =
      currentPlayer === 1
        ? 'Astro turn\n(Click to continue)'
        : 'Alien turn\n(Click to continue)';
  }
  updateUI();
  p.redraw();
}

function endGame(p: p5, message, winner) {
  gameState = 'gameOver';
  if (winner === 1) {
    astronautWins++;
    deadPlayerPos1 = getOpponentPos();
  } else if (winner === 2) {
    alienWins++;
    deadPlayerPos1 = getOpponentPos();
  }
  updateScores();
  document.getElementById('cover').innerText = message + '\n(Click to restart)';
  document.getElementById('cover').style.display = 'flex';
  document.getElementById('restartBtn').style.display = 'inline';
  document.getElementById('startBtn').style.display = 'none';
  p.redraw();
}

function drawDeadPlayer(p: p5) {
  if (gameState === 'gameOver') {
    if (deadPlayerPos1 && skullImg) {
      const center = hexToPixel(deadPlayerPos1);
      p.image(skullImg, center.x - 25, center.y - 25, 50, 50);
    } else if (deadPlayerPos1) {
      const center = hexToPixel(deadPlayerPos1);
      p.noStroke();
      p.fill(255); // white
      p.circle(center.x, center.y, 50);
    }
    if (deadPlayerPos2 && skullImg) {
      const center = hexToPixel(deadPlayerPos2);
      p.image(skullImg, center.x - 25, center.y - 25, 50, 50);
    } else if (deadPlayerPos2) {
      const center = hexToPixel(deadPlayerPos2);
      p.noStroke();
      p.fill(255); // white
      p.circle(center.x, center.y, 50);
    }
  }
}
