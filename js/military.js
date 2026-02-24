/* ===========================================
   military.js — ระบบการทหารและการรบ
   =========================================== */

const MilitarySystem = {
  // ข้อมูลหน่วยทหาร
  units: {
    elephantCorps: {
      name: 'กองช้างศึก',
      icon: '\u{1F418}',
      attack: 30,
      defense: 25,
      cost: 500,
      foodCost: 5,
      description: 'กำลังหลักของกองทัพอยุธยา ทรงพลังในสนามรบ'
    },
    infantry: {
      name: 'ทหารราบ (ไพร่หลวง)',
      icon: '\u{1F6E1}',
      attack: 15,
      defense: 15,
      cost: 100,
      foodCost: 2,
      description: 'กำลังพลหลักจากระบบไพร่'
    },
    navy: {
      name: 'กองเรือรบ',
      icon: '\u{26F5}',
      attack: 20,
      defense: 10,
      cost: 300,
      foodCost: 3,
      description: 'เรือรบสำหรับป้องกันปากน้ำและการค้าทางทะเล'
    },
    artillery: {
      name: 'ปืนใหญ่',
      icon: '\u{1F4A3}',
      attack: 35,
      defense: 5,
      cost: 800,
      foodCost: 2,
      description: 'อาวุธสมัยใหม่จากตะวันตก ทำลายล้างสูง'
    },
    foreignGuard: {
      name: 'ทหารรับจ้างต่างชาติ',
      icon: '\u{2694}',
      attack: 25,
      defense: 20,
      cost: 600,
      foodCost: 4,
      description: 'ทหารจากญี่ปุ่น โปรตุเกส เปอร์เซีย'
    }
  },

  // สมรภูมิที่พร้อมรบ
  battles: {
    battle_chiangmai: {
      name: 'ศึกเชียงใหม่',
      enemy: 'กองทัพพม่า',
      enemyPower: 250,
      difficulty: 'medium',
      rewards: { gold: 500, prestige: 15, authority: 10 },
      penalties: { gold: -300, prestige: -10, authority: -5 }
    },
    battle_voc: {
      name: 'สงครามทางทะเลกับ VOC',
      enemy: 'กองเรือ VOC',
      enemyPower: 350,
      difficulty: 'hard',
      rewards: { gold: 800, prestige: 20, holland_relation: -10 },
      penalties: { gold: -500, prestige: -15, holland_relation: 20 }
    },
    battle_khmer: {
      name: 'ศึกเขมร',
      enemy: 'กองทัพเขมร',
      enemyPower: 180,
      difficulty: 'easy',
      rewards: { gold: 300, prestige: 10, authority: 5 },
      penalties: { gold: -200, prestige: -5 }
    }
  },

  // จ้างทหาร
  recruitUnit(unitId) {
    const unit = this.units[unitId];
    if (!unit) return { success: false, message: 'ไม่พบหน่วยทหาร' };

    if (GameState.resources.gold < unit.cost) {
      return { success: false, message: `ทองคลังไม่พอ (ต้องการ ${unit.cost})` };
    }

    if (GameState.resources.food < unit.foodCost * 10) {
      return { success: false, message: 'อาหารไม่เพียงพอเลี้ยงทหารเพิ่ม' };
    }

    GameState.modifyResource('gold', -unit.cost);
    GameState.military[unitId] = (GameState.military[unitId] || 0) + 1;

    const message = `จ้าง${unit.name}เพิ่ม 1 หน่วย`;
    GameState.addLog('military', message);

    return { success: true, message: message };
  },

  // ปลดทหาร
  dismissUnit(unitId) {
    if (!GameState.military[unitId] || GameState.military[unitId] <= 0) {
      return { success: false, message: 'ไม่มีหน่วยทหารนี้ให้ปลด' };
    }

    GameState.military[unitId]--;
    const unit = this.units[unitId];
    // คืนเงินบางส่วน
    GameState.modifyResource('gold', Math.floor(unit.cost * 0.3));

    return { success: true, message: `ปลด${unit.name} 1 หน่วย` };
  },

  // คำนวณกำลังรบรวม
  calculateTotalPower() {
    let power = 0;
    for (const [unitId, count] of Object.entries(GameState.military)) {
      const unit = this.units[unitId];
      if (unit) {
        power += (unit.attack + unit.defense) * count;
      }
    }
    // โบนัสจากพระเพทราชา
    if (GameState.advisors.petratcha && GameState.advisors.petratcha.loyalty > 50) {
      power = Math.floor(power * 1.2);
    }
    return power;
  },

  // ดำเนินการรบ
  executeBattle(battleId) {
    const battle = this.battles[battleId];
    if (!battle) return null;

    const allyPower = this.calculateTotalPower();
    const enemyPower = battle.enemyPower;

    // สุ่มปัจจัย +-20%
    const allyRoll = allyPower * (0.8 + Math.random() * 0.4);
    const enemyRoll = enemyPower * (0.8 + Math.random() * 0.4);

    const victory = allyRoll > enemyRoll;
    const margin = Math.abs(allyRoll - enemyRoll) / Math.max(allyRoll, enemyRoll);

    // สูญเสีย
    let losses = {};
    if (victory) {
      // ชนะ — สูญเสียเล็กน้อย
      for (const [unitId, count] of Object.entries(GameState.military)) {
        if (count > 0 && Math.random() < 0.2) {
          losses[unitId] = 1;
          GameState.military[unitId]--;
        }
      }
      GameState.applyEffects(battle.rewards);
      GameState.stats.battlesWon++;
    } else {
      // แพ้ — สูญเสียมาก
      for (const [unitId, count] of Object.entries(GameState.military)) {
        const lost = Math.floor(count * (0.2 + margin * 0.3));
        if (lost > 0) {
          losses[unitId] = lost;
          GameState.military[unitId] -= lost;
        }
      }
      GameState.applyEffects(battle.penalties);
      GameState.stats.battlesLost++;
    }

    const message = victory ?
      `ชนะ${battle.name}! กองทัพอยุธยามีชัยเหนือ${battle.enemy}` :
      `พ่ายแพ้ใน${battle.name}... กองทัพสูญเสียกำลังพลจำนวนมาก`;
    GameState.addLog('military', message);

    return {
      victory: victory,
      allyPower: Math.floor(allyRoll),
      enemyPower: Math.floor(enemyRoll),
      losses: losses,
      message: message
    };
  },

  // แสดงผล UI การทหาร
  renderMilitaryPanel() {
    const unitsContainer = document.getElementById('military-units');
    const battlesContainer = document.getElementById('military-battles');
    if (!unitsContainer) return;

    let html = '<div class="card-grid">';
    const totalPower = this.calculateTotalPower();

    for (const [id, unit] of Object.entries(this.units)) {
      const count = GameState.military[id] || 0;

      html += `
        <div class="card">
          <div class="card-body">
            <div class="unit-card">
              <div class="unit-icon">${unit.icon}</div>
              <div class="unit-info">
                <div class="card-title">${unit.name}</div>
                <div class="unit-stats">
                  <span>โจมตี: ${unit.attack}</span>
                  <span>ป้องกัน: ${unit.defense}</span>
                  <span>ค่าจ้าง: ${unit.cost}</span>
                </div>
                <p style="font-size:0.8rem; color:var(--border-gold); margin-top:4px;">
                  ${unit.description}
                </p>
              </div>
              <div class="unit-count">${count}</div>
              <div class="unit-actions">
                <button onclick="MilitarySystem.doRecruit('${id}')" title="จ้างเพิ่ม">+</button>
                <button onclick="MilitarySystem.doDismiss('${id}')"
                  title="ปลด" ${count <= 0 ? 'disabled' : ''}>-</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    html += '</div>';
    html += `
      <div class="card" style="margin-top:12px; text-align:center;">
        <div class="card-body">
          <strong style="color:var(--primary-gold); font-family:'Kanit';">
            กำลังรบรวม: ${totalPower}
          </strong>
        </div>
      </div>
    `;

    // คำแนะนำจากพระเพทราชา
    if (GameState.advisors.petratcha) {
      const advisor = GameState.advisors.petratcha;
      html += `
        <div class="card" style="margin-top:12px; border-color: #F44336;">
          <div class="card-header">
            <span class="card-title">${advisor.icon} คำแนะนำจากพระเพทราชา</span>
          </div>
          <div class="card-body">
            <p><em>"${Characters.getAdvice('petratcha', 'military')}"</em></p>
          </div>
        </div>
      `;
    }

    unitsContainer.innerHTML = html;

    // แสดงสถานะการรบ (ว่าง — การรบเกิดจากเหตุการณ์)
    if (battlesContainer) {
      battlesContainer.innerHTML = '';
    }
  },

  // แสดงหน้าจอการรบ
  showBattle(battleId) {
    const battle = this.battles[battleId];
    if (!battle) return;

    const screen = document.getElementById('battle-screen');
    document.getElementById('battle-title').textContent = battle.name;
    document.getElementById('battle-enemy-name').textContent = battle.enemy;

    // แสดงหน่วยฝ่ายเรา
    let allyHtml = '';
    for (const [id, count] of Object.entries(GameState.military)) {
      if (count > 0) {
        const unit = this.units[id];
        allyHtml += `<div class="battle-unit-item">${unit.icon} ${unit.name} x${count}</div>`;
      }
    }
    document.getElementById('battle-ally-units').innerHTML = allyHtml;
    document.getElementById('battle-ally-power').textContent = this.calculateTotalPower();
    document.getElementById('battle-enemy-power').textContent = battle.enemyPower;

    // แสดงหน่วยข้าศึก
    document.getElementById('battle-enemy-units').innerHTML = `
      <div class="battle-unit-item">กำลังพล ${battle.enemy}</div>
      <div class="battle-unit-item">ระดับ: ${
        battle.difficulty === 'easy' ? 'ง่าย' :
        battle.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'
      }</div>
    `;

    document.getElementById('battle-log').innerHTML = '<p>เตรียมพร้อมทำการรบ...</p>';
    document.getElementById('battle-result').style.display = 'none';

    // ปุ่มต่อสู้
    const fightBtn = document.getElementById('btn-battle-fight');
    const retreatBtn = document.getElementById('btn-battle-retreat');
    fightBtn.style.display = '';
    retreatBtn.style.display = '';

    fightBtn.onclick = () => {
      const result = this.executeBattle(battleId);
      this.showBattleResult(result);
    };

    retreatBtn.onclick = () => {
      GameState.modifyResource('prestige', -5);
      GameState.modifyResource('authority', -3);
      GameState.addLog('military', `ถอนทัพจาก${battle.name}`);
      screen.classList.remove('active');
      UI.updateResources();
    };

    screen.classList.add('active');
  },

  showBattleResult(result) {
    const logDiv = document.getElementById('battle-log');
    const resultDiv = document.getElementById('battle-result');

    // แสดงบันทึกการรบ
    let logHtml = `
      <p>กำลังรบอยุธยา: ${result.allyPower}</p>
      <p>กำลังรบข้าศึก: ${result.enemyPower}</p>
      <p>---</p>
    `;

    if (Object.keys(result.losses).length > 0) {
      logHtml += '<p>การสูญเสีย:</p>';
      for (const [unitId, count] of Object.entries(result.losses)) {
        const unit = this.units[unitId];
        logHtml += `<p style="color:#EF9A9A;">- ${unit.name} x${count}</p>`;
      }
    } else {
      logHtml += '<p style="color:#A8D5A2;">ไม่มีการสูญเสีย!</p>';
    }

    logDiv.innerHTML = logHtml;

    // แสดงผลลัพธ์
    resultDiv.className = `battle-result ${result.victory ? 'victory' : 'defeat'}`;
    resultDiv.textContent = result.victory ? 'ชัยชนะ!' : 'พ่ายแพ้...';
    resultDiv.style.display = 'block';

    // ซ่อนปุ่มรบ แสดงปุ่มกลับ
    document.getElementById('btn-battle-fight').style.display = 'none';
    document.getElementById('btn-battle-retreat').style.display = 'none';

    const actionsDiv = document.getElementById('battle-actions');
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-gold';
    closeBtn.textContent = 'กลับ';
    closeBtn.onclick = () => {
      document.getElementById('battle-screen').classList.remove('active');
      closeBtn.remove();
      UI.updateResources();
      MilitarySystem.renderMilitaryPanel();
    };
    actionsDiv.appendChild(closeBtn);
  },

  doRecruit(unitId) {
    const result = this.recruitUnit(unitId);
    if (result.success) {
      UI.updateResources();
      this.renderMilitaryPanel();
    } else {
      alert(result.message);
    }
  },

  doDismiss(unitId) {
    const result = this.dismissUnit(unitId);
    if (result.success) {
      UI.updateResources();
      this.renderMilitaryPanel();
    }
  }
};
