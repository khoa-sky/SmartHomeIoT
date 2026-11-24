#include <WiFi.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT20.h>

// ============================================================
//  SMART HOME & GARDEN ESP32 (Vietduino) - BẢN FULL WI-FI & MQTT
//  - Không cần cài thêm thư viện ngoài (Tích hợp sẵn MQTT 3.1.1 trên WiFiClient)
//  - Tương thích 100% với MQTTX, Backend C# (.NET) và Giao diện React
//  - Hoạt động Offline-First: Mất Wi-Fi mạch vẫn chạy độc lập 100% không bị đơ!
// ============================================================

// ---------- CẤU HÌNH WI-FI & MQTT BROKER ----------
const char* WIFI_SSID     = "TEN_WIFI_CUA_BAN";      // <-- Điền tên Wi-Fi (2.4GHz) của bạn
const char* WIFI_PASSWORD = "MAT_KHAU_WIFI_CUA_BAN"; // <-- Điền mật khẩu Wi-Fi của bạn

const char* MQTT_HOST     = "broker.emqx.io";        // Hoặc IP máy tính chạy Local Broker
const uint16_t MQTT_PORT  = 1883;
const char* TOPIC_TELEMETRY = "smarthome/khoa2026/telemetry";
const char* TOPIC_COMMAND   = "smarthome/khoa2026/command";

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

const int GOC_PHOI_DO = 15;                  // Trời nắng: đưa đồ ra ngoài (lùi khỏi chốt 0 độ)
const int GOC_THU_DO  = 165;                 // Trời mưa: thu đồ vào mái hiên (lùi khỏi chốt 180 độ)
const unsigned long TG_CHO_HET_MUA = 2000;   // Lau khô mưa sau 2 giây (2000ms) thì đưa đồ ra lại
const unsigned long TG_DE_GIU_NUT  = 1200;   // Đè giữ nút 1.2 giây (1200ms) để Khóa/Mở cảm biến PIR

// ---------- ĐỐI TƯỢNG ----------
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT20 dht20;
WiFiClient wifiClient;

// ---------- TRẠNG THÁI ----------
enum BomState { BOM_NGHI, BOM_CHAY, BOM_CHO };
BomState bomState = BOM_NGHI;

enum ServoMode { SERVO_AUTO, SERVO_FORCE_OUT, SERVO_FORCE_IN };
ServoMode servoMode = SERVO_AUTO;

int giaTriLua = 4095, rawDat = 4095, phanTramDat = 100;
float nhietDo = 0.0, doAmKhi = 0.0;
bool coNguoi = false, pirTruoc = false, khoaPIR = false;
bool coMua = false;
int demCoMua = 0;
bool denBat = false, denDoBat = false;
int gocServoHienTai = -1;
unsigned long tServoBatDau = 0;
bool servoDangQuay = false;

bool coLua = false;
unsigned long tBatDauLua = 0, tLuaCuoi = 0;

bool testBaoDong = false;
unsigned long tBatDauTestBaoDong = 0;

int demDatKho = 0, soLanTuoi = 0;
bool khoaBom = false;

bool canKhoiPhucLCD = false;
int lcdCheDo = -1;
bool coiBat = false;

bool dangGiuNut = false, daXuLyGiuNut = false;
unsigned long tBatDauNhanNut = 0, tNutCuoi = 0, tTatDenBangNut = 0, tMuaCuoi = 0;
unsigned long tLua = 0, tDat = 0, tMua = 0, tLCD = 0, tSerial = 0, tDHT = 0;
unsigned long tBom = 0, tTatBom = 0, tCoi = 0, tLED = 0;

bool mqttConnected = false;
unsigned long tMqttReconnect = 0, tMqttPub = 0, tMqttPing = 0;
bool canGuiCapNhatNgay = false;

// ============================================================
//  HÀM ĐIỀU KHIỂN THIẾT BỊ DÙNG CHUNG (NÚT VẬT LÝ & WI-FI MQTT)
// ============================================================
void datTrangThaiDen(bool bat) {
  denBat = bat;
  if (!bat) tTatDenBangNut = millis();
  canGuiCapNhatNgay = true;
}

