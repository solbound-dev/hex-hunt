import {
  generateGrid,
  GRID_RADIUS,
  Hex,
  hexToPixel,
  isInGrid,
  PI,
  Player,
  PlayerType,
  type GameData,
} from './calculation-utils';
import type { ImgRef } from '../hooks/game';

export const colors = {
  [PlayerType.Astronaut]: 'blue',
  [PlayerType.Alien]: 'green',
  [PlayerType.Robot]: 'red',
  [PlayerType.Wizard]: 'purple',
};

type StyleOptions = {
  strokeStyle?: string;
  lineWidth?: number;
  fillStyle?: string;
  blur?: boolean;
  globalAlpha?: boolean;
};

function applyIsometricTransformation(x: number, y: number, hexSize: number) {
  return {
    ox: x * 0.7 - y * 0.7 + 6.1 * hexSize,
    oy: 0.5 * x * 0.7 + 0.5 * y * 0.7 - 0.6 * hexSize,
  };
}

export function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
) {
  if (image.complete) {
    ctx.drawImage(image, 0, 0, canvas.width / 2, canvas.height / 2);
  }
}

function drawHexIsometric(
  ctx: CanvasRenderingContext2D,
  hex: Hex | null,
  size: number,
  styleOptions: StyleOptions,
  canvasSize: number,
) {
  console.log('drawHexIso');

  if (!hex) return;
  const center = hexToPixel(hex, canvasSize, size);
  const x = center.x;
  const y = center.y;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = ((2 * PI) / 6) * i + PI / 6;
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);

    const { ox: ovx, oy: ovy } = applyIsometricTransformation(vx, vy, size);
    if (i === 0) ctx.moveTo(ovx, ovy);
    else ctx.lineTo(ovx, ovy);
  }
  if (styleOptions.fillStyle) {
    ctx.fillStyle = styleOptions.fillStyle;
    ctx.fill();
  }

  if (styleOptions.blur) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 30;
    ctx.shadowColor = styleOptions.strokeStyle!;
    ctx.stroke();
  } else {
    ctx.strokeStyle = styleOptions.strokeStyle!;
    ctx.lineWidth = styleOptions.lineWidth!;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }

  ctx.closePath();
  ctx.stroke();

  ctx.restore();
  ctx.save();

  // ctx.fillStyle = 'white';
  // ctx.font = `${Math.floor(size / 4)}px Arial`;
  // ctx.textAlign = 'center';
  // ctx.textBaseline = 'middle';
  // const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, size);
  // ctx.fillText(`${hex.q},${hex.r}`, ocx, ocy);
}

export function drawPlayerIsometric(
  ctx: CanvasRenderingContext2D,
  hex: Hex,
  playerType: PlayerType,
  isImmune: boolean,
  size: number,
  image: HTMLImageElement,
  canvasSize: number,
) {
  const center = hexToPixel(hex, canvasSize, size);
  const x = center.x;
  const y = center.y;

  let color: string;
  switch (playerType) {
    case PlayerType.Astronaut:
      color = 'blue';
      break;
    case PlayerType.Alien:
      color = 'green';
      break;
    case PlayerType.Robot:
      color = 'red';
      break;
    case PlayerType.Wizard:
      color = 'purple';
      break;
    default:
      color = 'blue';
  }

  drawHexIsometric(
    ctx,
    hex,
    size,
    { strokeStyle: color, lineWidth: 3 },
    canvasSize,
  );

  const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, size);

  if (isImmune) {
    ctx.save();

    const multiplier = 1;
    const ellipseWidth = multiplier * size * 0.8;
    const ellipseHeight = multiplier * size * 0.3; // flattened for isometric look

    ctx.beginPath();
    ctx.ellipse(
      ocx,
      ocy,
      ellipseWidth,
      ellipseHeight,
      -0.02 * Math.PI,
      0,
      2 * Math.PI,
    );
    ctx.strokeStyle = 'rgba(255,255,255,1)';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.closePath();

    ctx.globalAlpha = 1;
  }
  if (!image) return;

  if (image.complete) {
    ctx.drawImage(
      image,
      ocx - image.width,
      ocy - image.height * 1.5,
      image.width * 2,
      image.height * 2.1,
    );
  }
  ctx.restore();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
}

