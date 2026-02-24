/* ===========================================
   ui.js — จัดการส่วนติดต่อผู้ใช้
   =========================================== */

const UI = {
  // อัปเดตแสดงทรัพยากร
  updateResources() {
    const r = GameState.resources;
    const fields = {
      'res-gold': r.gold,
      'res-food': r.food,
      'res-faith': r.faith,
      'res-authority': r.authority,
      'res-prestige': r.prestige
    };

    for (const [id, value] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el) {
        const oldVal = parseInt(el.textContent) || 0;
        el.textContent = value;

        // แสดง animation เมื่อค่าเปลี่ยน
        if (value > oldVal) {
          el.parentElement.classList.remove('changed-down');
          el.parentElement.classList.add('changed-up');
          setTimeout(() => el.parentElement.classList.remove('changed-up'), 600);
        } else if (value < oldVal) {
          el.parentElement.classList.remove('changed-up');
          el.parentElement.classList.add('changed-down');
          setTimeout(() => el.parentElement.classList.remove('changed-down'), 600);
        }
      }
    }

    // อัปเดตปี/เทิร์น
    const yearEl = document.getElementById('year-display');
    const turnEl = document.getElementById('turn-display');
    if (yearEl) yearEl.textContent = `พ.ศ. ${GameState.currentYear}`;
    if (turnEl) turnEl.textContent = `เทิร์น ${GameState.currentTurn}`;
  },

  // สลับหน้าจอ
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
  },

  // สลับแผง (panel)
  showPanel(panelId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');

    // อัปเดตเมนูที่เลือก
    document.querySelectorAll('.menu-btn[data-panel]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === panelId);
    });

    // เรนเดอร์เนื้อหาตามแผง
    switch (panelId) {
      case 'panel-overview':
        MapSystem.render();
        MapSystem.renderOverviewStatus();
        break;
      case 'panel-trade':
        TradeSystem.renderTradePanel();
        break;
      case 'panel-diplomacy':
        DiplomacySystem.renderDiplomacyPanel();
        break;
      case 'panel-military':
        MilitarySystem.renderMilitaryPanel();
        break;
      case 'panel-court':
        this.renderCourt();
        break;
      case 'panel-log':
        this.renderLog();
        break;
    }
  },

  // แสดงราชสำนัก
  renderCourt() {
    const container = document.getElementById('court-advisors');
    if (!container) return;

    let html = '<div class="card-grid">';

    for (const [id, advisor] of Object.entries(GameState.advisors)) {
      const loyaltyClass = advisor.loyalty >= 60 ? 'good' :
                          advisor.loyalty >= 35 ? 'neutral' : 'bad';

      html += `
        <div class="card">
          <div class="card-body">
            <div class="advisor-card">
              <div class="advisor-portrait">${advisor.icon}</div>
              <div class="advisor-info">
                <div class="advisor-name">${advisor.name}</div>
                <div class="advisor-role">${advisor.role}</div>
                <div class="advisor-loyalty">
                  ความจงรักภักดี: ${advisor.loyalty}/100
                  <div class="relation-bar">
                    <div class="relation-bar-fill ${loyaltyClass}"
                         style="width: ${advisor.loyalty}%"></div>
                  </div>
                </div>
                <div class="advisor-loyalty">
                  อิทธิพล: ${advisor.influence}/100
                </div>
                <p style="font-size:0.85rem; color:var(--border-gold); margin-top:6px;">
                  ความเชี่ยวชาญ: ${
                    advisor.specialty === 'trade' ? 'การค้า (+20% รายได้)' :
                    advisor.specialty === 'military' ? 'การทหาร (+20% กำลังรบ)' :
                    'การทูต (+20% ผลทางการทูต)'
                  }
                </p>
                <p style="font-size:0.85rem; margin-top:4px;">
                  <em>"${advisor.adviceStyle}"</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  },

  // แสดงบันทึก
  renderLog() {
    const container = document.getElementById('log-entries');
    if (!container) return;

    if (GameState.log.length === 0) {
      container.innerHTML = '<p style="color:var(--border-gold);">ยังไม่มีบันทึก</p>';
      return;
    }

    let html = '';
    for (const entry of GameState.log) {
      html += `
        <div class="log-entry log-${entry.type}">
          <span class="log-year">พ.ศ. ${entry.year}</span>
          ${entry.message}
        </div>
      `;
    }
    container.innerHTML = html;
  },

  // อัปเดตสถานะ
  setStatus(message) {
    const el = document.getElementById('status-message');
    if (el) el.textContent = message;
  },

  setPhase(phase) {
    const el = document.getElementById('phase-display');
    const phases = {
      'free': 'รอคำสั่ง',
      'trade': 'ระยะการค้า',
      'diplomacy': 'ระยะการทูต',
      'military': 'ระยะการทหาร',
      'event': 'เหตุการณ์พิเศษ',
      'summary': 'สรุปเทิร์น'
    };
    if (el) el.textContent = `ระยะ: ${phases[phase] || phase}`;
  },

  // --- หน้าจอเหตุการณ์ (Visual Novel) ---
  currentEvent: null,
  currentSceneIndex: 0,

  showEvent(event) {
    this.currentEvent = event;
    this.currentSceneIndex = 0;

    const screen = document.getElementById('event-screen');
    const bgDiv = document.getElementById('event-bg');

    // ตั้งพื้นหลัง
    bgDiv.className = 'event-background';
    if (event.background) bgDiv.classList.add(event.background);

    screen.classList.add('active');
    this.renderScene();
  },

  renderScene() {
    const event = this.currentEvent;
    if (!event) return;

    const choicesDiv = document.getElementById('event-choices');
    const nextBtn = document.getElementById('event-next');

    // ถ้ายังมี scene ให้แสดง
    if (event.scenes && this.currentSceneIndex < event.scenes.length) {
      const scene = event.scenes[this.currentSceneIndex];

      // แสดงตัวละคร
      const charsDiv = document.getElementById('event-characters');
      let charsHtml = '';
      if (scene.characters) {
        for (const charId of scene.characters) {
          const char = Characters.getCharacter(charId);
          if (char) {
            const isSpeaking = scene.speaker === char.name ||
                              scene.speaker === char.nameEn;
            charsHtml += `<div class="event-character ${isSpeaking ? 'speaking' : ''}">${char.icon}</div>`;
          }
        }
      }
      charsDiv.innerHTML = charsHtml;

      // แสดงผู้พูดและข้อความ
      document.getElementById('event-speaker').textContent = scene.speaker || '';
      this.typeText(document.getElementById('event-text'), scene.text);

      // ซ่อนตัวเลือก แสดงปุ่มถัดไป
      choicesDiv.innerHTML = '';
      nextBtn.style.display = 'block';

      nextBtn.onclick = () => {
        this.currentSceneIndex++;
        this.renderScene();
      };
    }
    // ถ้าหมด scene แล้ว แสดงตัวเลือก (ถ้ามี)
    else if (event.choices && event.choices.length > 0) {
      nextBtn.style.display = 'none';
      let html = '';

      for (let i = 0; i < event.choices.length; i++) {
        const choice = event.choices[i];
        // แสดงผลกระทบ
        let effectsText = '';
        for (const [key, val] of Object.entries(choice.effects)) {
          const sign = val >= 0 ? '+' : '';
          const name = this.getEffectName(key);
          effectsText += `${name} ${sign}${val}  `;
        }

        html += `
          <button class="event-choice-btn" onclick="UI.selectChoice(${i})">
            ${choice.text}
            <div class="event-choice-effects">${effectsText}</div>
          </button>
        `;
      }

      choicesDiv.innerHTML = html;
    }
    // ไม่มีตัวเลือก — แค่เรื่องราว
    else {
      choicesDiv.innerHTML = '';
      nextBtn.style.display = 'block';
      nextBtn.textContent = 'ปิด';
      nextBtn.onclick = () => {
        this.closeEvent();
      };
    }
  },

  selectChoice(index) {
    const event = this.currentEvent;
    if (!event || !event.choices || !event.choices[index]) return;

    const choice = event.choices[index];

    // ใช้ effects
    GameState.applyEffects(choice.effects);

    // บันทึก
    if (choice.log) {
      GameState.addLog('event', choice.log);
    }

    // ตรวจว่ามี battle หรือไม่
    if (choice.battleId) {
      this.closeEvent();
      MilitarySystem.showBattle(choice.battleId);
      return;
    }

    this.closeEvent();
  },

  closeEvent() {
    const event = this.currentEvent;

    // บันทึกว่าเกิดแล้ว
    if (event) {
      GameState.completedEvents.push(event.id);

      // ใช้ effects ของ event (ถ้ามี)
      if (event.effects && !event.choices) {
        GameState.applyEffects(event.effects);
      }
    }

    document.getElementById('event-screen').classList.remove('active');
    document.getElementById('event-next').textContent = 'ต่อไป';
    this.currentEvent = null;
    this.currentSceneIndex = 0;

    UI.updateResources();

    // ตรวจว่ามีเหตุการณ์อื่นรอ
    if (event && event.triggerEnding) {
      Game.checkAndShowEnding();
    } else {
      Game.processNextEvent();
    }
  },

  // พิมพ์ข้อความทีละตัว
  typeText(element, text, speed = 20) {
    element.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  },

  // แปลงชื่อ effect
  getEffectName(key) {
    const names = {
      gold: 'ทอง',
      food: 'อาหาร',
      faith: 'ศรัทธา',
      authority: 'อำนาจ',
      prestige: 'ชื่อเสียง',
      holland_relation: 'สัมพันธ์ฮอลันดา',
      france_relation: 'สัมพันธ์ฝรั่งเศส',
      china_relation: 'สัมพันธ์จีน',
      japan_relation: 'สัมพันธ์ญี่ปุ่น',
      persia_relation: 'สัมพันธ์เปอร์เซีย',
      phaulkon_loyalty: 'ภักดีวิชาเยนทร์',
      petratcha_loyalty: 'ภักดีเพทราชา',
      kosapan_loyalty: 'ภักดีโกษาปาน'
    };
    return names[key] || key;
  },

  // --- หน้าจอสรุปเทิร์น ---
  showTurnSummary(changes) {
    const screen = document.getElementById('turn-summary-screen');
    document.getElementById('summary-title').textContent =
      `สรุปปี พ.ศ. ${GameState.currentYear - 1}`;

    let changesHtml = '';
    const resourceNames = {
      gold: 'ทองคลัง',
      food: 'อาหาร',
      faith: 'ศรัทธา',
      authority: 'อำนาจ',
      prestige: 'ชื่อเสียง'
    };

    for (const [key, val] of Object.entries(changes)) {
      const cls = val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral';
      const sign = val > 0 ? '+' : '';
      changesHtml += `
        <div class="summary-change">
          <span>${resourceNames[key] || key}</span>
          <span class="${cls}">${sign}${val}</span>
        </div>
      `;
    }

    document.getElementById('summary-changes').innerHTML = changesHtml;

    // แสดงเหตุการณ์ที่จะเกิดปีหน้า (teaser)
    const nextEvents = EventSystem.getEventsForTurn(GameState.currentYear, GameState.completedEvents);
    let eventsHtml = '';
    if (nextEvents.length > 0) {
      eventsHtml = '<p style="color:var(--primary-gold); margin-top:12px;">ปีหน้า...</p>';
      for (const e of nextEvents) {
        eventsHtml += `<p>- ${e.title}</p>`;
      }
    }
    document.getElementById('summary-events').innerHTML = eventsHtml;

    screen.classList.add('active');
  },

  closeTurnSummary() {
    document.getElementById('turn-summary-screen').classList.remove('active');
  },

  // --- หน้าจอจบเกม ---
  showEnding(endingId) {
    const endings = {
      golden_age: {
        icon: '\u{1F3C6}',
        title: 'ยุคทองแห่งอยุธยา',
        description: 'รัชสมัยของสมเด็จพระนารายณ์เป็นยุคที่อยุธยาเจริญรุ่งเรืองที่สุด เป็นที่ยอมรับในเวทีนานาชาติ ทรงสร้างสมดุลระหว่างการเปิดรับสิ่งใหม่กับการรักษาเอกราช จนได้รับการยกย่องเป็น "มหาราช"'
      },
      trade_empire: {
        icon: '\u{1F4E6}',
        title: 'จักรวรรดิการค้า',
        description: 'อยุธยากลายเป็นศูนย์กลางการค้าที่ยิ่งใหญ่ที่สุดในภูมิภาค เรือสินค้าจากทั่วโลกแล่นมายังท่าเรือกรุงศรีอยุธยา ความมั่งคั่งหลั่งไหลเข้าสู่ราชอาณาจักรอย่างมหาศาล'
      },
      foreign_influence: {
        icon: '\u{26A0}',
        title: 'ภายใต้เงาต่างชาติ',
        description: 'ชาวต่างชาติมีอิทธิพลเหนืออยุธยามากเกินไป ทหารฝรั่งเศสเข้ามาประจำการ มิชชันนารีเปลี่ยนศาสนา อำนาจราชบัลลังก์สั่นคลอน เอกราชของแผ่นดินตกอยู่ในอันตราย'
      },
      civil_war: {
        icon: '\u{1F480}',
        title: 'สงครามกลางเมือง',
        description: 'พระเพทราชาก่อกบฏยึดอำนาจ จับกุมวิชาเยนทร์และขับไล่ชาวต่างชาติ รัชกาลของสมเด็จพระนารายณ์สิ้นสุดลงด้วยโศกนาฏกรรม แผ่นดินอยุธยาจมอยู่ในความขัดแย้ง'
      }
    };

    const ending = endings[endingId];
    if (!ending) return;

    document.getElementById('ending-icon').textContent = ending.icon;
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-description').textContent = ending.description;

    // สถิติ
    const r = GameState.resources;
    const s = GameState.stats;
    document.getElementById('ending-stats').innerHTML = `
      <div class="ending-stat">ทองคลังสุดท้าย: ${r.gold}</div>
      <div class="ending-stat">ชื่อเสียง: ${r.prestige}</div>
      <div class="ending-stat">อำนาจ: ${r.authority}</div>
      <div class="ending-stat">ศรัทธา: ${r.faith}</div>
      <div class="ending-stat">ศึกที่ชนะ: ${s.battlesWon}</div>
      <div class="ending-stat">สนธิสัญญา: ${s.treatiesSigned}</div>
      <div class="ending-stat">ทูตที่ส่ง: ${s.embassiesSent}</div>
      <div class="ending-stat">รายได้การค้ารวม: ${s.totalTradeGold}</div>
    `;

    document.getElementById('ending-screen').classList.add('active');
  }
};
