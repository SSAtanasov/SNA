# LAB 5: ACCESS CONTROL LISTS (ACL)
## Контрол на мрежовия трафик и сигурност

**Цел:** Да се научите да създавате и прилагате ACL за контрол на достъпа между мрежи и VLAN-и.

**Продължителност:** 90-120 минути

**Prerequisite:** Завършени Lab 1-4

---

## ЩО Е ТО ACCESS CONTROL LIST (ACL)? 🎓

### Основна концепция

**ACL (Access Control List)** е **филтър за мрежов трафик** - като охранител на врата, който проверява кой може да влезе и кой не.

```
Аналогия: ACL е като нощен клуб със списък на гостите

┌─────────────────────────────┐
│    🚪 ENTRANCE (Router)     │
├─────────────────────────────┤
│ Bouncer (ACL):              │
│                             │
│ ✅ VIP John → ALLOW         │
│ ❌ Troublemaker Bob → DENY  │
│ ✅ Everyone else → ALLOW    │
└─────────────────────────────┘
```

### Защо имаме нужда от ACL?

**Без ACL (open network):**
```
┌────────────────────────────────────┐
│  Всички могат да достъпват всичко  │
│                                    │
│  Guest VLAN → Admin Server ✅      │
│  IT VLAN → Finance Database ✅     │
│  External → Internal Server ✅     │
│                                    │
│  ❌ НЯМА СИГУРНОСТ!                │
└────────────────────────────────────┘
```

**С ACL (controlled access):**
```
┌────────────────────────────────────┐
│  Достъпът е контролиран            │
│                                    │
│  Guest VLAN → Admin Server ❌      │
│  IT VLAN → Finance Database ✅     │
│  External → Internal Server ❌     │
│                                    │
│  ✅ ЗАЩИТА ЧРЕЗ ACL!               │
└────────────────────────────────────┘
```

---

## ВИДОВЕ ACL - ПОДРОБНО ОБЯСНЕНИЕ

### 1. Standard ACL (Стандартен ACL)

**Характеристики:**
- Филтрира **САМО** по **source IP адрес** (откъде идва трафикът)
- **НЕ** може да филтрира по destination, protocol, port
- По-прост, но ограничен
- ACL номера: **1-99** и **1300-1999**

```
Standard ACL логика:

Пакет пристига:
│
├─ Source IP е 192.168.10.11? → ДА → DENY ❌
├─ Source IP е 192.168.10.X? → ДА → PERMIT ✅
└─ Всички останали → Implicit DENY ❌
```

**Пример команда:**
```cisco
access-list 10 deny host 192.168.10.11
access-list 10 permit any
```

**Когато да използваме:**
- Когато ни интересува САМО откъде идва трафикът
- Когато искаме да блокираме/позволим **цяла мрежа**
- За SSH/Telnet access control (VTY линии)

**Къде да приложим:**
- **Близо до DESTINATION** (крайната точка)
- Защо? Защото филтрираме само по source, трябва да сме сигурни че трафикът вече е стигнал до правилното място

---

### 2. Extended ACL (Разширен ACL)

**Характеристики:**
- Филтрира по **МНОЖЕСТВО критерии:**
  - Source IP address
  - Destination IP address
  - Protocol (TCP, UDP, ICMP, IP)
  - Source port
  - Destination port
- Много по-мощен и гъвкав
- ACL номера: **100-199** и **2000-2699**

```
Extended ACL логика:

Пакет пристига:
│
├─ Source: 192.168.20.0/24? → ДА
│  ├─ Destination: 192.168.10.0/24? → ДА
│  │  ├─ Protocol: TCP? → ДА
│  │  │  ├─ Port: 80 (HTTP)? → ДА → PERMIT ✅
│  │  │  └─ Port: 23 (Telnet)? → ДА → DENY ❌
│  │  └─ Protocol: ICMP? → ДА → PERMIT ✅
│  └─ Destination: 192.168.30.0/24? → ДА → PERMIT ✅
└─ Всички останали → Implicit DENY ❌
```

**Пример команда:**
```cisco
access-list 100 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 80
```

**Когато да използваме:**
- Когато трябва детайлен контрол (protocol, port)
- Когато искаме да разрешим само конкретни услуги (HTTP, DNS, SSH)
- Когато филтрираме inter-VLAN трафик

**Къде да приложим:**
- **Близо до SOURCE** (началото на трафика)
- Защо? Защото искаме да спрем нежелания трафик възможно най-рано

---

### 3. Named ACL (Именован ACL)

**Характеристики:**
- Същото като Standard/Extended, но с **име** вместо номер
- По-четливо (вместо "ACL 100" → "BLOCK_TELNET")
- Лесно се редактира (можеш да добавяш/махаш правила)
- Модерен подход (препоръчителен!)

**Пример:**
```cisco
ip access-list extended ADMIN_ACCESS
 permit tcp 192.168.10.0 0.0.0.255 any eq 22
 deny ip any any
```

---

## ЩО Е ТО WILDCARD MASK? 🎭

### Subnet Mask vs Wildcard Mask

**Subnet Mask** и **Wildcard Mask** са **ОБРАТНИ** едно на друго!

