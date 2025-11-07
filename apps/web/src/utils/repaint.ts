import type { ImgRef } from '../hooks/game';
import {
  applyIsometricTransformation,
  easeInOutSine,
  easeOutSine,
  generateGrid,
  GRID_RADIUS,
  hexToPixel,
  MOVE_ANIMATION_DURATION_IN_MS,
} from './calculation-utils';
import {
  drawAvailableMovesHighlightIsometric,
  drawBulletMoving,
  drawCardIsometric,
  drawDeadPlayerIsometric,
  drawDisappearedHexesIsometric,
  drawGridIsometric,
  drawHexIsometric,
  drawLastSeenPlayerIsometric,
  drawPlayerIsometric,
  drawPlayerMoving,
  drawShootHighlightIsometric,
  drawZoneContractionWarningIsometric,
  mapPlayerTypeToImage,
  type Asset,
} from './draw-utils';
import type { GameData } from './GameData';
import { Hex } from './Hex';
import type { Player } from './Player';

export function repaintAnimationLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  imgRef: React.RefObject<ImgRef>,
  gameState: GameData | undefined | null,
  isCanvasHovered: boolean,
  isShooting: boolean,
  hoveredHex: Hex | null,
  clickedHex: Hex | null,
  hexSize: number,
  canvasSize: number,
  isMovingAnimationActive: boolean,
  walletId?: string,
) {
  if (!gameState) return;
  if (!walletId) return;
  if (!gameState.started) return;

  const context = canvasRef.current?.getContext('2d');
  if (!context) return;

  const currentPlayer = gameState.players.find((p) => p.walletId === walletId);

  if (!currentPlayer || !currentPlayer.previousPos) return;

  let animationStart: number | null = null;

  const initialHex = new Hex(
    currentPlayer.previousPos!.q,
    currentPlayer.previousPos!.r,
  );
  const finalHex = new Hex(currentPlayer.pos!.q, currentPlayer.pos!.r);

  const { x: ix, y: iy } = hexToPixel(initialHex, canvasSize, hexSize);
  const { x: fx, y: fy } = hexToPixel(finalHex, canvasSize, hexSize);

  function moveAnimation(timestamp: number) {
    if (!animationStart) animationStart = timestamp;
    const elapsed =
      (timestamp - animationStart) / MOVE_ANIMATION_DURATION_IN_MS;
    if (elapsed <= 1) {
      context!.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height,
      );
      repaint(
        canvasRef,
        imgRef,
        gameState,
        isCanvasHovered,
        isShooting,
        hoveredHex,
        clickedHex,
        hexSize,
        canvasSize,
        isMovingAnimationActive,
        walletId?.toString(),
      );
      const slopeX = fx - ix;
      const slopeY = fy - iy;

      const x = ix + slopeX * easeInOutSine(elapsed);
      const y = iy + slopeY * easeInOutSine(elapsed);
      const { ox, oy } = applyIsometricTransformation(x, y, hexSize);

      if (isMovingAnimationActive) {
        const playerImage = mapPlayerTypeToImage(
          currentPlayer!.playerType,
          imgRef,
        );

        drawPlayerMoving(context!, ox, oy, playerImage!);

        //loop for drawing bullets
        gameState?.players.forEach((p) => {
          const { x: ixBullet, y: iyBullet } = hexToPixel(
            p.pos!,
            canvasSize,
            hexSize,
          );

          if (!p.lastBulletHex) return;

          const { x: fxBullet, y: fyBullet } = hexToPixel(
            p.lastBulletHex,
            canvasSize,
            hexSize,
          );

          const slopeXBullet = fxBullet - ixBullet;
          const slopeYBullet = fyBullet - iyBullet;

          const xBullet = ixBullet + slopeXBullet * easeOutSine(elapsed);
          const yBullet = iyBullet + slopeYBullet * easeOutSine(elapsed);
          const { ox: oxBullet, oy: oyBullet } = applyIsometricTransformation(
            xBullet,
            yBullet,
            hexSize,
          );

          const { ox: ixBulletIsometric, oy: iyBulletIsometric } =
            applyIsometricTransformation(ixBullet, iyBullet, hexSize);

          const { ox: fxBulletIsometric, oy: fyBulletIsometric } =
            applyIsometricTransformation(fxBullet, fyBullet, hexSize);

          drawBulletMoving(
            context!,
            oxBullet,
            oyBullet,
            imgRef.current.bullet!,
            Math.PI / 2 -
              Math.atan2(
                iyBulletIsometric - fyBulletIsometric,
                fxBulletIsometric - ixBulletIsometric,
              ),
          );
        });
      }

      window.requestAnimationFrame(moveAnimation);
    }
  }
  window.requestAnimationFrame(moveAnimation);
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
  isMovingAnimationActive: boolean,
  walletId?: string,
) {
  if (!gameState) return;
  if (!walletId) return;

  const context = canvasRef.current?.getContext('2d');
  if (!context) return;

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
      blur: false,
    },
    canvasSize,
  );

  if (
    gameState.moves &&
    (gameState.moves % 6 === 5 || gameState.moves % 8 === 4) &&
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
    isMovingAnimationActive,
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
  isMovingAnimationActive: boolean,
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
        if (!isMovingAnimationActive) {
          drawPlayerIsometric(
            context,
            currentPlayer.pos!,
            currentPlayer.playerType,
            currentPlayer.isImmune,
            hexSize,
            playerImage!,
            canvasSize,
          );
        }
      } else if (currentPlayer.isDead) {
        if (!isMovingAnimationActive) {
          drawDeadPlayerIsometric(
            context,
            currentPlayer.pos!,
            imgRef.current.skull!,
            canvasSize,
            hexSize,
          );
        }
      }
    } else if (asset.equals(gameState.cardPos!)) {
      const cardPosToDraw = isMovingAnimationActive
        ? gameState.previousCardPos
        : gameState.cardPos;

      drawCardIsometric(
        context,
        cardPosToDraw,
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
        if (!isMovingAnimationActive) {
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
        }
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
