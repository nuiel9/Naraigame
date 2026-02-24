/* ===========================================
   events.js — ระบบเหตุการณ์แบบ Visual Novel
   =========================================== */

const EventSystem = {
  // เหตุการณ์ทั้งหมด
  events: [
    // ===== บทที่ 1: รุ่งอรุณแห่งรัชกาล =====
    {
      id: 'E01',
      title: 'ขึ้นครองราชย์',
      year: 2199,
      act: 1,
      type: 'story',
      background: 'bg-throne',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'พ.ศ. ๒๑๙๙ — สมเด็จพระนารายณ์เสด็จขึ้นครองราชย์เป็นกษัตริย์แห่งกรุงศรีอยุธยา ท่ามกลางความคาดหวังของไพร่ฟ้าประชาราษฎร์',
          characters: ['narai']
        },
        {
          speaker: 'สมเด็จพระนารายณ์',
          speakerIcon: '\u{1F451}',
          text: 'เราจะนำพาอยุธยาให้เจริญรุ่งเรือง เปิดรับสิ่งใหม่จากนานาอารยประเทศ พร้อมรักษาเอกราชและศักดิ์ศรีแห่งแผ่นดินสยาม',
          characters: ['narai']
        },
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'ราชอาณาจักรอยุธยาในขณะนั้นเป็นศูนย์กลางการค้าที่สำคัญของภูมิภาค มีชาวต่างชาติจำนวนมากเข้ามาค้าขาย ทั้งจีน ญี่ปุ่น เปอร์เซีย โปรตุเกส ฮอลันดา และอังกฤษ',
          characters: ['narai']
        }
      ],
      effects: { authority: 5 }
    },

    {
      id: 'E02',
      title: 'จัดการขุนนางฝ่ายตรงข้าม',
      year: 2199,
      act: 1,
      type: 'decision',
      background: 'bg-palace',
      scenes: [
        {
          speaker: 'พระเพทราชา',
          speakerIcon: '\u{1F977}',
          text: 'ขอเดชะ ยังมีขุนนางหลายคนที่เคยสนับสนุนรัชกาลก่อน พวกเขาอาจเป็นภัยต่อราชบัลลังก์ ควรจัดการอย่างเด็ดขาด',
          characters: ['petratcha']
        }
      ],
      choices: [
        {
          text: 'จัดการเด็ดขาด — ปลดออกจากตำแหน่งทั้งหมด',
          effects: { authority: 15, faith: -5, petratcha_loyalty: 10 },
          log: 'ปลดขุนนางฝ่ายตรงข้ามออกจากตำแหน่งทั้งหมด'
        },
        {
          text: 'เจรจาผ่อนปรน — ให้โอกาสแสดงความจงรักภักดี',
          effects: { authority: 5, faith: 5, prestige: 5 },
          log: 'เจรจาผ่อนปรนกับขุนนางฝ่ายตรงข้าม'
        },
        {
          text: 'ให้อภัยทั้งหมด — แสดงพระเมตตา',
          effects: { authority: -5, faith: 10, prestige: 10, petratcha_loyalty: -5 },
          log: 'พระราชทานอภัยโทษแก่ขุนนางฝ่ายตรงข้ามทั้งหมด'
        }
      ]
    },

    {
      id: 'E03',
      title: 'ฟอลคอนเข้ารับราชการ',
      year: 2201,
      act: 1,
      type: 'decision',
      background: 'bg-palace',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'ชาวกรีกนาม คอนสแตนติน ฟอลคอน ผู้มีความสามารถในการค้าขายและพูดได้หลายภาษา ได้เข้ามารับราชการในราชสำนัก',
          characters: ['narai', 'phaulkon']
        },
        {
          speaker: 'คอนสแตนติน ฟอลคอน',
          speakerIcon: '\u{1F9D4}',
          text: 'ข้าพระพุทธเจ้าขอถวายความจงรักภักดี ด้วยความรู้ด้านการค้าและภาษาต่างประเทศ ข้าพระพุทธเจ้าจะทำให้อยุธยาร่ำรวยยิ่งขึ้น',
          characters: ['narai', 'phaulkon']
        }
      ],
      choices: [
        {
          text: 'แต่งตั้งให้เป็นที่ปรึกษาด้านการค้า — ให้อำนาจเต็มที่',
          effects: { gold: 300, prestige: 10, phaulkon_loyalty: 20, petratcha_loyalty: -10 },
          log: 'แต่งตั้งฟอลคอนเป็นที่ปรึกษาด้านการค้า มีอำนาจเต็มที่'
        },
        {
          text: 'รับไว้ในตำแหน่งรอง — ให้พิสูจน์ตัวเองก่อน',
          effects: { gold: 100, phaulkon_loyalty: 5, petratcha_loyalty: 5 },
          log: 'รับฟอลคอนไว้ในตำแหน่งรอง ให้พิสูจน์ความสามารถ'
        },
        {
          text: 'ปฏิเสธ — ไม่ไว้ใจชาวต่างชาติ',
          effects: { authority: 5, petratcha_loyalty: 15, phaulkon_loyalty: -30 },
          log: 'ปฏิเสธการรับฟอลคอนเข้ารับราชการ'
        }
      ]
    },

    // ===== บทที่ 2: ยุคทองแห่งการค้า =====
    {
      id: 'E04',
      title: 'เปิดสถานีการค้าที่อยุธยา',
      year: 2205,
      act: 2,
      type: 'decision',
      background: 'bg-port',
      scenes: [
        {
          speaker: 'เจ้าพระยาวิชาเยนทร์',
          speakerIcon: '\u{1F9D4}',
          text: 'ขอเดชะ ชาวต่างชาติหลายชาติขอเปิดสถานีการค้าถาวรในกรุงศรีอยุธยา นี่คือโอกาสทองที่จะเพิ่มรายได้แผ่นดิน',
          characters: ['phaulkon']
        }
      ],
      choices: [
        {
          text: 'เปิดให้ทุกชาติ — เสรีภาพทางการค้าเต็มที่',
          effects: { gold: 500, prestige: 10, authority: -5 },
          log: 'เปิดสถานีการค้าให้ทุกชาติอย่างเสรี'
        },
        {
          text: 'เปิดแบบมีเงื่อนไข — เก็บภาษีสูงและจำกัดพื้นที่',
          effects: { gold: 300, authority: 5, prestige: 5 },
          log: 'เปิดสถานีการค้าแบบมีเงื่อนไขและเก็บภาษี'
        },
        {
          text: 'เปิดเฉพาะชาติที่เป็นมิตร — เลือกเฉพาะบางชาติ',
          effects: { gold: 200, authority: 10, prestige: -5 },
          log: 'เปิดสถานีการค้าเฉพาะชาติที่เป็นมิตรเท่านั้น'
        }
      ]
    },

    {
      id: 'E05',
      title: 'พ่อค้าจีนขอตั้งตลาด',
      year: 2207,
      act: 2,
      type: 'decision',
      background: 'bg-port',
      scenes: [
        {
          speaker: 'พ่อค้าจีน',
          speakerIcon: '\u{1F9CF}',
          text: 'กราบทูลฝ่าพระบาท พ่อค้าชาวจีนขอพระราชทานที่ดินตั้งตลาดการค้าขนาดใหญ่ ริมแม่น้ำเจ้าพระยา จะนำผ้าไหม เครื่องสังคโลก และชาชั้นดีมาค้าขาย',
          characters: ['narai']
        }
      ],
      choices: [
        {
          text: 'อนุญาตเต็มที่ — ให้ที่ดินกว้างขวาง',
          effects: { gold: 400, food: 50, china_relation: 20, authority: -3 },
          log: 'อนุญาตให้พ่อค้าจีนตั้งตลาดขนาดใหญ่ริมแม่น้ำ'
        },
        {
          text: 'อนุญาตแบบจำกัด — ให้พื้นที่เล็กและเก็บค่าเช่า',
          effects: { gold: 250, china_relation: 10, authority: 3 },
          log: 'อนุญาตให้พ่อค้าจีนตั้งตลาดแบบจำกัดพื้นที่'
        }
      ]
    },

    {
      id: 'E06',
      title: 'ฮอลันดาขอผูกขาดการค้าดีบุก',
      year: 2209,
      act: 2,
      type: 'decision',
      background: 'bg-port',
      scenes: [
        {
          speaker: 'ผู้แทนบริษัท VOC',
          speakerIcon: '\u{1F9D1}\u{200D}\u{2696}\u{FE0F}',
          text: 'ในนามบริษัท VOC ข้าพเจ้าขอเสนอสัญญาผูกขาดการค้าดีบุก เราจะจ่ายราคาสูงกว่าตลาด แลกกับสิทธิ์ซื้อดีบุกเพียงผู้เดียว',
          characters: ['narai']
        },
        {
          speaker: 'พระเพทราชา',
          speakerIcon: '\u{1F977}',
          text: 'ขอเดชะ อย่าให้ฝรั่งผูกขาดทรัพยากรของแผ่นดิน มิฉะนั้นเราจะตกอยู่ใต้อำนาจของพวกเขา',
          characters: ['petratcha']
        }
      ],
      choices: [
        {
          text: 'ยอมรับข้อเสนอ — ได้เงินมหาศาลทันที',
          effects: { gold: 1000, holland_relation: 25, authority: -10, petratcha_loyalty: -15 },
          log: 'ยอมให้ VOC ผูกขาดการค้าดีบุก'
        },
        {
          text: 'ต่อรองลดขอบเขต — ให้สิทธิ์บางส่วนเท่านั้น',
          effects: { gold: 500, holland_relation: 10, authority: -3 },
          log: 'ให้สิทธิ์การค้าดีบุกบางส่วนแก่ VOC'
        },
        {
          text: 'ปฏิเสธเด็ดขาด — ไม่ผูกขาดให้ชาติใด',
          effects: { gold: -200, holland_relation: -20, authority: 10, petratcha_loyalty: 10 },
          log: 'ปฏิเสธข้อเสนอผูกขาดของ VOC อย่างเด็ดขาด'
        }
      ]
    },

    // ===== บทที่ 3: สงครามและการป้องกัน =====
    {
      id: 'E07',
      title: 'ศึกเชียงใหม่',
      year: 2203,
      act: 3,
      type: 'battle_event',
      background: 'bg-battlefield',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'ข่าวจากชายแดนเหนือ! กองทัพพม่าเคลื่อนพลเข้ายึดเชียงใหม่ หัวเมืองประเทศราชขอกำลังจากกรุงศรีอยุธยา',
          characters: ['narai', 'petratcha']
        },
        {
          speaker: 'พระเพทราชา',
          speakerIcon: '\u{1F977}',
          text: 'ขอเดชะ ต้องยกทัพไปช่วยเชียงใหม่โดยเร็ว หากปล่อยให้พม่ายึดได้ อยุธยาจะถูกคุกคามจากทางเหนือ',
          characters: ['petratcha']
        }
      ],
      choices: [
        {
          text: 'ยกทัพใหญ่ไปช่วย — ส่งกำลังเต็มที่',
          effects: { gold: -800, food: -200, authority: 10, prestige: 15, petratcha_loyalty: 10 },
          battleId: 'battle_chiangmai',
          log: 'ยกทัพใหญ่ไปช่วยเชียงใหม่'
        },
        {
          text: 'ส่งกำลังบางส่วน — ประหยัดเสบียง',
          effects: { gold: -400, food: -100, authority: 5, prestige: 5 },
          log: 'ส่งกำลังบางส่วนไปช่วยเชียงใหม่'
        },
        {
          text: 'ไม่ส่งกำลัง — รักษากำลังไว้ป้องกันอยุธยา',
          effects: { authority: -10, prestige: -15, petratcha_loyalty: -10 },
          log: 'ตัดสินใจไม่ส่งกำลังไปช่วยเชียงใหม่'
        }
      ]
    },

    {
      id: 'E08',
      title: 'VOC ปิดล้อมทางทะเล',
      year: 2207,
      act: 3,
      type: 'battle_event',
      background: 'bg-port',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'กองเรือ VOC ปิดล้อมปากแม่น้ำเจ้าพระยา! ฮอลันดาไม่พอใจที่อยุธยาเปิดการค้ากับชาติอื่นมากขึ้น จึงใช้กำลังกดดัน',
          characters: ['narai']
        },
        {
          speaker: 'เจ้าพระยาวิชาเยนทร์',
          speakerIcon: '\u{1F9D4}',
          text: 'ขอเดชะ นี่คือการท้าทายอธิปไตยของอยุธยาอย่างร้ายแรง เราต้องตอบโต้อย่างเด็ดเดี่ยว',
          characters: ['phaulkon']
        }
      ],
      choices: [
        {
          text: 'สู้กลับ — ส่งกองเรือรบออกต่อสู้',
          effects: { gold: -600, authority: 15, prestige: 10, holland_relation: -30 },
          battleId: 'battle_voc',
          log: 'ส่งกองเรือรบต่อสู้กับ VOC'
        },
        {
          text: 'เจรจา — ยอมผ่อนปรนบางข้อ',
          effects: { gold: -300, authority: -5, holland_relation: 10 },
          log: 'เจรจาผ่อนปรนกับ VOC'
        },
        {
          text: 'ขอความช่วยเหลือจากฝรั่งเศส — ถ่วงดุลอำนาจ',
          effects: { gold: -200, france_relation: 15, holland_relation: -15, prestige: 5 },
          log: 'ขอความช่วยเหลือจากฝรั่งเศสเพื่อถ่วงดุล VOC'
        }
      ]
    },

    {
      id: 'E09',
      title: 'การรบที่เขมร',
      year: 2210,
      act: 3,
      type: 'battle_event',
      background: 'bg-battlefield',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'กษัตริย์เขมรถอนตัวจากการเป็นประเทศราชของอยุธยา และเริ่มรุกรานดินแดนชายแดนตะวันออก',
          characters: ['narai', 'petratcha']
        }
      ],
      choices: [
        {
          text: 'ยกทัพปราบ — แสดงแสนยานุภาพ',
          effects: { gold: -500, food: -150, authority: 10, prestige: 10 },
          battleId: 'battle_khmer',
          log: 'ยกทัพปราบเขมรที่กระด้างกระเดื่อง'
        },
        {
          text: 'เจรจาสันติ — ส่งทูตไปเจรจา',
          effects: { gold: -100, prestige: 5, authority: -5 },
          log: 'เจรจาสันติภาพกับเขมร'
        }
      ]
    },

    // ===== บทที่ 4: ราชทูตสู่แดนไกล =====
    {
      id: 'E10',
      title: 'ส่งคณะทูตไปฝรั่งเศส',
      year: 2228,
      act: 4,
      type: 'decision',
      background: 'bg-palace',
      scenes: [
        {
          speaker: 'ออกพระวิสุทธสุนทร (โกษาปาน)',
          speakerIcon: '\u{1F9D1}\u{200D}\u{1F4BC}',
          text: 'ขอเดชะ ข้าพระพุทธเจ้าพร้อมนำคณะทูตเดินทางไปเฝ้าพระเจ้าหลุยส์ที่ 14 ณ พระราชวังแวร์ซาย เพื่อเจริญสัมพันธไมตรีระหว่างสยามกับฝรั่งเศส',
          characters: ['kosapan']
        },
        {
          speaker: 'เจ้าพระยาวิชาเยนทร์',
          speakerIcon: '\u{1F9D4}',
          text: 'นี่คือโอกาสยิ่งใหญ่ที่จะยกฐานะอยุธยาในเวทีโลก ควรส่งเครื่องราชบรรณาการอันงดงามไปด้วย',
          characters: ['phaulkon']
        }
      ],
      choices: [
        {
          text: 'ส่งคณะทูตใหญ่ — พร้อมเครื่องบรรณาการอลังการ',
          effects: { gold: -1500, prestige: 25, france_relation: 25, kosapan_loyalty: 10 },
          log: 'ส่งคณะทูตใหญ่พร้อมเครื่องบรรณาการอลังการไปฝรั่งเศส'
        },
        {
          text: 'ส่งคณะทูตขนาดกลาง — สมเกียรติแต่ประหยัด',
          effects: { gold: -800, prestige: 15, france_relation: 15 },
          log: 'ส่งคณะทูตขนาดกลางไปฝรั่งเศส'
        },
        {
          text: 'ยังไม่ส่ง — รอจังหวะที่เหมาะสมกว่า',
          effects: { prestige: -5, france_relation: -10, phaulkon_loyalty: -10 },
          log: 'เลื่อนการส่งคณะทูตไปฝรั่งเศสออกไป'
        }
      ]
    },

    {
      id: 'E11',
      title: 'คณะทูตฝรั่งเศสเข้าเฝ้า',
      year: 2228,
      act: 4,
      type: 'decision',
      background: 'bg-throne',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'เชอวาลิเยร์ เดอ โชมงต์ เอกอัครราชทูตฝรั่งเศส นำคณะทูตเข้าเฝ้าสมเด็จพระนารายณ์ที่เมืองลพบุรี พร้อมพระราชสาส์นจากพระเจ้าหลุยส์ที่ 14',
          characters: ['narai', 'chevalier']
        },
        {
          speaker: 'เชอวาลิเยร์ เดอ โชมงต์',
          speakerIcon: '\u{1F3A9}',
          text: 'ในนามพระเจ้าหลุยส์ผู้ยิ่งใหญ่ ข้าพเจ้านำข้อเสนอพันธมิตรทางการค้า และขอเชิญชวนพระองค์ให้เปิดรับศาสนาคริสต์ในดินแดนสยาม',
          characters: ['chevalier']
        },
        {
          speaker: 'พระเพทราชา',
          speakerIcon: '\u{1F977}',
          text: '(กระซิบ) ขอเดชะ อย่าเปิดรับศาสนาของฝรั่ง จะเป็นภัยต่อพุทธศาสนาและความสงบในแผ่นดิน',
          characters: ['petratcha']
        }
      ],
      choices: [
        {
          text: 'รับข้อเสนอทั้งหมด — เปิดรับทั้งการค้าและมิชชันนารี',
          effects: { gold: 500, prestige: 20, faith: -15, france_relation: 30, petratcha_loyalty: -20 },
          log: 'รับข้อเสนอฝรั่งเศสทั้งหมด รวมถึงการเผยแพร่ศาสนาคริสต์'
        },
        {
          text: 'รับเฉพาะการค้า — ปฏิเสธเรื่องศาสนาอย่างสุภาพ',
          effects: { gold: 300, prestige: 10, faith: 5, france_relation: 10 },
          log: 'รับข้อเสนอการค้าจากฝรั่งเศส แต่ปฏิเสธเรื่องศาสนา'
        },
        {
          text: 'ปฏิเสธอย่างสุภาพ — รักษาเอกราชทางนโยบาย',
          effects: { authority: 10, faith: 10, france_relation: -20, petratcha_loyalty: 15, phaulkon_loyalty: -15 },
          log: 'ปฏิเสธข้อเสนอของฝรั่งเศสอย่างสุภาพ'
        }
      ]
    },

    {
      id: 'E12',
      title: 'ลงนามสนธิสัญญากับฝรั่งเศส',
      year: 2229,
      act: 4,
      type: 'decision',
      background: 'bg-palace',
      scenes: [
        {
          speaker: 'เจ้าพระยาวิชาเยนทร์',
          speakerIcon: '\u{1F9D4}',
          text: 'ขอเดชะ ฝรั่งเศสเสนอสนธิสัญญาทางการค้าและพันธมิตรทางทหาร นี่จะเป็นจุดเปลี่ยนของอยุธยาในเวทีโลก',
          characters: ['phaulkon']
        }
      ],
      choices: [
        {
          text: 'ลงนามสนธิสัญญาเต็มรูปแบบ — ทั้งการค้าและทหาร',
          effects: { gold: 800, prestige: 20, authority: -10, france_relation: 30, petratcha_loyalty: -15 },
          log: 'ลงนามสนธิสัญญาเต็มรูปแบบกับฝรั่งเศส'
        },
        {
          text: 'ลงนามเฉพาะด้านการค้า — ไม่ผูกมัดทางทหาร',
          effects: { gold: 400, prestige: 10, france_relation: 15 },
          log: 'ลงนามสนธิสัญญาการค้ากับฝรั่งเศส'
        },
        {
          text: 'ขอเวลาพิจารณา — ยังไม่ลงนาม',
          effects: { france_relation: -10, authority: 5 },
          log: 'ขอเวลาพิจารณาสนธิสัญญากับฝรั่งเศส'
        }
      ]
    },

    // ===== บทที่ 5: สนธยาแห่งรัชกาล =====
    {
      id: 'E13',
      title: 'กองทหารฝรั่งเศสมาถึง',
      year: 2230,
      act: 5,
      type: 'decision',
      background: 'bg-port',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'กองทหารฝรั่งเศสจำนวน 636 นาย เดินทางมาถึงกรุงศรีอยุธยา ภายใต้การบัญชาของนายพลเดส์ฟาร์จส์ พร้อมตั้งค่ายที่เมืองมะริดและบางกอก',
          characters: ['narai']
        },
        {
          speaker: 'พระเพทราชา',
          speakerIcon: '\u{1F977}',
          text: 'ขอเดชะ! นี่ไม่ใช่ทูต นี่คือกองทัพบุก! ทหารฝรั่งเศสเข้ามาในแผ่นดินเรามากขนาดนี้ เป็นภัยต่ออธิปไตยของชาติ!',
          characters: ['petratcha']
        }
      ],
      choices: [
        {
          text: 'อนุญาตให้ประจำการ — เชื่อใจฝรั่งเศส',
          effects: { authority: -20, faith: -10, france_relation: 20, petratcha_loyalty: -25 },
          log: 'อนุญาตให้กองทหารฝรั่งเศสประจำการในอยุธยา'
        },
        {
          text: 'จำกัดจำนวนและพื้นที่ — ให้อยู่เฉพาะบางแห่ง',
          effects: { authority: -8, france_relation: 5, petratcha_loyalty: -10 },
          log: 'จำกัดการประจำการของทหารฝรั่งเศส'
        },
        {
          text: 'ปฏิเสธ — สั่งให้กลับ',
          effects: { authority: 10, france_relation: -30, petratcha_loyalty: 15, phaulkon_loyalty: -20 },
          log: 'ปฏิเสธไม่ให้กองทหารฝรั่งเศสประจำการ สั่งให้กลับ'
        }
      ]
    },

    {
      id: 'E14',
      title: 'ขุนนางไม่พอใจอิทธิพลต่างชาติ',
      year: 2230,
      act: 5,
      type: 'decision',
      background: 'bg-palace',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'ความไม่พอใจในหมู่ขุนนางไทยเพิ่มสูงขึ้น การที่วิชาเยนทร์ชาวต่างชาติมีอำนาจมาก ทหารฝรั่งเศสประจำการในแผ่นดิน และมิชชันนารีพยายามเปลี่ยนศาสนา ทำให้เกิดกระแสต่อต้าน',
          characters: ['petratcha']
        },
        {
          speaker: 'พระเพทราชา',
          speakerIcon: '\u{1F977}',
          text: 'ขอเดชะ ขุนนางและราษฎรต่างวิตกกังวล หากไม่จัดการเรื่องนี้ ข้าพระพุทธเจ้าเกรงว่าจะเกิดความวุ่นวาย',
          characters: ['petratcha']
        }
      ],
      choices: [
        {
          text: 'ลดอำนาจต่างชาติ — ปลดวิชาเยนทร์ ส่งทหารฝรั่งเศสกลับ',
          effects: { authority: 15, faith: 10, petratcha_loyalty: 20, phaulkon_loyalty: -40, france_relation: -30 },
          log: 'ลดอิทธิพลต่างชาติ ปลดวิชาเยนทร์ออกจากตำแหน่ง'
        },
        {
          text: 'ประนีประนอม — ลดบทบาทบางส่วนแต่ไม่ปลด',
          effects: { authority: 5, petratcha_loyalty: 5, phaulkon_loyalty: -10, france_relation: -10 },
          log: 'ลดบทบาทต่างชาติบางส่วน เพื่อประนีประนอม'
        },
        {
          text: 'ยืนยันนโยบายเดิม — เชื่อมั่นในวิสัยทัศน์ของพระองค์',
          effects: { authority: -10, prestige: 5, petratcha_loyalty: -20, phaulkon_loyalty: 10 },
          log: 'ยืนยันนโยบายเปิดรับชาวต่างชาติตามเดิม'
        }
      ]
    },

    {
      id: 'E15',
      title: 'การลุกฮือของพระเพทราชา',
      year: 2231,
      act: 5,
      type: 'decision',
      background: 'bg-battlefield',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'สมเด็จพระนารายณ์ทรงประชวรหนัก ณ พระราชวังนารายณ์ราชนิเวศน์ เมืองลพบุรี พระเพทราชาฉวยโอกาสรวบรวมกำลังพล...',
          characters: ['petratcha']
        },
        {
          speaker: 'พระเพทราชา',
          speakerIcon: '\u{1F977}',
          text: 'ถึงเวลาแล้วที่จะกอบกู้แผ่นดินจากอิทธิพลต่างชาติ ข้าจะรักษาอยุธยาไว้ให้คนไทย!',
          characters: ['petratcha']
        }
      ],
      choices: [
        {
          text: 'พยายามต่อต้าน — ส่งทหารที่ยังจงรักภักดีไปปราบ',
          effects: { authority: -20, gold: -500 },
          log: 'พยายามต่อต้านการลุกฮือของพระเพทราชา'
        },
        {
          text: 'ยอมรับสถานการณ์ — รักษาความสงบเพื่อแผ่นดิน',
          effects: { faith: 10, authority: -10 },
          log: 'ยอมรับสถานการณ์ เพื่อรักษาความสงบของแผ่นดิน'
        }
      ]
    },

    {
      id: 'E16',
      title: 'สนธยาแห่งรัชกาล',
      year: 2231,
      act: 5,
      type: 'story',
      background: 'bg-palace',
      scenes: [
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'พ.ศ. ๒๒๓๑ — สมเด็จพระนารายณ์มหาราชเสด็จสวรรคต ณ พระราชวังนารายณ์ราชนิเวศน์ เมืองลพบุรี หลังทรงครองราชย์ 32 พรรษา',
          characters: ['narai']
        },
        {
          speaker: 'ผู้บรรยาย',
          speakerIcon: '',
          text: 'รัชสมัยของพระองค์เป็นยุคที่อยุธยาเจริญรุ่งเรืองที่สุดช่วงหนึ่ง เป็นที่รู้จักของนานาอารยประเทศ ทรงเป็นมหาราชองค์หนึ่งของชาติไทย',
          characters: ['narai']
        }
      ],
      effects: {},
      triggerEnding: true
    }
  ],

  // ดึงเหตุการณ์ตามปี
  getEventsForYear(year) {
    return this.events.filter(e => e.year === year);
  },

  // ดึงเหตุการณ์ที่ยังไม่เกิด
  getPendingEvents(year, completedIds) {
    return this.events.filter(e =>
      e.year <= year && !completedIds.includes(e.id)
    );
  },

  // ดึงเหตุการณ์ถัดไป
  getNextEvent(completedIds) {
    return this.events.find(e => !completedIds.includes(e.id));
  },

  // ดึงเหตุการณ์ที่ควรเกิดในเทิร์นนี้
  getEventsForTurn(year, completedIds) {
    return this.events.filter(e =>
      e.year === year && !completedIds.includes(e.id)
    );
  }
};
