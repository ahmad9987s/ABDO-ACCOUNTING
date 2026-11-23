-- ============================================================================
-- ABDO Restaurant — مخطط قاعدة البيانات (MySQL 8 / MariaDB 10.5+)
-- ============================================================================
-- مهم: البرنامج الحالي (الواجهة) لا يستخدم SQL؛ يحفظ بياناته في متصفح الجهاز
-- (localStorage) أو في قاعدة claude.ai عند تشغيله من رابطها. هذا الملف نموذج
-- لقاعدة بيانات علائقية مكافئة تماماً لبنية بيانات البرنامج، لاستخدامه عند بناء
-- خادم (PHP / Node.js ...) يربط الواجهة بقاعدة MySQL. لا يوجد في الحزمة خادم.
--
-- القواعد المحاسبية في البرنامج التي تعكسها الجداول والعروض هنا:
--  * الحذف "ناعم": تبقى الحركة وتُسجَّل deleted_by/deleted_at ولا تدخل في أي حساب.
--  * رصيد الطرف = مجموع حركاته بإشارة تعتمد على نوع الحركة (انظر v_party_balance).
--  * سند القيد (jv): ينقص رصيد party_id (من حساب) ويزيد رصيد to_party_id (إلى حساب).
--  * خصم/عمولة طريقة الدفع تُحسب على الإجمالي وتُخزَّن مع الطلب وقت البيع.
--  * مبيعات "الاستلام نقداً" تدخل الصندوق كاملة، والعمولة تُسجَّل على حساب المنصة.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS abdo_accounting
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE abdo_accounting;

