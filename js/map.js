/* ===========================================
   map.js — ระบบแผนที่
   =========================================== */

const MapSystem = {
  // ตำแหน่งบนแผนที่ (เปอร์เซ็นต์)
  locations: [
    { id: 'ayutthaya', name: 'กรุงศรีอยุธยา', x: 48, y: 48, type: 'capital' },
    { id: 'lopburi', name: 'ลพบุรี', x: 46, y: 38, type: 'city' },
    { id: 'bangkok', name: 'บางกอก', x: 46, y: 58, type: 'port' },
    { id: 'mergui', name: 'มะริด', x: 28, y: 52, type: 'port' },
    { id: 'tenasserim', name: 'ตะนาวศรี', x: 30, y: 58, type: 'port' },
    { id: 'pattani', name: 'ปัตตานี', x: 48, y: 88, type: 'port' },
    { id: 'nakhon', name: 'นครศรีธรรมราช', x: 44, y: 80, type: 'city' },
    { id: 'chiangmai', name: 'เชียงใหม่', x: 38, y: 18, type: 'city' },
    // อาณาจักรเพื่อนบ้าน
    { id: 'burma', name: 'พม่า', x: 18, y: 30, type: 'enemy' },
    { id: 'khmer', name: 'เขมร', x: 68, y: 55, type: 'enemy' },
    { id: 'lanna', name: 'ล้านนา', x: 36, y: 12, type: 'enemy' },
    { id: 'malay', name: 'มลายู', x: 52, y: 95, type: 'enemy' },
    // เส้นทางการค้า (ปลายทาง)
    { id: 'trade_china', name: 'จีน', x: 78, y: 10, type: 'trade' },
    { id: 'trade_japan', name: 'ญี่ปุ่น', x: 90, y: 8, type: 'trade' },
    { id: 'trade_holland', name: 'ฮอลันดา (VOC)', x: 8, y: 85, type: 'trade' },
    { id: 'trade_france', name: 'ฝรั่งเศส', x: 5, y: 15, type: 'trade' },
    { id: 'trade_persia', name: 'เปอร์เซีย', x: 10, y: 35, type: 'trade' }
  ],

  // เส้นทางการค้า (จาก อยุธยา ไปยัง)
  routes: [
    { from: 'ayutthaya', to: 'trade_china' },
    { from: 'ayutthaya', to: 'trade_japan' },
    { from: 'ayutthaya', to: 'trade_holland' },
    { from: 'ayutthaya', to: 'trade_france' },
    { from: 'ayutthaya', to: 'trade_persia' },
    { from: 'ayutthaya', to: 'lopburi' },
    { from: 'ayutthaya', to: 'bangkok' },
    { from: 'ayutthaya', to: 'chiangmai' }
  ],

  // วาดแผนที่
  render() {
    const mapDiv = document.getElementById('overview-map');
    if (!mapDiv) return;

    let html = '';

    // วาดเส้นทาง
    for (const route of this.routes) {
      const from = this.locations.find(l => l.id === route.from);
      const to = this.locations.find(l => l.id === route.to);
      if (!from || !to) continue;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      html += `<div class="map-route" style="
        left: ${from.x}%;
        top: ${from.y}%;
        width: ${length}%;
        transform: rotate(${angle}deg);
      "></div>`;
    }

    // วาดตำแหน่ง
    for (const loc of this.locations) {
      html += `
        <div class="map-location" style="left:${loc.x}%; top:${loc.y}%;
             transform: translate(-50%, -50%);"
             title="${loc.name}">
          <div class="map-dot ${loc.type}"></div>
          <div class="map-label">${loc.name}</div>
        </div>
      `;
    }

    mapDiv.innerHTML = html;
  },

  // แสดงสถานะภาพรวม
  renderOverviewStatus() {
    const statusDiv = document.getElementById('overview-status');
    if (!statusDiv) return;

    const totalPower = MilitarySystem.calculateTotalPower();
    const tradeAlliances = Object.values(GameState.treaties)
      .filter(t => t === 'trade' || t === 'alliance').length;
    const totalTrade = Object.values(GameState.tradePartners)
      .reduce((sum, p) => sum + p.tradeVolume, 0);

    const actNames = {
      1: 'บทที่ 1: รุ่งอรุณแห่งรัชกาล',
      2: 'บทที่ 2: ยุคทองแห่งการค้า',
      3: 'บทที่ 3: สงครามและการป้องกัน',
      4: 'บทที่ 4: ราชทูตสู่แดนไกล',
      5: 'บทที่ 5: สนธยาแห่งรัชกาล'
    };

    statusDiv.innerHTML = `
      <div class="overview-stat-card">
        <h4>กำลังรบรวม</h4>
        <div class="stat-value">${totalPower}</div>
      </div>
      <div class="overview-stat-card">
        <h4>สนธิสัญญา</h4>
        <div class="stat-value">${tradeAlliances}</div>
      </div>
      <div class="overview-stat-card">
        <h4>ปริมาณการค้ารวม</h4>
        <div class="stat-value">${totalTrade}</div>
      </div>
      <div class="overview-stat-card">
        <h4>ศึกที่ชนะ</h4>
        <div class="stat-value">${GameState.stats.battlesWon}</div>
      </div>
      <div class="overview-stat-card">
        <h4>ทูตที่ส่ง</h4>
        <div class="stat-value">${GameState.stats.embassiesSent}</div>
      </div>
      <div class="overview-stat-card">
        <h4>บทปัจจุบัน</h4>
        <div class="stat-value" style="font-size:0.9rem;">${actNames[GameState.currentAct] || ''}</div>
      </div>
    `;
  }
};
