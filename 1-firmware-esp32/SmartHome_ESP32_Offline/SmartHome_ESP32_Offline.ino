#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT20.h>

// ============================================================
//  SMART HOME & GARDEN ESP32 (Vietduino) - Bản Hoàn Chỉnh Cao Cấp
//  - Cảm biến Lửa (IO34, Active-LOW) + Còi báo (IO19) + 2 Đèn Đỏ Cảnh Báo (IO14)
//  - Cảm biến Độ ẩm đất (IO35) + Relay Bơm nước (IO26)
//  - Cảm biến PIR (IO27) + Đèn Trắng MKE-M01 (IO32) + Nút bấm thông minh (IO25):
//      + Bấm nhả nhanh (< 1.2s): Bật / Tắt Đèn Trắng
//      + Đè giữ nút (>= 1.2s):   Kêu Bíp -> Khóa / Mở cảm biến PIR tự động
//  - Cảm biến Nước mưa (IO23, có lọc nhiễu đụng dây) + Servo SG90 thu đồ (IO33)
//  - Màn hình LCD1602 (0x27) + Nhiệt/Ẩm DHT20 (0x38)
// ============================================================

// ---------- CHÂN KẾT NỐI ----------
#define FLAME_PIN      34   // Cảm biến lửa MKE-S04 (IO34)
#define SOIL_PIN       35   // Cảm biến độ ẩm đất LM393 (IO35)
#define PIR_PIN        27   // Cảm biến chuyển động PIR HC-SR501 (IO27)
#define RELAY_PIN      26   // Relay máy bơm (IO26)
#define BUZZER_PIN     19   // Còi báo MKE-M03 (IO19)
#define LED_PIN        18   // LED trên mạch (IO18)

#define RAIN_PIN       23   // Cảm biến nước mưa HS0217V chân DO (IO23)
#define SERVO_PIN      33   // Động cơ Servo SG90 0-180 độ (IO33)
#define LIGHT_PIN      32   // Mạch đèn LED trắng MKE-M01 - Chiếu sáng (IO32)
#define BUTTON_PIN     25   // Nút bấm thông minh (IO25)
#define ALARM_LED_PIN  14   // Cụm 2 Đèn LED đỏ 2 chân - Cảnh báo Cháy & Bơm (IO14)

#define RELAY_ON   HIGH
#define RELAY_OFF  LOW

// ---------- THÔNG SỐ CÓ THỂ CHỈNH ----------
const int NGUONG_LUA = 15;
const unsigned long TG_XAC_NHAN_LUA = 1000;
const unsigned long TG_GIU_BAO      = 3000;

const int NGUONG_DAT_KHO = 30;
const int NGUONG_DAT_UOT = 40;
const int SO_LAN_DAT_KHO_XAC_NHAN = 3;
const unsigned long TG_BOM_CHAY = 2500;
const unsigned long TG_BOM_NGHI = 12000;
const int SO_LAN_TUOI_TOI_DA = 5;

const int GOC_PHOI_DO = 15;    // Trời nắng: đưa đồ ra ngoài (lùi khỏi chốt 0 độ)
const int GOC_THU_DO  = 165;   // Trời mưa: thu đồ vào mái hiên (lùi khỏi chốt 180 độ)

const unsigned long TG_DE_GIU_NUT = 1200; // Đè giữ nút 1.2 giây để Tắt/Bật cảm biến PIR

// ---------- ĐỐI TƯỢNG ----------
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT20 dht20;

// ---------- TRẠNG THÁI ----------
enum BomState { BOM_NGHI, BOM_CHAY, BOM_CHO };
BomState bomState = BOM_NGHI;

int giaTriLua = 4095;
int rawDat = 4095;
int phanTramDat = 100;
float nhietDo = 0.0;
float doAmKhi = 0.0;
bool coNguoi = false;
bool pirTruoc = false;
bool khoaPIR = false;          // false = PIR hoạt động tự động; true = Đã tắt cảm biến PIR
bool coMua = false;
int demCoMua = 0;              // Bộ đếm lọc nhiễu đụng dây cảm biến mưa
bool denBat = false;
bool denDoBat = false;
int gocServoHienTai = -1;
unsigned long tServoBatDau = 0;
bool servoDangQuay = false;