void datCheDoKhoaPIR(bool khoa) {
  khoaPIR = khoa;
  if (khoaPIR) {
    denBat = false;
    digitalWrite(BUZZER_PIN, HIGH);
    delay(300);
    digitalWrite(BUZZER_PIN, LOW);
  } else {
    tTatDenBangNut = millis();
    for (int i = 0; i < 2; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(80);
      digitalWrite(BUZZER_PIN, LOW);
      if (i == 0) delay(90);
    }
  }
  canGuiCapNhatNgay = true;
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
  canGuiCapNhatNgay = true;
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
//  CẢM BIẾN LỬA, NÚT BẤM, MƯA & SERVO, ĐÈN, ĐẤT & BƠM
// ============================================================
void capNhatLua() {
  giaTriLua = docTrungBinh(FLAME_PIN, 8);
  unsigned long now = millis();
  if (giaTriLua < NGUONG_LUA) {
    tLuaCuoi = now;
    if (tBatDauLua == 0) tBatDauLua = now;
    if (!coLua && (now - tBatDauLua >= TG_XAC_NHAN_LUA)) {
      coLua = true;
      canGuiCapNhatNgay = true;
    }
  } else {
    tBatDauLua = 0;
    if (coLua && (now - tLuaCuoi >= TG_GIU_BAO)) {
      coLua = false;
      canGuiCapNhatNgay = true;
    }
  }
}

void capNhatNutBam() {
  if (bomState == BOM_CHAY || canKhoiPhucLCD || (millis() - tTatBom < 1500)) {
    dangGiuNut = false;
    return;
  }
  bool nutHienTai = digitalRead(BUTTON_PIN);
  unsigned long now = millis();

  if (!dangGiuNut) {
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
      if (!daXuLyGiuNut && (now - tBatDauNhanNut >= TG_DE_GIU_NUT)) {
        daXuLyGiuNut = true;
        datCheDoKhoaPIR(!khoaPIR);
      }
    } else {
      tNutCuoi = now;
      if (!daXuLyGiuNut) datTrangThaiDen(!denBat);
      dangGiuNut = false;
    }
  }
}

void capNhatMuaVaServo() {
  if (servoDangQuay && (millis() - tServoBatDau >= 600)) {
    ledcWrite(SERVO_PIN, 0);
    servoDangQuay = false;
  }
  if (bomState == BOM_CHAY || canKhoiPhucLCD || servoDangQuay) return;

  if (digitalRead(RAIN_PIN) == LOW) {
    tMuaCuoi = millis();
    if (demCoMua < 10) demCoMua++;
    if (demCoMua >= 3 && !coMua) {
      coMua = true;
      canGuiCapNhatNgay = true;
    }
  } else {
    demCoMua = 0;
    if (coMua && (millis() - tMuaCuoi >= TG_CHO_HET_MUA)) {
      coMua = false;
      canGuiCapNhatNgay = true;
    }
  }

  if (servoMode == SERVO_FORCE_OUT) {
    quayServo(GOC_PHOI_DO);
  } else if (servoMode == SERVO_FORCE_IN) {
    quayServo(GOC_THU_DO);
  } else {
    quayServo(coMua ? GOC_THU_DO : GOC_PHOI_DO);
  }
}

void dieuKhienDen() {
  if (!khoaPIR && !denBat && coNguoi && !pirTruoc &&
      (tTatDenBangNut == 0 || (millis() - tTatDenBangNut > 5000))) {
    denBat = true;
    canGuiCapNhatNgay = true;
  }
  pirTruoc = coNguoi;

  if (denBat) {
    pinMode(LIGHT_PIN, OUTPUT);
    digitalWrite(LIGHT_PIN, HIGH);
  } else {
    pinMode(LIGHT_PIN, INPUT);
  }
}

