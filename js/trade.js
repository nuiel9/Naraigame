/* ===========================================
   trade.js — ระบบการค้ากับต่างประเทศ
   =========================================== */

const TradeSystem = {
  // สินค้าของอยุธยา
  ayutthayaGoods: [
    { id: 'rice', name: 'ข้าว', basePrice: 50, icon: '\u{1F33E}' },
    { id: 'tin', name: 'ดีบุก', basePrice: 120, icon: '\u{1FA99}' },
    { id: 'wood', name: 'ไม้สัก/ไม้หอม', basePrice: 100, icon: '\u{1FAB5}' },
    { id: 'deerskin', name: 'หนังกวาง', basePrice: 80, icon: '\u{1F98C}' },
    { id: 'spice', name: 'เครื่องเทศ', basePrice: 90, icon: '\u{1F336}' },
    { id: 'elephant', name: 'ช้าง', basePrice: 500, icon: '\u{1F418}' }
  ],

  // คู่ค้าเริ่มต้น
  defaultPartners: {
    holland: {
      name: 'ฮอลันดา (VOC)',
      flag: '\u{1F1F3}\u{1F1F1}',
      goods: ['เครื่องเทศ', 'ผ้า', 'อาวุธปืน'],
      wantGoods: ['tin', 'wood', 'deerskin'],
      relationLevel: 50,
      tradeVolume: 0,
      priceModifier: 1.0,
      description: 'บริษัท VOC ต้องการดีบุกและหนังกวาง พร้อมจ่ายราคาสูง'
    },
    france: {
      name: 'ฝรั่งเศส',
      flag: '\u{1F1EB}\u{1F1F7}',
      goods: ['กระจก', 'เหล้าองุ่น', 'อาวุธ'],
      wantGoods: ['rice', 'spice', 'elephant'],
      relationLevel: 30,
      tradeVolume: 0,
      priceModifier: 0.9,
      description: 'ฝรั่งเศสสนใจข้าวและเครื่องเทศ กำลังสร้างความสัมพันธ์กับอยุธยา'
    },
    china: {
      name: 'จีน (ราชวงศ์ชิง)',
      flag: '\u{1F1E8}\u{1F1F3}',
      goods: ['ผ้าไหม', 'เครื่องสังคโลก', 'ชา'],
      wantGoods: ['rice', 'tin', 'wood'],
      relationLevel: 60,
      tradeVolume: 0,
      priceModifier: 1.1,
      description: 'จีนเป็นคู่ค้าเก่าแก่ ต้องการข้าวและดีบุกเป็นหลัก'
    },
    japan: {
      name: 'ญี่ปุ่น (โชกุนโทกุงาวะ)',
      flag: '\u{1F1EF}\u{1F1F5}',
      goods: ['เงิน', 'ดาบ', 'ทองแดง'],
      wantGoods: ['deerskin', 'wood', 'spice'],
      relationLevel: 55,
      tradeVolume: 0,
      priceModifier: 1.2,
      description: 'ญี่ปุ่นต้องการหนังกวางมากเป็นพิเศษ จ่ายราคาดี'
    },
    persia: {
      name: 'เปอร์เซีย (ซาฟาวิด)',
      flag: '\u{1F1EE}\u{1F1F7}',
      goods: ['พรม', 'อัญมณี', 'น้ำหอม'],
      wantGoods: ['spice', 'rice', 'wood'],
      relationLevel: 40,
      tradeVolume: 0,
      priceModifier: 1.0,
      description: 'เปอร์เซียสนใจเครื่องเทศและไม้หอมจากสยาม'
    }
  },

  // คำนวณราคาซื้อขาย
  calculateTradePrice(goodId, partnerId) {
    const good = this.ayutthayaGoods.find(g => g.id === goodId);
    const partner = GameState.tradePartners[partnerId];
    if (!good || !partner) return 0;

    let price = good.basePrice;

    // ตัวคูณราคาตามชาติ
    price *= partner.priceModifier;

    // โบนัสถ้าเป็นสินค้าที่ต้องการ
    if (partner.wantGoods.includes(goodId)) {
      price *= 1.5;
    }

    // โบนัสตามความสัมพันธ์
    price *= (0.7 + partner.relationLevel / 200);

    // โบนัสจากที่ปรึกษาวิชาเยนทร์
    if (GameState.advisors.phaulkon && GameState.advisors.phaulkon.loyalty > 50) {
      price *= 1.15;
    }

    // สุ่มเล็กน้อย +-10%
    const variance = 0.9 + Math.random() * 0.2;
    price *= variance;

    return Math.floor(price);
  },

  // ดำเนินการค้า
  executeTrade(goodId, partnerId) {
    const partner = GameState.tradePartners[partnerId];
    if (!partner) return { success: false, message: 'ไม่พบคู่ค้า' };

    // ตรวจว่าค้าขายกับชาตินี้แล้วในเทิร์นนี้หรือยัง
    if (GameState.tradedThisTurn[partnerId]) {
      return { success: false, message: 'ค้าขายกับชาตินี้แล้วในปีนี้' };
    }

    const price = this.calculateTradePrice(goodId, partnerId);
    const good = this.ayutthayaGoods.find(g => g.id === goodId);

    // ค่าใช้จ่ายในการจัดส่ง
    const shippingCost = Math.floor(good.basePrice * 0.2);

    if (GameState.resources.gold < shippingCost) {
      return { success: false, message: 'ทองคลังไม่พอสำหรับค่าขนส่ง' };
    }

    // ดำเนินการ
    const profit = price - shippingCost;
    GameState.modifyResource('gold', profit);
    partner.tradeVolume += price;
    partner.relationLevel = Math.min(100, partner.relationLevel + 2);
    GameState.tradedThisTurn[partnerId] = true;
    GameState.stats.totalTradeGold += profit;

    const message = `ส่ง${good.name}ไป${partner.name} ได้กำไร ${profit} ทอง`;
    GameState.addLog('trade', message);

    return {
      success: true,
      profit: profit,
      good: good.name,
      partner: partner.name,
      message: message
    };
  },

  // แสดงผล UI การค้า
  renderTradePanel() {
    const container = document.getElementById('trade-partners');
    if (!container) return;

    let html = '<div class="card-grid">';

    for (const [id, partner] of Object.entries(GameState.tradePartners)) {
      const traded = GameState.tradedThisTurn[id];
      const relationClass = partner.relationLevel >= 60 ? 'good' :
                           partner.relationLevel >= 35 ? 'neutral' : 'bad';

      html += `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${partner.flag} ${partner.name}</span>
            <span class="card-badge">สัมพันธ์: ${partner.relationLevel}</span>
          </div>
          <div class="card-body">
            <p>${partner.description}</p>
            <div class="relation-bar">
              <div class="relation-bar-fill ${relationClass}"
                   style="width: ${partner.relationLevel}%"></div>
            </div>
            <p style="font-size:0.85rem; color:var(--border-gold);">
              สินค้าที่ต้องการ: ${partner.wantGoods.map(gid => {
                const g = this.ayutthayaGoods.find(x => x.id === gid);
                return g ? g.icon + g.name : gid;
              }).join(', ')}
            </p>
            <p style="font-size:0.85rem;">ปริมาณการค้าสะสม: ${partner.tradeVolume} ทอง</p>
            ${traded ? '<p style="color:#FF9800;">ค้าขายแล้วในปีนี้</p>' : `
              <div class="trade-actions">
                ${partner.wantGoods.map(gid => {
                  const g = this.ayutthayaGoods.find(x => x.id === gid);
                  if (!g) return '';
                  const estPrice = this.calculateTradePrice(gid, id);
                  return `<button class="btn-gold" onclick="TradeSystem.doTrade('${gid}','${id}')"
                    title="ส่ง${g.name} (คาดว่าได้ ~${estPrice} ทอง)">
                    ${g.icon} ส่ง${g.name}</button>`;
                }).join('')}
              </div>
            `}
            <div id="trade-result-${id}"></div>
          </div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  },

  // เรียกจาก UI
  doTrade(goodId, partnerId) {
    const result = this.executeTrade(goodId, partnerId);
    const resultDiv = document.getElementById(`trade-result-${partnerId}`);

    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="trade-result ${result.success ? 'profit' : 'loss'}">
          ${result.message}
        </div>
      `;
    }

    if (result.success) {
      UI.updateResources();
      this.renderTradePanel();
    }
  }
};
