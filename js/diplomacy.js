/* ===========================================
   diplomacy.js — ระบบการทูต
   =========================================== */

const DiplomacySystem = {
  // ค่าใช้จ่ายส่งทูต
  embassyCost: 500,

  // ส่งราชทูต
  sendEmbassy(nationId) {
    const partner = GameState.tradePartners[nationId];
    if (!partner) return { success: false, message: 'ไม่พบประเทศนี้' };

    if (GameState.embassySentThisTurn) {
      return { success: false, message: 'ส่งราชทูตได้เพียงครั้งเดียวต่อปี' };
    }

    if (GameState.resources.gold < this.embassyCost) {
      return { success: false, message: `ทองคลังไม่พอ (ต้องการ ${this.embassyCost})` };
    }

    GameState.modifyResource('gold', -this.embassyCost);
    GameState.modifyResource('prestige', 5);
    partner.relationLevel = Math.min(100, partner.relationLevel + 15);
    GameState.embassySentThisTurn = true;
    GameState.stats.embassiesSent++;

    // โบนัสจากโกษาปาน
    if (GameState.advisors.kosapan && GameState.advisors.kosapan.loyalty > 60) {
      partner.relationLevel = Math.min(100, partner.relationLevel + 5);
      GameState.modifyResource('prestige', 3);
    }

    const message = `ส่งราชทูตไปเจริญสัมพันธไมตรีกับ${partner.name}`;
    GameState.addLog('diplomacy', message);

    return { success: true, message: message };
  },

  // ลงนามสนธิสัญญา
  signTreaty(nationId, type) {
    const partner = GameState.tradePartners[nationId];
    if (!partner) return { success: false, message: 'ไม่พบประเทศนี้' };

    // ต้องมีความสัมพันธ์เพียงพอ
    const requiredRelation = type === 'alliance' ? 70 : 50;
    if (partner.relationLevel < requiredRelation) {
      return {
        success: false,
        message: `ความสัมพันธ์ไม่เพียงพอ (ต้องการ ${requiredRelation}, มี ${partner.relationLevel})`
      };
    }

    // ค่าใช้จ่าย
    const cost = type === 'alliance' ? 800 : 300;
    if (GameState.resources.gold < cost) {
      return { success: false, message: `ทองคลังไม่พอ (ต้องการ ${cost})` };
    }

    GameState.modifyResource('gold', -cost);
    GameState.treaties[nationId] = type;
    GameState.stats.treatiesSigned++;

    let effects = {};
    if (type === 'trade') {
      effects = { prestige: 5 };
      partner.priceModifier *= 1.15;
    } else if (type === 'alliance') {
      effects = { prestige: 10, authority: -3 };
    }
    GameState.applyEffects(effects);

    const typeText = type === 'trade' ? 'สนธิสัญญาการค้า' :
                     type === 'alliance' ? 'พันธมิตรทางทหาร' : 'สนธิสัญญาสันติภาพ';
    const message = `ลงนาม${typeText}กับ${partner.name}`;
    GameState.addLog('diplomacy', message);

    return { success: true, message: message };
  },

  // แสดงผล UI การทูต
  renderDiplomacyPanel() {
    const container = document.getElementById('diplomacy-nations');
    if (!container) return;

    let html = '<div class="card-grid">';

    for (const [id, partner] of Object.entries(GameState.tradePartners)) {
      const treaty = GameState.treaties[id];
      const relationClass = partner.relationLevel >= 60 ? 'good' :
                           partner.relationLevel >= 35 ? 'neutral' : 'bad';

      let treatyBadge = '';
      if (treaty === 'trade') {
        treatyBadge = '<span class="treaty-badge trade">สนธิสัญญาการค้า</span>';
      } else if (treaty === 'alliance') {
        treatyBadge = '<span class="treaty-badge alliance">พันธมิตร</span>';
      }

      // คำแนะนำจากที่ปรึกษา
      const advice = Characters.getAdvice('kosapan', 'diplomacy');

      html += `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${partner.flag} ${partner.name}</span>
            <span class="card-badge">${partner.relationLevel}/100</span>
          </div>
          <div class="card-body">
            <div class="relation-bar">
              <div class="relation-bar-fill ${relationClass}"
                   style="width: ${partner.relationLevel}%"></div>
            </div>
            ${treatyBadge}
            <p style="margin-top:8px; font-size:0.9rem;">${partner.description}</p>

            <div class="diplomacy-actions">
              ${!GameState.embassySentThisTurn ? `
                <button class="btn-gold" onclick="DiplomacySystem.doSendEmbassy('${id}')">
                  ส่งราชทูต (${this.embassyCost} ทอง)
                </button>
              ` : ''}

              ${!treaty && partner.relationLevel >= 50 ? `
                <button class="btn-gold" onclick="DiplomacySystem.doSignTreaty('${id}','trade')">
                  สนธิสัญญาการค้า
                </button>
              ` : ''}

              ${!treaty && partner.relationLevel >= 70 ? `
                <button class="btn-gold" onclick="DiplomacySystem.doSignTreaty('${id}','alliance')">
                  พันธมิตรทางทหาร
                </button>
              ` : ''}
            </div>

            <div id="diplomacy-result-${id}"></div>
          </div>
        </div>
      `;
    }

    html += '</div>';

    // คำแนะนำจากที่ปรึกษา
    if (GameState.advisors.kosapan) {
      const advisor = GameState.advisors.kosapan;
      html += `
        <div class="card" style="margin-top:16px; border-color: #2196F3;">
          <div class="card-header">
            <span class="card-title">${advisor.icon} คำแนะนำจากโกษาปาน</span>
          </div>
          <div class="card-body">
            <p><em>"${Characters.getAdvice('kosapan', 'diplomacy')}"</em></p>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  },

  doSendEmbassy(nationId) {
    const result = this.sendEmbassy(nationId);
    const resultDiv = document.getElementById(`diplomacy-result-${nationId}`);
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="trade-result ${result.success ? 'profit' : 'loss'}">
          ${result.message}
        </div>
      `;
    }
    if (result.success) {
      UI.updateResources();
      this.renderDiplomacyPanel();
    }
  },

  doSignTreaty(nationId, type) {
    const result = this.signTreaty(nationId, type);
    const resultDiv = document.getElementById(`diplomacy-result-${nationId}`);
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="trade-result ${result.success ? 'profit' : 'loss'}">
          ${result.message}
        </div>
      `;
    }
    if (result.success) {
      UI.updateResources();
      this.renderDiplomacyPanel();
    }
  }
};