| Концепция | Subnet Mask | Wildcard Mask |
|-----------|-------------|---------------|
| **Цел** | Дефинира мрежа | Дефинира кои битове да се **игнорират** |
| **Логика** | 1 = проверявай, 0 = не проверявай | 0 = проверявай, 1 = **игнорирай** |
| **Пример** | 255.255.255.0 | 0.0.0.255 |
| **Използване** | IP конфигурация | ACL филтриране |

---

### Как работи Wildcard Mask?

**Wildcard mask** казва на router-а: "Кои битове от IP адреса да **игнорирам** при сравнение?"

```
IP адрес:      192.168.10.50
Wildcard:      0.0.0.255
               │  │  │  │
               │  │  │  └─ 255 = игнорирай ВСИЧКИ битове (0-255)
               │  │  └──── 0 = проверявай ТОЧНО
               │  └─────── 0 = проверявай ТОЧНО
               └────────── 0 = проверявай ТОЧНО

Резултат: Съвпадат ВСИЧКИ адреси от 192.168.10.0 до 192.168.10.255
```

---

### Примери с Wildcard Masks

#### Пример 1: Цяла мрежа /24

**Искаме:** Всички адреси в 192.168.10.0/24

```
IP:       192.168.10.0
Wildcard: 0.0.0.255

Обяснение:
- 0.0.0 → Първите 3 октета ТРЯБВА да са 192.168.10
- 255 → Последният октет МОЖЕ ДА Е ВСИЧКО (0-255)

Съвпада с:
✅ 192.168.10.1
✅ 192.168.10.50
✅ 192.168.10.255
❌ 192.168.11.1 (различен 3-ти октет)
```

**В ACL:**
```cisco
access-list 10 permit 192.168.10.0 0.0.0.255
```

---

#### Пример 2: Един конкретен хост

**Искаме:** САМО 192.168.10.50 (нищо друго!)

```
IP:       192.168.10.50
Wildcard: 0.0.0.0

Обяснение:
- Всички 4 октета ТРЯБВА да съвпадат ТОЧНО
- Нищо не се игнорира

Съвпада с:
✅ 192.168.10.50
❌ 192.168.10.51
❌ 192.168.10.49
```

**В ACL:**
```cisco
access-list 10 permit host 192.168.10.50
! или
access-list 10 permit 192.168.10.50 0.0.0.0
```

**Кратък syntax:** `host 192.168.10.50` = `192.168.10.50 0.0.0.0`

---

#### Пример 3: Диапазон от адреси

**Искаме:** От 192.168.10.64 до 192.168.10.127 (64 адреса)

```
IP:       192.168.10.64
Wildcard: 0.0.0.63

Защо 63?
64 адреса = 2^6 = последните 6 бита
Binary: 00111111 = Decimal 63

Съвпада с:
✅ 192.168.10.64
✅ 192.168.10.100
✅ 192.168.10.127
❌ 192.168.10.63 (под диапазона)
❌ 192.168.10.128 (над диапазона)
```

---

#### Пример 4: Няколко мрежи едновременно

**Искаме:** 192.168.0.0, 192.168.1.0, 192.168.2.0, 192.168.3.0

```
IP:       192.168.0.0
Wildcard: 0.0.3.255

Защо?
3 = binary 00000011 (последните 2 бита на 3-тия октет)

Съвпада с:
✅ 192.168.0.X
✅ 192.168.1.X
✅ 192.168.2.X
✅ 192.168.3.X
❌ 192.168.4.X
```

---

#### Пример 5: Всички адреси (any)

**Искаме:** Абсолютно ВСИЧКИ IP адреси

```
IP:       0.0.0.0
Wildcard: 255.255.255.255

Обяснение:
- Всички битове се игнорират
- Съвпада с ВСИЧКО

Кратък syntax: any
```

**В ACL:**
```cisco
access-list 10 permit any
! или
access-list 10 permit 0.0.0.0 255.255.255.255
```

---

### Бърза формула: Subnet → Wildcard

```
Wildcard Mask = 255.255.255.255 - Subnet Mask

Пример:
Subnet Mask:  255.255.255.0
Wildcard:     255.255.255.255
            - 255.255.255.0
            ─────────────────
            = 0.0.0.255 ✅
```

**Таблица с често срещани:**

| Subnet Mask | Wildcard Mask | Какво означава |
|-------------|---------------|----------------|
| 255.255.255.255 | 0.0.0.0 | Един хост |
| 255.255.255.0 | 0.0.0.255 | /24 мрежа (254 хоста) |
| 255.255.0.0 | 0.0.255.255 | /16 мрежа (65534 хоста) |
| 255.0.0.0 | 0.255.255.255 | /8 мрежа |
| 0.0.0.0 | 255.255.255.255 | Всички адреси (any) |

---

## ACL PROCESSING - КАК РАБОТИ?

### Последователна проверка (Top-to-Bottom)