export function drawLastSeenPlayerIsometric(
  ctx: CanvasRenderingContext2D,
  player: Player,
  size: number,
  image: HTMLImageElement,
  canvasSize: number,
) {
  const center = hexToPixel(player.lastSeenPos!, canvasSize, size);
  const x = center.x;
  const y = center.y;

  const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, size);
  if (!image) return;
  if (image.complete) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      image,
      ocx - image.width,
      ocy - image.height * 1.5,
      image.width * 2,
      image.height * 2.1,
    );
    ctx.restore();
  }
}

export function drawCardIsometric(
  ctx: CanvasRenderingContext2D,
  cardPos: Hex | null,
  image: HTMLImageElement,
  hexSize: number,
  canvasSize: number,
) {
  if (cardPos) {
    const center = hexToPixel(cardPos, canvasSize, hexSize);
    const x = center.x;
    const y = center.y;

    const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, hexSize);
    if (!image) return;
    if (image.complete) {
      ctx.drawImage(
        image,
        ocx - image.width,
        ocy - image.height * 1.7,
        image.width * 2,
        image.height * 2.3,
      );
    }
  }
}

export function drawAvailableMovesHighlightIsometric(
  ctx: CanvasRenderingContext2D,
  pos: Hex,
  grid: Hex[],
  disappearedHexes: Hex[],
  size: number,
  canvasSize: number,
) {
  const positionInstance = new Hex(pos.q, pos.r);
  positionInstance.neighbors().forEach((n) => {
    if (isInGrid(n, grid, disappearedHexes)) {
      drawHexIsometric(
        ctx,
        n,
        size,
        {
          strokeStyle: 'white',
          lineWidth: 1,
          fillStyle: 'rgba(0, 255, 0, 0.1)',
        },
        canvasSize,
      );
      ctx.stroke();
    }
  });
}

export function drawShootHighlightIsometric(
  ctx: CanvasRenderingContext2D,
  pos: Hex,
  grid: Hex[],
  disappearedHexes: Hex[],
  size: number,
  canvasSize: number,
) {
  const RANGE = 3;

  pos.neighbors().forEach((n) => {
    const dir = new Hex(n.q - pos.q, n.r - pos.r);
    let position = new Hex(pos.q, pos.r);
    while (
      pos.distanceTo(position) < RANGE &&
      isInGrid(
        new Hex(position.q + dir.q, position.r + dir.r),
        grid,
        disappearedHexes,
      )
    ) {
      position = new Hex(position.q + dir.q, position.r + dir.r);
      drawHexIsometric(
        ctx,
        position,
        size,
        {
          strokeStyle: 'white',
          lineWidth: 1,
          fillStyle: 'rgba(255, 255, 0, 0.2)',
        },
        canvasSize,
      );
      ctx.stroke();
    }
    //draw neighbors
    if (isInGrid(n, grid, disappearedHexes)) {
      drawHexIsometric(
        ctx,
        n,
        size,
        {
          strokeStyle: 'white',
          lineWidth: 1,
          fillStyle: 'rgba(255, 255, 0, 0.5)',
        },
        canvasSize,
      );
      ctx.stroke();
    }
  });
}

export function drawZoneContractionWarningIsometric(
  ctx: CanvasRenderingContext2D,
  grid: Hex[],
  currentRadius: number,
  size: number,
  canvasSize: number,
) {
  if (grid.length) {
    grid.forEach((hex) => {
      const newHex = new Hex(hex.q, hex.r);
      if (newHex.distanceTo(new Hex(0, 0)) === currentRadius) {
        drawHexIsometric(
          ctx,
          hex,
          size,
          {
            strokeStyle: 'rgba(255, 140,0, 0.2)',
            fillStyle: 'rgba(255, 140,0, 0.2)',
            lineWidth: 1,
          },
          canvasSize,
        );
        ctx.stroke();
      }
    });
  }
}

