# D03-06: TCP комуникационен процес във Wireshark

> **Поток:** напреднали | **Време:** ~60 мин | **Среда:** Windows 10/11, Wireshark 4.6.x с Npcap
> **Задължителен минимум:** Части 1–4. **Разширение:** Части 5–7 и допълнителните упражнения.
> **Връзка с курса:** лекции D01-05 (TCP и UDP портове) и D01-03 (HTTP, клиент–сървър); държавен въпрос 11 (протоколи, PDU); във финалния тест: SYN → SYN-ACK → ACK.

## Цели на упражнението

След завършване на това упражнение ще можете да:

- Разберете концепцията за connection-oriented протокол
- Прихващате и анализирате TCP Three-Way Handshake
- Идентифицирате TCP Control Bits (флаговете)
- Наблюдавате как се затваря TCP връзка
- Анализирате Sequence Numbers и Acknowledgment Numbers
- Проследявате цялата комуникация в една TCP връзка

## Теоретична основа

**TCP (Transmission Control Protocol)** е един от основните протоколи на транспортния слой. TCP е connection-oriented протокол: преди обмен на данни трябва да се установи връзка.

### Характеристики на TCP:

✅ **Connection-oriented** – изисква установяване на връзка
✅ **Reliable** – потвърждава получените данни (acknowledgments) и изпраща повторно загубените
✅ **Ordered** – получателят подрежда данните по sequence numbers
✅ **Error-checking** – използва контролна сума (checksum)
✅ **Flow control** – механизъм с Window size

### TCP спрямо UDP:

| Характеристика | TCP | UDP |
|----------------|-----|-----|
| Връзка | Connection-oriented | Connectionless |
| Надеждност | Reliable | Без гаранция (best effort) |
| Ред на данните | Подредени | Без подреждане |
| Натоварване (overhead) | По-голямо | По-малко |
| Приложения | HTTP/1.1 и HTTP/2, SSH, SMTP | DNS, VoIP, игри, **QUIC (HTTP/3)** |

> **Забележка:** Много сайтове (Google, YouTube, Facebook) използват HTTP/3 върху QUIC, който работи над **UDP** порт 443. Затова при отворен браузър част от уеб трафика не се вижда с display filter `tcp`.

## TCP Three-Way Handshake

Преди обмен на данни TCP установява връзка чрез Three-Way Handshake:

```
Client                                  Server
  |                                       |
  |  1. SYN (Seq=0)                       |
  |-------------------------------------->|
  |                                       |
  |  2. SYN-ACK (Seq=0, Ack=1)            |
  |<--------------------------------------|
  |                                       |
  |  3. ACK (Seq=1, Ack=1)                |
  |-------------------------------------->|
  |                                       |
  |     Connection Established!           |
```

**Стъпка 1:** Клиентът изпраща SYN (Synchronize) със своя начален sequence number.
**Стъпка 2:** Сървърът отговаря със SYN-ACK: потвърждава SYN на клиента и изпраща своя начален sequence number.
**Стъпка 3:** Клиентът изпраща ACK и потвърждава SYN на сървъра.

> Стойностите 0 и 1 в схемата са **относителни** номера, които Wireshark показва за удобство. Действителните начални номера (ISN) са случайни 32-битови числа.

## TCP Control Bits (Flags)

TCP заглавката съдържа следните флагове:

| Flag | Име | Функция |
|------|-----|---------|
| URG | Urgent | Има спешни данни (полето Urgent Pointer е валидно) |
| ACK | Acknowledgment | Полето Acknowledgment Number е валидно |
| PSH | Push | Получателят да предаде данните на приложението веднага |
| RST | Reset | Незабавно прекратяване на връзката |
| SYN | Synchronize | Установяване на връзка, синхронизиране на sequence numbers |
| FIN | Finish | Изпращачът няма повече данни; затваряне на връзката |
| CWR, ECE | Congestion Window Reduced, ECN-Echo | Сигнализиране на задръстване (ECN) |
| AE | Accurate ECN | Разширение на ECN; Wireshark го показва като Accurate ECN |

Основните шест флага са URG, ACK, PSH, RST, SYN и FIN. CWR, ECE и AE се виждат във Wireshark и обикновено не са зададени.

## Необходими ресурси

- 1 PC (Windows 10/11)
- Wireshark 4.6.x с Npcap
- Достъп до Интернет
- Web browser или `curl.exe` (вграден в Windows 10/11)