```
ACL е СПИСЪК с правила, които се проверяват ПОСЛЕДОВАТЕЛНО:

┌────────────────────────────────────┐
│ 1. permit tcp host 192.168.10.11   │ ← Проверка 1
│         any eq 80                  │
├────────────────────────────────────┤
│ 2. permit tcp host 192.168.10.12   │ ← Проверка 2
│         any eq 443                 │
├────────────────────────────────────┤
│ 3. deny tcp 192.168.10.0 0.0.0.255 │ ← Проверка 3
│         any                        │
├────────────────────────────────────┤
│ 4. permit ip any any               │ ← Проверка 4
├────────────────────────────────────┤
│ [implicit deny ip any any]         │ ← Невидимо, винаги в края
└────────────────────────────────────┘
```

**Как се обработва пакет:**

```
Пакет пристига:
│
├─ Проверява правило 1 → Съвпада? → ДА → PERMIT ✅ [СТОП тук!]
├─ Проверява правило 1 → Съвпада? → НЕ → Продължава...
├─ Проверява правило 2 → Съвпада? → ДА → PERMIT ✅ [СТОП тук!]
├─ Проверява правило 2 → Съвпада? → НЕ → Продължава...
├─ Проверява правило 3 → Съвпада? → ДА → DENY ❌ [СТОП тук!]
├─ Проверява правило 3 → Съвпада? → НЕ → Продължава...
├─ Проверява правило 4 → Съвпада? → ДА → PERMIT ✅ [СТОП тук!]
└─ Няма съвпадение → Implicit Deny → DENY ❌
```

**Важно:**
- **Първото съвпадение СПИРА обработката** (не проверява останалите)
- **Implicit deny all** е ВИНАГИ в края (невидимо правило)

---

### Implicit Deny All - ВАЖНО!

**В края на ВСЕКИ ACL има невидимо правило:**

```cisco
! Това е НЕВИДИМО, но е там!
deny ip any any
```

**Какво означава:**

```
Ако НИТО ЕДНО правило не съвпадне → БЛОКИРАЙ всичко!

Пример:

access-list 10 deny host 192.168.10.11
! Липсва "permit any" → IMPLICIT DENY ще блокира всички останали!

Резултат:
❌ 192.168.10.11 → blocked (explicit deny)
❌ 192.168.10.12 → blocked (implicit deny)
❌ 192.168.20.1 → blocked (implicit deny)
❌ ВСИЧКО ДРУГО → blocked (implicit deny)
```

**Правилна конфигурация:**

```cisco
access-list 10 deny host 192.168.10.11
access-list 10 permit any          ← ВАЖНО! Позволява всички останали
```

---

## ЧАСТ 1: Топология за лаба (10 мин)

### Използваме същата топология от Lab 2-4 + DNS Server

```
              [Router R1]
              192.168.10.1 (.10)
              192.168.20.1 (.20)
                   |
            GigE0/0 (trunk)
                   |
              [Switch SW1]
         /     |     |     |     \
      Fa0/5 Fa0/2 Fa0/3 Fa0/4 Fa0/6
        |     |     |     |     |
      DNS   PC1   PC2   PC3   PC4
     Server Admin Admin  IT    IT
   .10.2  .10.11 .10.12 .20.11 .20.12
   
   VLAN 10 (Admin)       VLAN 20 (IT)
```

### Addressing Table:

| Device | Interface | IP Address | VLAN | Gateway |
|--------|-----------|------------|------|---------|
| R1 | GigE0/0.10 | 192.168.10.1 | 10 | N/A |
| R1 | GigE0/0.20 | 192.168.20.1 | 20 | N/A |
| SW1 | VLAN 1 | 192.168.10.2 | 10 | 192.168.10.1 |
| DNS Server | NIC | 192.168.10.2 | 10 | 192.168.10.1 |
| PC1-Admin | NIC | 192.168.10.11 | 10 | 192.168.10.1 |
| PC2-Admin | NIC | 192.168.10.12 | 10 | 192.168.10.1 |
| PC3-IT | NIC | 192.168.20.11 | 20 | 192.168.20.1 |
| PC4-IT | NIC | 192.168.20.12 | 20 | 192.168.20.1 |

---

## ЧАСТ 2: Standard ACL - Базов пример (25 мин)

### Scenario 1: Блокирай PC1 да достъпва IT VLAN

**Бизнес requirement:** 
PC1 (конкретен администраторски компютър) не трябва да има достъп до IT VLAN поради policy.

---

### Стъпка 1: Създаване на Standard ACL

```cisco
R1# configure terminal
R1(config)# access-list 10 deny host 192.168.10.11
R1(config)# access-list 10 permit any
R1(config)# exit
```

**Детайлно обяснение на командите:**

| Команда | Какво прави | Защо |
|---------|-------------|------|
| `access-list 10` | Създава Standard ACL с номер 10 | 10 е в диапазона 1-99 (standard) |
| `deny` | Блокира трафика | Забранява пакети |
| `host 192.168.10.11` | Конкретен IP адрес | Същото като `192.168.10.11 0.0.0.0` |
| `permit any` | Позволява всичко останало | **КРИТИЧНО!** Без това implicit deny ще блокира всички |

**Какво прави този ACL:**

