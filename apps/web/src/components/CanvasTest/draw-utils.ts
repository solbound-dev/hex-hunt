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

type StyleOptions = {
  strokeStyle: string;
  lineWidth: number;
  fillStyle?: string;
  blur?: boolean;
};

function applyOrthometricTransformation(x: number, y: number, hexSize: number) {
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

function drawHexOrthometric(
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

    const { ox: ovx, oy: ovy } = applyOrthometricTransformation(vx, vy, size);
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
  // const { ox: ocx, oy: ocy } = applyOrthometricTransformation(x, y, size);
  // ctx.fillText(`${hex.q},${hex.r}`, ocx, ocy);
}

export function drawPlayerOrthometric(
  ctx: CanvasRenderingContext2D,
  hex: Hex,
  playerType: PlayerType,
  size: number,
  image: HTMLImageElement,
) {
  const center = hexToPixel(hex);
  const x = center.x;
  const y = center.y;
  const color = playerType === PlayerType.Astronaut ? 'blue' : 'red';
  drawHexOrthometric(ctx, hex, size, { strokeStyle: color, lineWidth: 3 });

  const { ox: ocx, oy: ocy } = applyOrthometricTransformation(x, y, size);
  if (image.complete) {
    ctx.drawImage(
      image,
      ocx - image.width,
      ocy - image.height * 1.4,
      image.width * 2,
      image.height * 2.1,
    );
  }
  ctx.restore();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
}

export function drawLastSeenPlayerOrthometric(
  ctx: CanvasRenderingContext2D,
  hex: Hex,
  size: number,
  image: HTMLImageElement,
) {
  const center = hexToPixel(hex);
  const x = center.x;
  const y = center.y;

  const { ox: ocx, oy: ocy } = applyOrthometricTransformation(x, y, size);

  if (image.complete) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      image,
      ocx - image.width,
      ocy - image.height * 1.4,
      image.width * 2,
      image.height * 2.1,
    );
    ctx.restore();
  }
}