bool coLua = false;
unsigned long tBatDauLua = 0;
unsigned long tLuaCuoi = 0;

int demDatKho = 0;
int soLanTuoi = 0;
bool khoaBom = false;

bool canKhoiPhucLCD = false;
int lcdCheDo = -1;

bool coiBat = false;

bool dangGiuNut = false;
bool daXuLyGiuNut = false;
unsigned long tBatDauNhanNut = 0;
unsigned long tNutCuoi = 0;
unsigned long tTatDenBangNut = 0;
unsigned long tMuaCuoi = 0;

unsigned long tLua = 0, tDat = 0, tMua = 0, tLCD = 0, tSerial = 0, tDHT = 0;
unsigned long tBom = 0, tTatBom = 0, tCoi = 0, tLED = 0;

// ============================================================
//  HÀM TIỆN ÍCH & ĐIỀU KHIỂN CHUNG (SẴN SÀNG CHO WI-FI / MQTT)
// ============================================================

// Hàm bật/tắt đèn trắng dùng chung cho cả Nút bấm vật lý lẫn Wi-Fi/MQTT từ xa
void datTrangThaiDen(bool bat) {
  denBat = bat;
  if (!bat) {
    // Khi tắt đèn (bằng nút hoặc qua Web), khóa PIR tạm 5 giây để rút tay ra không bị bật lại ngay
    tTatDenBangNut = millis();
  }
}

// Hàm bật/tắt chế độ tự động của cảm biến PIR (có tiếng Bíp báo hiệu)
void datCheDoKhoaPIR(bool khoa) {
  khoaPIR = khoa;
  if (khoaPIR) {
    // Đã KHÓA cảm biến PIR -> Tắt đèn và kêu 1 tiếng BÍP DÀI (300ms)
    denBat = false;
    digitalWrite(BUZZER_PIN, HIGH);
    delay(300);
    digitalWrite(BUZZER_PIN, LOW);
  } else {
    // Đã MỞ LẠI cảm biến PIR -> Khóa tạm 3s để rút tay và kêu 2 tiếng BÍP-BÍP ngắn
    tTatDenBangNut = millis();
    for (int i = 0; i < 2; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(80);
      digitalWrite(BUZZER_PIN, LOW);
      if (i == 0) delay(90);
    }
  }
}

int docTrungBinh(int pin, int n) {
  long tong = 0;
  for (int i = 0; i < n; i++) tong += analogRead(pin);
  return tong / n;
}

void quayServo(int goc) {
  goc = constrain(goc, 0, 180);
  if (goc == gocServoHienTai) return;
  gocServoHienTai = goc;
  int duty = map(goc, 0, 180, 102, 491);
  ledcWrite(SERVO_PIN, duty);
  tServoBatDau = millis();
  servoDangQuay = true;
}

void inLCD(uint8_t hang, const char* s) {
  lcd.setCursor(0, hang);
  uint8_t i = 0;
  while (s[i] && i < 16) { lcd.print(s[i]); i++; }
  while (i < 16) { lcd.print(' '); i++; }
}

void veManHinhBinhThuong(bool bomOn) {
  char d1[20], d2[20];
  snprintf(d1, sizeof(d1), "T:%.1fC Am:%.0f%%", nhietDo, doAmKhi);
  const char* tt = bomOn ? "BOM:ON" :
                   (coMua ? "MUA:THU" :
                   (khoaBom ? "LOI:DAT" :
                   (khoaPIR ? "PIR:OFF" :
                   (coNguoi ? "PIR:CO" : "PIR:KO"))));
  snprintf(d2, sizeof(d2), "Dat:%d%% %s", phanTramDat, tt);
  inLCD(0, d1);
  inLCD(1, d2);
}