```
Входящ трафик:
│
├─ Source е 192.168.10.11? → ДА → DENY ❌ [PC1 блокиран]
└─ Source е друг? → ДА → PERMIT ✅ [Всички останали позволени]
```

---

### Стъпка 2: Прилагане на ACL към интерфейс

```cisco
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# ip access-group 10 out
R1(config-subif)# exit
```

**Обяснение на командите:**

| Команда | Какво прави | Детайли |
|---------|-------------|---------|
| `interface GigE0/0.20` | Влиза в конфигурация на subinterface за VLAN 20 | Това е gateway-ят към IT VLAN |
| `ip access-group 10 out` | Прилага ACL 10 в **изходяща** посока | `out` = трафик ИЗЛИЗА от router към VLAN 20 |

---

### IN vs OUT - КАК ДА РЕШИМ?

```
Perspective: Винаги от гледна точка на ROUTER-А!

┌─────────────────────────────────────────────┐
│           Router R1                         │
│                                             │
│   [IN] ←── Interface GigE0/0.20 ──→ [OUT]  │
│            (към VLAN 20)                    │
└─────────────────────────────────────────────┘

IN = Трафик ВЛИЗА В router-а ОТ VLAN 20
OUT = Трафик ИЗЛИЗА ОТ router-а КЪМ VLAN 20
```

**В нашия случай:**

```
PC1 (VLAN 10) иска да достъпи PC3 (VLAN 20):

1. PC1 → Router subinterface .10 [трафик влиза]
2. Router routing decision → трябва към VLAN 20
3. Router → subinterface .20 → VLAN 20 [трафик ИЗЛИЗА] ← ACL тук!
                                         ↑
                                    OUT direction
```

**Защо OUT, а не IN?**
- Искаме да филтрираме трафик ИЗЛИЗАЩ към VLAN 20
- Standard ACL се прилага близо до destination
- OUT = "Преди да излезе пакетът, провери ACL"

---

### Стъпка 3: Тестване

```
От PC1 (192.168.10.11):
C:\> ping 192.168.20.11
Request timed out. ❌

От PC2 (192.168.10.12):
C:\> ping 192.168.20.11
Reply from 192.168.20.11 ✅
```

**Какво се случва:**

**PC1 → PC3 (blocked):**
```
1. PC1 изпраща ICMP към 192.168.20.11
2. Switch форвардва към Router subinterface .10
3. Router проверява routing table → към GigE0/0.20
4. Преди да излезе на .20, Router проверява ACL 10 (OUT direction)
5. ACL проверка:
   - Source е 192.168.10.11? ДА → DENY ❌
6. Пакетът се ОТХВЪРЛЯ (не се изпраща към PC3)
```

**PC2 → PC3 (allowed):**
```
1. PC2 изпраща ICMP към 192.168.20.11
2. Switch форвардва към Router subinterface .10
3. Router проверява routing table → към GigE0/0.20
4. Преди да излезе на .20, Router проверява ACL 10 (OUT direction)
5. ACL проверка:
   - Source е 192.168.10.11? НЕ
   - Permit any? ДА → PERMIT ✅
6. Пакетът се ИЗПРАЩА към PC3
```

---

### Стъпка 4: Проверка на ACL

```cisco
R1# show access-lists
```

**Очакван резултат:**
```
Standard IP access list 10
    10 deny   192.168.10.11
    20 permit any
```

**Проверка на интерфейса:**
```cisco
R1# show ip interface GigabitEthernet0/0.20
```

**Търсете:**
```
Outgoing access list is 10
Inbound  access list is not set
```

---

### Стъпка 5: Премахване на ACL (ако трябва)

```cisco
R1(config)# interface GigE0/0.20
R1(config-subif)# no ip access-group 10 out
R1(config-subif)# exit
R1(config)# no access-list 10
```

**Важен ред:**
1. **Първо** махни от интерфейса (`no ip access-group`)
2. **После** изтрий ACL-а (`no access-list`)

---

## ЧАСТ 3: Extended ACL - Advanced (35 мин)

### Scenario 2: Позволи само HTTP, HTTPS и ICMP от IT към Admin VLAN

**Бизнес requirement:**
IT отделът трябва да може да:
- ✅ Ping-ва Admin устройства (troubleshooting)
- ✅ Достъпва web services (HTTP/HTTPS)
- ❌ НЕ може Telnet, SSH, FTP и т.н. към Admin

---

### Стъпка 1: Анализ на requirement

```
Какво трябва да филтрираме?
├─ Source: IT VLAN (192.168.20.0/24)
├─ Destination: Admin VLAN (192.168.10.0/24)
├─ Protocols: TCP (HTTP, HTTPS), ICMP (ping)
└─ Ports: 80 (HTTP), 443 (HTTPS)

Заключение: Трябва EXTENDED ACL! ✅
```

---

### Стъпка 2: Създаване на Extended ACL

```cisco
R1(config)# access-list 100 remark IT to Admin Access Control
R1(config)# access-list 100 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 80
R1(config)# access-list 100 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 443
R1(config)# access-list 100 permit icmp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
R1(config)# access-list 100 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
R1(config)# access-list 100 permit ip any any
R1(config)# exit
```

