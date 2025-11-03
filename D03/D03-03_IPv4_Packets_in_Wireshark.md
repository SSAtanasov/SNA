# D03-03: IPv4 пакети във Wireshark

## Цели на упражнението

След завършване на това упражнение ще можете да:

- Разберете структурата на IPv4 packet header
- Идентифицирате основните полета в IPv4 заглавката  
- Заснемете и анализирате различни типове IPv4 пакети (TCP, HTTP, ICMP)
- Разберете ролята на TTL, Protocol field и други ключови полета
- Сравните различни типове IPv4 трафик

## Теоретична основа

**IPv4** е един от основните network layer комуникационни протоколи. IPv4 packet header се използва за гарантиране, че този пакет бъде доставен до следващата му спирка по пътя към крайното устройство.

IPv4 packet header се състои от полета, съдържащи важна информация за пакета. Тези полета съдържат binary числа, които се изследват от Layer 3 процеса.

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
- Съдържа 4-битова binary стойност **0100** (4 в decimal)
- Идентифицира това като IPv4 пакет

### 2. **Internet Header Length (IHL)** (4 бита)
- Показва дължината на IPv4 header в 32-битови думи (4 байта)
- Минимална стойност: **5** (20 байта)
- Максимална стойност: **15** (60 байта)

### 3. **Differentiated Services (DS)** (8 бита)
- Използва се за определяне на приоритета на пакета (QoS)
- Полезно за VoIP, видео стрийминг

### 4. **Total Length** (16 бита)
- Общата дължина на IP пакета (header + data) в байтове
- Максимална стойност: **65,535 байта**

### 5. **Identification** (16 бита)
- Уникален идентификатор за фрагментация и reassembly

### 6. **Flags** (3 бита)
- **Bit 0:** Резервиран (винаги 0)
- **Bit 1:** Don't Fragment (DF) - Ако е 1, пакетът не може да се фрагментира
- **Bit 2:** More Fragments (MF) - Ако е 1, има още фрагменти

### 7. **Fragment Offset** (13 бита)
- Позицията на фрагмента в оригиналния пакет

### 8. **Time to Live (TTL)** (8 бита)
- Предотвратява безкрайни loop-ове
- Всеки router намалява TTL с 1
- Когато TTL = 0, пакетът се отхвърля
- **Типични стойности:** 64 (Linux), 128 (Windows), 255 (Cisco)

### 9. **Protocol** (8 бита)
- Идентифицира upper layer протокола
- **1** = ICMP, **6** = TCP, **17** = UDP

### 10. **Header Checksum** (16 бита)
- Проверка за грешки в IP header

### 11. **Source IP Address** (32 бита)
- IPv4 адресът на изпращача

### 12. **Destination IP Address** (32 бита)
- IPv4 адресът на получателя

---

## Необходими ресурси

- 1 PC (Windows 10)
- Wireshark инсталиран
- Достъп до Интернет
- Command Prompt

---

## Част 1: Подготовка и настройка

### Стъпка 1: Проверка на мрежовата конфигурация

**a.** Отворете Command Prompt (Windows key + R, напишете `cmd`, натиснете Enter)

**b.** Въведете командата `ipconfig /all` и натиснете Enter

```cmd
C:\>ipconfig /all

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : Intel(R) Network Adapter
   Physical Address. . . . . . . . . : XX-XX-XX-XX-XX-XX
   IPv4 Address. . . . . . . . . . . : 192.168.1.X
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
```

**c.** Запишете вашите:
- IPv4 адрес: ___________________
- Default Gateway: ___________________
- DNS Server: ___________________

---

## Част 2: Заснемане и анализ на ICMP трафик (ping)

### Стъпка 1: Стартиране на Wireshark и започване на capture

**a.** Стартирайте Wireshark (Start → Wireshark)

**b.** Изберете активния network interface (обикновено Ethernet или Wi-Fi адаптерът)

**c.** В filter bar напишете:
```
ip
```

**d.** Кликнете на **Start capturing packets** (синя shark fin икона)

### Стъпка 2: Генериране на ICMP трафик

**a.** Отворете Command Prompt прозорец

**b.** Направете ping към вашия default gateway:

```cmd
C:\>ping 192.168.1.1

Pinging 192.168.1.1 with 32 bytes of data:
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
```

**c.** Спрете capture-а във Wireshark (червена квадратна икона)

### Стъпка 3: Филтриране на ICMP пакети

**a.** В filter bar напишете:
```
icmp
```

**b.** Натиснете Enter или кликнете на стрелката (Apply)

Сега ще видите само ICMP пакетите (ping request и reply).

### Стъпка 4: Анализ на ICMP Echo Request пакет

**a.** В packet list pane (горе), кликнете на първия пакет с **"Echo (ping) request"** в Info колоната

**b.** В packet details pane (средата), разгънете **Internet Protocol Version 4**

Ще видите нещо подобно на:

```
Internet Protocol Version 4, Src: 192.168.1.X, Dst: 192.168.1.1
    0100 .... = Version: 4
    .... 0101 = Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)
    Total Length: 60
    Identification: 0x1234 (4660)
    Flags: 0x0000
        0... .... .... .... = Reserved bit: Not set
        .0.. .... .... .... = Don't fragment: Not set
        ..0. .... .... .... = More fragments: Not set
    Fragment Offset: 0
    Time to Live: 128
    Protocol: ICMP (1)
    Header Checksum: 0xabcd [validation disabled]
    Source Address: 192.168.1.X
    Destination Address: 192.168.1.1
```

**c.** Отговорете на следните въпроси:

_Каква е стойността на Version полето?_ **4**

_Каква е дължината на header (Header Length)?_ **20 байта**

_Каква е стойността на TTL?_ ________________
*(Windows обикновено използва 128)*

_Каква е стойността на Protocol полето?_ **1 (ICMP)**

_Какви са Source и Destination IP адресите?_
- Source: ________________
- Destination: ________________

### Стъпка 5: Анализ на ICMP Echo Reply пакет

**a.** Кликнете на втория пакет с **"Echo (ping) reply"** в Info колоната

**b.** Разгънете **Internet Protocol Version 4** в packet details pane

**c.** Наблюдавайте разликите:

_Какъв е TTL на reply пакета?_ ________________
*(Обикновено 64 за Linux/router, 255 за Cisco)*

_Разменени ли са Source и Destination адресите?_ **Да**

_Source адрес на reply пакета е:_ ________________ *(Default gateway-ят)*

---

## Част 3: Заснемане и анализ на TCP трафик

### Стъпка 1: Изчистване и нов capture

**a.** Във Wireshark, кликнете **File → Close** (или Ctrl+W) за да затворите текущия capture

**b.** Кликнете **Continue without Saving** ако се появи prompt

**c.** Стартирайте нов capture с филтър:
```
tcp
```

### Стъпка 2: Генериране на TCP трафик

**a.** Отворете web browser (Chrome, Firefox, Edge)