export function drawDisappearedHexesIsometric(
  ctx: CanvasRenderingContext2D,
  disappearedHexes: Hex[],
  size: number,
  canvasSize: number,
) {
  if (disappearedHexes.length) {
    disappearedHexes.forEach((hex) => {
      drawHexIsometric(
        ctx,
        hex,
        size,
        {
          strokeStyle: 'rgba(139, 0,0,0.2)',
          fillStyle: 'rgba(139, 0,0,0.2)',
          lineWidth: 1,
        },
        canvasSize,
      );
      ctx.stroke();
    });
  }
}

export function drawDeadPlayerIsometric(
  ctx: CanvasRenderingContext2D,
  deadPlayerPos: Hex,
  image: HTMLImageElement,
  canvasSize: number,
  hexSize: number,
  styleOptions?: StyleOptions,
) {
  const center = hexToPixel(deadPlayerPos, canvasSize, hexSize);
  const x = center.x;
  const y = center.y;

  const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, hexSize);

  if (!image) return;
  if (image.complete) {
    const imgSize = image.width;
    if (styleOptions?.globalAlpha) {
      ctx.save();
      ctx.globalAlpha = 0.5;
    }

    ctx.drawImage(
      image,
      ocx - imgSize / 2,
      ocy - imgSize / 1.2,
      imgSize,
      imgSize,
    );
    ctx.restore();
  }
}

export function drawHoverHighlight(
  ctx: CanvasRenderingContext2D,
  hex: Hex | null,
  size: number,
  canvasSize: number,
) {
  if (!hex) return;

  drawHexIsometric(
    ctx,
    hex,
    size,
    {
      strokeStyle: 'yellow',
      lineWidth: 2,
      fillStyle: 'rgba(255, 255, 0, 1)',
    },
    canvasSize,
  );
}

export function drawGridIsometric(
  ctx: CanvasRenderingContext2D,
  grid: Hex[],
  hexSize: number,
  canvasSize: number,
) {
  grid.forEach((hex) =>
    drawHexIsometric(
      ctx,
      hex,
      hexSize,
      {
        strokeStyle: 'rgba(255, 255, 255, 0.1)',
        lineWidth: 1.5,
      },
      canvasSize,
    ),
  );
}

export function repaint(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  imgRef: React.RefObject<ImgRef>,
  gameState: GameData | undefined | null,
  isCanvasHovered: boolean,
  isShooting: boolean,
  hoveredHex: Hex | null,
  clickedHex: Hex | null,
  hexSize: number,
  canvasSize: number,
  walletId?: string,
) {
  if (!gameState) return;
  if (!walletId) return;

  const context = canvasRef.current?.getContext('2d');
  if (!context) return;

  context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

  drawGridIsometric(context, generateGrid(GRID_RADIUS), hexSize, canvasSize);

  const currentPlayer = gameState.players.find((p) => p.walletId === walletId);
  if (!currentPlayer) return;

  if (!clickedHex && !currentPlayer?.isDead) {
    drawHexIsometric(
      context,
      hoveredHex,
      hexSize,
      {
        strokeStyle: `rgba(255,255,0,1)`,
        lineWidth: 4,
        blur: true,
      },
      canvasSize,
    );
  }

  const otherPlayers = gameState.players.filter((p) => p.walletId !== walletId);

  if (isShooting) {
    const pos = new Hex(currentPlayer.pos!.q, currentPlayer.pos!.r);

    drawShootHighlightIsometric(
      context,
      pos,
      gameState!.grid,
      gameState!.disappearedHexes,
      hexSize,
      canvasSize,
    );
  }

  drawDisappearedHexesIsometric(
    context,
    gameState.disappearedHexes,
    hexSize,
    canvasSize,
  );

  drawHexIsometric(
    context,
    clickedHex,
    hexSize,
    {
      strokeStyle: 'rgba(0, 255, 0, 1)',
      lineWidth: 8,
    },
    canvasSize,
  );
  if (
    gameState.moves &&
    (gameState.moves % 8 === 6 || gameState.moves % 8 === 7) &&
    gameState.currentRadius > 1
  ) {
    drawZoneContractionWarningIsometric(
      context,
      gameState.grid,
      gameState.currentRadius,
      hexSize,
      canvasSize,
    );
  }

  paintInOrder(
    context,
    imgRef,
    gameState,
    currentPlayer,
    otherPlayers,
    isCanvasHovered,
    clickedHex,
    hexSize,
    canvasSize,
  );
}