**Детайлно обяснение НА ВСЯКА КОМАНДА:**

---

#### Команда 1: Remark (коментар)

```cisco
access-list 100 remark IT to Admin Access Control
```

| Елемент | Значение |
|---------|----------|
| `access-list 100` | Extended ACL номер 100 (диапазон 100-199) |
| `remark` | Добавя коментар (за документация) |
| `IT to Admin...` | Текстът на коментара |

**Не прави нищо функционално, само документация!**

---

#### Команда 2: Permit HTTP

```cisco
access-list 100 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 80
```

**Breakdown:**

| Част | Значение | Обяснение |
|------|----------|-----------|
| `access-list 100` | ACL номер | Extended ACL |
| `permit` | Действие | Позволява трафика |
| `tcp` | Протокол | TCP пакети (не UDP, ICMP) |
| `192.168.20.0 0.0.0.255` | **Source** | ОТ VLAN 20 (192.168.20.1-254) |
| `192.168.10.0 0.0.0.255` | **Destination** | КЪМ VLAN 10 (192.168.10.1-254) |
| `eq 80` | Destination port | Port 80 (HTTP) |

**Какво прави:**
```
Позволява TCP трафик:
- ОТ всеки адрес в 192.168.20.0/24
- КЪМ всеки адрес в 192.168.10.0/24
- Само ако destination port е 80 (HTTP)
```

---

#### Команда 3: Permit HTTPS

```cisco
access-list 100 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 443
```

**Същото като HTTP, но port 443 (HTTPS)**

---

#### Команда 4: Permit ICMP (ping)

```cisco
access-list 100 permit icmp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
```

| Част | Значение |
|------|----------|
| `icmp` | Протокол ICMP (ping, traceroute) |
| Няма port | ICMP няма портове (Layer 3 протокол) |

**Какво прави:**
```
Позволява ICMP трафик (ping):
- ОТ VLAN 20
- КЪМ VLAN 10
- Всички ICMP типове (echo, echo-reply, unreachable...)
```

---

#### Команда 5: Deny всичко останало (IT → Admin)

```cisco
access-list 100 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
```

| Част | Значение |
|------|----------|
| `deny` | Блокира |
| `ip` | ВСИЧКИ IP протоколи (TCP, UDP, ICMP, OSPF...) |

**Какво прави:**
```
Блокира ВСИЧКО ОСТАНАЛО:
- ОТ VLAN 20
- КЪМ VLAN 10
- Което не съвпада с горните правила (Telnet, SSH, FTP...)
```

**Защо е нужно?**
- HTTP, HTTPS, ICMP вече са позволени (правила 1-3)
- Искаме да блокираме всичко друго (Telnet, SSH, FTP)
- Но НЕ искаме да блокираме трафик към ДРУГИ VLAN-и

---

#### Команда 6: Permit всичко останало (други VLAN-и)

```cisco
access-list 100 permit ip any any
```

**Какво прави:**
```
Позволява ВСИЧКО което не съвпада с горните правила:
- Трафик от VLAN 20 към други мрежи (не Admin) ✅
- Трафик от други VLAN-и ✅
- Трафик между други мрежи ✅
```

**Без това правило:**
```
Implicit deny ще блокира:
❌ VLAN 20 → Internet
❌ VLAN 10 → VLAN 20
❌ ВСИЧКО което не е експлицитно позволено
```

---

### Логика на ACL 100 (flowchart):

```
Пакет пристига на Router:
│
├─ Source: 192.168.20.X && Dest: 192.168.10.X && TCP port 80?
│  └─ ДА → PERMIT ✅ (HTTP позволен)
│
├─ Source: 192.168.20.X && Dest: 192.168.10.X && TCP port 443?
│  └─ ДА → PERMIT ✅ (HTTPS позволен)
│
├─ Source: 192.168.20.X && Dest: 192.168.10.X && ICMP?
│  └─ ДА → PERMIT ✅ (Ping позволен)
│
├─ Source: 192.168.20.X && Dest: 192.168.10.X?
│  └─ ДА → DENY ❌ (Всичко друго IT→Admin блокирано)
│
└─ Всичко останало?
   └─ PERMIT ✅ (Други VLAN-и, към интернет и т.н.)
```

---

### Стъпка 3: Прилагане на ACL

```cisco
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# ip access-group 100 in
R1(config-subif)# exit
```

**Защо IN, а не OUT?**

```
Искаме да филтрираме трафик ВЛИЗАЩ от VLAN 20:

PC3 (VLAN 20) → Router subinterface .20 [IN direction] ← ACL тук!
                         ↓
                   Routing decision
                         ↓
                Router subinterface .10 → VLAN 10
```

**Extended ACL best practice:**
- Прилагай близо до **source** (където започва трафикът)
- Използвай **IN** direction (влизащ трафик)

---

### Стъпка 4: Тестване

#### Test 1: ICMP (ping) - ТРЯБВА ДА РАБОТИ ✅

```
От PC3 (IT - 192.168.20.11):
C:\> ping 192.168.10.2
Reply from 192.168.10.2 ✅

C:\> ping 192.168.10.11
Reply from 192.168.10.11 ✅
```

