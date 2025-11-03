# Урок 4: IPv6 пакети във Wireshark

## Цели на упражнението

След завършване на това упражнение ще можете да:

- Разберете ограниченията на IPv4 и нуждата от IPv6
- Идентифицирате структурата на IPv6 packet header
- Сравните IPv4 и IPv6 headers
- Анализирате IPv6 пакети във Wireshark
- Разпознавате различни типове IPv6 адреси (global unicast, link-local, multicast)
- Разберете ICMPv6 Neighbor Discovery Protocol

## Теоретична основа

### Ограниченията на IPv4

IPv4 е разработен през 1980-те години и има няколко значителни ограничения:

1. **Изчерпване на адресното пространство** - IPv4 използва 32-битови адреси, осигурявайки около **4.3 милиарда** уникални адреси
2. **Липса на вградена сигурност** - IPSec е опционален в IPv4
3. **Липса на native Quality of Service (QoS)** - QoS се добавя чрез допълнителни механизми
4. **Фрагментация** - Налага overhead на routers

### Преглед на IPv6

**IPv6** (Internet Protocol version 6) е следващото поколение Internet Layer протокол. IPv6 адресира проблемите на IPv4 и предоставя много подобрения:

- **128-битови адреси** - Осигурява 340 ундецилиона (3.4 × 10³⁸) уникални адреси
- **Опростена header структура** - Фиксирана дължина от 40 байта
- **Вградена сигурност** - IPSec е задължителна част от IPv6
- **Подобрено QoS** - Flow Label поле за real-time приложения
- **Без нужда от NAT** - Достатъчно адреси за всички устройства
- **Автоматична конфигурация** - SLAAC (Stateless Address Autoconfiguration)

#### Сравнение на адресното пространство

| Протокол | Битове | Брой адреси | Формат |
|----------|--------|-------------|---------|
| IPv4 | 32 | ~4.3 милиарда | 192.168.1.1 (dotted decimal) |
| IPv6 | 128 | ~340 ундецилиона | 2001:0db8:85a3::8a2e:0370:7334 (hexadecimal) |

---

## IPv6 Packet Header - Структура

Една от основните design подобрения на IPv6 спрямо IPv4 е **опростената IPv6 header**. IPv4 header се състои от променлива дължина от 20 октета (до 60 байта, ако има Options поле). IPv6 header обаче е **фиксирани 40 байта**.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version| Traffic Class |           Flow Label                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Payload Length        |  Next Header  |   Hop Limit   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                                                               +
|                                                               |
+                         Source Address                        +
|                                                               |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                                                               +
|                                                               |
+                      Destination Address                      +
|                                                               |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## Сравнение на IPv4 и IPv6 Header Fields

### Полета, запазени от IPv4 в IPv6:

| IPv4 Поле | IPv6 Поле | Промени |
|-----------|-----------|---------|
| Version | Version | Без промени |
| Differentiated Services | Traffic Class | Преименувано |
| Protocol | Next Header | Преименувано |
| Time to Live (TTL) | Hop Limit | Преименувано |
| Source Address | Source Address | Увеличено от 32 на 128 бита |
| Destination Address | Destination Address | Увеличено от 32 на 128 бита |

### Полета, премахнати от IPv4:

- **IHL (Internet Header Length)** - Не е необходимо, защото IPv6 header е фиксирана дължина
- **Identification, Flags, Fragment Offset** - Фрагментацията се обработва различно в IPv6
- **Header Checksum** - Премахнато за по-добра производителност (проверките се правят на други layers)
- **Options** - Заменено с Extension Headers

### Нови полета в IPv6:

- **Flow Label** - Ново поле за real-time приложения

---

## Описание на полетата в IPv6 Header

### 1. **Version** (4 бита)
- Съдържа binary стойност **0110** (6 в decimal)
- **Стойност:** Винаги **6** за IPv6

