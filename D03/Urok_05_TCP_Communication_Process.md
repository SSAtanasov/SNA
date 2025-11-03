# Урок 5: TCP комуникационен процес във Wireshark

## Цели на упражнението

След завършване на това упражнение ще можете да:

- Разберете концепцията за connection-oriented протокол
- Идентифицирате TCP Three-Way Handshake процеса
- Анализирате TCP Control Bits (флагове)
- Разберете как се терминира TCP връзка
- Анализирате TCP комуникация във Wireshark
- Разпознавате Sequence Numbers и Acknowledgment Numbers

## Теоретична основа

**TCP (Transmission Control Protocol)** е един от основните transport layer протоколи в Internet Protocol Suite. TCP е **connection-oriented протокол**, което означава, че трябва да се установи end-to-end връзка, преди данни да могат да се изпращат или получават.

### Характеристики на TCP:

- **Connection-oriented** - Изисква установяване на връзка преди обмен на данни
- **Reliable** - Гарантира доставка на данни чрез acknowledgments
- **Ordered** - Данните пристигат в същия ред, в който са изпратени
- **Error-checking** - Използва checksums за откриване на грешки
- **Flow control** - Window size механизъм за управление на скоростта
- **Congestion control** - Избягва претоварване на мрежата

### Разлика между TCP и UDP:

| Характеристика | TCP | UDP |
|----------------|-----|-----|
| Connection | Connection-oriented | Connectionless |
| Надеждност | Reliable (guaranteed delivery) | Unreliable (best effort) |
| Ред на данни | Ordered | Unordered |
| Скорост | По-бавен (overhead) | По-бърз |
| Приложения | HTTP, FTP, SSH, Email | DNS, VoIP, Video Streaming |

---

## TCP Three-Way Handshake

Преди да започне обмен на данни между два хоста, TCP използва процес, наречен **Three-Way Handshake**, за да установи reliable връзка.

### Трите стъпки на Three-Way Handshake:

```
Client                                  Server
  |                                       |
  |  1. SYN (Seq=0)                      |
  |-------------------------------------->|
  |                                       |
  |  2. SYN-ACK (Seq=0, Ack=1)           |
  |<--------------------------------------|
  |                                       |
  |  3. ACK (Seq=1, Ack=1)               |
  |-------------------------------------->|
  |                                       |
  |     Connection Established!           |
  |                                       |
```

### Подробно обяснение:

#### **Стъпка 1: SYN (Synchronize)**
- Клиентът изпраща TCP segment с **SYN flag = 1**
- **Sequence Number = 0** (относителен номер във Wireshark)
- Това е заявка за синхронизация и установяване на връзка

#### **Стъпка 2: SYN-ACK (Synchronize-Acknowledge)**
- Сървърът отговаря с TCP segment с **SYN flag = 1** и **ACK flag = 1**
- **Sequence Number = 0** (за сървъра)
- **Acknowledgment Number = 1** (потвърждава получаването на клиентския SYN)
- Това е потвърждение и собствена синхронизация от сървъра

#### **Стъпка 3: ACK (Acknowledge)**
- Клиентът изпраща финален TCP segment с **ACK flag = 1**
- **Sequence Number = 1**
- **Acknowledgment Number = 1** (потвърждава получаването на сървърския SYN)
- **SYN flag = 0** (не се използва повече)
- Връзката е установена!

---

## TCP Control Bits (Flags)

TCP header съдържа **6 основни control bits (flags)**, които се използват за управление на connection и data transfer:

| Flag | Име | Функция |
|------|-----|---------|
| **URG** | Urgent | Urgent pointer field е significant |
| **ACK** | Acknowledgment | Acknowledgment field е значим |
| **PSH** | Push | Push функция - изпрати данни веднага |
| **RST** | Reset | Reset на връзката |
| **SYN** | Synchronize | Синхронизация на sequence numbers |
| **FIN** | Finish | Няма повече данни от изпращача |

### Използване на флагове:

- **SYN:** Използва се при установяване на връзка
- **ACK:** Използва се за потвърждаване на получени данни (почти винаги зададен след handshake)
- **FIN:** Използва се при терминиране на връзка
- **RST:** Използва се за прекъсване на връзка (abnormal termination)
- **PSH:** Индикира, че данните трябва да се изпратят до приложението веднага
- **URG:** Индикира urgent data (рядко използван)

### Control Bits във Wireshark:

```
Flags: 0x002 (SYN)
    000000000010 = Flags: SYN
    .... .... ...0 = Fin: Not set
    .... .... ..1. = Syn: Set
    .... .... .0.. = Reset: Not set
    .... .... 0... = Push: Not set
    .... ...0 .... = Acknowledgment: Not set
    .... ..0. .... = Urgent: Not set
```

---

## Анализ на TCP Three-Way Handshake във Wireshark

### Пример от Wireshark capture:

Нека анализираме screenshots от Wireshark packet capture, който показва процеса на TCP three-way handshake и терминиране на TCP комуникация.

#### **Packet 10: SYN (Стъпка 1)**

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80
    Source Port: 54321
    Destination Port: 80 (HTTP)
    Sequence Number: 0    (relative sequence number)
    Acknowledgment Number: 0
    Header Length: 32 bytes (8)
    Flags: 0x002 (SYN)
        .... .... ...0 = Fin: Not set
        .... .... ..1. = Syn: Set
        .... .... .0.. = Reset: Not set
        .... .... 0... = Push: Not set
        .... ...0 .... = Acknowledgment: Not set
        .... ..0. .... = Urgent: Not set
    Window: 65535
    Checksum: 0x1234 [unverified]
```

**Анализ:**

- **Sequence Number:** 0 - Началото на three-way handshake
- **SYN flag:** Зададен на 1 (Set)
- **ACK flag:** Не е зададен (Not set)
- Това е заявка за установяване на connection

> **Важно:** Sequence number-ът всъщност е 32-битово случайно число, наречено **ISN (Initial Sequence Number)**. Wireshark конвертира това число на 0 за по-лесно четене и increment на sequence numbers.

**Защо случайно ISN?**

Случайният ISN помага за защита срещу **TCP connection hijacking attacks**. Ако ISN беше предсказуем, атакуващ би могъл да "отгатне" следващия sequence number и да инжектира malicious данни.

---

#### **Packet 11: SYN-ACK (Стъпка 2)**

```
Transmission Control Protocol, Src Port: 80, Dst Port: 54321
    Source Port: 80 (HTTP)
    Destination Port: 54321
    Sequence Number: 0    (relative sequence number)
    Acknowledgment Number: 1    (relative ack number)
    Header Length: 32 bytes (8)
    Flags: 0x012 (SYN, ACK)
        .... .... ...0 = Fin: Not set
        .... .... ..1. = Syn: Set
        .... .... .0.. = Reset: Not set
        .... .... 0... = Push: Not set
        .... ...1 .... = Acknowledgment: Set
        .... ..0. .... = Urgent: Not set
    Window: 65535
    Checksum: 0x5678 [unverified]
```

**Анализ:**

- **Sequence Number:** 0 (relative) - Сървърът започва със собствен sequence number
- **Acknowledgment Number:** 1 - Потвърждава получаването на клиентския SYN (0 + 1 = 1)
- **SYN flag:** Зададен (Set)
- **ACK flag:** Зададен (Set)
- Това е сървърен отговор - потвърждение и собствена синхронизация

---

#### **Packet 12: ACK (Стъпка 3)**

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80
    Source Port: 54321
    Destination Port: 80 (HTTP)
    Sequence Number: 1    (relative sequence number)
    Acknowledgment Number: 1    (relative ack number)
    Header Length: 20 bytes (5)
    Flags: 0x010 (ACK)
        .... .... ...0 = Fin: Not set
        .... .... ..0. = Syn: Not set
        .... .... .0.. = Reset: Not set
        .... .... 0... = Push: Not set
        .... ...1 .... = Acknowledgment: Set
        .... ..0. .... = Urgent: Not set
    Window: 65535
    Checksum: 0x9abc [unverified]
```