**Защо работи?**
```
ACL 100 правило 3: permit icmp 192.168.20.0 ... 192.168.10.0 ...
├─ Source: 192.168.20.11 ✅
├─ Destination: 192.168.10.2 ✅
├─ Protocol: ICMP ✅
└─ Съвпада → PERMIT ✅
```

---

#### Test 2: HTTP - ТРЯБВА ДА РАБОТИ ✅

**Стартирайте HTTP service на DNS Server (192.168.10.2):**

1. Кликнете DNS Server → Services → HTTP
2. HTTP should be ON

**Тест от PC3:**
```
C:\> Web Browser
URL: http://192.168.10.2
Result: Страницата се зарежда ✅
```

---

#### Test 3: Telnet - ТРЯБВА ДА Е БЛОКИРАН ❌

**Ако имате Telnet service на Admin устройство:**

```
От PC3:
C:\> telnet 192.168.10.2
Connection failed ❌
```

**Защо е блокиран?**
```
ACL 100 проверка:
├─ Правило 1 (HTTP port 80)? НЕ → продължава
├─ Правило 2 (HTTPS port 443)? НЕ → продължава
├─ Правило 3 (ICMP)? НЕ → продължава
├─ Правило 4 (deny ip IT→Admin)? ДА ✅
└─ Action: DENY ❌ [Telnet е блокиран]
```

---

### Стъпка 5: Проверка на ACL

```cisco
R1# show access-lists
```

**Очакван резултат:**
```
Extended IP access list 100
    10 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq www (5 matches)
    20 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 443
    30 permit icmp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 (8 matches)
    40 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 (12 matches)
    50 permit ip any any (54 matches)
```

**Забележка:**
- `(X matches)` показва колко пъти е използвано правилото
- Помага да видиш кои правила "работят"

---

## ЧАСТ 4: Named ACL (Модерен подход) (20 мин)

### Защо Named ACL?

| Standard/Extended ACL | Named ACL |
|----------------------|-----------|
| `access-list 10` | `ip access-list standard BLOCK_PC1` |
| Трудно се запомня какво е "ACL 10" | Описателно име ✅ |
| Не може да редактираш лесно | Можеш да добавяш/махаш правила ✅ |
| Остарял подход | Модерен, препоръчан ✅ |

---

### Scenario 3: Admin VLAN пълен достъп до IT VLAN

```cisco
R1(config)# ip access-list extended ADMIN_TO_IT
R1(config-ext-nacl)# remark Allow full access from Admin to IT
R1(config-ext-nacl)# permit ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255
R1(config-ext-nacl)# exit
```

**Обяснение:**

| Команда | Какво прави |
|---------|-------------|
| `ip access-list extended ADMIN_TO_IT` | Създава Named Extended ACL |
| `remark ...` | Коментар |
| `permit ip ...` | Позволява ВСИЧКО (ip = all protocols) |

---

### Прилагане на Named ACL:

```cisco
R1(config)# interface GigabitEthernet0/0.10
R1(config-subif)# ip access-group ADMIN_TO_IT out
R1(config-subif)# exit
```

**Същото като numbered ACL, но с име!**

---

### Редактиране на Named ACL:

**Добавяне на ново правило НА КОНКРЕТНА ПОЗИЦИЯ:**

```cisco
R1(config)# ip access-list extended ADMIN_TO_IT
R1(config-ext-nacl)# 15 deny tcp host 192.168.10.11 any eq 23
R1(config-ext-nacl)# exit
```

**Номерът 15** определя позицията (между правила 10 и 20)

**Изтриване на правило:**

```cisco
R1(config)# ip access-list extended ADMIN_TO_IT
R1(config-ext-nacl)# no 15
R1(config-ext-nacl)# exit
```

---

## ЧАСТ 5: ACL за защита на Router (VTY линии) (20 мин)

### Scenario 4: SSH достъп САМО от Admin VLAN

**Problem:** 
Всеки може да се опита да влезе в router-а чрез SSH!

**Solution:**
ACL на VTY линиите (virtual terminal lines = Telnet/SSH)

---

### Стъпка 1: Конфигурация на SSH (ако не е направено)

```cisco
R1(config)# hostname R1
R1(config)# ip domain-name company.local
R1(config)# crypto key generate rsa
How many bits in the modulus [512]: 1024
R1(config)# username admin privilege 15 secret cisco123
R1(config)# line vty 0 4
R1(config-line)# transport input ssh
R1(config-line)# login local
R1(config-line)# exit
```

**Обяснение:**

| Команда | Какво прави |
|---------|-------------|
| `ip domain-name` | Нужен за RSA keys |
| `crypto key generate rsa` | Генерира SSH ключове |
| `username admin` | Локален потребител за SSH |
| `transport input ssh` | САМО SSH (не Telnet) |
| `login local` | Използва локална база данни |

---

### Стъпка 2: ACL за VTY линии

```cisco
R1(config)# access-list 50 remark SSH Access Control
R1(config)# access-list 50 permit 192.168.10.0 0.0.0.255
R1(config)# access-list 50 deny any log
R1(config)# line vty 0 4
R1(config-line)# access-class 50 in
R1(config-line)# exit
```