export function drawCardOrthometric(
  ctx: CanvasRenderingContext2D,
  cardPos: Hex | null,
  image: HTMLImageElement,
) {
  if (cardPos) {
    const center = hexToPixel(cardPos);
    const x = center.x;
    const y = center.y;

    const { ox: ocx, oy: ocy } = applyOrthometricTransformation(x, y, HEX_SIZE);

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

export function drawAvailableMovesHighlightOrthometric(
  ctx: CanvasRenderingContext2D,
  pos: Hex,
  grid: Hex[],
  disappearedHexes: Hex[],
  size: number,
) {
  const positionInstance = new Hex(pos.q, pos.r);
  positionInstance.neighbors().forEach((n) => {
    if (isInGrid(n, grid, disappearedHexes)) {
      drawHexOrthometric(ctx, n, size, {
        strokeStyle: 'white',
        lineWidth: 1,
        fillStyle: 'rgba(0, 255, 0, 0.1)',
      });
      ctx.stroke();
    }
  });
}

export function drawShootHighlightOrthometric(
  ctx: CanvasRenderingContext2D,
  pos: Hex,
  grid: Hex[],
  disappearedHexes: Hex[],
  size: number,
) {
  pos.neighbors().forEach((n) => {
    if (isInGrid(n, grid, disappearedHexes)) {
      drawHexOrthometric(ctx, n, size, {
        strokeStyle: 'white',
        lineWidth: 1,
        fillStyle: 'rgba(255, 255, 0, 100)',
      });
      ctx.stroke();
    }
  });
}

export function drawZoneContractionWarningOrthometric(
  ctx: CanvasRenderingContext2D,
  grid: Hex[],
  currentRadius: number,
  size: number,
) {
  if (grid.length) {
    grid.forEach((hex) => {
      const newHex = new Hex(hex.q, hex.r);
      if (newHex.distanceTo(new Hex(0, 0)) === currentRadius) {
        drawHexOrthometric(ctx, hex, size, {
          strokeStyle: 'rgba(255, 140,0, 0.5)',
          fillStyle: 'rgba(255, 140,0, 0.5)',
          lineWidth: 1,
        });
        ctx.stroke();
      }
    });
  }
}

export function drawDisappearedHexesOrthometric(
  ctx: CanvasRenderingContext2D,
  disappearedHexes: Hex[],
  size: number,
) {
  if (disappearedHexes.length) {
    disappearedHexes.forEach((hex) => {
      drawHexOrthometric(ctx, hex, size, {
        strokeStyle: 'rgba(139, 0,0,1)',
        fillStyle: 'rgba(139, 0,0,1)',
        lineWidth: 1,
      });
      ctx.stroke();
    });
  }
}

export function drawDeadPlayerOrthometric(
  ctx: CanvasRenderingContext2D,
  deadPlayerPos: Hex,
  image: HTMLImageElement,
) {
  const center = hexToPixel(deadPlayerPos);
  const x = center.x;
  const y = center.y;

  const { ox: ocx, oy: ocy } = applyOrthometricTransformation(x, y, HEX_SIZE);

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

  drawHexOrthometric(ctx, hex, size, {
    strokeStyle: 'yellow',
    lineWidth: 2,
    fillStyle: 'rgba(255, 255, 0, 1)',
  });
}
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------

export function drawGridOrthometric(
  ctx: CanvasRenderingContext2D,
  grid: Hex[],
) {
  grid.forEach((hex) =>
    drawHexOrthometric(ctx, hex, HEX_SIZE, {
      strokeStyle: 'white',
      lineWidth: 1.5,
    }),
  );
}

export function repaint(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
  alienImgRef: React.RefObject<HTMLImageElement | null>,
  cardImgRef: React.RefObject<HTMLImageElement | null>,
  skullImgRef: React.RefObject<HTMLImageElement | null>,
  gameState: GameData | undefined,
  isCanvasHovered: boolean,
  isShooting: boolean,
  hoveredHex: Hex | null,
) {
  if (!gameState) return;

  const imagesMap: Record<
    PlayerType,
    React.RefObject<HTMLImageElement | null>
  > = {
    [PlayerType.Astronaut]: astronautImgRef,
    [PlayerType.Alien]: alienImgRef,
  };

  contextRef.current!.clearRect(
    0,
    0,
    canvasRef.current!.width,
    canvasRef.current!.height,
  );

  // drawBackgroundImage(
  //   contextRef.current!,
  //   canvasRef.current!,
  //   backgroundImgRef.current!,
  // );

  drawGridOrthometric(contextRef.current!, generateGrid(GRID_RADIUS));

  drawHexOrthometric(contextRef.current!, hoveredHex, HEX_SIZE, {
    strokeStyle: `rgba(255,255,0,1)`,
    lineWidth: 4,
    blur: true,
  });

  const currentPlayer = gameState.players.find(
    (p) => p.id === socketRef.current?.id,
  )!;

  const otherPlayers = gameState.players.filter(
    (p) => p.id !== socketRef.current?.id,
  );

  if (isShooting) {
    const pos = currentPlayer.pos!;

    drawShootHighlightOrthometric(
      contextRef.current!,
      pos,
      gameState!.grid,
      gameState!.disappearedHexes,
      HEX_SIZE,
    );
  }

  drawDisappearedHexesOrthometric(
    contextRef.current!,
    gameState.disappearedHexes,
    HEX_SIZE,
  );

  if (
    gameState.moves &&
    (gameState.moves % 8 === 6 || gameState.moves % 8 === 7) &&
    gameState.currentRadius > 1
  ) {
    drawZoneContractionWarningOrthometric(
      contextRef.current!,
      gameState.grid,
      gameState.currentRadius,
      HEX_SIZE,
    );
  }

  paintInOrder(
    contextRef,
    astronautImgRef,
    alienImgRef,
    cardImgRef,
    skullImgRef,
    gameState,
    currentPlayer,
    otherPlayers,
    isCanvasHovered,
  );
}

function paintInOrder(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
  alienImgRef: React.RefObject<HTMLImageElement | null>,
  cardImgRef: React.RefObject<HTMLImageElement | null>,
  skullImgRef: React.RefObject<HTMLImageElement | null>,
  gameState: GameData,
  currentPlayer: Player,
  otherPlayers: Player[],
  isCanvasHovered: boolean,
) {
  if (isCanvasHovered) {
    drawAvailableMovesHighlightOrthometric(
      contextRef.current!,
      currentPlayer.pos!,
      gameState.grid,
      gameState.disappearedHexes,
      HEX_SIZE,
    );
  }

  const assets: Hex[] = [];
  otherPlayers.forEach((p) => assets.push(p.lastSeenPos!));
  assets.push(currentPlayer.pos!, gameState.cardPos!);

  const sortedAssets = assets.sort((a, b) => a.r - b.r);
  sortedAssets.forEach((sa) => {
    const asset = new Hex(sa.q, sa.r);
    if (asset.equals(currentPlayer.pos!)) {
      //TODO: neki mapper iz playertype u koji se image mora renderat
      if (!currentPlayer.isDead) {
        drawPlayerOrthometric(
          contextRef.current!,
          currentPlayer.pos!,
          currentPlayer.playerType,
          HEX_SIZE,
          astronautImgRef.current!,
        );
      } else {
        drawDeadPlayerOrthometric(
          contextRef.current!,
          currentPlayer.pos!,
          skullImgRef.current!,
        );
      }
    } else if (asset.equals(gameState.cardPos!)) {
      drawCardOrthometric(
        contextRef.current!,
        gameState.cardPos,
        cardImgRef.current!,
      );
    } else {
      //TODO: neki mapper iz playertype u koji se image mora renderat
      drawLastSeenPlayerOrthometric(
        contextRef.current!,
        asset,
        HEX_SIZE,
        alienImgRef.current!,
      );
    }
  });
}
