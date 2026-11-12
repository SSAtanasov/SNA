# D03-05: IPv6 пакети във Wireshark

## Цели на упражнението

След завършване на това упражнение ще можете да:

- Разберете структурата на IPv6 packet header
- Сравните IPv4 и IPv6 headers
- Заснемете и анализирате IPv6 трафик
- Разпознавате различни типове IPv6 адреси (global unicast, link-local, multicast)
- Анализирате ICMPv6 Neighbor Discovery Protocol

## Теоретична основа

### Защо IPv6?

IPv4 има сериозни ограничения:
- **Изчерпване на адресите** - само ~4.3 милиарда адреса
- **Липса на вградена сигурност** - IPSec е опционален
- **Сложна header структура** - променлива дължина

**IPv6** решава тези проблеми:
- **128-битови адреси** - 340 ундецилиона адреси (3.4 × 10³⁸)
- **Опростена header** - фиксирани 40 байта
- **Вградена сигурност** - IPSec е задължителен
- **Подобрено QoS** - Flow Label поле

## IPv6 Packet Header - Структура

IPv6 header е **винаги 40 байта** (фиксирана дължина):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version| Traffic Class |           Flow Label                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Payload Length        |  Next Header  |   Hop Limit   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                         Source Address                        +
|                          (128 бита)                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                      Destination Address                      +
|                          (128 бита)                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

## Описание на полетата в IPv6 Header

### 1. **Version** (4 бита)
- Стойност: **6** (0110 в binary)

### 2. **Traffic Class** (8 бита)
- Еквивалент на DS field в IPv4
- Използва се за QoS

### 3. **Flow Label** (20 бита)
- **Ново в IPv6!**
- Помага на routers да поддържат packet flow
- Важно за real-time приложения (VoIP, streaming)

### 4. **Payload Length** (16 бита)
- Дължината на payload (без header-а)
- Максимум: 65,535 байта

### 5. **Next Header** (8 бита)
- Еквивалент на Protocol в IPv4
- **6** = TCP, **17** = UDP, **58** = ICMPv6

### 6. **Hop Limit** (8 бита)
- Еквивалент на TTL в IPv4
- Всеки router намалява с 1

### 7. **Source Address** (128 бита)
- IPv6 адрес на изпращача

### 8. **Destination Address** (128 бита)
- IPv6 адрес на получателя

---

## Типове IPv6 адреси

### 1. **Global Unicast** (2000::/3)
- Маршрутизируеми в Internet
- Пример: 2001:db8:85a3::8a2e:370:7334

### 2. **Link-Local** (fe80::/10)
- Само в локалната мрежа
- Пример: fe80::1

### 3. **Multicast** (ff00::/8)
- За група устройства
- Пример: ff02::1 (всички nodes)

---

## Необходими ресурси

- 1 PC (Windows 10)
- Wireshark инсталиран
- IPv6 connectivity (проверка)
- Command Prompt

---

## Част 1: Проверка на IPv6 connectivity

### Стъпка 1: Проверка дали имате IPv6

**a.** Отворете Command Prompt

**b.** Въведете:
```cmd
C:\>ipconfig

Ethernet adapter Ethernet:

   Link-local IPv6 Address . . . . . : fe80::a1b2:c3d4:e5f6:7890%11
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : fe80::1%11
                                       192.168.1.1
```

**c.** Запишете вашия:
- Link-local IPv6 Address: _____________________
- IPv6 Default Gateway (ако има): _____________________

> **Забележка:** Дори без global IPv6 connectivity, вашият компютър винаги има link-local IPv6 адрес (започва с fe80::)

### Стъпка 2: Тестване на IPv6 connectivity

**a.** Опитайте ping към IPv6 localhost:
```cmd
C:\>ping ::1

Pinging ::1 with 32 bytes of data:
Reply from ::1: time<1ms
Reply from ::1: time<1ms
Reply from ::1: time<1ms
Reply from ::1: time<1ms
```

**b.** Опитайте ping към Google IPv6 DNS (ако имате IPv6 Internet):
```cmd
C:\>ping 2001:4860:4860::8888

Pinging 2001:4860:4860::8888 with 32 bytes of data:
Reply from 2001:4860:4860::8888: time=20ms
```

> **Забележка:** Ако няма отговор, вашият ISP не предоставя IPv6. Това е нормално - ще използваме link-local трафик за упражнението.

### Стъпка 3: Проверка на IPv6 neighbors

**a.** Въведете:
```cmd
C:\>netsh interface ipv6 show neighbors

Interface 11: Ethernet

Internet Address                              Physical Address   Type
--------------------------------------------  -----------------  -----------
fe80::1                                       aa-bb-cc-dd-ee-ff  Reachable
ff02::1                                       33-33-00-00-00-01  Permanent
ff02::2                                       33-33-00-00-00-02  Permanent
```

