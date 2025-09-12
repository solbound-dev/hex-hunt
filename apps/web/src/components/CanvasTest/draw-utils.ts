import { Hex, HEX_SIZE, hexToPixel, isInGrid, PI } from './calculation-utils';

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

  // Set transparency
  ctx.globalAlpha = 0.5;

  // Draw image clipped inside hex
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
  size: number,
) {
  pos.neighbors().forEach((n) => {
    if (isInGrid(n, grid)) {
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

export function drawDeadPlayer(
  ctx: CanvasRenderingContext2D,
  deadPlayerPos: Hex,
  size: number,
) {
  const center = hexToPixel(deadPlayerPos); // convert hex to pixel coords
  const x = center.x;
  const y = center.y;

  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, 2 * Math.PI); // circle radius scaled to hex size
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
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