> **Важно за филтрите:** Стартирайте всяко прихващане **без** capture filter (полето на началния екран остава празно). Всички филтри в упражнението (`tcp`, `tcp.port == 80`, `tcp.stream eq N`) са display filters и се въвеждат след старта.

---

## Част 1: Прихващане на TCP Three-Way Handshake

### Стъпка 1: Подготовка на Wireshark

**a.** Стартирайте Wireshark.

**b.** Изберете активния мрежов интерфейс. Полето за capture filter оставете празно.

**c.** Кликнете **Start capturing packets**.

### Стъпка 2: Генериране на TCP връзка

**a.** Отворете Command Prompt и изпълнете:

```
C:\>curl.exe -v http://neverssl.com
```

`curl` отваря една TCP връзка, изтегля страницата и затваря връзката веднага. Така прихващането е по-чисто, отколкото с браузър.

**b.** Вместо `curl` можете да използвате браузър и HTTP сайт (`http://neverssl.com` или `http://info.cern.ch`).

> **Забележка за HTTP:** От октомври 2026 г. Chrome (версия 154 и следващи) по подразбиране предупреждава преди да отвори HTTP сайт. Изберете **Continue to site** (Продължи към сайта). Браузърът отваря няколко паралелни връзки, затова работете с една от тях (Стъпка 3).

> TCP handshake се вижда и при HTTPS. HTTP използваме, за да можем в Част 4 да прочетем съдържанието на заявката и отговора без дешифриране.

**c.** Изчакайте около 10 секунди след зареждането и спрете прихващането.

### Стъпка 3: Изолиране на една TCP връзка

**a.** В лентата за display filter въведете:

```
tcp.port == 80
```

**b.** Кликнете на първия пакет с `[SYN]` в колоната Info.

**c.** Кликнете с десен бутон върху него и изберете **Conversation Filter → TCP**. Wireshark ще приложи филтър от вида `tcp.stream eq 0` и ще покаже само пакетите от тази връзка.

> **Защо е нужно?** При общ филтър „първите три пакета“ може да принадлежат на различни връзки, защото браузърът отваря няколко връзки едновременно.

> **Предвидете:** Какви ще бъдат относителните Seq и Ack в третия пакет на handshake?

### Стъпка 4: Намиране на Three-Way Handshake

В списъка с пакети на изолираната връзка първите три пакета са:

- Пакет 1: Info показва `[SYN]`
- Пакет 2: Info показва `[SYN, ACK]`
- Пакет 3: Info показва `[ACK]`

Това е Three-Way Handshake.

### Стъпка 5: Анализ на SYN пакета (Стъпка 1 на handshake)

**a.** Кликнете на пакета с `[SYN]`.

**b.** В Packet Details разгънете **Transmission Control Protocol** и реда **Flags**.

Ще видите изход, подобен на този (стойностите при вас ще са различни):

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80, Seq: 0, Len: 0
    Source Port: 54321
    Destination Port: 80
    [TCP Segment Len: 0]
    Sequence Number: 0    (relative sequence number)
    Sequence Number (raw): 2817394011
    [Next Sequence Number: 1    (relative sequence number)]
    Acknowledgment Number: 0
    Acknowledgment number (raw): 0
    1000 .... = Header Length: 32 bytes (8)
    Flags: 0x002 (SYN)
        000. .... .... = Reserved: Not set
        ...0 .... .... = Accurate ECN: Not set
        .... 0... .... = Congestion Window Reduced: Not set
        .... .0.. .... = ECN-Echo: Not set
        .... ..0. .... = Urgent: Not set
        .... ...0 .... = Acknowledgment: Not set
        .... .... 0... = Push: Not set
        .... .... .0.. = Reset: Not set
        .... .... ..1. = Syn: Set
        .... .... ...0 = Fin: Not set
        [TCP Flags: ··········S·]
    Window: 64240
    [Calculated window size: 64240]
    Checksum: 0xf40d [unverified]
    Urgent Pointer: 0
    Options: (12 bytes), Maximum segment size, No-Operation (NOP), Window scale, No-Operation (NOP), No-Operation (NOP), SACK permitted
