/* ===========================================
   game-state.js — จัดการสถานะเกมทั้งหมด
   =========================================== */

const GameState = {
  // สถานะปัจจุบัน
  currentTurn: 1,
  currentYear: 2199,
  currentAct: 1,
  phase: 'free', // free, trade, diplomacy, military, event, summary

  // ทรัพยากร
  resources: {
    gold: 5000,
    food: 500,
    faith: 75,
    authority: 80,
    prestige: 50
  },

  // การค้า
  tradePartners: {},
  tradedThisTurn: {},

  // การทูต
  treaties: {},
  embassySentThisTurn: false,

  // การทหาร
  military: {
    elephantCorps: 2,
    infantry: 10,
    navy: 3,
    artillery: 0,
    foreignGuard: 1
  },
  battledThisTurn: false,

  // ที่ปรึกษา
  advisors: {},

  // เหตุการณ์ที่เกิดแล้ว
  completedEvents: [],
  pendingEvents: [],

  // บันทึก
  log: [],

  // สถิติเกม
  stats: {
    totalTradeGold: 0,
    battlesWon: 0,
    battlesLost: 0,
    treatiesSigned: 0,
    embassiesSent: 0
  },

  // เกมจบแล้วหรือยัง
  gameOver: false,

  // --- ฟังก์ชันเริ่มต้นเกมใหม่ ---
  init() {
    this.currentTurn = 1;
    this.currentYear = 2199;
    this.currentAct = 1;
    this.phase = 'free';
    this.resources = { gold: 5000, food: 500, faith: 75, authority: 80, prestige: 50 };
    this.tradedThisTurn = {};
    this.embassySentThisTurn = false;
    this.battledThisTurn = false;
    this.completedEvents = [];
    this.pendingEvents = [];
    this.log = [];
    this.gameOver = false;
    this.stats = {
      totalTradeGold: 0, battlesWon: 0, battlesLost: 0,
      treatiesSigned: 0, embassiesSent: 0
    };

    // ตั้งค่าคู่ค้า
    this.tradePartners = JSON.parse(JSON.stringify(TradeSystem.defaultPartners));
    this.treaties = {};

    // ตั้งค่าที่ปรึกษา
    this.advisors = JSON.parse(JSON.stringify(Characters.advisors));

    // ตั้งค่ากองทัพ
    this.military = {
      elephantCorps: 2,
      infantry: 10,
      navy: 3,
      artillery: 0,
      foreignGuard: 1
    };

    this.addLog('event', 'สมเด็จพระนารายณ์เสด็จขึ้นครองราชย์ ณ กรุงศรีอยุธยา');
  },

  // --- ปรับทรัพยากร ---
  modifyResource(type, amount) {
    if (this.resources[type] === undefined) return;
    const old = this.resources[type];
    this.resources[type] += amount;

    // จำกัดค่า
    if (type === 'faith' || type === 'authority' || type === 'prestige') {
      this.resources[type] = Math.max(0, Math.min(100, this.resources[type]));
    } else {
      this.resources[type] = Math.max(0, this.resources[type]);
    }

    return this.resources[type] - old; // ค่าที่เปลี่ยนจริง
  },

  // --- ใช้ effects object ---
  applyEffects(effects) {
    const changes = {};
    for (const [key, value] of Object.entries(effects)) {
      // ทรัพยากร
      if (this.resources[key] !== undefined) {
        changes[key] = this.modifyResource(key, value);
      }
      // ความสัมพันธ์กับชาติ
      if (key.endsWith('_relation') && this.tradePartners) {
        const nation = key.replace('_relation', '');
        if (this.tradePartners[nation]) {
          this.tradePartners[nation].relationLevel = Math.max(0,
            Math.min(100, this.tradePartners[nation].relationLevel + value));
          changes[key] = value;
        }
      }
      // ความจงรักภักดีที่ปรึกษา
      if (key.endsWith('_loyalty') && this.advisors) {
        const advisor = key.replace('_loyalty', '');
        if (this.advisors[advisor]) {
          this.advisors[advisor].loyalty = Math.max(0,
            Math.min(100, this.advisors[advisor].loyalty + value));
          changes[key] = value;
        }
      }
    }
    return changes;
  },

  // --- คำนวณ Act จาก Year ---
  getAct(year) {
    if (year <= 2205) return 1;
    if (year <= 2215) return 2;
    if (year <= 2218) return 3;
    if (year <= 2228) return 4;
    return 5;
  },

  // --- จบเทิร์น ---
  endTurn() {
    // รายได้ประจำปี
    const tradeIncome = this.calculateTradeIncome();
    const foodProduction = this.calculateFoodProduction();
    const militaryUpkeep = this.calculateMilitaryUpkeep();
    const faithChange = this.calculateFaithChange();

    const turnChanges = {
      gold: tradeIncome - militaryUpkeep,
      food: foodProduction - this.calculateFoodConsumption(),
      faith: faithChange,
      authority: this.calculateAuthorityChange(),
      prestige: this.calculatePrestigeChange()
    };

    // ใช้การเปลี่ยนแปลง
    for (const [key, value] of Object.entries(turnChanges)) {
      this.modifyResource(key, value);
    }

    // ลดความจงรักภักดีของพระเพทราชาตามอิทธิพลต่างชาติ
    if (this.advisors.phaulkon && this.advisors.petratcha) {
      if (this.advisors.phaulkon.influence > 70) {
        this.advisors.petratcha.loyalty = Math.max(0,
          this.advisors.petratcha.loyalty - 3);
      }
    }

    // เลื่อนเทิร์น
    this.currentTurn++;
    this.currentYear++;
    this.currentAct = this.getAct(this.currentYear);
    this.tradedThisTurn = {};
    this.embassySentThisTurn = false;
    this.battledThisTurn = false;

    return turnChanges;
  },

  // --- คำนวณรายได้ ---
  calculateTradeIncome() {
    let income = 200; // รายได้พื้นฐาน
    for (const partner of Object.values(this.tradePartners)) {
      income += Math.floor(partner.tradeVolume * (partner.relationLevel / 100) * 0.5);
    }
    // โบนัสจากที่ปรึกษาวิชาเยนทร์
    if (this.advisors.phaulkon && this.advisors.phaulkon.loyalty > 50) {
      income = Math.floor(income * 1.2);
    }
    return income;
  },

  calculateFoodProduction() {
    return 100; // ผลผลิตพื้นฐาน
  },

  calculateFoodConsumption() {
    const totalTroops = Object.values(this.military).reduce((a, b) => a + b, 0);
    return 50 + totalTroops * 3;
  },

  calculateMilitaryUpkeep() {
    const units = MilitarySystem.units;
    let upkeep = 0;
    for (const [key, count] of Object.entries(this.military)) {
      if (units[key]) {
        upkeep += Math.floor(units[key].cost * count * 0.1);
      }
    }
    return upkeep;
  },

  calculateFaithChange() {
    let change = 0;
    // มิชชันนารีต่างชาติลดศรัทธา
    if (this.tradePartners.france && this.tradePartners.france.relationLevel > 70) {
      change -= 2;
    }
    return change;
  },

  calculateAuthorityChange() {
    let change = 0;
    // อิทธิพลต่างชาติมากลดอำนาจ
    const totalForeignInfluence = Object.values(this.tradePartners)
      .reduce((sum, p) => sum + p.tradeVolume, 0);
    if (totalForeignInfluence > 2000) change -= 2;
    // ความจงรักภักดีขุนนางต่ำลดอำนาจ
    if (this.advisors.petratcha && this.advisors.petratcha.loyalty < 40) {
      change -= 3;
    }
    return change;
  },

  calculatePrestigeChange() {
    let change = 0;
    if (this.stats.embassiesSent > 0) change += 1;
    return change;
  },

  // --- เพิ่มบันทึก ---
  addLog(type, message) {
    this.log.unshift({
      year: this.currentYear,
      type: type, // trade, diplomacy, military, event
      message: message
    });
    // เก็บแค่ 50 รายการ
    if (this.log.length > 50) this.log.pop();
  },

  // --- ตรวจสอบจบเกม ---
  checkEnding() {
    // ปีสุดท้าย
    if (this.currentYear >= 2231) {
      return this.determineEnding();
    }

    // จบก่อนกำหนด: สงครามกลางเมือง
    if (this.advisors.petratcha &&
        this.advisors.petratcha.loyalty < 15 &&
        this.resources.authority < 30) {
      return 'civil_war';
    }

    // จบก่อนกำหนด: ภายใต้เงาต่างชาติ
    if (this.resources.authority < 15) {
      return 'foreign_influence';
    }

    return null;
  },

  determineEnding() {
    const r = this.resources;
    const tradeAlliances = Object.values(this.treaties)
      .filter(t => t === 'trade' || t === 'alliance').length;

    if (r.authority < 30 || (this.tradePartners.france &&
        this.tradePartners.france.relationLevel > 90)) {
      return 'foreign_influence';
    }

    if (this.advisors.petratcha &&
        this.advisors.petratcha.loyalty < 20 && r.authority < 40) {
      return 'civil_war';
    }

    if (r.gold >= 30000 && tradeAlliances >= 4) {
      return 'trade_empire';
    }

    if (r.gold >= 15000 && r.prestige >= 70 && r.authority >= 60) {
      return 'golden_age';
    }

    // ตอนจบเริ่มต้น: ขึ้นกับว่าอะไรสูงสุด
    if (r.prestige >= r.gold / 500 && r.authority >= 50) {
      return 'golden_age';
    }
    return 'trade_empire';
  },

  // --- Save/Load ---
  save() {
    const saveData = {
      currentTurn: this.currentTurn,
      currentYear: this.currentYear,
      currentAct: this.currentAct,
      resources: { ...this.resources },
      tradePartners: JSON.parse(JSON.stringify(this.tradePartners)),
      treaties: { ...this.treaties },
      military: { ...this.military },
      advisors: JSON.parse(JSON.stringify(this.advisors)),
      completedEvents: [...this.completedEvents],
      log: [...this.log],
      stats: { ...this.stats },
      gameOver: this.gameOver,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('narai_save', JSON.stringify(saveData));
    return true;
  },

  load() {
    const data = localStorage.getItem('narai_save');
    if (!data) return false;

    try {
      const saveData = JSON.parse(data);
      this.currentTurn = saveData.currentTurn;
      this.currentYear = saveData.currentYear;
      this.currentAct = saveData.currentAct;
      this.resources = saveData.resources;
      this.tradePartners = saveData.tradePartners;
      this.treaties = saveData.treaties || {};
      this.military = saveData.military;
      this.advisors = saveData.advisors;
      this.completedEvents = saveData.completedEvents;
      this.log = saveData.log;
      this.stats = saveData.stats;
      this.gameOver = saveData.gameOver || false;
      this.phase = 'free';
      this.tradedThisTurn = {};
      this.embassySentThisTurn = false;
      this.battledThisTurn = false;
      return true;
    } catch (e) {
      console.error('โหลดเกมล้มเหลว:', e);
      return false;
    }
  },

  hasSave() {
    return localStorage.getItem('narai_save') !== null;
  }
};