void quetI2C() {
  Serial.println("\n================ KIEM TRA KET NOI PHAN CUNG ================");
  int count = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("[OK] Phat hien thiet bi I2C tai 0x");
      if (addr < 16) Serial.print("0");
      Serial.print(addr, HEX);
      if (addr == 0x27 || addr == 0x3F) Serial.print(" -> Man hinh LCD1602");
      if (addr == 0x38) Serial.print(" -> Cam bien Nhiet/Am DHT20");
      Serial.println();
      count++;
    }
  }
  if (count == 0) Serial.println("[LOI] Chua tim thay thiet bi I2C!");
  Serial.println("============================================================");
}

// ============================================================
//  CẢM BIẾN LỬA (Active-LOW: tụt xuống dưới 15 là có lửa)
// ============================================================
void capNhatLua() {
  giaTriLua = docTrungBinh(FLAME_PIN, 8);
  unsigned long now = millis();

  if (giaTriLua < NGUONG_LUA) {
    tLuaCuoi = now;
    if (tBatDauLua == 0) tBatDauLua = now;
    if (!coLua && (now - tBatDauLua >= TG_XAC_NHAN_LUA)) coLua = true;
  } else {
    tBatDauLua = 0;
    if (coLua && (now - tLuaCuoi >= TG_GIU_BAO)) coLua = false;
  }
}

// ============================================================
//  NÚT BẤM THÔNG MINH (IO25):
//  - Bấm nhả nhanh (< 1.2s): Bật / Tắt Đèn Trắng
//  - Đè giữ (>= 1.2s): Kêu Bíp -> Tắt / Bật cảm biến chuyển động PIR
// ============================================================
void capNhatNutBam() {
  if (bomState == BOM_CHAY || canKhoiPhucLCD || (millis() - tTatBom < 1500)) {
    dangGiuNut = false;
    return;
  }

  bool nutHienTai = digitalRead(BUTTON_PIN);
  unsigned long now = millis();

  if (!dangGiuNut) {
    // Phát hiện bắt đầu nhấn nút xuống (có lọc nhiễu 60ms)
    if (nutHienTai == LOW && (now - tNutCuoi > 250)) {
      delay(60);
      if (digitalRead(BUTTON_PIN) == LOW) {
        dangGiuNut = true;
        daXuLyGiuNut = false;
        tBatDauNhanNut = millis();
      }
    }
  } else {
    if (nutHienTai == LOW) {
      // Đang đè giữ nút: Nếu giữ đủ 1.2 giây thì kêu Bíp và Đảo chế độ Khóa PIR ngay!
      if (!daXuLyGiuNut && (now - tBatDauNhanNut >= TG_DE_GIU_NUT)) {
        daXuLyGiuNut = true;
        datCheDoKhoaPIR(!khoaPIR);
      }
    } else {
      // Vừa thả nút ra
      tNutCuoi = now;
      if (!daXuLyGiuNut) {
        // Nếu thả ra trước 1.2 giây -> Là cú bấm nhả ngắn: Bật / Tắt Đèn Trắng
        datTrangThaiDen(!denBat);
      }
      dangGiuNut = false;
    }
  }
}

// ============================================================
//  CẢM BIẾN MƯA & SERVO THU ĐỒ (CÓ LỌC NHIỄU ĐỤNG DÂY 100%)
// ============================================================
void capNhatMuaVaServo() {
  if (servoDangQuay && (millis() - tServoBatDau >= 600)) {
    ledcWrite(SERVO_PIN, 0);
    servoDangQuay = false;
  }

  if (bomState == BOM_CHAY || canKhoiPhucLCD || servoDangQuay) return;

  if (digitalRead(RAIN_PIN) == LOW) {
    tMuaCuoi = millis();
    if (demCoMua < 10) demCoMua++;
    // Phải có nước mưa liên tục 3 lần đọc (0.6 giây) mới tính là Có Mưa!
    if (demCoMua >= 3) {
      coMua = true;
    }
  } else {
    demCoMua = 0;
    if (coMua && (millis() - tMuaCuoi >= 2000)) {
      coMua = false;
    }
  }
  quayServo(coMua ? GOC_THU_DO : GOC_PHOI_DO);
}

