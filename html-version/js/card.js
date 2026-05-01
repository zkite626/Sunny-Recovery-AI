/**
 * 情绪卡片 Canvas 生成器
 * 生成精美的情绪转化卡片，支持保存为图片
 */

function generateEmotionCard(canvasId, sessionData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = 750;
  const H = 1100;
  canvas.width = W;
  canvas.height = H;

  // ── Background gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#fffbeb');
  bgGrad.addColorStop(0.4, '#fdf8f0');
  bgGrad.addColorStop(0.7, '#fef5e7');
  bgGrad.addColorStop(1, '#fde2ca');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative circles ──
  ctx.globalAlpha = 0.08;
  ctx.beginPath();
  ctx.arc(W - 80, 120, 200, 0, Math.PI * 2);
  ctx.fillStyle = '#f6a623';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(80, H - 150, 150, 0, Math.PI * 2);
  ctx.fillStyle = '#a78bfa';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(W/2, H/2, 300, 0, Math.PI * 2);
  ctx.fillStyle = '#86c7a3';
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Inner card area ──
  const margin = 40;
  const cardX = margin;
  const cardY = margin;
  const cardW = W - margin * 2;
  const cardH = H - margin * 2;

  // Card background with rounded corners
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(246,166,35,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // ── Header ──
  let y = cardY + 60;

  // Sun icon + title
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f6a623';
  ctx.fillText('☀', W / 2, y);
  y += 20;

  ctx.font = '600 22px "Noto Serif SC", "Songti SC", serif';
  ctx.fillStyle = '#3d2e1f';
  ctx.fillText('晴愈情绪卡', W / 2, y);
  y += 28;

  ctx.font = '13px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#b8a99a';
  ctx.fillText(sessionData.date + '  ' + sessionData.time, W / 2, y);
  y += 40;

  // ── Divider ──
  drawDivider(ctx, cardX + 60, y, cardW - 120);
  y += 35;

  // ── Emotion Info ──
  ctx.textAlign = 'left';
  const leftX = cardX + 60;

  ctx.font = '14px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#b8a99a';
  ctx.fillText('情绪类型', leftX, y);
  y += 24;

  ctx.font = '600 22px "Noto Serif SC", serif';
  ctx.fillStyle = '#3d2e1f';
  ctx.fillText(`${sessionData.emotionEmoji}  ${sessionData.emotionLabel}`, leftX, y);
  y += 40;

  // Thinking trap
  ctx.font = '14px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#b8a99a';
  ctx.fillText('思维陷阱', leftX, y);
  y += 24;

  ctx.font = '600 18px "Noto Serif SC", serif';
  ctx.fillStyle = '#7a6b5d';
  ctx.fillText(`${sessionData.thinkingTrapIcon}  ${sessionData.thinkingTrap}`, leftX, y);
  y += 45;

  // ── Divider ──
  drawDivider(ctx, cardX + 60, y, cardW - 120);
  y += 35;

  // ── Restructure section ──
  ctx.font = '14px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#b8a99a';
  ctx.fillText('认知重构', leftX, y);
  y += 30;

  // Old thought
  const oldThought = sessionData.oldThought || '我肯定过不了';
  ctx.save();
  roundRect(ctx, leftX, y, cardW - 120, 60, 12);
  ctx.fillStyle = 'rgba(248,113,113,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(248,113,113,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.font = '13px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#f87171';
  ctx.fillText('❌ 旧想法', leftX + 16, y + 22);
  ctx.font = '15px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#3d2e1f';
  wrapText(ctx, `"${oldThought}"`, leftX + 16, y + 44, cardW - 160, 22);
  y += 80;

  // Arrow
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f6a623';
  ctx.fillText('↓', W / 2, y);
  y += 30;

  // New thought
  const newThought = sessionData.newThought || '现在开始准备，每天进步一点';
  ctx.textAlign = 'left';
  ctx.save();
  roundRect(ctx, leftX, y, cardW - 120, 60, 12);
  ctx.fillStyle = 'rgba(134,199,163,0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(134,199,163,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.font = '13px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#86c7a3';
  ctx.fillText('✅ 新想法', leftX + 16, y + 22);
  ctx.font = '15px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#3d2e1f';
  wrapText(ctx, `"${newThought}"`, leftX + 16, y + 44, cardW - 160, 22);
  y += 95;

  // ── Micro action ──
  if (sessionData.microAction) {
    ctx.save();
    roundRect(ctx, leftX, y, cardW - 120, 70, 12);
    ctx.fillStyle = 'rgba(246,166,35,0.06)';
    ctx.fill();
    ctx.restore();

    ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = '#f6a623';
    ctx.fillText('💡 微行动建议', leftX + 16, y + 24);
    ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = '#7a6b5d';
    wrapText(ctx, sessionData.microAction, leftX + 16, y + 48, cardW - 160, 22);
    y += 90;
  }

  // ── Emotion change visualization ──
  y += 10;
  drawDivider(ctx, cardX + 60, y, cardW - 120);
  y += 40;

  const before = sessionData.intensityBefore || 7;
  const after = sessionData.intensityAfter || 4;

  ctx.textAlign = 'center';
  ctx.font = '14px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#b8a99a';
  ctx.fillText('情绪变化', W / 2, y);
  y += 30;

  // Before bar
  drawEmotionBar(ctx, leftX + 20, y, cardW - 160, before, 10, '体验前');
  y += 50;

  // After bar
  drawEmotionBar(ctx, leftX + 20, y, cardW - 160, after, 10, '体验后');
  y += 60;

  // Change text
  ctx.font = '600 28px "Noto Serif SC", serif';
  ctx.fillStyle = '#f6a623';
  ctx.fillText(`${before} → ${after}`, W / 2, y);
  y += 10;

  ctx.font = '14px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#86c7a3';
  ctx.fillText(`↓ 降低了 ${before - after} 个点`, W / 2, y + 20);
  y += 50;

  // ── Footer ──
  ctx.font = '12px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b8a99a';
  ctx.fillText('晴愈AI教练 · 直面情绪 向阳而生', W / 2, cardY + cardH - 30);
}

// ── Helper functions ──

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawDivider(ctx, x, y, width) {
  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, 'rgba(246,166,35,0)');
  grad.addColorStop(0.3, 'rgba(246,166,35,0.15)');
  grad.addColorStop(0.7, 'rgba(246,166,35,0.15)');
  grad.addColorStop(1, 'rgba(246,166,35,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
}

function drawEmotionBar(ctx, x, y, width, value, maxVal, label) {
  // Background
  ctx.save();
  roundRect(ctx, x, y, width, 20, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  ctx.fill();
  ctx.restore();

  // Fill
  const fillWidth = (value / maxVal) * width;
  const grad = ctx.createLinearGradient(x, y, x + fillWidth, y);
  if (value <= 3) {
    grad.addColorStop(0, '#86c7a3');
    grad.addColorStop(1, '#a8d8c0');
  } else if (value <= 6) {
    grad.addColorStop(0, '#fcd34d');
    grad.addColorStop(1, '#f6a623');
  } else {
    grad.addColorStop(0, '#f6a623');
    grad.addColorStop(1, '#f87171');
  }

  ctx.save();
  roundRect(ctx, x, y, fillWidth, 20, 10);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Label
  ctx.font = '12px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#7a6b5d';
  ctx.fillText(`${label}：${value}/10`, x, y - 6);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  let line = '';
  let currentY = y;
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = text[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

/**
 * Save canvas as downloadable image
 */
function downloadCard(canvasId, filename) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = filename || '晴愈情绪卡.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
