# Урок 3: IPv4 пакети във Wireshark

## Цели на упражнението

След завършване на това упражнение ще можете да:

- Разберете структурата на IPv4 packet header
- Идентифицирате основните полета в IPv4 заглавката
- Анализирате IPv4 пакети във Wireshark
- Разпознавате различни типове протоколи в IPv4 пакети (TCP, HTTP, ICMP)
- Разберете ролята на TTL, Protocol field и други ключови полета

## Теоретична основа

**IPv4** е един от основните network layer комуникационни протоколи. IPv4 packet header се използва за гарантиране, че този пакет бъде доставен до следващата му спирка по пътя към крайното устройство.

IPv4 packet header се състои от полета, съдържащи важна информация за пакета. Тези полета съдържат binary числа, които се изследват от Layer 3 процеса. Бинарните стойности на всяко поле идентифицират различни настройки на IP пакета.

Protocol header диаграми, които се четат от ляво на дясно и отгоре надолу, предоставят визуално представяне при обсъждане на protocol fields.

## IPv4 Packet Header - Структура

IPv4 заглавката има променлива дължина от **20 до 60 байта**, в зависимост от наличието на Options поле. Основната структура включва:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |Type of Service|          Total Length         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|      Fragment Offset    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |         Header Checksum       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source Address                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination Address                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## Описание на основните полета в IPv4 Header

### 1. **Version** (4 бита)
- Съдържа 4-битова binary стойност, зададена на **0100**, която идентифицира това като IPv4 пакет
- **Стойност:** Винаги **4** за IPv4

### 2. **Internet Header Length (IHL)** (4 бита)
- Показва дължината на IPv4 header
- Минимална стойност: **5** (20 байта)
- Максимална стойност: **15** (60 байта, когато има Options)
- **Измерва се в 32-битови думи (4 байта)**

### 3. **Differentiated Services (DS) или Type of Service (ToS)** (8 бита)
- Използва се за определяне на приоритета на всеки пакет
- Най-значимите 6 бита са **Differentiated Services Code Point (DSCP)** битове
- Последните 2 бита са **Explicit Congestion Notification (ECN)** битове
- **Приложение:** Quality of Service (QoS), приоритизация на VoIP трафик

### 4. **Total Length** (16 бита)
- Определя общата дължина на IP пакета (header + data)
- **Измерва се в байтове**
- Максимална стойност: **65,535 байта**

### 5. **Identification** (16 бита)
- Използва се за уникално идентифициране на фрагментите на един оригинален IP пакет
- **Важно за фрагментация и reassembly**

### 6. **Flags** (3 бита)
- Използва се за контролиране и идентификация на фрагменти
- Битове:
  - **Bit 0:** Резервиран (винаги 0)
  - **Bit 1:** Don't Fragment (DF) - Ако е зададен на 1, пакетът не може да се фрагментира
  - **Bit 2:** More Fragments (MF) - Ако е зададен на 1, има още фрагменти

### 7. **Fragment Offset** (13 бита)
- Използва се за идентифициране на позицията на фрагмента в оригиналния пакет
- **Измерва се в блокове от 8 байта**

### 8. **Time to Live (TTL)** (8 бита)
- Използва се за предотвратяване на безкрайни loop-ове в мрежата
- Всеки router намалява TTL с 1
- Когато TTL достигне **0**, пакетът се отхвърля (drop)
- **Типични начални стойности:** 64, 128, 255

### 9. **Protocol** (8 бита)
- Идентифицира протокола на следващия layer (какво се съдържа в data частта)
- **Често срещани стойности:**
  - **1** = ICMP (Internet Control Message Protocol)
  - **6** = TCP (Transmission Control Protocol)
  - **17** = UDP (User Datagram Protocol)

### 10. **Header Checksum** (16 бита)
- Използва се за проверка на грешки в IP header
- Routers проверяват checksum и отхвърлят пакети с грешки
- **Забележка:** Checksum се преизчислява на всеки hop (заради TTL промяната)

### 11. **Source IP Address** (32 бита)
- IPv4 адресът на устройството-изпращач
- **Най-важното поле:** Показва откъде идва пакетът