```

**c.** Отговорете на въпросите:

- _Какъв е Source Port?_ ______
- _Какъв е Destination Port?_ ______
- _Какъв е относителният Sequence Number?_ ______
- _Какъв е действителният Sequence Number (raw)?_ ______
- _Кой флаг е зададен?_ ______
- _Зададен ли е флагът ACK?_ ______

> **Важно:** Sequence number е случайно 32-битово число (ISN – Initial Sequence Number). Wireshark показва 0 само за удобство; действителната стойност е на реда `Sequence Number (raw)`.

### Стъпка 6: Анализ на SYN-ACK пакета (Стъпка 2)

**a.** Кликнете на пакета с `[SYN, ACK]`.

**b.** Разгънете **Transmission Control Protocol**.

```
Transmission Control Protocol, Src Port: 80, Dst Port: 54321, Seq: 0, Ack: 1, Len: 0
    Source Port: 80
    Destination Port: 54321
    Sequence Number: 0    (relative sequence number)
    Sequence Number (raw): 1938465201
    Acknowledgment Number: 1    (relative ack number)
    Acknowledgment number (raw): 2817394012
    Flags: 0x012 (SYN, ACK)
        .... ...1 .... = Acknowledgment: Set
        .... .... ..1. = Syn: Set
        .... .... ...0 = Fin: Not set
```

**c.** Отговорете:

- _Разменени ли са Source и Destination портовете?_ ______
- _Кои флагове са зададени?_ ______
- _Какъв е относителният Sequence Number?_ ______
- _Какъв е относителният Acknowledgment Number?_ ______
- _Каква е връзката между Acknowledgment number (raw) на сървъра и Sequence Number (raw) на клиента от Стъпка 5?_ ______

### Стъпка 7: Анализ на ACK пакета (Стъпка 3)

**a.** Кликнете на третия пакет с `[ACK]` (без SYN).

**b.** Разгънете **Transmission Control Protocol**.

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80, Seq: 1, Ack: 1, Len: 0
    Source Port: 54321
    Destination Port: 80
    Sequence Number: 1    (relative sequence number)
    Acknowledgment Number: 1    (relative ack number)
    Flags: 0x010 (ACK)
        .... ...1 .... = Acknowledgment: Set
        .... .... ..0. = Syn: Not set
        .... .... ...0 = Fin: Not set
```

**c.** Отговорете:

- _Кой флаг е зададен?_ ______
- _Зададен ли е флагът SYN?_ ______
- _Какъв е относителният Acknowledgment Number?_ ______

<details markdown="1">
<summary>Отговори за самопроверка (Стъпки 5–7)</summary>

- SYN: Source Port е произволен висок номер (ephemeral port); Destination Port е 80; относителен Seq = 0; зададен е само SYN, ACK не е зададен.
- SYN-ACK: портовете са разменени; зададени са SYN и ACK; относителен Seq = 0 (сървърът също започва от свой ISN); относителен Ack = 1.
- Ack (raw) на сървъра = Seq (raw) на клиента + 1. SYN „заема“ един sequence number, затова сървърът очаква следващия байт с номер ISN + 1.
- ACK: зададен е само ACK; относителен Ack = 1 – потвърждава SYN на сървъра. Връзката е установена.

</details>

---

## Част 2: Наблюдаване на преноса на данни

### Стъпка 1: Намиране на HTTP GET request

**a.** След Three-Way Handshake намерете пакет с Info `GET / HTTP/1.1` (протокол HTTP) или `[PSH, ACK]`.

**b.** Кликнете на пакета.

**c.** Разгънете **Transmission Control Protocol**:

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80, Seq: 1, Ack: 1, Len: 82
    Sequence Number: 1    (relative sequence number)
    [Next Sequence Number: 83    (relative sequence number)]
    Acknowledgment Number: 1    (relative ack number)
    Flags: 0x018 (PSH, ACK)
        .... ...1 .... = Acknowledgment: Set
        .... .... 1... = Push: Set