-- ---------------------------------------------------------------- المستخدمون
CREATE TABLE users (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username         VARCHAR(60)  NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,        -- استخدم password_hash() أو bcrypt؛ لا تخزّن نصاً عادياً
  email            VARCHAR(190) NULL,
  is_admin         TINYINT(1)   NOT NULL DEFAULT 0,
  temp_code_hash   VARCHAR(255) NULL,            -- رمز مؤقت لاسترداد كلمة المرور
  temp_code_expires DATETIME    NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- الصلاحيات: pos pur exp pay rec jv st rp cfg us edit del
CREATE TABLE user_permissions (
  user_id     INT UNSIGNED NOT NULL,
  permission  ENUM('pos','pur','exp','pay','rec','jv','st','rp','cfg','us','edit','del') NOT NULL,
  PRIMARY KEY (user_id, permission),
  CONSTRAINT fk_perm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE password_reset_requests (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  requested_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('pending','done','ignored') NOT NULL DEFAULT 'pending',
  CONSTRAINT fk_rst_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------ الإعدادات
-- مفاتيح: phone, address, footer, business_day_hour, invoice_design (JSON),
--         theme (JSON), admin_recovery_key_hash
CREATE TABLE settings (
  setting_key   VARCHAR(60) PRIMARY KEY,
  setting_value TEXT NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------- شجرة الحسابات
CREATE TABLE accounts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(20)  NOT NULL UNIQUE,
  name       VARCHAR(150) NOT NULL,
  type       ENUM('asset','liab','eq','rev','exp') NOT NULL,   -- أصول، خصوم، حقوق ملكية، إيرادات، مصروفات
  parent_id  INT UNSIGNED NULL,
  CONSTRAINT fk_acc_parent FOREIGN KEY (parent_id) REFERENCES accounts(id)
) ENGINE=InnoDB;

-- ------------------------------------------- الأطراف (موردون، زبائن، حسابات...)
CREATE TABLE parties (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  kind        ENUM('sup','cust','exp','emp','own','plat','bank','cash','oth','dlv') NOT NULL,
  -- sup مورد | cust زبون | exp نوع مصروف | emp موظف | own شريك | plat منصة
  -- bank حساب بنكي | cash صندوق | oth حساب آخر | dlv شركة توصيل
  phone       VARCHAR(40)  NULL,
  notes       VARCHAR(255) NULL,
  account_id  INT UNSIGNED NULL,
  UNIQUE KEY uq_party (kind, name),
  CONSTRAINT fk_party_acc FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------- الأصناف
CREATE TABLE items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  price       DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost        DECIMAL(12,2) NOT NULL DEFAULT 0,
  category    VARCHAR(80)  NULL,
  image_path  VARCHAR(255) NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ------------------------------------------------------------- طرق الدفع والعمولة
CREATE TABLE payment_methods (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(80) NOT NULL UNIQUE,         -- نقدي، بنكي، WHEELS نقدي، WHEELS فيزا ...
  fee_percent   DECIMAL(6,3) NOT NULL DEFAULT 0,     -- نسبة الخصم/العمولة %
  platform_name VARCHAR(80)  NULL,                   -- WHEELS / SHINI GO أو NULL
  received_cash TINYINT(1)   NOT NULL DEFAULT 1      -- 1 يدخل الصندوق كاملاً، 0 يصل بنكياً بعد الخصم
) ENGINE=InnoDB;

-- ------------------------------------------------------------------- المبيعات
CREATE TABLE sales (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- رقم الفاتورة
  sale_date            DATE NOT NULL,                             -- اليوم التجاري
  sale_time            TIME NULL,
  payment_method_id    INT UNSIGNED NOT NULL,
  subtotal             DECIMAL(12,2) NOT NULL,
  discount             DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_fee         DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_company_id  INT UNSIGNED NULL,
  total                DECIMAL(12,2) NOT NULL,                    -- = subtotal - discount + delivery_fee
  fee                  DECIMAL(12,2) NOT NULL DEFAULT 0,          -- = total * fee_percent / 100
  net                  DECIMAL(12,2) NOT NULL,                    -- = total - fee
  customer_name        VARCHAR(120) NULL,
  note                 VARCHAR(255) NULL,
  footer_text          VARCHAR(255) NULL,
  created_by           INT UNSIGNED NULL,
  edited_by            INT UNSIGNED NULL,
  edited_at            DATETIME NULL,
  deleted_by           INT UNSIGNED NULL,
  deleted_at           DATETIME NULL,
  KEY ix_sales_date (sale_date),
  CONSTRAINT fk_sale_pm   FOREIGN KEY (payment_method_id)   REFERENCES payment_methods(id),
  CONSTRAINT fk_sale_dlv  FOREIGN KEY (delivery_company_id) REFERENCES parties(id),
  CONSTRAINT fk_sale_cb   FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_sale_eb   FOREIGN KEY (edited_by)  REFERENCES users(id),
  CONSTRAINT fk_sale_db   FOREIGN KEY (deleted_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE sale_lines (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id     INT UNSIGNED NOT NULL,
  item_name   VARCHAR(150) NOT NULL,                 -- نسخة من الاسم وقت البيع
  unit_price  DECIMAL(12,2) NOT NULL,
  unit_cost   DECIMAL(12,2) NOT NULL DEFAULT 0,
  qty         DECIMAL(10,3) NOT NULL,
  CONSTRAINT fk_line_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------- الحركات (مشتريات، مصاريف، سندات)
-- type: purchase مشتريات | pay سند صرف | cred بيع آجل | rec سند قبض | expense مصروف
--       salary راتب | xfer تحويل لشريك | ret إرجاع للصندوق | plat تحويل بنكي من منصة
--       jv سند قيد (party_id = من حساب، to_party_id = إلى حساب)
CREATE TABLE transactions (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tx_date      DATE NOT NULL,
  type         ENUM('purchase','pay','cred','rec','expense','salary','xfer','ret','plat','jv') NOT NULL,
  party_id     INT UNSIGNED NOT NULL,
  to_party_id  INT UNSIGNED NULL,
  amount       DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  note         VARCHAR(255) NULL,
  created_by   INT UNSIGNED NULL,
  edited_by    INT UNSIGNED NULL,
  edited_at    DATETIME NULL,
  deleted_by   INT UNSIGNED NULL,
  deleted_at   DATETIME NULL,
  KEY ix_tx_date (tx_date),
  KEY ix_tx_party (party_id),
  KEY ix_tx_to (to_party_id),
  CONSTRAINT fk_tx_party FOREIGN KEY (party_id)    REFERENCES parties(id),
  CONSTRAINT fk_tx_to    FOREIGN KEY (to_party_id) REFERENCES parties(id),
  CONSTRAINT fk_tx_cb    FOREIGN KEY (created_by)  REFERENCES users(id),
  CONSTRAINT fk_tx_eb    FOREIGN KEY (edited_by)   REFERENCES users(id),
  CONSTRAINT fk_tx_db    FOREIGN KEY (deleted_by)  REFERENCES users(id)
) ENGINE=InnoDB;

-- عدّ الصندوق الفعلي لكل فترة (يوم yyyy-mm-dd، أو شهر yyyy-mm، أو سنة yyyy)
CREATE TABLE cash_counts (
  period_key      VARCHAR(10) PRIMARY KEY,
  counted_amount  DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;

-- ============================================================================
-- عروض (Views) تعكس حسابات البرنامج
-- ============================================================================

-- رصيد كل طرف (نفس إشارات كشف الحساب في البرنامج)
CREATE VIEW v_party_balance AS
SELECT p.id AS party_id, p.name, p.kind,
  COALESCE(SUM(
    CASE
      WHEN t.type = 'jv'                    THEN CASE WHEN t.party_id = p.id THEN -t.amount ELSE t.amount END
      WHEN p.kind IN ('exp','emp')          THEN t.amount
      WHEN t.type IN ('purchase','cred','xfer') THEN t.amount
      WHEN t.type IN ('pay','rec','ret','plat') THEN -t.amount
      ELSE 0
    END), 0) AS balance
FROM parties p
LEFT JOIN transactions t
  ON (t.party_id = p.id OR t.to_party_id = p.id) AND t.deleted_at IS NULL
GROUP BY p.id, p.name, p.kind;

-- الديون: موجب = مستحق لنا، سالب = مستحق علينا (المورد معكوس الإشارة)
-- (أرصدة المنصات تُحسب من المبيعات: انظر v_platform_wallet)
CREATE VIEW v_debts AS
SELECT party_id, name, kind,
  CASE WHEN kind = 'sup' THEN -balance ELSE balance END AS owed_to_us
FROM v_party_balance
WHERE kind IN ('sup','cust','own')
  AND ABS(balance) > 0.004;

-- مبيعات يومية (بدون المحذوف)
CREATE VIEW v_daily_sales AS
SELECT s.sale_date,
       COUNT(*) AS orders,
       SUM(s.total) AS total,
       SUM(s.fee)   AS fees,
       SUM(s.net)   AS net
FROM sales s
WHERE s.deleted_at IS NULL
GROUP BY s.sale_date;

-- حساب المنصة: مبيعات الفيزا (صافي) - عمولة النقدي - ما حُوِّل (سندات plat + قيود منها/إليها)
CREATE VIEW v_platform_wallet AS
SELECT pm.platform_name AS platform,
  SUM(CASE WHEN pm.received_cash = 0 THEN s.total - s.fee ELSE 0 END) AS card_net,
  SUM(CASE WHEN pm.received_cash = 1 THEN s.fee           ELSE 0 END) AS cash_commission
FROM sales s
JOIN payment_methods pm ON pm.id = s.payment_method_id
WHERE s.deleted_at IS NULL AND pm.platform_name IS NOT NULL
GROUP BY pm.platform_name;

-- ============================================================================
-- استعلامات جاهزة (أمثلة)
-- ============================================================================
-- مطابقة الصندوق ليوم محدد (:d) — المعادلة كما في البرنامج:
--   مبيعات نقدية + سندات القبض - سندات الصرف + قيود إلى الصندوق - قيود من الصندوق
--
-- SELECT
--   COALESCE((SELECT SUM(s.total) FROM sales s JOIN payment_methods pm ON pm.id=s.payment_method_id
--             WHERE s.deleted_at IS NULL AND pm.received_cash=1 AND s.sale_date=:d),0)
-- + COALESCE((SELECT SUM(amount) FROM transactions WHERE deleted_at IS NULL AND type='rec'  AND tx_date=:d),0)
-- - COALESCE((SELECT SUM(amount) FROM transactions WHERE deleted_at IS NULL AND type='pay'  AND tx_date=:d),0)
-- + COALESCE((SELECT SUM(t.amount) FROM transactions t JOIN parties p ON p.id=t.to_party_id
--             WHERE t.deleted_at IS NULL AND t.type='jv' AND p.kind='cash' AND t.tx_date=:d),0)
-- - COALESCE((SELECT SUM(t.amount) FROM transactions t JOIN parties p ON p.id=t.party_id
--             WHERE t.deleted_at IS NULL AND t.type='jv' AND p.kind='cash' AND t.tx_date=:d),0)
--   AS expected_cash;
--
-- صافي الربح لشهر (:m بصيغة yyyy-mm): صافي المبيعات - المشتريات - (مصاريف + رواتب + سندات صرف لنوع مصروف/موظف)
--
-- SELECT
--   COALESCE((SELECT SUM(net) FROM sales WHERE deleted_at IS NULL AND DATE_FORMAT(sale_date,'%Y-%m')=:m),0)
-- - COALESCE((SELECT SUM(amount) FROM transactions WHERE deleted_at IS NULL AND type='purchase'
--             AND DATE_FORMAT(tx_date,'%Y-%m')=:m),0)
-- - COALESCE((SELECT SUM(t.amount) FROM transactions t JOIN parties p ON p.id=t.party_id
--             WHERE t.deleted_at IS NULL AND DATE_FORMAT(t.tx_date,'%Y-%m')=:m
--               AND (t.type IN ('expense','salary') OR (t.type='pay' AND p.kind IN ('exp','emp')))),0)
--   AS net_profit;