### 12. **Destination IP Address** (32 бита)
- IPv4 адресът на устройството-получател
- **Най-важното поле:** Показва къде отива пакетът

### 13. **Options** (променлива дължина) и **Padding**
- Опционално поле, рядко използвано
- Когато се използва, padding се добавя, за да се гарантира, че header е кратен на 32 бита

---

## Анализ на IPv4 пакети във Wireshark

### Пример 1: TCP пакет

Нека разгледаме screenshot от Wireshark packet capture. Вторият пакет е маркиран и network layer информацията е разгъната, за да видим всички неща, случващи се на network layer.

**Наблюдения:**

1. **Протокол:** Internet Protocol Version 4 (IPv4)
2. **Source IP Address:** 192.168.1.109
3. **Destination IP Address:** 192.168.1.1
4. **Upper Layer Protocol:** TCP

#### Полета в IPv4 Header:

```
Internet Protocol Version 4, Src: 192.168.1.109, Dst: 192.168.1.1
    0100 .... = Version: 4
    .... 0101 = Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)
    Total Length: 52
    Identification: 0x3f42 (16194)
    Flags: 0x4000, Don't fragment
        0... .... .... .... = Reserved bit: Not set
        .1.. .... .... .... = Don't fragment: Set
        ..0. .... .... .... = More fragments: Not set
    Fragment Offset: 0
    Time to Live: 128
    Protocol: TCP (6)
    Header Checksum: 0xb138 [validation disabled]
    [Header checksum status: Unverified]
    Source Address: 192.168.1.109
    Destination Address: 192.168.1.1
```

**Анализ:**

- **Version:** 4 - Това е IPv4 пакет
- **Header Length:** 20 байта - Минималният размер на IPv4 header (няма Options)
- **Differentiated Services:** 0x00 - Нормален приоритет (без QoS)
- **Total Length:** 52 байта - Цялата дължина на IP пакета
- **Identification:** 16194 - Уникален идентификатор за този пакет
- **Flags:** Don't Fragment е зададен - Пакетът не може да бъде фрагментиран
- **TTL:** 128 - Пакетът може да премине през максимум 128 router-а преди да бъде отхвърлен
- **Protocol:** 6 (TCP) - Data частта съдържа TCP segment
- **Header Checksum:** Позволява на routers да проверяват за грешки
- **Source/Destination:** Показват откъде и къде отива пакетът

---

### Пример 2: HTTP GET Request пакет

Нека разгледаме осмия пакет в capture. Source IP адресът е отново 192.168.1.109 и destination IP адресът е 192.168.1.1, но този път пакетът е **HTTP GET request** към web server.

**Наблюдения:**

```
Internet Protocol Version 4, Src: 192.168.1.109, Dst: 192.168.1.1
    Version: 4
    Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00
    Total Length: 411 bytes
    Identification: 0x3f50 (16208)
    Flags: 0x4000, Don't fragment
    Fragment Offset: 0
    Time to Live: 128
    Protocol: TCP (6)
    Header Checksum: 0xaf82
    Source Address: 192.168.1.109
    Destination Address: 192.168.1.1
```

**Анализ:**

- **Total Length:** 411 байта (в сравнение с предишния пакет от 52 байта)
- Този пакет съдържа много повече информация - HTTP GET request данни
- Под IPv4 информацията виждаме TCP информация, а под нея - HTTP protocol информация

**Разликата:** Този пакет е значително по-голям, защото съдържа HTTP application layer данни.

---

### Пример 3: ICMP Echo Request (Ping)

Сега нека разгледаме шестнадесетия пакет. Той е също от host 192.168.1.109 към 192.168.1.1, но този път използва **ICMP протокол**.

**Наблюдения:**

```
Internet Protocol Version 4, Src: 192.168.1.109, Dst: 192.168.1.1
    Version: 4
    Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00
    Total Length: 60 bytes
    Identification: 0x3f5c (16220)
    Flags: 0x0000
        0... .... .... .... = Reserved bit: Not set
        .0.. .... .... .... = Don't fragment: Not set
        ..0. .... .... .... = More fragments: Not set
    Fragment Offset: 0
    Time to Live: 128
    Protocol: ICMP (1)
    Header Checksum: 0xb0ca
    Source Address: 192.168.1.109
    Destination Address: 192.168.1.1
```