```

**d.** Отговорете:

- _Какво означава флагът PSH?_ ______
- _Колко байта данни (Len) съдържа сегментът и какъв е Next Sequence Number?_ ______
- _Защо флагът ACK е зададен и тук?_ ______

### Стъпка 2: Разглеждане на HTTP данните

**a.** В същия пакет разгънете **Hypertext Transfer Protocol**.

Ще видите HTTP GET request:

```
GET / HTTP/1.1
Host: neverssl.com
User-Agent: curl/8.x
Accept: */*
```

**b.** Забележете капсулирането:

- Транспортен слой: TCP
- Приложен слой: HTTP

<details markdown="1">
<summary>Отговори за самопроверка</summary>

- **PSH** казва на получателя да предаде данните на приложението веднага, без да чака буферът да се напълни.
- Next Sequence Number = Sequence Number + Len (например 1 + 82 = 83).
- След handshake флагът ACK е зададен почти във всеки сегмент: всяка страна потвърждава получените до момента данни. Изключение могат да бъдат някои RST сегменти.

</details>

---

## Част 3: Наблюдаване на затварянето на TCP връзка

### Стъпка 1: Намиране на FIN пакетите

**a.** Превъртете списъка до края на изолираната връзка.

**b.** Потърсете пакети с `[FIN, ACK]` в колоната Info.

Типичната последователност при нормално затваряне е:

- `[FIN, ACK]` – едната страна няма повече данни и иска да затвори
- `[ACK]` – другата страна потвърждава
- `[FIN, ACK]` – другата страна също затваря
- `[ACK]` – първата страна потвърждава

> **Забележка:** Това е **примерна** последователност, а не задължителен брой пакети:
> - Често вторият и третият пакет се сливат и затварянето е в **3 пакета**: `[FIN, ACK]`, `[FIN, ACK]`, `[ACK]`.
> - Браузърите държат връзката отворена (keep-alive) и я затварят след време или с `[RST, ACK]`. Ако сте спрели прихващането твърде рано, FIN пакети може да няма.
> - Затова за тази част използвайте прихващането с `curl` или готовото прихващане от преподавателя.

### Стъпка 2: Анализ на първия FIN пакет

**a.** Кликнете на първия пакет с `[FIN, ACK]`.

**b.** Разгънете **Transmission Control Protocol**:

```
Transmission Control Protocol, Src Port: 54321, Dst Port: 80, Seq: 83, Ack: ..., Len: 0
    Flags: 0x011 (FIN, ACK)
        .... ...1 .... = Acknowledgment: Set
        .... .... ...1 = Fin: Set
```

**c.** Обяснение: флагът FIN означава „Нямам повече данни за изпращане“. Изпращачът може все още да получава данни, докато другата страна също не изпрати FIN.

_Коя страна инициира затварянето във вашето прихващане – клиентът или сървърът?_ ______

### Стъпка 3: Анализ на останалите пакети

**a.** Разгледайте пакетите след първия FIN до края на връзката.

_Колко пакета участват в затварянето във вашето прихващане?_ ______

_Има ли RST пакет? Ако да, коя страна го е изпратила?_ ______

---

## Част 4: Използване на Follow TCP Stream

### Стъпка 1: Проследяване на цялата комуникация

**a.** Маркирайте произволен пакет от изолираната HTTP връзка.

**b.** Кликнете с десен бутон върху пакета → **Follow → TCP Stream** (или Ctrl+Alt+Shift+T).

Wireshark ще покаже цялата комуникация в четим вид.

### Стъпка 2: Разглеждане на прозореца Follow TCP Stream

Ще видите нещо подобно:

```
GET / HTTP/1.1
Host: neverssl.com
User-Agent: curl/8.x
...

HTTP/1.1 200 OK
Content-Type: text/html
...

<html>
...
```

- **Червеният текст** е изпратен от клиента
- **Синият текст** е изпратен от сървъра

**c.** Затворете прозореца. Обърнете внимание, че Wireshark е сменил display filter на `tcp.stream eq N`.

_Можете ли да прочетете съдържанието по същия начин, ако сайтът е по HTTPS? Защо?_ ______

---

## Част 5 (разширение): Анализ на Sequence и Acknowledgment Numbers

### Стъпка 1: Ново прихващане с прост трафик

**a.** Затворете старото прихващане.

**b.** Стартирайте ново прихващане без capture filter.

**c.** Изпълнете `curl.exe http://neverssl.com`.

**d.** Спрете прихващането.

### Стъпка 2: Проследяване на Sequence Numbers

**a.** Изолирайте връзката (**Conversation Filter → TCP**).

**b.** Разгледайте последователните пакети. Примерна последователност:

```
Пакет 1 (SYN):
  Seq = 0

Пакет 2 (SYN-ACK):
  Seq = 0 (сървърът)
  Ack = 1 (потвърждава SYN на клиента, очаква Seq 1)

Пакет 3 (ACK):
  Seq = 1
  Ack = 1 (потвърждава SYN на сървъра)

Пакет 4 (HTTP GET):
  Seq = 1
  Ack = 1
  Len = 82 (изпраща 82 байта данни)

Пакет 5 (ACK от сървъра):
  Seq = 1
  Ack = 83 (потвърждава получаването на 82 байта: 1 + 82 = 83)
```

_Попълнете същата таблица с числата от вашето прихващане._

### Стъпка 3: Разбиране на Acknowledgment Numbers

**Формула:**

```
Ack = Seq на получения сегмент + Len на получения сегмент
```

**Пример:**

- Получих Seq = 100, Len = 50
- Изпращам Ack = 150 (очаквам следващият байт да е с номер 150)

---

## Част 6 (разширение): Наблюдаване на TCP Retransmission

### Стъпка 1: Търсене на повторно изпратени сегменти (ако има)

**a.** В лентата за display filter въведете:

```
tcp.analysis.retransmission
```

Ако има загубени пакети, Wireshark ги маркира като `[TCP Retransmission]`.

### Стъпка 2: Анализ на retransmission

Ако намерите такъв пакет:

**b.** Кликнете на него.

**c.** Wireshark ще покаже:

```
[Expert Info (Note/Sequence): This frame is a (suspected) retransmission]
```

Това означава, че сегментът е изпратен отново, защото потвърждението (ACK) не е пристигнало навреме.

> **Забележка:** В стабилна локална мрежа retransmissions може изобщо да няма. Отворете **Analyze → Expert Information**, за да видите обобщено всички предупреждения в прихващането.

---

## Част 7 (разширение): Състояния на TCP връзката

През своя жизнен цикъл TCP връзката преминава през различни състояния:

| Състояние | Описание |
|-----------|----------|
| CLOSED | Няма връзка |
| LISTEN | Сървърът очаква връзки |
| SYN-SENT | Клиентът е изпратил SYN |
| SYN-RECEIVED | Сървърът е получил SYN и е изпратил SYN-ACK |
| ESTABLISHED | Връзката е активна |
| FIN-WAIT-1 | Локалната страна е изпратила FIN |
| FIN-WAIT-2 | Другата страна е потвърдила FIN; чака се нейният FIN |
| CLOSE-WAIT | Получен е FIN; чака се локалното приложение да затвори |
| CLOSING | Двете страни са изпратили FIN едновременно |
| LAST-ACK | Изпратен е FIN след CLOSE-WAIT; чака се последният ACK |
| TIME-WAIT | Изчакване преди окончателното затваряне (за закъснели пакети) |
| CLOSED | Връзката е затворена |

### Преглед на текущите TCP връзки:

```
C:\>netstat -an | findstr ESTABLISHED
  TCP    192.168.1.100:54321    <адрес на сървъра>:80    ESTABLISHED
```

---

## Практически съвети за Wireshark

### Полезни TCP филтри (display filters):

```
tcp                                       # Всички TCP пакети
tcp.port == 80                            # HTTP трафик
tcp.port == 443                           # HTTPS трафик (през TCP)
tcp.flags.syn == 1                        # Пакети със SYN (включително SYN-ACK)
tcp.flags.syn == 1 && tcp.flags.ack == 0  # Само SYN (начало на връзка)
tcp.flags.syn == 1 && tcp.flags.ack == 1  # Само SYN-ACK
tcp.flags.fin == 1                        # FIN пакети
tcp.flags.reset == 1                      # RST пакети (рязко прекъсване)
tcp.analysis.retransmission               # Повторно изпратени сегменти
tcp.stream eq 0                           # Само първата TCP връзка
```

### Цветове по подразбиране (View → Coloring Rules):

- **TCP SYN/FIN** – сив фон (едно общо правило за SYN и FIN)
- **TCP RST** – тъмночервен фон
- **Bad TCP** (например retransmissions) – черен фон с червен текст
- **HTTP** – светлозелен фон

---

## Въпроси за размисъл

**1.** Защо TCP използва three-way handshake, а не two-way?

<details markdown="1">
<summary>Отговор</summary>

Всяка страна трябва да съобщи своя начален sequence number (ISN) и да получи потвърждение за него. SYN съобщава ISN на клиента, SYN-ACK потвърждава го и съобщава ISN на сървъра, а последният ACK потвърждава ISN на сървъра. С две съобщения ISN на сървъра остава непотвърден. Третото съобщение предпазва и от погрешно установяване на връзка от закъснели стари SYN пакети.

</details>

**2.** Какво се случва, ако SYN пакетът се загуби?

<details markdown="1">
<summary>Отговор</summary>

Клиентът не получава SYN-ACK и след изтичане на таймера (обикновено около 1–3 s в зависимост от операционната система) изпраща SYN отново. Всеки следващ опит чака около два пъти по-дълго. След няколко неуспешни опита връзката се отказва с грешка.

</details>

**3.** Защо sequence number започва от случайно число вместо от 0?

<details markdown="1">
<summary>Отговор</summary>

Случайният ISN затруднява атаките с подправени TCP сегменти: ако атакуващият може да предвиди sequence number, той може да вмъкне данни във връзката или да я прекъсне. Случайният ISN намалява и риска закъснели сегменти от стара връзка да бъдат приети в нова връзка между същите портове.

</details>

**4.** Защо флагът ACK е зададен почти винаги след handshake?

<details markdown="1">
<summary>Отговор</summary>

След установяването на връзката всяка страна потвърждава получените данни. Флагът ACK показва, че полето Acknowledgment Number е валидно. Така всеки сегмент носи и потвърждение, без да са нужни отделни пакети.

</details>

**5.** Каква е разликата между FIN и RST?

<details markdown="1">
<summary>Отговор</summary>

FIN е нормално (graceful) затваряне: всяка страна съобщава, че няма повече данни, и двете посоки се затварят поотделно. RST е рязко прекъсване: връзката се прекратява веднага, без потвърждение, обикновено при грешка, отказ на сървъра (няма слушащ процес на порта) или при затваряне на браузъра.

</details>

## Обяснете сами (без готов отговор)

1. Кое доказателство в прихващането показва, че сървърът е получил вашия GET request?
2. Какво ще видите във Wireshark, ако се опитате да се свържете към порт, на който сървърът не слуша?
3. Защо в Част 5 Ack на сървъра е 83, а не 82?

---

## Допълнителни упражнения (по избор)

### Упражнение 1: Сравнение на TCP връзки

Направете прихващания за:

- HTTP (порт 80)
- HTTPS (порт 443) – шифровано
- SSH (порт 22) – шифровано

Сравнете Three-Way Handshake – еднакъв ли е за всички? Какво се вижда след handshake при HTTPS?

### Упражнение 2: Window Size

Разгледайте полето Window в TCP заглавката. Това е механизмът за flow control.

```
Window: 64240
[Calculated window size: 64240]
```

По-голям прозорец означава, че могат да се изпратят повече данни преди потвърждение. В SYN пакета намерете опцията **Window scale** и обяснете защо `[Calculated window size]` в следващите пакети е много по-голям от стойността в полето Window.

### Упражнение 3: TCP Options

В SYN пакетите разгънете TCP Options:

- MSS (Maximum Segment Size)
- Window Scale
- SACK Permitted (Selective Acknowledgment)
- Timestamps (при Linux и macOS; Windows по подразбиране не ги използва)

---

## Заключение

В това упражнение научихте как да:

✅ Прихващате TCP трафик във Wireshark
✅ Идентифицирате Three-Way Handshake (SYN, SYN-ACK, ACK)
✅ Анализирате TCP Control Flags
✅ Наблюдавате затварянето на връзката
✅ Проследявате TCP комуникацията с Follow TCP Stream
✅ Разбирате Sequence и Acknowledgment Numbers

Ключови точки:

- **Three-Way Handshake:** SYN → SYN-ACK → ACK
- **Надеждна доставка:** потвърждения за получените байтове
- **Подредени данни:** sequence numbers
- **Flow control:** Window size
- **Нормално затваряне:** FIN и ACK от двете страни (3 или 4 пакета)

Познаването на TCP е необходимо за отстраняване на мрежови проблеми, анализ на сигурността и оптимизиране на производителността.

## Полезни команди

### Windows:

```
netstat -an                        # Всички активни връзки
netstat -an | findstr ESTABLISHED  # Само установените връзки
netstat -ano                       # С номера на процеса (PID)
netstat -b                         # С името на приложението (изисква администраторски права)
```

### Тестване на TCP връзка с curl (вграден в Windows 10/11):

```
curl.exe -v http://neverssl.com
```

Параметърът `-v` показва установяването на връзката, изпратената заявка и заглавките на отговора.

<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