Това е еквивалентът на ARP таблицата за IPv6.

---

## Част 2: Заснемане и анализ на link-local IPv6 трафик

### Стъпка 1: Стартиране на Wireshark capture

**a.** Стартирайте Wireshark

**b.** Изберете активния network interface

**c.** В filter bar напишете:
```
ipv6
```

**d.** Кликнете **Start capturing packets**

### Стъпка 2: Генериране на IPv6 трафик

**a.** В Command Prompt, направете ping към вашия IPv6 localhost:

```cmd
C:\>ping ::1 -n 4

Pinging ::1 with 32 bytes of data:
Reply from ::1: time<1ms
Reply from ::1: time<1ms
Reply from ::1: time<1ms
Reply from ::1: time<1ms
```

**b.** Ако имате IPv6 gateway, направете ping към него:

```cmd
C:\>ping fe80::1%11 -n 2
```

> **Забележка:** %11 е interface index - замете го с вашия от `ipconfig`

**c.** Спрете capture-а във Wireshark

### Стъпка 3: Филтриране на ICMPv6 трафик

**a.** В filter bar напишете:
```
icmpv6
```

**b.** Натиснете Enter

Ще видите ICMPv6 пакети (ping requests и replies).

### Стъпка 4: Анализ на IPv6 Echo Request

**a.** Кликнете на пакет с **"Echo (ping) request"** в Info колоната

**b.** В packet details pane, разгънете **Internet Protocol Version 6**

```
Internet Protocol Version 6, Src: ::1, Dst: ::1
    0110 .... = Version: 6
    .... 0000 0000 .... = Traffic Class: 0x00
    .... .... .... 0000 0000 0000 0000 0000 = Flow Label: 0x00000
    Payload Length: 40
    Next Header: ICMPv6 (58)
    Hop Limit: 128
    Source Address: ::1
    Destination Address: ::1
```

**c.** Отговорете на въпросите:

_Каква е стойността на Version полето?_ **6**

_Каква е дължината на IPv6 header?_ **40 байта (винаги фиксирани)**

_Каква е стойността на Next Header?_ **58 (ICMPv6)**

_Каква е стойността на Hop Limit?_ ________________

_Какъв е Source адресът?_ **::1 (localhost)**

### Стъпка 5: Сравнение с IPv4

**d.** Забележете разликите спрямо IPv4:

| Характеристика | IPv4 | IPv6 |
|----------------|------|------|
| Header дължина | 20-60 байта (променлива) | 40 байта (фиксирана) |
| Header Checksum | Да | Не |
| TTL / Hop Limit | TTL | Hop Limit (същото) |
| Protocol / Next Header | Protocol | Next Header (същото) |
| Адресна дължина | 32 бита | 128 бита |

---

## Част 3: Заснемане на ICMPv6 Neighbor Discovery

### Стъпка 1: Изчистване на IPv6 neighbor cache

**a.** В Command Prompt с Administrator права, въведете:

```cmd
C:\>netsh interface ipv6 delete neighbors
Ok.
```

Това изтрива IPv6 neighbor cache (еквивалент на `arp -d` за IPv4).

### Стъпка 2: Стартиране на нов capture

**a.** Във Wireshark, затворете стария capture (File → Close)

**b.** Стартирайте нов capture с филтър:
```
icmpv6
```

### Стъпка 3: Генериране на Neighbor Solicitation

**a.** В Command Prompt, направете ping към вашия gateway (ако има IPv6):

```cmd
C:\>ping fe80::1%11 -n 1
```

Или ping към друго устройство в мрежата с IPv6.

**b.** Спрете capture-а

### Стъпка 4: Анализ на Neighbor Solicitation

**a.** Потърсете пакет с Info: **"Neighbor Solicitation"**

**b.** Кликнете на пакета

**c.** Разгънете **Internet Protocol Version 6**

```
Internet Protocol Version 6, Src: fe80::..., Dst: ff02::1:ff00:1
    Version: 6
    Traffic Class: 0x00
    Flow Label: 0x00000
    Payload Length: 32
    Next Header: ICMPv6 (58)
    Hop Limit: 255
    Source Address: fe80::a1b2:c3d4:e5f6:7890
    Destination Address: ff02::1:ff00:1
```

**d.** Забележете:

_Source адресът е:_ **fe80::... (link-local)**

_Destination адресът е:_ **ff02::... (multicast)**

Това е **solicited-node multicast** адрес - еквивалента на broadcast в IPv4.