**Обяснение:**

| Команда | Какво прави |
|---------|-------------|
| `access-list 50` | Standard ACL (само source IP) |
| `permit 192.168.10.0 0.0.0.255` | Позволява Admin VLAN |
| `deny any log` | Блокира всички останали + логва |
| `access-class 50 in` | Прилага ACL към VTY линии |

**Важно:** За VTY линии използваме `access-class`, не `ip access-group`!

---

### Стъпка 3: Тестване

**От PC1 (Admin VLAN - 192.168.10.11):**

```
C:\> ssh -l admin 192.168.10.1
Password: cisco123

R1> enable
Password: [enable secret]
R1# 

SUCCESS! ✅
```

**От PC3 (IT VLAN - 192.168.20.11):**

```
C:\> ssh -l admin 192.168.10.1
% Connection refused by remote host

BLOCKED! ❌
```

---

### Стъпка 4: Проверка на логове

```cisco
R1# show logging
```

**Ще видите:**
```
%SEC-6-IPACCESSLOGP: list 50 denied tcp 192.168.20.11(12345) -> 192.168.10.1(22)
```

**Keyword `log`** в ACL-а записва в логове всеки блокиран опит!

---

## TROUBLESHOOTING ACL (15 мин)

### Често срещани грешки:

---

### Грешка 1: Забравено "permit any" (Implicit Deny)

**Проблем:**
```cisco
access-list 10 deny host 192.168.10.11
! Липсва "permit any" !!!
```

**Резултат:**
```
❌ 192.168.10.11 → blocked (explicit deny)
❌ 192.168.10.12 → blocked (implicit deny)
❌ ВСИЧКИ останали → blocked (implicit deny)
```

**Решение:**
```cisco
R1(config)# access-list 10 permit any
```

---

### Грешка 2: ACL в грешна посока (IN vs OUT)

**Проблем:**
```cisco
interface GigE0/0.20
 ip access-group 100 out    ← Трябва да е IN!
```

**Как да решим:**

```
1. Къде е SOURCE на трафика?
   └─ VLAN 20 (IT)

2. Къде искаме да филтрираме?
   └─ Когато трафикът ВЛИЗА в router от VLAN 20

3. Коя посока?
   └─ IN (влизащ трафик от VLAN 20)

Правилно:
interface GigE0/0.20
 ip access-group 100 in  ✅
```

---

### Грешка 3: Грешен wildcard mask

**Проблем:**
```cisco
access-list 10 permit 192.168.10.0 255.255.255.0   ← ГРЕШНО!
                                    ↑
                           Subnet mask, не wildcard!
```

**Резултат:** ACL няма да работи правилно

**Решение:**
```cisco
access-list 10 permit 192.168.10.0 0.0.0.255  ✅
                                    ↑
                                Wildcard mask
```

---

### Грешка 4: ACL на грешен интерфейс

**Проблем:**
```cisco
interface GigE0/0           ← Физическият интерфейс
 ip access-group 100 in     ← Грешно място!
```

**За Router-on-a-Stick прилагайте на SUBINTERFACE:**

```cisco
interface GigE0/0.20        ← Subinterface
 ip access-group 100 in  ✅
```

---

### Debug команди:

```cisco
! Включване на debug
R1# debug ip packet
R1# debug ip access-list

! Направете тест (ping, telnet и т.н.)

! ВАЖНО: Изключете debug-а!
R1# undebug all
! или
R1# no debug all
```

**Внимание:** Debug генерира МНОГО output → може да забави router-а!

---

### Проверка на ACL statistics:

```cisco
R1# show access-lists
```

**Гледайте "(X matches)":**

```
Extended IP access list 100
    10 permit tcp ... eq www (5 matches)     ← Използвано 5 пъти
    20 permit tcp ... eq 443 (0 matches)     ← Никога не е използвано
    30 deny ip ... (12 matches)              ← 12 блокирани опита
```

**Ако matches е 0:**
- Или правилото не е нужно
- Или има грешка в конфигурацията

---

### Clear ACL counters:

```cisco
R1# clear ip access-list counters
```

**Занулява "(X matches)" брояча.**

---

## ЧАСТ 6: Port Security на Switch (BONUS) (15 мин)

### Допълнителна сигурност на Layer 2

Port Security **ограничава кои MAC адреси** могат да се свържат към порт.

```cisco
SW1(config)# interface FastEthernet0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 2
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation restrict
SW1(config-if)# exit
```

**Обяснение:**

| Команда | Какво прави |
|---------|-------------|
| `switchport port-security` | Активира port security |
| `maximum 2` | Максимум 2 MAC адреса |
| `mac-address sticky` | Автоматично "научава" MAC адресите |
| `violation restrict` | При нарушение: блокира трафика, НЕ shutdown-ва порта |

---

### Violation modes:

| Mode | Какво прави | Кога да използвам |
|------|-------------|-------------------|
| **shutdown** | Shutdown-ва порта (по подразбиране) | Строга сигурност |
| **restrict** | Блокира трафика, логва, но НЕ shutdown | Средна сигурност |
| **protect** | Блокира трафика, БЕЗ логове | Мека сигурност |