### 2. **Traffic Class** (8 бита)
- Еквивалент на Differentiated Services (DS) в IPv4
- Използва се за packet prioritization и congestion management
- **Приложение:** QoS за VoIP, видео стрийминг

### 3. **Flow Label** (20 бита)
- **Ново поле в IPv6**
- Позволява на routers и switches да поддържат същия packet flow
- Помага на real-time приложения, които изискват пакети да пристигат в същия ред
- **Пример:** VoIP разговор, видео конференция

### 4. **Payload Length** (16 бита)
- Еквивалент на Total Length field в IPv4
- Показва дължината на payload (data част след header)
- **Измерва се в байтове**
- Максимална стойност: **65,535 байта**
- **Забележка:** Не включва 40-те байта на основния IPv6 header

### 5. **Next Header** (8 бита)
- Еквивалент на Protocol field в IPv4
- Идентифицира типа на header, който следва след IPv6 header
- **Често срещани стойности:**
  - **6** = TCP
  - **17** = UDP
  - **58** = ICMPv6
  - **43** = Routing Extension Header
  - **44** = Fragment Extension Header

### 6. **Hop Limit** (8 бита)
- Еквивалент на TTL (Time to Live) в IPv4
- Всеки router намалява стойността с 1
- Когато достигне **0**, пакетът се отхвърля
- **Типични стойности:** 64, 128, 255

### 7. **Source Address** (128 бита = 16 байта)
- IPv6 адресът на устройството-изпращач
- **Формат:** 8 групи по 4 hexadecimal цифри
- **Пример:** 2001:0db8:85a3:0000:0000:8a2e:0370:7334

### 8. **Destination Address** (128 бита = 16 байта)
- IPv6 адресът на устройството-получател
- **Формат:** Същото като Source Address

---

## Типове IPv6 адреси

### 1. Global Unicast Address
- **Prefix:** 2000::/3 (започва с 2 или 3)
- **Обхват:** Глобален (маршрутизируем в Internet)
- **Пример:** 2001:0db8:85a3::8a2e:0370:7334
- **Аналог в IPv4:** Public IP адреси

### 2. Link-Local Address
- **Prefix:** FE80::/10
- **Обхват:** Само локалната мрежа (не се маршрутизират)
- **Пример:** fe80::58c5:45f2:7e5e:29c2
- **Използване:** Neighbor Discovery, локална комуникация
- **Аналог в IPv4:** 169.254.0.0/16 (APIPA)

### 3. Multicast Address
- **Prefix:** FF00::/8
- **Обхват:** Група от устройства
- **Пример:** ff02::1 (всички nodes на link)
- **Използване:** Neighbor Discovery, routing protocols
- **Аналог в IPv4:** 224.0.0.0/4

### 4. Unique Local Address (ULA)
- **Prefix:** FC00::/7
- **Обхват:** Частна организация (не се маршрутизират в Internet)
- **Аналог в IPv4:** 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16

> **Забележка:** IPv6 няма broadcast адреси! Всички broadcast функции са заменени с multicast.

---

## Анализ на IPv6 пакети във Wireshark

### Пример 1: TCP пакет към Web Server

Нека разгледаме packet capture с IPv6 комуникация. Пакет номер 46 е маркиран, и network layer информацията е разгъната.

**Наблюдения:**

```
Internet Protocol Version 6, Src: 2001:6f8:..., Dst: 2001:6f8:900:...
    0110 .... = Version: 6
    .... 0000 0000 .... .... .... .... .... = Traffic Class: 0x00
    .... .... .... 0000 0000 0000 0000 0000 = Flow Label: 0x00000
    Payload Length: 40
    Next Header: TCP (6)
    Hop Limit: 64
    Source Address: 2001:6f8:...
    Destination Address: 2001:6f8:900:...
```

**Анализ:**