**Анализ:**

- **Sequence Number:** 1 (relative)
- **Acknowledgment Number:** 1 - Потвърждава получаването на сървърския SYN (0 + 1 = 1)
- **ACK flag:** Зададен (Set)
- **SYN flag:** НЕ е зададен (Not set)
- Това е финалната фаза в three-way handshake
- **Connection е установена!**

---

## TCP Connection Termination

Когато връзката трябва да се терминира (например, затворите web browser), connection се терминира с **два two-way handshakes**.

### Процес на терминиране:

```
Client                                  Server
  |                                       |
  |  1. FIN-ACK                          |
  |-------------------------------------->|
  |                                       |
  |  2. ACK                               |
  |<--------------------------------------|
  |                                       |
  |  3. FIN-ACK                           |
  |<--------------------------------------|
  |                                       |
  |  4. ACK                               |
  |-------------------------------------->|
  |                                       |
  |     Connection Closed!                |
  |                                       |
```

### Подробно обяснение:

#### **Packet 16: FIN-ACK (Стъпка 1)**

```
Transmission Control Protocol, Src Port: 80, Dst Port: 54321
    Sequence Number: 374
    Acknowledgment Number: 250
    Flags: 0x011 (FIN, ACK)
        .... .... ...1 = Fin: Set
        .... .... ..0. = Syn: Not set
        .... ...1 .... = Acknowledgment: Set
```

**Анализ:**

- **FIN flag:** Зададен (Set) - Сървърът иска да терминира връзката
- **ACK flag:** Зададен (Set) - ACK винаги е зададен след three-way handshake
- Сървърът сигнализира край на connection

---

#### **Packet 17: ACK (Стъпка 2)**

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80
    Sequence Number: 250
    Acknowledgment Number: 375
    Flags: 0x010 (ACK)
```

**Анализ:**

- **ACK flag:** Зададен (Set)
- Клиентът потвърждава получаването на FIN от сървъра
- Това е първият two-way handshake: **FIN-ACK, ACK**

---

#### **Packet 18: FIN-ACK (Стъпка 3)**

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80
    Sequence Number: 250
    Acknowledgment Number: 375
    Flags: 0x011 (FIN, ACK)
```

**Анализ:**

- **FIN flag:** Зададен (Set) - Клиентът също иска да терминира връзката
- **ACK flag:** Зададен (Set)
- Клиентът изпраща собствен FIN

---

#### **Packet 19: ACK (Стъпка 4)**

```
Transmission Control Protocol, Src Port: 80, Dst Port: 54321
    Sequence Number: 375
    Acknowledgment Number: 251
    Flags: 0x010 (ACK)
```

**Анализ:**

- **ACK flag:** Зададен (Set)
- Сървърът потвърждава получаването на FIN от клиента
- Това е вторият two-way handshake: **FIN-ACK, ACK**
- **Connection е терминирана!**

---

## Sequence Numbers и Acknowledgment Numbers

### Как работят Sequence Numbers:

- Всеки byte от данни има свой sequence number
- Sequence number-ът в TCP header показва номера на първия byte в segment
- Получателят използва sequence numbers за reassemble на данните в правилния ред

### Как работят Acknowledgment Numbers:

- Acknowledgment number казва на изпращача: "Получих всички bytes до този номер"
- Acknowledgment number = последен получен sequence number + 1
- Пример: Ако получа bytes 0-99, изпращам ACK=100 (очаквам следващия byte да е 100)

### Relative vs. Absolute Sequence Numbers:

- **Absolute:** Действителният 32-битов sequence number (например 3428947123)
- **Relative:** Wireshark го конвертира на 0 в началото за лесно четене (0, 1, 2, ...)

---