---

### Проверка:

```cisco
SW1# show port-security interface FastEthernet0/2
```

**Очакван резултат:**
```
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Restrict
Maximum MAC Addresses      : 2
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
```

```cisco
SW1# show port-security address
```

**Показва научените MAC адреси:**
```
Secure Mac Address Table
------------------------------------------------------------
Vlan    Mac Address       Type                  Ports
----    -----------       --------              -----
  10    0011.2233.4455    SecureSticky          Fa0/2
```

---

## ЗАДАЧИ ЗА САМОСТОЯТЕЛНА РАБОТА

### Задача 1: Блокирай конкретен хост към DNS

Създайте Standard ACL, който блокира PC2 (192.168.10.12) да достъпва DNS server (192.168.10.2).

**Hints:**
- Standard ACL (номер 1-99)
- Deny host 192.168.10.12
- Permit any (важно!)
- Приложи на правилния интерфейс

---

### Задача 2: Ограничи протоколи (IT → Admin)

Създайте Extended ACL който позволява:
- ✅ ICMP (ping)
- ✅ DNS (UDP port 53)
- ❌ Всичко останало от IT към Admin

```cisco
R1(config)# access-list 110 permit icmp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
R1(config)# access-list 110 permit udp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 53
R1(config)# access-list 110 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
R1(config)# access-list 110 permit ip any any
```

---

### Задача 3: Multi-layer security

Комбинирайте:
1. ACL на router (inter-VLAN)
2. Port security на switch портове
3. SSH access control на VTY линии

**Документирайте всяка стъпка!**

---

### Задача 4: Log analysis

Добавете `log` keyword към deny правила:

```cisco
access-list 100 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 log
```

Направете опити за блокиран трафик, после:

```cisco
R1# show logging
```

Анализирайте кой се опитва да достъпи какво!

---

## BEST PRACTICES ЗА ACL

```
✅ Extended ACL близо до source (filtering early)
✅ Standard ACL близо до destination
✅ Винаги добавяйте "permit any" (ако е нужно)
✅ Използвайте Named ACL (по-четливо)
✅ Добавяйте remark коментари
✅ Тествайте преди production!
✅ Документирайте в таблица
✅ Записвайте конфигурацията след промени
✅ Използвайте "log" за security events
✅ Периодично проверявайте "show access-lists"
```

---

## CHECKLIST ЗА ЗАВЪРШВАНЕ

```
☐ Standard ACL създаден и тестван
☐ Extended ACL създаден и тестван
☐ Named ACL създаден
☐ Разбирам разликата между IN и OUT
☐ Разбирам wildcard masks
☐ Разбирам implicit deny
☐ ACL приложен в правилна посока
☐ SSH access control конфигуриран
☐ Port security активиран
☐ Тестовете потвърждават permit правилата
☐ Тестовете потвърждават deny правилата
☐ ACL правилата документирани в таблица
☐ Логовете прегледани
```

---

## КАКВО НАУЧИХМЕ

1. ✅ Що е то ACL (аналогия с охранител)
2. ✅ Standard vs Extended ACL (разлики и употреба)
3. ✅ Wildcard mask (как работи, примери)
4. ✅ ACL processing (top-to-bottom, first match)
5. ✅ Implicit deny all (невидимото правило)
6. ✅ IN vs OUT direction (как да решим)
7. ✅ Named ACL (модерен подход)
8. ✅ VTY access control (SSH security)
9. ✅ Port security (Layer 2 защита)
10. ✅ Troubleshooting ACL (debug, show commands)

---

## БЪРЗИ КОМАНДИ ЗА REFERENCE

### Standard ACL:
```cisco
access-list 10 deny host 192.168.10.11
access-list 10 permit any
interface GigE0/0.20
 ip access-group 10 out
```

### Extended ACL:
```cisco
access-list 100 permit tcp 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 80
access-list 100 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255
access-list 100 permit ip any any
interface GigE0/0.20
 ip access-group 100 in
```

### Named ACL:
```cisco
ip access-list extended ADMIN_TO_IT
 permit ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255
interface GigE0/0.10
 ip access-group ADMIN_TO_IT out
```

### VTY Access:
```cisco
access-list 50 permit 192.168.10.0 0.0.0.255
access-list 50 deny any log
line vty 0 4
 access-class 50 in
```

### Port Security:
```cisco
interface Fa0/2
 switchport mode access
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation restrict
```

### Show Commands:
```cisco
show access-lists
show ip interface GigE0/0.20
show logging
show port-security interface Fa0/2
show port-security address
```

---

## СЛЕДВАЩА СТЪПКА

В **Lab 6** ще интегрираме:
- IoT устройства (sensors, actuators)
- Автоматизация с Blockly/Python
- Smart Home/Office сценарии

**Това е финалната стъпка преди курсовия проект!**

**Запазете файла като:** `Lab5_ACL_YourName.pkt`

---

**Успех с лаба! ACL-ите са мощен инструмент за мрежова сигурност! 🔒**
