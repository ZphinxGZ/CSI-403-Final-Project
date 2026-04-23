================================================================================
                     Discord Oil Bot (Groq LLaMA) - OilBot
================================================================================
                      Links เชิญบอท และ Link สำหรับ Discord server
Links เชิญบอท = https://discord.com/oauth2/authorize?client_id=1495827397118005450&permissions=137439037440&integration_type=0&scope=bot+applications.commands

Link สำหรับ Discord server =https://discord.gg/BNzwqVaB7
================================================================================

บอทราคาน้ำมันไทยบน Discord ใช้ AI (LLaMA 3.3 70B ผ่าน Groq) สรุปข้อมูลราคา
น้ำมันจาก 3 ปั๊ม (PTT, Shell, Bangchak) ให้อ่านง่ายเป็นภาษาไทย

================================================================================
  โครงสร้างไฟล์
================================================================================

  bot.js                                 - Discord Bot (discord.js)
  Discord Oil Bot (Groq LLaMA).json.json - n8n Workflow (import เข้า n8n)
  .env                                   - เก็บ Bot Token และ Webhook URL (ลับ)
  .gitignore                             - กัน .env และ node_modules ไม่ขึ้น Git
  package.json                           - Dependencies

================================================================================
  ข้อมูลที่ดึง
================================================================================

  แหล่งข้อมูล : https://api.chnwt.dev/thai-oil-api/latest
  ปั๊ม 3 แห่ง : PTT, Shell, Bangchak
  น้ำมัน 8 ชนิด:
    - ดีเซล B7
    - ดีเซล B20
    - ดีเซลพรีเมียม
    - แก๊สโซฮอล์ 95
    - แก๊สโซฮอล์ 91
    - แก๊สโซฮอล์ E20
    - แก๊สโซฮอล์ E85
    - เบนซิน 95

================================================================================
  รายละเอียด n8n Workflow (3 Flows)
================================================================================

--- Flow 1: Daily Report (รายงานประจำวัน) ---

  Trigger  : ทุกวัน เวลา 06:00 น.
  การทำงาน : ดึงราคาน้ำมันทุกชนิดจากทุกปั๊ม ส่งให้ AI สรุปเปรียบเทียบ
              แล้วส่งเข้า Discord channel อัตโนมัติ
  ลำดับ Node:
    Daily 6AM -> Fetch Oil (Daily) -> Prepare Daily Prompt
    -> AI Agent (Daily) + Groq Model (Daily) -> Bot Send (Daily)

--- Flow 2: User Commands & Chat (คำสั่ง + แชท) ---

  Trigger  : user พิมพ์คำสั่งหรือแชทใน Discord
  การทำงาน : bot.js รับข้อความ ส่งต่อมาที่ n8n ผ่าน Webhook
              Parse Command แยกว่าเป็นคำสั่งหรือแชทอิสระ
              ถ้าเป็นคำสั่ง จะดึงเฉพาะน้ำมันที่ user เลือก
              ถ้าเป็นแชท จะดึงข้อมูลทั้งหมดเป็น context ให้ AI ตอบ
              AI ตอบเฉพาะเรื่องน้ำมัน ถ้าถามเรื่องอื่นจะปฏิเสธสุภาพ
              ตอบกลับใน channel เดียวกับที่ user พิมพ์ (dynamic channelId)
  ลำดับ Node:
    Webhook (Discord Bot) -> Fetch Oil (Command) -> Parse Command
    -> AI Agent (Command) + Groq Model (Command) -> Bot Send (Command)
    -> Respond to Webhook

--- Flow 3: Price Alert (แจ้งเตือนราคาเปลี่ยน) ---

  Trigger  : ทุก 3 ชั่วโมง
  การทำงาน : ดึงราคาน้ำมันเทียบกับครั้งก่อน (เก็บใน Static Data)
              ถ้าราคาเปลี่ยน AI จะสรุปว่าอะไรขึ้น/ลงกี่บาท แล้วส่ง Discord
              ถ้าราคาไม่เปลี่ยน จะไม่ส่งอะไร
  ลำดับ Node:
    Check Every 3h -> Fetch Oil (Alert) -> Detect Price Change
    -> AI Agent (Alert) + Groq Model (Alert) -> Bot Send (Alert)

================================================================================
  คำสั่งใน Discord
================================================================================

  !all          ดูราคาน้ำมันทุกชนิดทุกปั๊ม
  !diesel       ดูราคาดีเซล B7
  !b20          ดูราคาดีเซล B20
  !d-premium    ดูราคาดีเซลพรีเมียม
  !95           ดูราคาแก๊สโซฮอล์ 95
  !91           ดูราคาแก๊สโซฮอล์ 91
  !e20          ดูราคาแก๊สโซฮอล์ E20
  !e85          ดูราคาแก๊สโซฮอล์ E85
  !benzine      ดูราคาเบนซิน 95
  !compare      เปรียบเทียบราคาทุกชนิดทุกปั๊ม พร้อมแนะนำปั๊มถูกสุด
  !help         แสดงรายการคำสั่งทั้งหมด

  คุยเรื่องน้ำมัน:
  !ask <ข้อความ>    เช่น !ask ดีเซลแพงขึ้นไหม
  @OilBot <ข้อความ> เช่น @OilBot ควรเติมน้ำมันตอนไหนดี

================================================================================
  วิธีติดตั้งและใช้งาน
================================================================================

  1. ติดตั้ง Dependencies
     > npm install

  2. สร้างไฟล์ .env ในโฟลเดอร์โปรเจค ใส่ค่าดังนี้:
     BOT_TOKEN=<Discord Bot Token ของคุณ>
     N8N_URL=<n8n Webhook URL ของคุณ>

  3. Import Workflow เข้า n8n
     - เปิด n8n Cloud
     - ไปที่ Workflows -> Import from File
     - เลือกไฟล์ "Discord Oil Bot (Groq LLaMA).json.json"

  4. ตั้งค่า Credentials ใน n8n
     - Groq API: เพิ่ม credential -> ใส่ API Key จาก console.groq.com
     - Header Auth (Discord Bot Token):
         Name  = Authorization
         Value = Bot <Discord Bot Token ของคุณ>

  5. ตั้งค่า Channel ID
     - Bot Send (Daily) และ Bot Send (Alert) ต้องใส่ Channel ID จริง
     - หาได้จาก: Discord -> คลิกขวาที่ channel -> Copy Channel ID
       (ต้องเปิด Developer Mode ใน Discord Settings -> Advanced ก่อน)

  6. Activate Workflow ใน n8n
     - ถ้าใช้ webhook-test ไม่ต้อง activate (สำหรับทดสอบ)
     - ถ้าใช้ webhook (production) ต้อง activate workflow ก่อน

  7. รันบอท
     > node bot.js
     จะเห็นข้อความ "Bot online: ..." แสดงว่าพร้อมใช้งาน

================================================================================
  เทคโนโลยีที่ใช้
================================================================================

  - Discord Bot     : discord.js
  - Workflow         : n8n (Cloud)
  - AI Model        : LLaMA 3.3 70B Versatile (ผ่าน Groq API)
  - Oil Data API    : api.chnwt.dev/thai-oil-api
  - Environment     : dotenv
  - Language         : Node.js

================================================================================


