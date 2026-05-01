/**
 * 课堂看板 Chart.js 图表渲染
 * 展示全班情绪数据汇总
 */

// Chart.js CDN will be loaded in HTML
let emotionChart = null;
let trapChart = null;
let changeChart = null;

const CHART_COLORS = {
  anxiety:     '#f6a623',
  frustration: '#f87171',
  sadness:     '#a78bfa',
  loneliness:  '#7dd3fc',
  anger:       '#ef4444',
  'self-doubt':'#fda085',
  burnout:     '#b8a99a',
  fear:        '#86c7a3'
};

const TRAP_COLORS = {
  catastrophizing:  '#f6a623',
  'black-white':    '#f87171',
  overgeneralize:   '#a78bfa',
  should:           '#7dd3fc',
  'mind-reading':   '#86c7a3'
};

function renderDashboard() {
  const data = getClassroomData();

  // Show empty state if no data
  if (data.length === 0) {
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('dashboardEmpty').style.display = 'block';
    return;
  }

  document.getElementById('dashboardContent').style.display = 'block';
  document.getElementById('dashboardEmpty').style.display = 'none';

  // Update stats
  const avgBefore = (data.reduce((s, d) => s + (d.intensityBefore || 5), 0) / data.length).toFixed(1);
  const avgAfter = (data.reduce((s, d) => s + (d.intensityAfter || 3), 0) / data.length).toFixed(1);
  const change = (avgBefore - avgAfter).toFixed(1);

  document.getElementById('statTotal').textContent = data.length;
  document.getElementById('statAvgBefore').textContent = avgBefore;
  document.getElementById('statAvgAfter').textContent = avgAfter;
  document.getElementById('statChange').textContent = `-${change}`;

  // Emotion type distribution
  renderEmotionChart(data);

  // Thinking trap distribution
  renderTrapChart(data);

  // Before/After comparison
  renderChangeChart(data);

  // Word cloud
  renderWordCloud(data);
}

function renderEmotionChart(data) {
  const counts = {};
  data.forEach(d => {
    const type = d.emotionType || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  });

  const labels = Object.keys(counts).map(id => {
    const emo = EMOTION_TYPES.find(e => e.id === id);
    return emo ? `${emo.emoji} ${emo.label}` : id;
  });
  const values = Object.values(counts);
  const colors = Object.keys(counts).map(id => CHART_COLORS[id] || '#ccc');

  const ctx = document.getElementById('emotionChart').getContext('2d');

  if (emotionChart) emotionChart.destroy();

  emotionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 13, family: "'Noto Sans SC', sans-serif" },
            color: '#7a6b5d'
          }
        },
        title: {
          display: true,
          text: '情绪类型分布',
          font: { size: 16, family: "'Noto Serif SC', serif", weight: '600' },
          color: '#3d2e1f',
          padding: { bottom: 16 }
        }
      }
    }
  });
}

function renderTrapChart(data) {
  const counts = {};
  data.forEach(d => {
    const trap = d.thinkingTrap || 'unknown';
    counts[trap] = (counts[trap] || 0) + 1;
  });

  const labels = Object.keys(counts).map(id => {
    const t = THINKING_TRAPS.find(tr => tr.id === id);
    return t ? `${t.icon} ${t.label}` : id;
  });
  const values = Object.values(counts);
  const colors = Object.keys(counts).map(id => TRAP_COLORS[id] || '#ccc');

  const ctx = document.getElementById('trapChart').getContext('2d');

  if (trapChart) trapChart.destroy();

  trapChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + '88'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 12, family: "'Noto Sans SC', sans-serif" },
            color: '#7a6b5d'
          }
        },
        title: {
          display: true,
          text: '思维陷阱类型分布',
          font: { size: 16, family: "'Noto Serif SC', serif", weight: '600' },
          color: '#3d2e1f',
          padding: { bottom: 16 }
        }
      }
    }
  });
}

function renderChangeChart(data) {
  // Group by emotion type, show avg before/after
  const groups = {};
  data.forEach(d => {
    const type = d.emotionType || 'unknown';
    if (!groups[type]) groups[type] = { before: [], after: [] };
    groups[type].before.push(d.intensityBefore || 5);
    groups[type].after.push(d.intensityAfter || 3);
  });

  const labels = Object.keys(groups).map(id => {
    const emo = EMOTION_TYPES.find(e => e.id === id);
    return emo ? `${emo.emoji} ${emo.label}` : id;
  });

  const beforeAvg = Object.values(groups).map(g =>
    (g.before.reduce((a, b) => a + b, 0) / g.before.length).toFixed(1)
  );
  const afterAvg = Object.values(groups).map(g =>
    (g.after.reduce((a, b) => a + b, 0) / g.after.length).toFixed(1)
  );

  const ctx = document.getElementById('changeChart').getContext('2d');

  if (changeChart) changeChart.destroy();

  changeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '体验前',
          data: beforeAvg,
          backgroundColor: 'rgba(248,113,113,0.3)',
          borderColor: '#f87171',
          borderWidth: 2,
          borderRadius: 8
        },
        {
          label: '体验后',
          data: afterAvg,
          backgroundColor: 'rgba(134,199,163,0.3)',
          borderColor: '#86c7a3',
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            font: { size: 12 },
            color: '#b8a99a'
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 12, family: "'Noto Sans SC', sans-serif" },
            color: '#7a6b5d'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 20,
            font: { size: 13 },
            color: '#7a6b5d'
          }
        },
        title: {
          display: true,
          text: '情绪强度变化（体验前后对比）',
          font: { size: 16, family: "'Noto Serif SC', serif", weight: '600' },
          color: '#3d2e1f',
          padding: { bottom: 16 }
        }
      }
    }
  });
}

function renderWordCloud(data) {
  // Simple keyword frequency from emotion text (if stored)
  // For now, show emotion labels as word cloud
  const container = document.getElementById('wordCloud');
  container.innerHTML = '';

  const counts = {};
  data.forEach(d => {
    const emo = EMOTION_TYPES.find(e => e.id === d.emotionType);
    if (emo) {
      counts[emo.label] = (counts[emo.label] || 0) + 1;
    }
    const trap = THINKING_TRAPS.find(t => t.id === d.thinkingTrap);
    if (trap) {
      counts[trap.label] = (counts[trap.label] || 0) + 1;
    }
  });

  const maxCount = Math.max(...Object.values(counts), 1);

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([word, count]) => {
      const span = document.createElement('span');
      const size = 0.8 + (count / maxCount) * 1.5;
      span.style.fontSize = `${size}rem`;
      span.style.padding = '4px 12px';
      span.style.display = 'inline-block';
      span.style.color = `hsl(${Math.random() * 40 + 20}, 70%, ${40 + Math.random() * 20}%)`;
      span.style.fontWeight = count > 2 ? '700' : '500';
      span.textContent = word;
      container.appendChild(span);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderDashboard);

// Auto-refresh every 5 seconds
setInterval(renderDashboard, 5000);
