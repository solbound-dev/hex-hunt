import type { Socket } from 'socket.io-client';
import {
  generateGrid,
  GRID_RADIUS,
  Hex,
  HEX_SIZE,
  hexToPixel,
  isInGrid,
  PI,
  Player,
  PlayerType,
  type GameData,
} from './calculation-utils';
import type { DefaultEventsMap } from '@socket.io/component-emitter';
import type { ImgRef } from '../hooks/game';

export const colors = {
  [PlayerType.Astronaut]: 'blue',
  [PlayerType.Alien]: 'green',
  [PlayerType.Robot]: 'red',
  [PlayerType.Wizard]: 'purple',
};

type StyleOptions = {
  strokeStyle: string;
  lineWidth: number;
  fillStyle?: string;
  blur?: boolean;
};

function applyIsometricTransformation(x: number, y: number, hexSize: number) {
  return {
    ox: x * 0.7 - y * 0.7 + 7 * hexSize,
    oy: 0.5 * x * 0.7 + 0.5 * y * 0.7 + 2 * hexSize,
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
) {
  if (!hex) return;
  const center = hexToPixel(hex);
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
    ctx.shadowColor = styleOptions.strokeStyle;
    ctx.stroke();
  } else {
    ctx.strokeStyle = styleOptions.strokeStyle;
    ctx.lineWidth = styleOptions.lineWidth;
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
  size: number,
  image: HTMLImageElement,
) {
  const center = hexToPixel(hex);
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

  drawHexIsometric(ctx, hex, size, { strokeStyle: color, lineWidth: 3 });

  const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, size);
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
  hex: Hex,
  size: number,
  image: HTMLImageElement,
) {
  const center = hexToPixel(hex);
  const x = center.x;
  const y = center.y;

  const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, size);

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
) {
  if (cardPos) {
    const center = hexToPixel(cardPos);
    const x = center.x;
    const y = center.y;

    const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, HEX_SIZE);

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
) {
  const positionInstance = new Hex(pos.q, pos.r);
  positionInstance.neighbors().forEach((n) => {
    if (isInGrid(n, grid, disappearedHexes)) {
      drawHexIsometric(ctx, n, size, {
        strokeStyle: 'white',
        lineWidth: 1,
        fillStyle: 'rgba(0, 255, 0, 0.1)',
      });
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
) {
  pos.neighbors().forEach((n) => {
    if (isInGrid(n, grid, disappearedHexes)) {
      drawHexIsometric(ctx, n, size, {
        strokeStyle: 'white',
        lineWidth: 1,
        fillStyle: 'rgba(255, 255, 0, 100)',
      });
      ctx.stroke();
    }
  });
}

export function drawZoneContractionWarningIsometric(
  ctx: CanvasRenderingContext2D,
  grid: Hex[],
  currentRadius: number,
  size: number,
) {
  if (grid.length) {
    grid.forEach((hex) => {
      const newHex = new Hex(hex.q, hex.r);
      if (newHex.distanceTo(new Hex(0, 0)) === currentRadius) {
        drawHexIsometric(ctx, hex, size, {
          strokeStyle: 'rgba(255, 140,0, 0.5)',
          fillStyle: 'rgba(255, 140,0, 0.5)',
          lineWidth: 1,
        });
        ctx.stroke();
      }
    });
  }
}

export function drawDisappearedHexesIsometric(
  ctx: CanvasRenderingContext2D,
  disappearedHexes: Hex[],
  size: number,
) {
  if (disappearedHexes.length) {
    disappearedHexes.forEach((hex) => {
      drawHexIsometric(ctx, hex, size, {
        strokeStyle: 'rgba(139, 0,0,1)',
        fillStyle: 'rgba(139, 0,0,1)',
        lineWidth: 1,
      });
      ctx.stroke();
    });
  }
}

export function drawDeadPlayerIsometric(
  ctx: CanvasRenderingContext2D,
  deadPlayerPos: Hex,
  image: HTMLImageElement,
) {
  const center = hexToPixel(deadPlayerPos);
  const x = center.x;
  const y = center.y;

  const { ox: ocx, oy: ocy } = applyIsometricTransformation(x, y, HEX_SIZE);

  if (image.complete) {
    const imgSize = image.width;
    ctx.drawImage(
      image,
      ocx - imgSize / 2,
      ocy - imgSize / 1.2,
      imgSize,
      imgSize,
    );
  }
}

export function drawHoverHighlight(
  ctx: CanvasRenderingContext2D,
  hex: Hex | null,
  size: number,
) {
  if (!hex) return;

  drawHexIsometric(ctx, hex, size, {
    strokeStyle: 'yellow',
    lineWidth: 2,
    fillStyle: 'rgba(255, 255, 0, 1)',
  });
}

export function drawGridIsometric(ctx: CanvasRenderingContext2D, grid: Hex[]) {
  grid.forEach((hex) =>
    drawHexIsometric(ctx, hex, HEX_SIZE, {
      strokeStyle: 'white',
      lineWidth: 1.5,
    }),
  );
}

export function repaint(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
  imgRef: React.RefObject<ImgRef>,
  gameState: GameData | undefined,
  isCanvasHovered: boolean,
  isShooting: boolean,
  hoveredHex: Hex | null,
  walletId?: string,
) {
  if (!gameState) return;
  if (!walletId) return;

  console.log('repaint', gameState);

  const context = canvasRef.current?.getContext('2d');
  if (!context) return;

  context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

  drawGridIsometric(context, generateGrid(GRID_RADIUS));

  drawHexIsometric(context, hoveredHex, HEX_SIZE, {
    strokeStyle: `rgba(255,255,0,1)`,
    lineWidth: 4,
    blur: true,
  });

  const currentPlayer = gameState.players.find((p) => p.walletId === walletId);
  if (!currentPlayer) return;

  const otherPlayers = gameState.players.filter(
    (p) => p.id !== socketRef.current?.id,
  );

  if (isShooting) {
    const pos = new Hex(currentPlayer.pos!.q, currentPlayer.pos!.r);

    drawShootHighlightIsometric(
      context,
      pos,
      gameState!.grid,
      gameState!.disappearedHexes,
      HEX_SIZE,
    );
  }

  drawDisappearedHexesIsometric(context, gameState.disappearedHexes, HEX_SIZE);

  if (
    gameState.moves &&
    (gameState.moves % 8 === 6 || gameState.moves % 8 === 7) &&
    gameState.currentRadius > 1
  ) {
    drawZoneContractionWarningIsometric(
      context,
      gameState.grid,
      gameState.currentRadius,
      HEX_SIZE,
    );
  }

  paintInOrder(
    context,
    imgRef,
    gameState,
    currentPlayer,
    otherPlayers,
    isCanvasHovered,
  );
}

function paintInOrder(
  context: CanvasRenderingContext2D,
  imgRef: React.RefObject<ImgRef>,
  gameState: GameData,
  currentPlayer: Player,
  otherPlayers: Player[],
  isCanvasHovered: boolean,
) {
  if (isCanvasHovered) {
    drawAvailableMovesHighlightIsometric(
      context,
      currentPlayer.pos!,
      gameState.grid,
      gameState.disappearedHexes,
      HEX_SIZE,
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
          HEX_SIZE,
          playerImage!,
        );
      } else if (currentPlayer.isDead) {
        drawDeadPlayerIsometric(
          context,
          currentPlayer.pos!,
          imgRef.current.skull!,
        );
      }
    } else if (asset.equals(gameState.cardPos!)) {
      drawCardIsometric(context, gameState.cardPos, imgRef.current.card!);
    } else {
      const lastSeenPlayerImage = mapPlayerTypeToImage(sa.type, imgRef);

      drawLastSeenPlayerIsometric(
        context,
        asset,
        HEX_SIZE,
        lastSeenPlayerImage!,
      );
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