_Какъв е Hop Limit?_ **255** (максимален за локални съобщения)

### Стъпка 5: Разглеждане на ICMPv6 съдържанието

**e.** Разгънете **Internet Control Message Protocol v6**

```
Internet Control Message Protocol v6
    Type: Neighbor Solicitation (135)
    Code: 0
    Checksum: 0x1234 [correct]
    Target Address: fe80::1
    ICMPv6 Option (Source link-layer address)
        Type: Source link-layer address (1)
        Length: 1 (8 bytes)
        Link-layer address: aa:bb:cc:dd:ee:ff
```

**f.** Обяснение:

Neighbor Solicitation е аналогът на **ARP Request** в IPv4. Устройството пита:
- "Кой има IPv6 адрес fe80::1?"
- "Ако е твоят адрес, отговори с твоя MAC адрес"

### Стъпка 6: Намиране на Neighbor Advertisement

**a.** Потърсете следващия пакет с Info: **"Neighbor Advertisement"**

**b.** Кликнете на пакета

**c.** Разгънете **Internet Protocol Version 6**

```
Internet Protocol Version 6, Src: fe80::1, Dst: fe80::a1b2:c3d4:e5f6:7890
    Source Address: fe80::1
    Destination Address: fe80::a1b2:c3d4:e5f6:7890
```

**d.** Забележете:

_Source и Destination са разменени?_ **Да**

_Destination адресът вече е unicast (не multicast)?_ **Да**

Това е отговорът - router-ът изпраща своя MAC адрес обратно директно към заявителя.

---

## Част 4: IPv6 трафик към Internet (ако имате IPv6)

### Стъпка 1: Проверка за IPv6 Internet connectivity

**a.** Опитайте:
```cmd
C:\>ping 2001:4860:4860::8888

Pinging 2001:4860:4860::8888 with 32 bytes of data:
Reply from 2001:4860:4860::8888: time=20ms
```

Ако работи, имате IPv6 Internet!

### Стъпка 2: Заснемане на IPv6 Internet трафик

**a.** Стартирайте нов Wireshark capture с филтър:
```
ipv6 && icmpv6
```

**b.** Направете ping към Google IPv6 DNS:
```cmd
C:\>ping 2001:4860:4860::8888 -n 2
```

**c.** Спрете capture-а

### Стъпка 3: Анализ на global unicast адреси

**a.** Кликнете на Echo request пакет

**b.** Разгънете **Internet Protocol Version 6**

```
Internet Protocol Version 6, Src: 2001:xxxx:xxxx::yyyy, Dst: 2001:4860:4860::8888
    Source Address: 2001:xxxx:xxxx::yyyy
    Destination Address: 2001:4860:4860::8888
```

**c.** Забележете:

_Source адресът започва с 2001?_ **Да - global unicast**

_Destination адресът е 2001:4860:4860::8888?_ **Да - Google Public DNS**

Тези адреси са маршрутизируеми в Internet, за разлика от link-local (fe80::).

---

## Част 5: Анализ на IPv6 TCP connection (по избор)

### Стъпка 1: Заснемане на TCP трафик

**a.** Стартирайте Wireshark capture с филтър:
```
ipv6 && tcp
```

**b.** В browser, посетете IPv6-enabled уебсайт:
- http://ipv6.google.com
- http://[2606:2800:220:1:248:1893:25c8:1946] (example.com IPv6)

> **Забележка:** IPv6 адреси в URL се слагат в скоби [ ]

**c.** Спрете capture-а

### Стъпка 2: Анализ на TCP SYN пакет

**a.** Намерете TCP пакет с [SYN] flag

**b.** Разгънете **Internet Protocol Version 6**

```
Internet Protocol Version 6, Src: 2001:..., Dst: 2607:f8b0:4004:...
    Version: 6
    Payload Length: 40
    Next Header: TCP (6)
    Hop Limit: 64
```

**c.** Сравнете с IPv4 TCP:

_Next Header е 6 (TCP) - същото като Protocol в IPv4?_ **Да**

_IPv6 header е по-прост от IPv4?_ **Да - без Checksum, без Fragmentation полета**

---

## Практически съвети за Wireshark

### Полезни филтри за IPv6:

```
ipv6                              # Всички IPv6 пакети
ipv6.src == 2001:db8::1           # От конкретен IPv6
ipv6.dst == 2001:4860:4860::8888  # Към Google IPv6 DNS
icmpv6                            # Всички ICMPv6
icmpv6.type == 135                # Neighbor Solicitation
icmpv6.type == 136                # Neighbor Advertisement
ipv6.nxt == 6                     # TCP
ipv6.nxt == 58                    # ICMPv6
```