void dieuKhienDenCanhBao() {
  if (testBaoDong && (millis() - tBatDauTestBaoDong >= 2000)) {
    testBaoDong = false;
  }

  if (coLua || testBaoDong) {
    denDoBat = coiBat;
  } else if (bomState == BOM_CHAY) {
    denDoBat = ((millis() / 250) % 2 == 0);
  } else {
    denDoBat = false;
  }
  digitalWrite(ALARM_LED_PIN, denDoBat ? HIGH : LOW);
}

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
    canGuiCapNhatNgay = true;
    return;
  }
  soLanTuoi++;
  veManHinhBinhThuong(true);
  delay(50);
  digitalWrite(RELAY_PIN, RELAY_ON);
  bomState = BOM_CHAY;
  tBom = millis();
  canGuiCapNhatNgay = true;
}

void tatBom() {
  digitalWrite(RELAY_PIN, RELAY_OFF);
  bomState = BOM_CHO;
  tTatBom = millis();
  canKhoiPhucLCD = true;
  canGuiCapNhatNgay = true;
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
  if (!coLua && !testBaoDong) {
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

// ============================================================
//  BỘ GIAO TIẾP MQTT 3.1.1 TÍCH HỢP SẴN (KHÔNG CẦN THƯ VIỆN NGOÀI)
// ============================================================
void mqttWriteLength(uint8_t* buf, int& idx, int len) {
  do {
    uint8_t d = len % 128;
    len /= 128;
    if (len > 0) d |= 0x80;
    buf[idx++] = d;
  } while (len > 0);
}

bool mqttPublish(const char* topic, const char* payload) {
  if (!wifiClient.connected()) return false;
  int tLen = strlen(topic);
  int pLen = strlen(payload);
  int remLen = 2 + tLen + pLen;
  uint8_t header[8];
  int hIdx = 0;
  header[hIdx++] = 0x30; // PUBLISH QoS 0
  mqttWriteLength(header, hIdx, remLen);
  header[hIdx++] = (tLen >> 8) & 0xFF;
  header[hIdx++] = tLen & 0xFF;

  wifiClient.write(header, hIdx);
  wifiClient.write((const uint8_t*)topic, tLen);
  wifiClient.write((const uint8_t*)payload, pLen);
  return true;
}

bool mqttSubscribe(const char* topic) {
  if (!wifiClient.connected()) return false;
  int tLen = strlen(topic);
  int remLen = 2 + 2 + tLen + 1;
  uint8_t pkt[128];
  int idx = 0;
  pkt[idx++] = 0x82; // SUBSCRIBE
  mqttWriteLength(pkt, idx, remLen);
  pkt[idx++] = 0x00; pkt[idx++] = 0x01; // Packet ID 1
  pkt[idx++] = (tLen >> 8) & 0xFF;
  pkt[idx++] = tLen & 0xFF;
  memcpy(&pkt[idx], topic, tLen);
  idx += tLen;
  pkt[idx++] = 0x00; // QoS 0
  wifiClient.write(pkt, idx);
  return true;
}

void xuLyLenhMqtt(const String& json) {
  Serial.println("[MQTT NHAN LENH] " + json);

  if (json.indexOf("\"LIGHT\"") >= 0) {
    if (json.indexOf("\"ON\"") >= 0 || json.indexOf("true") >= 0) datTrangThaiDen(true);
    else if (json.indexOf("\"OFF\"") >= 0 || json.indexOf("false") >= 0) datTrangThaiDen(false);
    else if (json.indexOf("\"TOGGLE\"") >= 0) datTrangThaiDen(!denBat);
  }
  else if (json.indexOf("\"PIR_LOCK\"") >= 0) {
    if (json.indexOf("\"UNLOCK\"") >= 0 || json.indexOf("false") >= 0) datCheDoKhoaPIR(false);
    else if (json.indexOf("\"LOCK\"") >= 0 || json.indexOf("true") >= 0) datCheDoKhoaPIR(true);
    else if (json.indexOf("\"TOGGLE\"") >= 0) datCheDoKhoaPIR(!khoaPIR);
  }
  else if (json.indexOf("\"SERVO\"") >= 0) {
    if (json.indexOf("\"OUT\"") >= 0) { servoMode = SERVO_FORCE_OUT; quayServo(GOC_PHOI_DO); }
    else if (json.indexOf("\"IN\"") >= 0) { servoMode = SERVO_FORCE_IN; quayServo(GOC_THU_DO); }
    else if (json.indexOf("\"AUTO\"") >= 0) { servoMode = SERVO_AUTO; canGuiCapNhatNgay = true; }
  }
  else if (json.indexOf("\"PUMP\"") >= 0) {
    if (json.indexOf("\"UNLOCK\"") >= 0) {
      khoaBom = false;
      soLanTuoi = 0;
      canGuiCapNhatNgay = true;
    } else if (json.indexOf("\"START\"") >= 0) {
      khoaBom = false;
      if (bomState != BOM_CHAY) batDauBom();
    } else if (json.indexOf("\"STOP\"") >= 0) {
      if (bomState == BOM_CHAY) tatBom();
    }
  }
  else if (json.indexOf("\"ALARM_TEST\"") >= 0) {
    if (json.indexOf("\"OFF\"") >= 0 || json.indexOf("false") >= 0) {
      testBaoDong = false;
    } else {
      testBaoDong = true;
      tBatDauTestBaoDong = millis();
    }
    canGuiCapNhatNgay = true;
  }
}

void docGoiTinMqtt() {
  while (wifiClient.connected() && wifiClient.available() >= 2) {
    uint8_t type = wifiClient.read();
    int mult = 1, remLen = 0;
    uint8_t enc;
    do {
      if (!wifiClient.available()) return;
      enc = wifiClient.read();
      remLen += (enc & 127) * mult;
      mult *= 128;
    } while ((enc & 128) != 0);

    uint8_t buf[512];
    int nRead = 0;
    unsigned long tWait = millis();
    while (nRead < remLen && (millis() - tWait < 50)) {
      if (wifiClient.available()) {
        int c = wifiClient.read();
        if (nRead < 511) buf[nRead] = (uint8_t)c;
        nRead++;
      }
    }

    // Nếu là gói tin PUBLISH (0x30..0x3F)
    if ((type & 0xF0) == 0x30 && nRead >= 2) {
      int topicLen = (buf[0] << 8) | buf[1];
      int payloadStart = 2 + topicLen;
      if (((type >> 1) & 0x03) > 0) payloadStart += 2; // Bỏ qua Packet ID nếu QoS > 0
      if (payloadStart < nRead && payloadStart < 511) {
        buf[min(nRead, 511)] = '\0';
        String payload = String((char*)&buf[payloadStart]);
        xuLyLenhMqtt(payload);
      }
    }
  }
}

void guiTelemetryMqtt() {
  if (!mqttConnected || !wifiClient.connected()) return;
  const char* svMode = (servoMode == SERVO_FORCE_OUT) ? "OUT" :
                       ((servoMode == SERVO_FORCE_IN) ? "IN" : "AUTO");
  char json[380];
  snprintf(json, sizeof(json),
    "{\"temp\":%.1f,\"hum\":%.0f,\"soil\":%d,\"flame\":%d,\"fireAlert\":%s,"
    "\"pir\":%s,\"pirLocked\":%s,\"rain\":%s,\"servoAngle\":%d,\"servoMode\":\"%s\","
    "\"lightOn\":%s,\"redLedOn\":%s,\"pumpOn\":%s,\"pumpLocked\":%s,\"pumpCount\":%d}",
    nhietDo, doAmKhi, phanTramDat, giaTriLua, coLua ? "true" : "false",
    coNguoi ? "true" : "false", khoaPIR ? "true" : "false",
    coMua ? "true" : "false", gocServoHienTai, svMode,
    denBat ? "true" : "false", denDoBat ? "true" : "false",
    (bomState == BOM_CHAY) ? "true" : "false", khoaBom ? "true" : "false", soLanTuoi
  );
  mqttPublish(TOPIC_TELEMETRY, json);
}

void capNhatWiFiVaMqtt() {
  if (bomState == BOM_CHAY || servoDangQuay) return; // Ưu tiên phần cứng tuyệt đối khi bơm/servo đang chạy

  if (WiFi.status() != WL_CONNECTED) {
    mqttConnected = false;
    return;
  }

  unsigned long now = millis();
  if (!wifiClient.connected()) {
    mqttConnected = false;
    if (now - tMqttReconnect < 5000) return; // Thử kết nối lại mỗi 5 giây
    tMqttReconnect = now;

    wifiClient.setTimeout(1);
    if (wifiClient.connect(MQTT_HOST, MQTT_PORT, 400)) {
      String clientId = "VietduinoESP32-" + String((uint32_t)ESP.getEfuseMac(), HEX);
      int idLen = clientId.length();
      int remLen = 10 + 2 + idLen;
      uint8_t pkt[64];
      int idx = 0;
      pkt[idx++] = 0x10; // CONNECT
      mqttWriteLength(pkt, idx, remLen);
      pkt[idx++] = 0x00; pkt[idx++] = 0x04;
      pkt[idx++] = 'M';  pkt[idx++] = 'Q'; pkt[idx++] = 'T'; pkt[idx++] = 'T';
      pkt[idx++] = 0x04; // Protocol Level 4 (MQTT 3.1.1)
      pkt[idx++] = 0x02; // Clean Session
      pkt[idx++] = 0x00; pkt[idx++] = 30; // Keep Alive 30s
      pkt[idx++] = (idLen >> 8) & 0xFF;
      pkt[idx++] = idLen & 0xFF;
      memcpy(&pkt[idx], clientId.c_str(), idLen);
      idx += idLen;
      wifiClient.write(pkt, idx);

      delay(50);
      if (wifiClient.available() >= 4) {
        uint8_t b1 = wifiClient.read();
        uint8_t b2 = wifiClient.read();
        uint8_t b3 = wifiClient.read();
        uint8_t rc = wifiClient.read();
        if (b1 == 0x20 && rc == 0x00) {
          mqttConnected = true;
          mqttSubscribe(TOPIC_COMMAND);
          Serial.printf("[MQTT OK] Da ket noi %s:%d | Subscribed: %s\n", MQTT_HOST, MQTT_PORT, TOPIC_COMMAND);
          canGuiCapNhatNgay = true;
        }
      }
    }
    return;
  }

  docGoiTinMqtt();

  if (canGuiCapNhatNgay || (now - tMqttPub >= 1000)) {
    tMqttPub = now;
    canGuiCapNhatNgay = false;
    guiTelemetryMqtt();
  }

  if (now - tMqttPing >= 15000) {
    tMqttPing = now;
    const uint8_t pingReq[2] = {0xC0, 0x00};
    wifiClient.write(pingReq, 2);
  }
}

void inSerial() {
  if (millis() - tSerial < 500) return;
  tSerial = millis();

  const char* bom = (bomState == BOM_CHAY) ? "ON" : "OFF";
  const char* ttPir = khoaPIR ? "KHOA" : (coNguoi ? "CO" : "KO");
  const char* net = (WiFi.status() == WL_CONNECTED) ? (mqttConnected ? "MQTT:OK" : "WIFI:OK") : "OFFLINE";

  Serial.printf("[%s] Nhiet:%.1f*C | AmKhi:%.0f%% | Dat:%d%% | PIR:%s | Mua:%s | DenTrang:%s | DenDo:%s | Lua:%d | Bom:%s",
                net, nhietDo, doAmKhi, phanTramDat, ttPir,
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

  pinMode(RELAY_PIN, OUTPUT);     digitalWrite(RELAY_PIN, RELAY_OFF);
  pinMode(BUZZER_PIN, OUTPUT);    digitalWrite(BUZZER_PIN, LOW);
  pinMode(LIGHT_PIN, INPUT);
  pinMode(ALARM_LED_PIN, OUTPUT); digitalWrite(ALARM_LED_PIN, LOW);

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
  inLCD(1, "KHOI DONG WIFI..");

  // Khởi động Wi-Fi chế độ chạy ngầm (Non-blocking: không dùng while() chờ tránh treo mạch!)
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

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
  capNhatWiFiVaMqtt();
  inSerial();
}
