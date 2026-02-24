/* ===========================================
   main.js — ลอจิกหลักและ Game Loop
   =========================================== */

const Game = {
  pendingTurnEvents: [],

  // --- เริ่มเกมใหม่ ---
  newGame() {
    GameState.init();
    UI.showScreen('game-screen');
    UI.updateResources();
    UI.showPanel('panel-overview');
    UI.setStatus('สมเด็จพระนารายณ์เสด็จขึ้นครองราชย์');
    UI.setPhase('free');

    // แสดงเหตุการณ์เริ่มต้น
    this.triggerEventsForTurn();
  },

  // --- โหลดเกม ---
  loadGame() {
    if (GameState.load()) {
      UI.showScreen('game-screen');
      UI.updateResources();
      UI.showPanel('panel-overview');
      UI.setStatus('โหลดเกมสำเร็จ');
      UI.setPhase('free');
    } else {
      alert('ไม่พบข้อมูลเกมที่บันทึกไว้');
    }
  },

  // --- บันทึกเกม ---
  saveGame() {
    if (GameState.save()) {
      UI.setStatus('บันทึกเกมสำเร็จ!');
      setTimeout(() => UI.setStatus('พร้อมรับพระบรมราชโองการ'), 2000);
    }
  },

  // --- จบเทิร์น ---
  endTurn() {
    // คำนวณการเปลี่ยนแปลง
    const changes = GameState.endTurn();

    // อัปเดต UI
    UI.updateResources();

    // แสดงสรุป
    UI.showTurnSummary(changes);
  },

  // --- หลังปิดสรุปเทิร์น ---
  onNextTurn() {
    UI.closeTurnSummary();

    // ตรวจจบเกม
    const ending = GameState.checkEnding();
    if (ending) {
      GameState.gameOver = true;
      UI.showEnding(ending);
      return;
    }

    UI.updateResources();
    UI.setPhase('free');
    UI.setStatus(`พ.ศ. ${GameState.currentYear} — พร้อมรับพระบรมราชโองการ`);

    // แสดงเหตุการณ์ของเทิร์นใหม่
    this.triggerEventsForTurn();
  },

  // --- เรียกเหตุการณ์ตามเทิร์น ---
  triggerEventsForTurn() {
    const events = EventSystem.getEventsForTurn(
      GameState.currentYear,
      GameState.completedEvents
    );

    this.pendingTurnEvents = [...events];
    this.processNextEvent();
  },

  // --- ประมวลผลเหตุการณ์ถัดไป ---
  processNextEvent() {
    if (this.pendingTurnEvents.length === 0) {
      // ไม่มีเหตุการณ์รอ — กลับสู่โหมดปกติ
      UI.setPhase('free');
      UI.showPanel('panel-overview');
      return;
    }

    const event = this.pendingTurnEvents.shift();
    UI.showEvent(event);
  },

  // --- ตรวจและแสดงตอนจบ ---
  checkAndShowEnding() {
    const ending = GameState.checkEnding();
    if (ending) {
      GameState.gameOver = true;
      UI.showEnding(ending);
    } else {
      // ปีสุดท้ายก็จบอยู่ดี
      const endingResult = GameState.determineEnding();
      GameState.gameOver = true;
      UI.showEnding(endingResult);
    }
  },

  // --- กลับหน้าแรก ---
  backToTitle() {
    UI.showScreen('title-screen');
    document.getElementById('ending-screen').classList.remove('active');
    document.getElementById('event-screen').classList.remove('active');
    document.getElementById('battle-screen').classList.remove('active');
    document.getElementById('turn-summary-screen').classList.remove('active');
  }
};

/* ===========================================
   Event Listeners — ผูกปุ่มต่างๆ
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // --- หน้าแรก ---
  document.getElementById('btn-new-game').addEventListener('click', () => {
    Game.newGame();
  });

  document.getElementById('btn-load-game').addEventListener('click', () => {
    Game.loadGame();
  });

  document.getElementById('btn-how-to-play').addEventListener('click', () => {
    UI.showScreen('tutorial-screen');
  });

  document.getElementById('btn-back-title').addEventListener('click', () => {
    UI.showScreen('title-screen');
  });

  // อัปเดตปุ่มโหลดเกม
  if (!GameState.hasSave()) {
    document.getElementById('btn-load-game').disabled = true;
    document.getElementById('btn-load-game').title = 'ยังไม่มีเกมที่บันทึก';
  }

  // --- เมนูด้านซ้าย ---
  document.querySelectorAll('.menu-btn[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.showPanel(btn.dataset.panel);
    });
  });

  // --- ปุ่มบันทึก ---
  document.getElementById('btn-save').addEventListener('click', () => {
    Game.saveGame();
  });

  // --- ปุ่มจบเทิร์น ---
  document.getElementById('btn-end-turn').addEventListener('click', () => {
    if (GameState.gameOver) return;
    Game.endTurn();
  });

  // --- ปุ่มเทิร์นถัดไป (ในสรุป) ---
  document.getElementById('btn-next-turn').addEventListener('click', () => {
    Game.onNextTurn();
  });

  // --- ปุ่มกลับหน้าแรก (ตอนจบ) ---
  document.getElementById('btn-ending-title').addEventListener('click', () => {
    Game.backToTitle();
  });
});