// ============================================================
//  1. ĐÈN TRẮNG CHIẾU SÁNG (MKE-M01 - IO32)
//  - Nếu KHÔNG khóa PIR (!khoaPIR): Thấy người bước vào -> Tự bật Đèn sáng giữ luôn!
//  - Nếu ĐÃ khóa PIR (khoaPIR): Có người đi qua đèn cũng không tự bật (chỉ bật/tắt bằng nút)
// ============================================================
void dieuKhienDen() {
  if (!khoaPIR && !denBat && coNguoi && !pirTruoc &&
      (tTatDenBangNut == 0 || (millis() - tTatDenBangNut > 5000))) {
    denBat = true;
  }
  pirTruoc = coNguoi;

  if (denBat) {
    pinMode(LIGHT_PIN, OUTPUT);
    digitalWrite(LIGHT_PIN, HIGH);
  } else {
    pinMode(LIGHT_PIN, INPUT);
  }
}

// ============================================================
//  2. CỤM 2 ĐÈN ĐỎ CẢNH BÁO CHÁY & BÁO BƠM (IO14)
// ============================================================
void dieuKhienDenCanhBao() {
  if (coLua) {
    denDoBat = coiBat;                        // Có cháy: chớp nhanh theo còi
  } else if (bomState == BOM_CHAY) {
    denDoBat = ((millis() / 250) % 2 == 0);   // Đang bơm: chớp mỗi 0.25s
  } else {
    denDoBat = false;                         // Bình thường: tắt hẳn
  }
  digitalWrite(ALARM_LED_PIN, denDoBat ? HIGH : LOW);
}

// ============================================================
//  CẢM BIẾN ĐỘ ẨM ĐẤT & MÁY BƠM
// ============================================================
void capNhatDat() {
  if (bomState == BOM_CHAY) return;

  rawDat = docTrungBinh(SOIL_PIN, 8);
  phanTramDat = constrain(map(rawDat, 4095, 1300, 0, 100), 0, 100);

  if (phanTramDat < NGUONG_DAT_KHO) {
    if (demDatKho < 100) demDatKho++;
  } else {
    demDatKho = 0;
  }

  if (phanTramDat >= NGUONG_DAT_UOT) {
    soLanTuoi = 0;
    khoaBom = false;
  }
}

void batDauBom() {
  if (soLanTuoi >= SO_LAN_TUOI_TOI_DA) {
    khoaBom = true;
    return;
  }
  soLanTuoi++;

  veManHinhBinhThuong(true);
  delay(50);

  digitalWrite(RELAY_PIN, RELAY_ON);
  bomState = BOM_CHAY;
  tBom = millis();
}

void tatBom() {
  digitalWrite(RELAY_PIN, RELAY_OFF);
  bomState = BOM_CHO;
  tTatBom = millis();
  canKhoiPhucLCD = true;
}

void capNhatBom() {
  unsigned long now = millis();
  switch (bomState) {
    case BOM_NGHI:
      if (!coLua && !khoaBom && demDatKho >= SO_LAN_DAT_KHO_XAC_NHAN) batDauBom();
      break;
    case BOM_CHAY:
      if (coLua || (now - tBom >= TG_BOM_CHAY)) tatBom();
      break;
    case BOM_CHO:
      if (now - tTatBom >= TG_BOM_NGHI) {
        bomState = BOM_NGHI;
        demDatKho = 0;
      }
      break;
  }
}

// ============================================================
//  DHT20, CÒI, LCD, LED, SERIAL
// ============================================================
void capNhatDHT() {
  if (bomState == BOM_CHAY || canKhoiPhucLCD) return;
  unsigned long now = millis();
  if (now - tDHT < 1500) return;
  tDHT = now;

  if (dht20.read() == DHT20_OK) {
    nhietDo = dht20.getTemperature();
    doAmKhi = dht20.getHumidity();
  }
}