### Филтриране по тип адрес:

```
ipv6.src == fe80::/10             # Link-local source
ipv6.dst == ff02::/16             # Multicast destination
ipv6.addr == 2001:db8::/32        # Конкретна subnet
```

---

## Сравнение IPv4 vs IPv6

| Характеристика | IPv4 | IPv6 |
|----------------|------|------|
| Адресна дължина | 32 бита | 128 бита |
| Брой адреси | 4.3 милиарда | 340 ундецилиона |
| Header дължина | 20-60 байта (променлива) | 40 байта (фиксирана) |
| Header Checksum | Да | Не |
| Фрагментация | Router може | Само source host |
| Address resolution | ARP | ICMPv6 NDP |
| Broadcast | Да | Не (multicast вместо това) |
| IPSec | Опционален | Задължителен |
| Конфигурация | DHCP | SLAAC или DHCPv6 |

---

## Въпроси за размисъл

**1.** Защо IPv6 header е по-прост, въпреки че адресите са много по-дълги?

_IPv6 е проектиран за ефективност. Премахнати са полета като Header Checksum и Options. Header-ът е фиксирана дължина, което позволява на router-ите да обработват пакети по-бързо._

**2.** Каква е ролята на Flow Label полето?

_Flow Label помага на routers да идентифицират пакети от един "flow" или сесия. Това е важно за real-time приложения (VoIP, streaming), където пакетите трябва да пристигат в правилния ред._

**3.** Защо IPv6 използва ICMPv6 Neighbor Discovery вместо ARP?

_ICMPv6 NDP е по-сигурен и има повече функции. Работи с multicast вместо broadcast (по-ефективно), поддържа автоконфигурация, и може да се защити с IPSec._

**4.** Какво е предимството на link-local адресите?

_Link-local адресите позволяват на устройства да комуникират в локалната мрежа без нужда от глобална конфигурация. Те се генерират автоматично и винаги са налични._

**5.** Защо IPv6 няма broadcast?

_Broadcast е неефективен - изпраща пакети до всички, дори до незаинтересувани. IPv6 използва multicast, който изпраща само до заинтересувани устройства, намалявайки мрежовия трафик._

---

## Допълнителни упражнения (по избор)

### Упражнение 1: IPv6 address shortening

Практикувайте съкращаване на IPv6 адреси:

Пълен адрес:
```
2001:0db8:0000:0000:0000:ff00:0042:8329
```

Съкратен:
```
2001:db8::ff00:42:8329
```

Правила:
- Водещи нули в група се пропускат
- Последователни групи от нули се заменят с ::
- :: може да се използва само веднъж

### Упражнение 2: Neighbor Discovery анализ

Изтрийте neighbor cache и наблюдавайте пълния процес:
1. Neighbor Solicitation (multicast)
2. Neighbor Advertisement (unicast)
3. Последващ трафик използва cached MAC

### Упражнение 3: IPv6 prefix

Използвайте `netsh` за да видите вашия IPv6 prefix:
```cmd
C:\>netsh interface ipv6 show prefixpolicy
```

---

## Полезни команди за IPv6

### Windows:

```cmd
ipconfig                                    # Покажи IPv6 адреси
ping ::1                                    # Ping localhost
ping fe80::1%11                             # Ping link-local (с interface index)
ping 2001:4860:4860::8888                   # Ping Google IPv6 DNS
tracert 2001:4860:4860::8888                # Traceroute към IPv6 адрес
netsh interface ipv6 show neighbors        # Покажи neighbor cache
netsh interface ipv6 delete neighbors      # Изтрий neighbor cache
netsh interface ipv6 show interfaces       # Покажи IPv6 интерфейси
```

### Тестване на IPv6 connectivity:

- **https://test-ipv6.com/** - Провери дали имаш IPv6
- **https://ipv6-test.com/** - Алтернативен тест

---

## Заключение

В това упражнение научихте как да:

✅ Проверявате IPv6 connectivity  
✅ Заснемате IPv6 трафик във Wireshark  
✅ Анализирате IPv6 header полета  
✅ Разпознавате типове IPv6 адреси (link-local, global, multicast)  
✅ Изследвате ICMPv6 Neighbor Discovery  
✅ Сравнявате IPv4 и IPv6  

IPv6 е бъдещето на Internet комуникацията. Ключови точки:

- **Фиксиран 40-байтов header** - по-прост и бърз
- **Огромно адресно пространство** - 128 бита
- **ICMPv6 NDP** замества ARP
- **Multicast** замества broadcast
- **Три основни типа адреси:** Global Unicast, Link-Local, Multicast

Познаването на IPv6 е essential за съвременните network engineers!


<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