- **Version:** 6 - Това е IPv6 пакет
- **Traffic Class:** 0x00 - Нормален приоритет
- **Flow Label:** 0x00000 - Няма специален flow tracking
- **Payload Length:** 40 байта - Дължината на TCP header + data
- **Next Header:** 6 (TCP) - Upper layer протоколът е TCP
- **Hop Limit:** 64 - Пакетът може да премине през 64 router-а
- **Source/Destination:** Global unicast IPv6 адреси

**Важно:** Забележете, че количеството информация в IPv6 header е **много по-малко** от IPv4 header. IPv6 е по-опростен и ефективен!

---

### Пример 2: HTTP GET Request

Сега разглеждаме пакет номер 49, който е GET request към web server.

**Наблюдения:**

```
Internet Protocol Version 6, Src: 2001:6f8:..., Dst: 2001:6f8:900:...
    Version: 6
    Traffic Class: 0x00
    Flow Label: 0x00000
    Payload Length: 412 bytes
    Next Header: TCP (6)
    Hop Limit: 64
    Source Address: 2001:6f8:...
    Destination Address: 2001:6f8:900:...
```

**Анализ:**

- **Payload Length:** 412 байта (значително по-голямо от предишния пакет)
- Този пакет съдържа HTTP application layer данни
- Под IPv6 информацията виждаме TCP информация, а под нея - HTTP protocol информация

---

### Пример 3: ICMPv6 Neighbor Solicitation

Последният screenshot показва **ICMPv6 Neighbor Solicitation message** - аналогът на ARP в IPv6.

**Наблюдения:**

```
Internet Protocol Version 6, Src: fe80::..., Dst: ff02::...
    Version: 6
    Traffic Class: 0x00
    Flow Label: 0x00000
    Payload Length: 32 bytes
    Next Header: ICMPv6 (58)
    Hop Limit: 255
    Source Address: fe80::... (Link-Local Address)
    Destination Address: ff02::... (Multicast Address)
```

**Анализ:**

- **Source Address:** **fe80::** - Това е link-local адрес
- Забележете **ff:fe** в адреса - индикира използване на **EUI-64** за генериране на Interface ID
- **Destination Address:** **ff02::** - Multicast адрес (всички nodes на link)
- **Next Header:** 58 (ICMPv6)
- **Hop Limit:** 255 - Максимална стойност за локални съобщения

**Функция:** Neighbor Solicitation е аналогът на ARP request в IPv4. Използва се за открив Découverte на link-local адреса на друго устройство в мрежата.

---

## ICMPv6 и Neighbor Discovery Protocol (NDP)

В IPv6, **ARP е заменен с ICMPv6 Neighbor Discovery Protocol**. NDP използва няколко типа съобщения:

### ICMPv6 Message Types:

| Type | Име | Функция |
|------|-----|---------|
| 133 | Router Solicitation | Host търси router в мрежата |
| 134 | Router Advertisement | Router обявява своето присъствие |
| 135 | Neighbor Solicitation | Търси link-layer адрес (MAC) на neighbor |
| 136 | Neighbor Advertisement | Отговор с link-layer адрес |
| 137 | Redirect | Router пренасочва трафик към по-добър next-hop |

**Neighbor Solicitation и Advertisement** заместват ARP Request и Reply от IPv4.

---

## Практически съвети за анализ във Wireshark

### Филтриране на IPv6 пакети:

```
ipv6
```

### Филтриране по source IPv6 адрес:

```
ipv6.src == 2001:db8::1
```

### Филтриране по destination IPv6 адрес:

```
ipv6.dst == 2001:db8::2
```

### Филтриране по Next Header:

```
ipv6.nxt == 6   (TCP)
ipv6.nxt == 58  (ICMPv6)
ipv6.nxt == 17  (UDP)
```

### Филтриране на ICMPv6 съобщения:

```
icmpv6
icmpv6.type == 135  (Neighbor Solicitation)
icmpv6.type == 136  (Neighbor Advertisement)
```

### Филтриране на link-local адреси:

```
ipv6.src == fe80::/10
```

### Филтриране на multicast адреси:

```
ipv6.dst == ff02::/8
```

---

## Ключови разлики между IPv4 и IPv6

| Характеристика | IPv4 | IPv6 |
|----------------|------|------|
| Адресна дължина | 32 бита | 128 бита |
| Header дължина | 20-60 байта (променлива) | 40 байта (фиксирана) |
| Header Checksum | Да | Не |
| Фрагментация | Router може да фрагментира | Само source host |
| ARP | Да | Не (заменено с NDP) |
| Broadcast | Да | Не (заменено с multicast) |
| IPSec | Опционален | Задължителен |
| Автоконфигурация | DHCP | SLAAC или DHCPv6 |

---

## Въпроси за размисъл

**1.** Защо IPv6 header е по-прост от IPv4 header, въпреки че адресите са много по-дълги?

_IPv6 header е проектиран да бъде ефективен за router обработка. Премахнати са полета като Header Checksum и Options, а header-ът е фиксирана дължина. Това позволява на router-ите да обработват пакети по-бързо, въпреки по-дългите адреси._

**2.** Каква е ролята на Flow Label полето в IPv6?

_Flow Label помага на routers да идентифицират пакети, които принадлежат към същия "flow" или сесия. Това е особено полезно за real-time приложения като VoIP или видео стрийминг, където е важно пакетите да пристигат в правилния ред._

**3.** Защо IPv6 няма broadcast адреси?

_Broadcast е неефективен, защото изпраща пакети до всички устройства, дори до тези, които не се интересуват. IPv6 използва multicast вместо това, което позволява изпращане само до заинтересуваните устройства, намалявайки мрежовия трафик._

**4.** Какво е предимството на използването на ICMPv6 Neighbor Discovery вместо ARP?

_ICMPv6 NDP е по-сигурен и предлага повече функции от ARP. Поддържа автоконфигурация, router discovery, и може да открива duplikate адреси. Също така работи с IPSec за сигурност._

**5.** Защо IPv6 премахва Header Checksum?

_Header Checksum създава overhead, тъй като трябва да се преизчислява на всеки hop. В IPv6 се разчита на checksums на други layers (Link Layer и Transport Layer) за откриване на грешки, което прави пакетната обработка по-ефективна._

---

## Статус на IPv6 внедряването (2025)

### Текущо състояние:

- **Големи доставчици:** Google, Facebook, YouTube, Netflix вече работят с IPv6
- **Мобилни оператори:** В много държави (включително ЕС) по подразбиране дават IPv6 адреси
- **Хостинг компании:** Cloudflare, Akamai предлагат пълна IPv6 поддръжка
- **България:** В средата на класацията - някои доставчици го поддържат

### Проверка на IPv6 connectivity:

Можете да проверите дали вашият доставчик и устройство работят с IPv6 на:
**https://test-ipv6.com/**

### Прогноза:

- Следващите 5–10 години IPv6 ще стане default протокол
- IPv4 ще остане в **dual stack** режим (IPv4 + IPv6 едновременно) още дълго време
- Когато IPv4 ресурсите станат твърде ограничени, преходът ще се ускори

---

## Заключение

IPv6 е бъдещето на Internet Protocol комуникацията. Опростената header структура, огромното адресно пространство и вградената сигурност правят IPv6 по-ефективен и мащабируем от IPv4. Разбирането на IPv6 packet header и неговите полета е critical за съвременните network engineers.

Ключови точки за запомняне:

- IPv6 header е **фиксирани 40 байта**
- **Няма Header Checksum** за по-бърза обработка
- **Flow Label** е ново поле за real-time приложения
- **ICMPv6 NDP** замества ARP
- **Multicast** замества broadcast
- Три основни типа адреси: **Global Unicast, Link-Local, Multicast**

Познаването на IPv6 е essential skill за бъдещето на networking!
