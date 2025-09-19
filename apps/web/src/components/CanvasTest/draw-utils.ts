import type { Socket } from 'socket.io-client';
import {
  generateGrid,
  GRID_RADIUS,
  Hex,
  HEX_SIZE,
  hexToPixel,
  isInGrid,
  PI,
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
  isAstronaut: boolean,
  size: number,
  image: HTMLImageElement,
) {
  const center = hexToPixel(hex);
  const x = center.x;
  const y = center.y;
  const color = isAstronaut ? 'blue' : 'red';
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
  backgroundImgRef: React.RefObject<HTMLImageElement | null>,
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

  if (isShooting) {
    const pos =
      socketRef.current?.id === gameState?.astronautId
        ? new Hex(gameState!.astronautPos!.q, gameState!.astronautPos!.r)
        : new Hex(gameState!.alienPos!.q, gameState!.alienPos!.r);

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

  //ASTRONAUT --------------------------------
  if (socketRef.current?.id === gameState.astronautId) {
    paintInOrder(
      contextRef,
      astronautImgRef,
      alienImgRef,
      cardImgRef,
      skullImgRef,
      gameState,
      'astronaut',
      isCanvasHovered,
    );
  } else if (socketRef.current?.id === gameState.alienId) {
    paintInOrder(
      contextRef,
      astronautImgRef,
      alienImgRef,
      cardImgRef,
      skullImgRef,
      gameState,
      'alien',
      isCanvasHovered,
    );
  }
}

function paintInOrder(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
  alienImgRef: React.RefObject<HTMLImageElement | null>,
  cardImgRef: React.RefObject<HTMLImageElement | null>,
  skullImgRef: React.RefObject<HTMLImageElement | null>,
  gameState: GameData,
  playerType: 'astronaut' | 'alien',
  isCanvasHovered: boolean,
) {
  const assets: Hex[] = [];

  if (playerType === 'astronaut') {
    assets.push(
      gameState.astronautPos!,
      gameState.lastSeenAlienPos!,
      gameState.cardPos!,
    );

    if (isCanvasHovered) {
      drawAvailableMovesHighlightOrthometric(
        contextRef.current!,
        gameState.astronautPos!,
        gameState.grid,
        gameState.disappearedHexes,
        HEX_SIZE,
      );
    }

    const sortedAssets = assets.sort((a, b) => a.r - b.r);

    for (let i = 0; i < sortedAssets.length; i++) {
      const asset = new Hex(sortedAssets[i].q, sortedAssets[i].r);
      if (asset.equals(gameState.astronautPos!)) {
        if (!gameState.isAstronautDead) {
          drawPlayerOrthometric(
            contextRef.current!,
            gameState.astronautPos!,
            true,
            HEX_SIZE,
            astronautImgRef.current!,
          );
        } else {
          drawDeadPlayerOrthometric(
            contextRef.current!,
            gameState.astronautPos!,
            skullImgRef.current!,
          );
        }
      } else if (asset.equals(gameState.lastSeenAlienPos!)) {
        drawLastSeenPlayerOrthometric(
          contextRef.current!,
          gameState.lastSeenAlienPos!,
          HEX_SIZE,
          alienImgRef.current!,
        );
        if (gameState.isAlienDead) {
          drawDeadPlayerOrthometric(
            contextRef.current!,
            gameState.alienPos!,
            skullImgRef.current!,
          );
        }
      } else if (asset.equals(gameState.cardPos!)) {
        drawCardOrthometric(
          contextRef.current!,
          gameState.cardPos,
          cardImgRef.current!,
        );
      }
    }
  } else {
    assets.push(
      gameState.alienPos!,
      gameState.lastSeenAstronautPos!,
      gameState.cardPos!,
    );

    if (isCanvasHovered) {
      drawAvailableMovesHighlightOrthometric(
        contextRef.current!,
        gameState.alienPos!,
        gameState.grid,
        gameState.disappearedHexes,
        HEX_SIZE,
      );
    }

    const sortedAssets = assets.sort((a, b) => a.r - b.r);

    for (let i = 0; i < sortedAssets.length; i++) {
      const asset = new Hex(sortedAssets[i].q, sortedAssets[i].r);
      if (asset.equals(gameState.alienPos!)) {
        if (!gameState.isAlienDead) {
          drawPlayerOrthometric(
            contextRef.current!,
            gameState.alienPos!,
            false,
            HEX_SIZE,
            alienImgRef.current!,
          );
        } else {
          drawDeadPlayerOrthometric(
            contextRef.current!,
            gameState.alienPos!,
            skullImgRef.current!,
          );
        }
      } else if (asset.equals(gameState.lastSeenAstronautPos!)) {
        drawLastSeenPlayerOrthometric(
          contextRef.current!,
          gameState.lastSeenAstronautPos!,
          HEX_SIZE,
          astronautImgRef.current!,
        );
        if (gameState.isAstronautDead) {
          drawDeadPlayerOrthometric(
            contextRef.current!,
            gameState.astronautPos!,
            skullImgRef.current!,
          );
        }
      } else if (asset.equals(gameState.cardPos!)) {
        drawCardOrthometric(
          contextRef.current!,
          gameState.cardPos,
          cardImgRef.current!,
        );
      }
    }
  }
}

export function paintCanvasOnGameStart(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
  alienImgRef: React.RefObject<HTMLImageElement | null>,
  cardImgRef: React.RefObject<HTMLImageElement | null>,
  data: GameData,
) {
  drawPlayerOrthometric(
    contextRef.current!,
    data.astronautPos!,
    true,
    HEX_SIZE,
    astronautImgRef.current!,
  );
  drawPlayerOrthometric(
    contextRef.current!,
    data.alienPos!,
    false,
    HEX_SIZE,
    alienImgRef.current!,
  );

  drawCardOrthometric(contextRef.current!, data.cardPos, cardImgRef.current!);
}
