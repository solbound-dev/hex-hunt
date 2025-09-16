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

function drawHex(ctx: CanvasRenderingContext2D, hex: Hex, size: number) {
  const center = hexToPixel(hex);
  const x = center.x;
  const y = center.y;
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  for (let i = 0; i < 6; i++) {
    const angle = ((2 * PI) / 6) * i + PI / 6;
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);

    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.lineWidth = 1;
  ctx.closePath();
  ctx.stroke();
}

export function drawGrid(ctx: CanvasRenderingContext2D, grid: Hex[]) {
  grid.forEach((hex) => drawHex(ctx, hex, HEX_SIZE));
}

export function drawPlayer(
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

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = ((2 * PI) / 6) * i + PI / 6;
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();

  ctx.save();
  ctx.clip();

  if (image.complete) {
    ctx.drawImage(
      image,
      x - image.width,
      y - image.height,
      image.width * 2,
      image.height * 2,
    );
  }
  ctx.restore();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

export function drawLastSeenPlayer(
  ctx: CanvasRenderingContext2D,
  hex: Hex,
  size: number,
  image: HTMLImageElement,
) {
  const center = hexToPixel(hex);
  const x = center.x;
  const y = center.y;

  ctx.save();

  // Build hex path
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = ((2 * Math.PI) / 6) * i + Math.PI / 6;
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = 0.5;

  if (image.complete) {
    ctx.drawImage(
      image,
      x - image.width,
      y - image.height,
      image.width * 2,
      image.height * 2,
    );
  }

  ctx.restore();
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  cardPos: Hex | null,
  image: HTMLImageElement,
) {
  if (cardPos) {
    const center = hexToPixel(cardPos);

    const cardWidth = HEX_SIZE * 0.9;
    const cardHeight = HEX_SIZE * 0.6;

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      center.x - cardWidth / 2,
      center.y - cardHeight / 2,
      cardWidth,
      cardHeight,
    );
    ctx.closePath();
    ctx.clip();

    if (image.complete) {
      ctx.drawImage(
        image,
        center.x - image.width,
        center.y - image.height,
        image.width * 2,
        image.height * 2,
      );
    }
    ctx.restore();
  }
}