**b.** Посетете уебсайт (например http://example.com или http://neverssl.com)

> **Забележка:** Използвайте **HTTP** (не HTTPS), за да видите неенкриптиран TCP трафик. Уебсайтове като http://neverssl.com или http://example.com работят с обикновен HTTP.

**c.** Изчакайте страницата да се зареди

**d.** Спрете capture-а във Wireshark

### Стъпка 3: Анализ на TCP пакет

**a.** В packet list pane, намерете пакет с:
- Protocol: **TCP**
- Info: **[SYN]** или друго TCP съобщение

**b.** Кликнете на пакета

**c.** В packet details pane, разгънете **Internet Protocol Version 4**

```
Internet Protocol Version 4, Src: 192.168.1.X, Dst: 93.184.216.34
    Version: 4
    Header Length: 20 bytes (5)
    Differentiated Services Field: 0x00
    Total Length: 52
    Identification: 0x5678 (22136)
    Flags: 0x4000, Don't fragment
        0... .... .... .... = Reserved bit: Not set
        .1.. .... .... .... = Don't fragment: Set
        ..0. .... .... .... = More fragments: Not set
    Fragment Offset: 0
    Time to Live: 128
    Protocol: TCP (6)
    Header Checksum: 0x1234
    Source Address: 192.168.1.X
    Destination Address: 93.184.216.34
```

**d.** Отговорете на въпросите:

_Каква е стойността на Protocol полето?_ **6 (TCP)**

_Зададен ли е Don't Fragment (DF) flag?_ ________________

_Какъв е Total Length на пакета?_ ________________

_Към кой уебсайт се свързвате (Destination Address)?_ ________________

### Стъпка 4: Сравнение на различни TCP пакети

**a.** Разгледайте няколко различни TCP пакети в capture-а

**b.** Забележете как Total Length варира в зависимост от payload данните

**c.** Потърсете пакет с по-голяма дължина (например данни от web page)

_Намерихте ли TCP пакет с Total Length > 500 байта?_ ________________

_Какъв е най-големият Total Length, който видяхте?_ ________________

---

## Част 4: Заснемане и анализ на HTTP трафик

### Стъпка 1: Нов capture с HTTP филтър

**a.** Затворете текущия capture (File → Close)

**b.** Стартирайте нов capture с филтър:
```
http
```

> **Забележка:** За да видите HTTP трафик, уебсайтът трябва да използва обикновен HTTP (не HTTPS/SSL). Опитайте http://neverssl.com

### Стъпка 2: Генериране на HTTP GET request

**a.** В browser, посетете http://neverssl.com

**b.** Спрете capture-а

### Стъпка 3: Намиране на HTTP GET request пакет

**a.** В packet list, потърсете пакет с Info: **GET / HTTP/1.1**

**b.** Кликнете на пакета

**c.** Разгънете **Internet Protocol Version 4**

```
Internet Protocol Version 4, Src: 192.168.1.X, Dst: 34.223.124.45
    Version: 4
    Header Length: 20 bytes (5)
    Total Length: 411
    Protocol: TCP (6)
    Source Address: 192.168.1.X
    Destination Address: 34.223.124.45
```

**d.** Забележете:

_Какъв е Total Length на HTTP GET request пакета?_ ________________
*(Обикновено 300-500 байта, много повече от ping)*

_Защо HTTP пакетът е по-голям от ICMP пакета?_

_Отговор: HTTP GET request съдържа HTTP headers (Host, User-Agent, Accept, и т.н.), което увеличава размера на payload данните._

### Стъпка 4: Разглеждане на пълния пакет

**a.** В packet details pane, разгънете:
- Internet Protocol Version 4
- Transmission Control Protocol
- Hypertext Transfer Protocol

**b.** Забележете как **три протокола** са капсулирани един в друг:
- **Layer 3:** IPv4 (Network)
- **Layer 4:** TCP (Transport)
- **Layer 7:** HTTP (Application)

---

## Част 5: Изследване на TTL стойности

### Стъпка 1: Ping към отдалечен хост

**a.** Стартирайте нов capture във Wireshark с филтър:
```
icmp
```

**b.** В Command Prompt, направете ping към публичен DNS сървър:

```cmd
C:\>ping 8.8.8.8

Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=15ms TTL=117
Reply from 8.8.8.8: bytes=32 time=14ms TTL=117
Reply from 8.8.8.8: bytes=32 time=16ms TTL=117
Reply from 8.8.8.8: bytes=32 time=15ms TTL=117
```

**c.** Спрете capture-а

### Стъпка 2: Анализ на TTL

**a.** Кликнете на Echo request пакет

**b.** Разгънете Internet Protocol Version 4

_Каква е TTL стойността на Echo request?_ ________________
*(Windows по подразбиране е 128)*

**c.** Кликнете на Echo reply пакет

_Каква е TTL стойността на Echo reply?_ ________________
*(Обикновено около 117 - начална стойност била 128, минала през ~11 router-a)*

**d.** Изчислете колко router-а е преминал reply пакетът:

_Формула: Начална TTL - Текуща TTL = Брой hops_

Ако reply TTL е 117, и знаем че Google използва начална стойност 128:
128 - 117 = **11 hops** (router-а)

### Стъпка 3: Използване на tracert за проверка

**a.** В Command Prompt, въведете:

```cmd
C:\>tracert 8.8.8.8
```

**b.** Пребройте броя на hops (router-ите) до 8.8.8.8

_Отговаря ли броят на hops с вашите изчисления от TTL?_ ________________

---

## Практически съвети за Wireshark

### Полезни филтри за IPv4 анализ:

```
ip                          # Всички IPv4 пакети
ip.src == 192.168.1.1       # Само от този source IP
ip.dst == 8.8.8.8           # Само към този destination IP
ip.ttl < 64                 # Пакети с нисък TTL
ip.proto == 6               # Само TCP (Protocol = 6)
ip.proto == 1               # Само ICMP (Protocol = 1)
ip.addr == 192.168.1.0/24   # Всички IP в тази subnet
```

### Комбинирани филтри:

```
ip.src == 192.168.1.100 && tcp          # TCP от конкретен IP
icmp && ip.ttl > 100                    # ICMP с висок TTL
ip.dst == 8.8.8.8 && ip.proto == 17     # UDP към 8.8.8.8
```

---

## Въпроси за размисъл

**1.** Защо е важно Protocol полето в IPv4 header?

_Protocol полето казва на получателя какъв upper-layer протокол се съдържа в data частта. Без това поле, получателят не би знаел дали data съдържа TCP, UDP, ICMP или друг протокол._

**2.** Каква е ролята на TTL полето и какво се случва когато TTL стане 0?

_TTL предотвратява пакети да циркулират безкрайно в мрежата при routing loop. Всеки router намалява TTL с 1. Когато TTL достигне 0, router-ът отхвърля пакета и изпраща ICMP "Time Exceeded" съобщение обратно._

**3.** Защо HTTP пакетът е много по-голям от ping пакета?

_HTTP пакетът съдържа не само IP и TCP headers, но и HTTP application data (GET request с headers като Host, User-Agent, Accept, и т.н.). Ping пакетът съдържа само ICMP header и малко payload данни._

**4.** Какво можете да заключите от TTL стойността на получен пакет?

_От TTL може да заключим приблизително колко router-а е преминал пакетът. Също така, различните операционни системи използват различни начални TTL стойности (64 за Linux, 128 за Windows, 255 за Cisco), което може да помогне за идентифициране на source операционната система._

---

## Заключение

В това упражнение научихте как да:

✅ Заснемате IPv4 трафик във Wireshark  
✅ Идентифицирате и анализирате IPv4 header полета  
✅ Разпознавате различни Protocol types (ICMP, TCP)  
✅ Изследвате TTL и неговата роля  
✅ Сравнявате различни типове IPv4 пакети  

IPv4 header съдържа критична информация за маршрутизация и доставка на пакети. Най-важните полета са:
- **Source/Destination IP** - къде отива пакетът
- **TTL** - колко router-а може да премине
- **Protocol** - какъв протокол е в data частта
- **Flags** - може ли да се фрагментира

Тези знания са основа за troubleshooting и network анализ!