void dieuKhienCoi() {
  if (!coLua) {
    digitalWrite(BUZZER_PIN, LOW);
    coiBat = false;
    return;
  }
  unsigned long now = millis();
  if (coiBat && (now - tCoi >= 150)) {
    coiBat = false;
    digitalWrite(BUZZER_PIN, LOW);
    tCoi = now;
  } else if (!coiBat && (now - tCoi >= 100)) {
    coiBat = true;
    digitalWrite(BUZZER_PIN, HIGH);
    tCoi = now;
  }
}

void capNhatLCD() {
  if (bomState == BOM_CHAY) return;

  unsigned long now = millis();
  if (canKhoiPhucLCD) {
    if (now - tTatBom < 150) return;
    lcd.init();
    lcd.backlight();
    lcd.clear();
    canKhoiPhucLCD = false;
    lcdCheDo = -1;
  }

  if (now - tLCD < 300) return;
  tLCD = now;

  int cheDo = coLua ? 1 : 0;
  if (cheDo != lcdCheDo) {
    lcd.clear();
    lcdCheDo = cheDo;
  }

  if (coLua) {
    lcd.backlight();
    inLCD(0, "!! CANH BAO !!");
    inLCD(1, "PHAT HIEN LUA!");
  } else {
    veManHinhBinhThuong(false);
  }
}

void nhapNhayLED() {
  static bool trangThai = false;
  if (millis() - tLED >= 500) {
    tLED = millis();
    trangThai = !trangThai;
    digitalWrite(LED_PIN, trangThai);
  }
}

void inSerial() {
  if (millis() - tSerial < 500) return;
  tSerial = millis();

  const char* bom = (bomState == BOM_CHAY) ? "ON" : "OFF";
  const char* ttPir = khoaPIR ? "KHOA" : (coNguoi ? "CO" : "KO");
  Serial.printf("Nhiet:%.1f*C | AmKhi:%.0f%% | Dat:%d%% | PIR:%s | Mua:%s | DenTrang:%s | DenDo:%s | Lua:%d | Bom:%s",
                nhietDo, doAmKhi, phanTramDat,
                ttPir,
                coMua ? "CO_MUA" : "Kho",
                denBat ? "ON" : "OFF",
                denDoBat ? "NHAY" : "OFF",
                giaTriLua, bom);
  if (khoaBom) Serial.print(" [KHOA BOM]");
  if (coLua)   Serial.print(" ==> [BAO CHAY!]");
  Serial.println();
}

// ============================================================
//  SETUP & LOOP
// ============================================================
void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_OFF);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  pinMode(LIGHT_PIN, INPUT);
  pinMode(ALARM_LED_PIN, OUTPUT);
  digitalWrite(ALARM_LED_PIN, LOW);

  pinMode(LED_PIN, OUTPUT);
  pinMode(FLAME_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT_PULLUP);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  ledcAttach(SERVO_PIN, 50, 12);
  quayServo(GOC_PHOI_DO);

  Wire.begin(21, 22);
  Wire.setClock(50000);
  delay(200);

  quetI2C();

  dht20.begin();
  lcd.init();
  lcd.backlight();

  inLCD(0, "SMART HOME ESP32");
  inLCD(1, "HE THONG ON DINH");

  if (dht20.read() == DHT20_OK) {
    nhietDo = dht20.getTemperature();
    doAmKhi = dht20.getHumidity();
  }
  tDHT = millis();
  capNhatDat();

  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(ALARM_LED_PIN, HIGH);
  delay(120);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(ALARM_LED_PIN, LOW);

  delay(600);
  lcd.clear();
  lcdCheDo = -1;
}

void loop() {
  unsigned long now = millis();

  coNguoi = (digitalRead(PIR_PIN) == HIGH);

  capNhatNutBam();
  if (now - tLua >= 100) { tLua = now; capNhatLua(); }
  if (now - tDat >= 500) { tDat = now; capNhatDat(); }
  if (now - tMua >= 200) { tMua = now; capNhatMuaVaServo(); }

  capNhatBom();
  capNhatDHT();
  dieuKhienCoi();
  dieuKhienDen();
  dieuKhienDenCanhBao();
  capNhatLCD();
  nhapNhayLED();
  inSerial();
}