## Практически съвети за анализ във Wireshark

### Филтриране на TCP трафик:

```
tcp
```

### Филтриране на TCP SYN пакети:

```
tcp.flags.syn == 1
```

### Филтриране на TCP SYN-ACK пакети:

```
tcp.flags.syn == 1 && tcp.flags.ack == 1
```

### Филтриране на TCP FIN пакети:

```
tcp.flags.fin == 1
```

### Филтриране на TCP RST пакети:

```
tcp.flags.reset == 1
```

### Филтриране по TCP port:

```
tcp.port == 80
tcp.srcport == 443
tcp.dstport == 22
```

### Следене на TCP stream:

1. Маркирайте пакет от желания TCP connection
2. Десен клик → **Follow** → **TCP Stream**
3. Wireshark ще покаже целия conversation в четим формат

---

## TCP Header Structure

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |
|       |           |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                             data                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## Въпроси за размисъл

**1.** Защо TCP използва three-way handshake вместо two-way?

_Three-way handshake гарантира, че и двете страни са готови да комуникират И че са синхронизирани. Първите две стъпки (SYN, SYN-ACK) установяват връзката в една посока. Третата стъпка (ACK) потвърждава връзката в обратната посока. Това гарантира bidirectional communication._

**2.** Какво се случва ако SYN пакетът се загуби в мрежата?

_Клиентът ще изчака timeout период и след това ще изпрати SYN отново. Този процес се нарича "retransmission". TCP автоматично retry-ва няколко пъти преди да се откаже._

**3.** Защо sequence number-ът започва от случайно число вместо от 0?

_Случайният ISN защитава срещу TCP hijacking attacks. Ако атакуващ може да предвиди следващия sequence number, той би могъл да inject malicious данни във връзката. Случайният ISN прави това почти невъзможно._

**4.** Какво е разликата между FIN и RST?

_FIN е "graceful" (нормално) терминиране на connection - двете страни се съгласяват да затворят връзката. RST е "abrupt" (рязко) терминиране - връзката се прекъсва веднага, обикновено поради грешка или security причина._

**5.** Защо ACK flag е почти винаги зададен след three-way handshake?

_След като connection е установена, всяка страна трябва да потвърждава получаването на данни. ACK flag индикира, че acknowledgment number-ът е валиден. Това е как TCP гарантира reliable delivery._

---

## TCP Connection States

По време на своя lifecycle, TCP connection преминава през различни states:

| State | Описание |
|-------|----------|
| **CLOSED** | Няма активна connection |
| **LISTEN** | Сървър чака за connection request |
| **SYN-SENT** | Клиент изпрати SYN, чака SYN-ACK |
| **SYN-RECEIVED** | Сървър получи SYN, изпрати SYN-ACK, чака ACK |
| **ESTABLISHED** | Connection е установена, данни могат да се обменят |
| **FIN-WAIT-1** | Локалната страна иска да затвори connection |
| **FIN-WAIT-2** | Отдалечената страна се съгласи да затвори |
| **TIME-WAIT** | Чака да мине време преди пълно затваряне |
| **CLOSE-WAIT** | Отдалечената страна иска да затвори |
| **LAST-ACK** | Чака финален ACK |
| **CLOSED** | Connection е затворена |

---

## Заключение

TCP Three-Way Handshake е fundamental механизъм за установяване на reliable connection-oriented комуникация. Разбирането на този процес е critical за network troubleshooting и security анализ.

Ключови точки за запомняне:

- **Three-Way Handshake:** SYN → SYN-ACK → ACK
- **Connection Termination:** FIN-ACK → ACK → FIN-ACK → ACK (два two-way handshakes)
- **Control Flags:** SYN, ACK, FIN, RST, PSH, URG
- **ISN:** Случаен за security
- **Relative Sequence Numbers:** Wireshark ги показва от 0 за лесно четене

TCP е backbone на надеждната комуникация в Internet. Познаването на неговите механизми е essential за всеки network engineer!