function paintInOrder(
  context: CanvasRenderingContext2D,
  imgRef: React.RefObject<ImgRef>,
  gameState: GameData,
  currentPlayer: Player,
  otherPlayers: Player[],
  isCanvasHovered: boolean,
  clickedHex: Hex | null,
  hexSize: number,
  canvasSize: number,
) {
  const gameContainsWinner = gameState.players.some((p) => p.won);

  if (
    isCanvasHovered &&
    !clickedHex &&
    !currentPlayer.isDead &&
    !gameContainsWinner
  ) {
    drawAvailableMovesHighlightIsometric(
      context,
      currentPlayer.pos!,
      gameState.grid,
      gameState.disappearedHexes,
      hexSize,
      canvasSize,
    );
  }

  const assets: Asset[] = [];
  otherPlayers.forEach((p) =>
    assets.push({ pos: p.lastSeenPos!, type: p.playerType }),
  );

  assets.push(
    { pos: currentPlayer.pos!, type: currentPlayer.playerType },
    { pos: gameState.cardPos!, type: 'card' },
  );

  const sortedAssets = assets.sort((a, b) => a.pos.r - b.pos.r);
  sortedAssets.forEach((sa) => {
    const asset = new Hex(sa.pos.q, sa.pos.r);

    if (asset.equals(currentPlayer.pos!)) {
      const playerImage = mapPlayerTypeToImage(
        currentPlayer.playerType,
        imgRef,
      );
      if (!currentPlayer.isDead) {
        drawPlayerIsometric(
          context,
          currentPlayer.pos!,
          currentPlayer.playerType,
          currentPlayer.isImmune,
          hexSize,
          playerImage!,
          canvasSize,
        );
      } else if (currentPlayer.isDead) {
        drawDeadPlayerIsometric(
          context,
          currentPlayer.pos!,
          imgRef.current.skull!,
          canvasSize,
          hexSize,
        );
      }
    } else if (asset.equals(gameState.cardPos!)) {
      drawCardIsometric(
        context,
        gameState.cardPos,
        imgRef.current.card!,
        hexSize,
        canvasSize,
      );
    } else {
      const lastSeenPlayerImage = mapPlayerTypeToImage(sa.type, imgRef);

      const player = otherPlayers.find((p) => {
        const lastSeenPos = new Hex(p.lastSeenPos!.q, p.lastSeenPos!.r);
        const pos = new Hex(sa.pos.q, sa.pos.r);
        return lastSeenPos.equals(pos);
      });

      if (player?.isDead && player.diedAtMove === gameState.moves - 1) {
        drawDeadPlayerIsometric(
          context,
          player.pos!,
          imgRef.current.skull!,
          canvasSize,
          hexSize,
          {
            globalAlpha: true,
          },
        );
      } else {
        if (!player?.isDead) {
          drawLastSeenPlayerIsometric(
            context,
            player!,
            hexSize,
            lastSeenPlayerImage!,
            canvasSize,
          );
        }
      }
    }
  });
}

type Asset = {
  pos: Hex;
  type: PlayerType | 'card';
};

function mapPlayerTypeToImage(
  playerType: PlayerType | 'card',
  imgRef: React.RefObject<ImgRef>,
) {
  let image: HTMLImageElement | null;
  switch (playerType) {
    case PlayerType.Astronaut:
      image = imgRef.current.astronaut;
      break;
    case PlayerType.Alien:
      image = imgRef.current.alien;
      break;
    case PlayerType.Robot:
      image = imgRef.current.robot;
      break;
    case PlayerType.Wizard:
      image = imgRef.current.wizard;
      break;
    default:
      image = imgRef.current.astronaut;
  }

  return image;
}
