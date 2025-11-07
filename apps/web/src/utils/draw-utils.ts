import {
  applyIsometricTransformation,
  hexToPixel,
  isInGrid,
  PI,
} from './calculation-utils';
import type { ImgRef } from '../hooks/game';
import { Hex } from './Hex';
import { Player, PlayerType } from './Player';

type StyleOptions = {
  strokeStyle?: string;
  lineWidth?: number;
  fillStyle?: string;
  blur?: boolean;
  globalAlpha?: boolean;
};

export function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
) {
  if (image.complete) {
    ctx.drawImage(image, 0, 0, canvas.width / 2, canvas.height / 2);
  }
}

export function drawHexIsometric(
  ctx: CanvasRenderingContext2D,
  hex: Hex | null,
  size: number,
  styleOptions: StyleOptions,
  canvasSize: number,
) {
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

export function drawBulletMoving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  image: HTMLImageElement,
  angle: number,
) {
  if (!image) return;
  if (image.complete) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.drawImage(
      image,
      -image.width,
      -image.height,
      image.width * 2,
      image.height * 2,
    );

    ctx.restore();
  }
}

export function drawPlayerMoving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  image: HTMLImageElement,
) {
  if (!image) return;

  if (image.complete) {
    ctx.drawImage(
      image,
      x - image.width,
      y - image.height * 1.5,
      image.width * 2,
      image.height * 2.1,
    );
  }
}

export type Asset = {
  pos: Hex;
  type: PlayerType | 'card';
};

export function mapPlayerTypeToImage(
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