**Анализ:**

- **Protocol:** 1 (ICMP) - Data частта съдържа ICMP съобщение
- Флаговете са леко различни
- В packet list window виждаме, че това е "echo (ping) request"
- Под IPv4 информацията има разгъната област за ICMP header информация

**Разлика:** Protocol полето сега е зададено на **1**, индикирайки че data частта на този пакет е ICMP protocol съобщение.

---

## Практически съвети за анализ във Wireshark

### Как да филтрирате IPv4 пакети:

```
ip
```

### Как да филтрирате по source IP:

```
ip.src == 192.168.1.109
```

### Как да филтрирате по destination IP:

```
ip.dst == 192.168.1.1
```

### Как да филтрирате по протокол в IPv4:

```
ip.proto == 6   (TCP)
ip.proto == 1   (ICMP)
ip.proto == 17  (UDP)
```

### Как да филтрирате по TTL:

```
ip.ttl == 128
ip.ttl < 64
```

---

## Важни факти за IPv4

### TTL (Time to Live)

- **Цел:** Предотвратява безкрайни loop-ове в мрежата
- Всеки router намалява TTL с 1
- Когато TTL стане 0, пакетът се отхвърля
- TTL се използва също в ICMP traceroute и ping команди

**Типични начални TTL стойности:**

| Операционна система | Default TTL |
|---------------------|-------------|
| Windows | 128 |
| Linux/Unix | 64 |
| Cisco IOS | 255 |

### Protocol Field Values

| Протокол | Номер | Описание |
|----------|-------|----------|
| ICMP | 1 | Internet Control Message Protocol |
| IGMP | 2 | Internet Group Management Protocol |
| TCP | 6 | Transmission Control Protocol |
| UDP | 17 | User Datagram Protocol |
| GRE | 47 | Generic Routing Encapsulation |
| ESP | 50 | Encapsulating Security Payload (IPSec) |
| AH | 51 | Authentication Header (IPSec) |
| OSPF | 89 | Open Shortest Path First |

---

## Въпроси за размисъл

**1.** Защо е важно Protocol полето в IPv4 header?

_Protocol полето е критично, защото казва на получаващото устройство какъв протокол се съдържа в data частта на IP пакета. Това позволява на устройството правилно да обработи payload данните (TCP, UDP, ICMP и т.н.)._

**2.** Каква е ролята на TTL полето?

_TTL предотвратява пакети да циркулират безкрайно в мрежата при routing loop. Всеки router намалява TTL с 1, и когато достигне 0, пакетът се отхвърля. Това също се използва в diagnostic tools като traceroute._

**3.** Защо Header Checksum трябва да се преизчислява на всеки hop?

_Тъй като TTL полето се променя на всеки hop (намалява се с 1), IPv4 header се променя. Следователно Header Checksum трябва да се преизчисли, за да отразява новата стойност на header._

**4.** Какво е значението на Don't Fragment (DF) flag?

_DF flag показва дали даден пакет може да бъде фрагментиран от router-и. Ако DF е зададен и пакетът е твърде голям за network link, router-ът ще отхвърли пакета и ще изпрати ICMP съобщение обратно, че е необходима фрагментация._

---

## Заключение

IPv4 packet header съдържа критична информация за маршрутизация и доставка на пакети. Разбирането на структурата и значението на всяко поле е fundamental за network troubleshooting и анализ. Wireshark е отличен инструмент за визуализиране и анализ на IPv4 headers, позволявайки ни да видим всички детайли на пакетната комуникация.

Най-важните полета за запомняне са:
- **Source/Destination IP Addresses** - къде отива пакетът
- **TTL** - колко router-а може да премине
- **Protocol** - какъв протокол е в data частта
- **Flags** - може ли да се фрагментира

Тези знания са основа за по-напреднали topics като IPv6, routing, и security анализ.