export function drawShootHighlight(
  ctx: CanvasRenderingContext2D,
  pos: Hex,
  grid: Hex[],
  disappearedHexes: Hex[],
  size: number,
) {
  pos.neighbors().forEach((n) => {
    if (isInGrid(n, grid, disappearedHexes)) {
      const center = hexToPixel(n);
      const x = center.x;
      const y = center.y;
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      for (let i = 0; i < 6; i++) {
        const angle = ((2 * PI) / 6) * i + PI / 6;
        const vx = x + size * Math.cos(angle);
        const vy = y + size * Math.sin(angle);

        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.fillStyle = 'rgba(255, 255, 0, 100)';
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  });
}

export function drawAvailableMovesHighlight(
  ctx: CanvasRenderingContext2D,
  pos: Hex,
  grid: Hex[],
  disappearedHexes: Hex[],
  size: number,
) {
  const positionInstance = new Hex(pos.q, pos.r);
  positionInstance.neighbors().forEach((n) => {
    if (isInGrid(n, grid, disappearedHexes)) {
      const center = hexToPixel(n);
      const x = center.x;
      const y = center.y;
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      for (let i = 0; i < 6; i++) {
        const angle = ((2 * PI) / 6) * i + PI / 6;
        const vx = x + size * Math.cos(angle);
        const vy = y + size * Math.sin(angle);

        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  });
}

export function drawDeadPlayer(
  ctx: CanvasRenderingContext2D,
  deadPlayerPos: Hex,
  size: number,
  image: HTMLImageElement,
) {
  const center = hexToPixel(deadPlayerPos);
  const x = center.x;
  const y = center.y;

  if (image.complete) {
    const imgSize = size * 1.2;
    ctx.drawImage(image, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
  }
}

export function drawDisappearedHexes(
  ctx: CanvasRenderingContext2D,
  disappearedHexes: Hex[],
  size: number,
) {
  if (disappearedHexes.length) {
    disappearedHexes.forEach((hex) => {
      const center = hexToPixel(hex);
      const x = center.x;
      const y = center.y;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(139, 0,0, 0.5)';
      for (let i = 0; i < 6; i++) {
        const angle = ((2 * PI) / 6) * i + PI / 6;
        const vx = x + size * Math.cos(angle);
        const vy = y + size * Math.sin(angle);

        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.fillStyle = 'rgba(139, 0, 0, 0.5)';
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    });
  }
}

export function drawZoneContractionWarning(
  ctx: CanvasRenderingContext2D,
  grid: Hex[],
  currentRadius: number,
  size: number,
) {
  if (grid.length) {
    grid.forEach((hex) => {
      const newHex = new Hex(hex.q, hex.r);
      if (newHex.distanceTo(new Hex(0, 0)) === currentRadius) {
        const center = hexToPixel(hex);
        const x = center.x;
        const y = center.y;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 140,0, 0.5)';
        for (let i = 0; i < 6; i++) {
          const angle = ((2 * PI) / 6) * i + PI / 6;
          const vx = x + size * Math.cos(angle);
          const vy = y + size * Math.sin(angle);

          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.fillStyle = 'rgba(255, 140, 0, 0.5)';
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
      }
    });
  }
}

function repaint(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
  alienImgRef: React.RefObject<HTMLImageElement | null>,
  cardImgRef: React.RefObject<HTMLImageElement | null>,
  skullImgRef: React.RefObject<HTMLImageElement | null>,
  gameState: GameData | undefined,
  isCanvasHovered: boolean,
) {
  if (!gameState) return;

  contextRef.current!.clearRect(
    0,
    0,
    canvasRef.current!.width,
    canvasRef.current!.height,
  );
  drawGrid(contextRef.current!, generateGrid(GRID_RADIUS));

  drawDisappearedHexes(
    contextRef.current!,
    gameState.disappearedHexes,
    HEX_SIZE,
  );

  if (
    gameState.moves &&
    (gameState.moves % 8 === 6 || gameState.moves % 8 === 7) &&
    gameState.currentRadius > 1
  ) {
    drawZoneContractionWarning(
      contextRef.current!,
      gameState.grid,
      gameState.currentRadius,
      HEX_SIZE,
    );
  }

  if (socketRef.current?.id === gameState.astronautId) {
    if (isCanvasHovered) {
      drawAvailableMovesHighlight(
        contextRef.current!,
        gameState.astronautPos!,
        gameState.grid,
        gameState.disappearedHexes,
        HEX_SIZE,
      );
    }
    drawPlayer(
      contextRef.current!,
      gameState.astronautPos!,
      true,
      HEX_SIZE,
      astronautImgRef.current!,
    );
  } else if (socketRef.current?.id === gameState.alienId) {
    if (isCanvasHovered) {
      drawAvailableMovesHighlight(
        contextRef.current!,
        gameState.alienPos!,
        gameState.grid,
        gameState.disappearedHexes,
        HEX_SIZE,
      );
    }
    drawPlayer(
      contextRef.current!,
      gameState.alienPos!,
      false,
      HEX_SIZE,
      alienImgRef.current!,
    );
  }
  if (socketRef.current?.id === gameState.alienId) {
    drawLastSeenPlayer(
      contextRef.current!,
      gameState.lastSeenAstronautPos!,
      HEX_SIZE,
      astronautImgRef.current!,
    );
  } else if (socketRef.current?.id === gameState.astronautId) {
    drawLastSeenPlayer(
      contextRef.current!,
      gameState.lastSeenAlienPos!,
      HEX_SIZE,
      alienImgRef.current!,
    );
  }
  drawCard(contextRef.current!, gameState.cardPos, cardImgRef.current!);

  if (gameState.isAstronautDead) {
    drawDeadPlayer(
      contextRef.current!,
      gameState.astronautPos!,
      HEX_SIZE,
      skullImgRef.current!,
    );
  }
  if (gameState.isAlienDead) {
    drawDeadPlayer(
      contextRef.current!,
      gameState.alienPos!,
      HEX_SIZE,
      skullImgRef.current!,
    );
  }
}

export function repaintCanvas(
  isShooting: boolean,
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
  alienImgRef: React.RefObject<HTMLImageElement | null>,
  cardImgRef: React.RefObject<HTMLImageElement | null>,
  skullImgRef: React.RefObject<HTMLImageElement | null>,
  gameState: GameData | undefined,
  isCanvasHovered: boolean,
) {
  if (isShooting) {
    const pos =
      socketRef.current?.id === gameState?.astronautId
        ? new Hex(gameState!.astronautPos!.q, gameState!.astronautPos!.r)
        : new Hex(gameState!.alienPos!.q, gameState!.alienPos!.r);

    drawShootHighlight(
      contextRef.current!,
      pos,
      gameState!.grid,
      gameState!.disappearedHexes,
      HEX_SIZE,
    );
  } else if (
    gameState?.astronautId &&
    gameState?.alienId &&
    gameState?.cardPos
  ) {
    repaint(
      contextRef,
      canvasRef,
      socketRef,
      astronautImgRef,
      alienImgRef,
      cardImgRef,
      skullImgRef,
      gameState,
      isCanvasHovered,
    );
  }
}

export function paintCanvasOnGameStart(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
  alienImgRef: React.RefObject<HTMLImageElement | null>,
  cardImgRef: React.RefObject<HTMLImageElement | null>,
  data: GameData,
) {
  drawPlayer(
    contextRef.current!,
    data.astronautPos!,
    true,
    HEX_SIZE,
    astronautImgRef.current!,
  );
  drawPlayer(
    contextRef.current!,
    data.alienPos!,
    false,
    HEX_SIZE,
    alienImgRef.current!,
  );
  drawCard(contextRef.current!, data.cardPos, cardImgRef.current!);
}
