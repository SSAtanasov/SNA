# D02-03: DHCP конфигурация
## Dynamic Host Configuration Protocol – Автоматично IP адресиране

> **Поток:** АКС + ИКТО | **Време:** ~80 мин
> **Задължителен минимум:** Части 1–3 и 5–7 (с Част 6А в Simulation). **Разширение:** Част 4, Част 7А, Част 8 и задачите за самостоятелна работа.
> **Връзка с лекциите:** D01-03 (DHCP, клиент и сървър), D02-03 (IPv4 адреси), D01-05 (портове UDP 67 и 68).
> **Начало:** отворете `D02-02_YourName.pkt` (основния файл, без бонуса и задачите) и го запазете като `D02-03_YourName.pkt`.

**Цел:** Да се научите да конфигурирате DHCP за автоматично раздаване на IP адреси и да видите в Simulation четирите съобщения на DHCP.

---

## ПРЕДИ УПРАЖНЕНИЕТО

**За справка:** записките към лекциите [D01-03](../res/D01-03.md) (клиенти и сървъри, мрежови услуги) и [D01-05](../res/D01-05.md) (портове 67 и 68). Процесът DORA и наемът (lease) са описани по-долу. В „Как да се подготвя за изпита“ – реда „DHCP“.

- **DHCP** раздава автоматично адрес, маска, шлюз и DNS сървър.
- Обменът е **DORA**: Discover → Offer → Request → Acknowledge. Discover и Request са broadcast.
- **Pool** – набор адреси за една мрежа; **excluded addresses** – адреси, които не се раздават (за router-и и сървъри).
- **Lease time** – срокът, за който адресът е даден; клиентът го подновява преди да изтече.
- DHCP работи по **UDP**: клиентът използва порт 68, сървърът – порт 67.
- Адрес **169.254.x.x** означава, че DHCP сървър не е отговорил.

### Проверете се

1. Кои четири съобщения образуват DHCP обмена и кои от тях са broadcast?
2. Защо адресите на router-а (маршрутизатора) и сървърите се изключват от pool-а?
3. Какво означава, ако компютърът има адрес 169.254.12.7?

---

## ЧАСТ 1: Какво е DHCP? (5 мин)

### Проблем без DHCP:

```
 Администраторът трябва РЪЧНО да конфигурира всеки PC:
   - IP Address
   - Subnet Mask
   - Default Gateway
   - DNS Server

 Голям риск от грешки (duplicate IP)
 Много време при 50+ компютъра
```

### Решение с DHCP:

```
 PC се включва в мрежата
 Автоматично получава всички настройки
 Няма грешки, няма duplicate IP-та
 Бърза конфигурация
```

### Как работи? (DORA процес)

```
1. PC:      "Има ли тук DHCP server?" (DISCOVER)
2. Server:  "Да! Ето ти IP: 192.168.10.11" (OFFER)
3. PC:      "OK, приемам го" (REQUEST)
4. Server:  "Потвърдено!" (ACK)
```

- **Discover** и **Request** са **broadcast**: компютърът още няма адрес и не знае къде е сървърът.
- **Lease** е срокът, за който адресът е даден. По подразбиране клиентът започва да го подновява при изтичане на половината от срока.

### Какво получава PC-то?

| Параметър | Стойност | Обяснение |
|-----------|----------|-----------|
| IP Address | 192.168.10.11 | Адресът на PC-то |
| Subnet Mask | 255.255.255.0 | Размер на мрежата |
| Default Gateway | 192.168.10.1 | Router за излизане от мрежата |
| DNS Server | 8.8.8.8 | Google DNS за имена |

---

## ЧАСТ 2: Топология (5 мин)

Продължаваме със същата топология от D02-02:

```
              [Router R1]
                   |
            GigE0/0 (trunk)
                   |        Gi0/1 (trunk)
              [Switch SW1] ----------[Switch SW2]
               /   |   \   \           /      \
           Fa0/2 Fa0/3 Fa0/4 Fa0/5   Fa0/2  Fa0/3
             /     |     \     \       |      |
        [PC1]  [PC2]  [PC3]  [PC4]   [PC5]  [PC6]
       VLAN10 VLAN10 VLAN20 VLAN20   VLAN10 VLAN20
```

**VLAN-и:**
- VLAN 10: 192.168.10.0/24
- VLAN 20: 192.168.20.0/24

**+ SW2 (Access):** свързан към SW1 Gi0/1 с trunk; PC5 (VLAN 10) и PC6 (VLAN 20) – от D02-02, Част 3А.

---

## ЧАСТ 3: Метод 1 – Router като DHCP сървър (25 мин)

### Стъпка 1: Excluded addresses (запазени адреси)

**Защо?** Запазваме първите 10 адреса за статични устройства:

```
.1 = Router (Gateway)
.2 = DNS Server (ако имаме)
.3 = Web Server (ако имаме)
.4-.10 = Резерв за други сървъри
```

```cisco
R1# configure terminal
R1(config)# no ip domain-lookup
!
R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10
R1(config)# ip dhcp excluded-address 192.168.20.1 192.168.20.10
```

### Стъпка 2: DHCP pool за VLAN 10

```cisco
R1(config)# ip dhcp pool ADMIN_POOL
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# exit
```

**Обяснение:**
- `network` → Коя мрежа обслужва този pool
- `default-router` → Gateway-ят (Router interface IP)
- `dns-server` → DNS за name resolution

**Забележка:** `8.8.8.8` демонстрира DHCP опцията за DNS сървър. В тази топология няма изход към интернет, затова 8.8.8.8 няма да отговаря. Локален DNS сървър (192.168.10.2) се добавя в D02-04.

**Lease time (по избор):** ако Packet Tracer приема командата (проверете с `R1(dhcp-config)# lease ?`), задайте срока в pool-а, напр. `lease 7` (7 дни) или `lease 0 8` (8 часа).

### Стъпка 3: DHCP pool за VLAN 20

```cisco
R1(config)# ip dhcp pool IT_POOL
R1(dhcp-config)# network 192.168.20.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.20.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# exit
```

### Стъпка 4: Запазване

```cisco
R1(config)# exit
R1# copy running-config startup-config
```

**Забележка:** В реален Cisco IOS lease time се настройва с командата `lease` в DHCP pool. В Packet Tracer 8.2.2 проверете дали командата е налична (`lease ?` в режима на pool-а); ако не е, настройката остава теоретична.

---

## ЧАСТ 4: Метод 2 – Server като DHCP (BONUS – 15 мин)

 **ВАЖНО:** Това е **алтернативен**, а не паралелен метод. Изпълнете първо Части 5–6 с Метод 1 и запазете основния файл. Метод 2 изпробвайте в **отделен файл** (`D02-03_Bonus_ServerDHCP.pkt`): два DHCP сървъра в една VLAN си пречат, а в D02-04 адресът 192.168.10.2 и портът Fa0/11 са за DNS сървъра.

В отделния файл първо изключете DHCP на R1:

```cisco
R1(config)# no ip dhcp pool ADMIN_POOL
R1(config)# no ip dhcp pool IT_POOL
```

### Предимства на Server метода:

- Има GUI (по-лесно за начинаещи)
- **Lease Time** (ако вашата версия на PT има това поле)
- Виждаме всички настройки наведнъж

**Забележка:** Официалната помощ на Packet Tracer изброява за DHCP pool на Server-PT полетата Pool Name, Default Gateway, DNS Server, Start IP Address, Subnet Mask и Maximum Number of Users. Ако във вашата версия няма поле Lease Time, тази настройка остава теоретична.

### Топология със Server:

```
              [Router R1]
                   |
            GigE0/0 (trunk)
                   |        Gi0/1 (trunk)
              [Switch SW1] ----------------[Switch SW2]
          /     |     |     \     \          /      \
       Fa0/11 Fa0/2 Fa0/3 Fa0/4 Fa0/5      Fa0/2  Fa0/3
         |     |     |     |     |           |      |
     [Server] [PC1] [PC2] [PC3] [PC4]      [PC5]  [PC6]
      DHCP   VLAN10 VLAN10 VLAN20 VLAN20   VLAN10 VLAN20
```

### Стъпка 1: Добавяне на Server

1. **Devices → End Devices → Server-PT**
2. Свържете към **SW1 FastEthernet0/11**

```cisco
SW1(config)# interface FastEthernet0/11
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# description DHCP-Server
SW1(config-if)# no shutdown
SW1(config-if)# exit
```

### Стъпка 2: IP на Server-а

**Кликнете: Server → Desktop → IP Configuration**

```
IP Address: 192.168.10.2
Subnet Mask: 255.255.255.0
Default Gateway: 192.168.10.1
```

### Стъпка 3: Конфигурация на DHCP Service

**Кликнете: Server → Services → DHCP**

1. **Включете DHCP:** ON

2. **Pool за VLAN 10:**
   ```
   Pool Name: ADMIN_POOL
   Default Gateway: 192.168.10.1
   DNS Server: 8.8.8.8
   Start IP Address: 192.168.10.11
   Subnet Mask: 255.255.255.0
   Maximum Number of Users: 50
   TFTP Server: (празно)
   WLC Address: (празно)
   Lease Time: 1 Days (само ако полето съществува във вашата версия)
   ```
   → Кликнете **Add**

3. **Pool за VLAN 20:**
   ```
   Pool Name: IT_POOL
   Default Gateway: 192.168.20.1
   DNS Server: 8.8.8.8
   Start IP Address: 192.168.20.11
   Subnet Mask: 255.255.255.0
   Maximum Number of Users: 50
   Lease Time: 7 Days (само ако полето съществува)
   ```
   → Кликнете **Add**

### Стъпка 4: DHCP Relay на Router

**Защо?** Server е в VLAN 10, но трябва да обслужва и VLAN 20.

```cisco
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# ip helper-address 192.168.10.2
R1(config-subif)# exit
```

**Какво прави:** Препраща DHCP заявки от VLAN 20 към Server-а.

---

## ЧАСТ 5: Конфигурация на PC-тата (10 мин)

> **Предвидете:** Какъв адрес ще получи първият компютър, поискал адрес във VLAN 10? Запишете предположението си.

### За всеки PC (PC1–PC6):

1. **Кликнете:** PC → Desktop → IP Configuration
2. **Изберете:** DHCP (вместо Static)
3. **Кликнете:** Бутона DHCP
4. **Изчакайте** 3-5 секунди

**Ред на превключване:** започнете с **PC2, PC4, PC5 и PC6** – те още имат статичните адреси .11 и .12 от D02-02 и трябва да ги освободят, преди DHCP да ги даде на друг компютър. После превключете PC1 и PC3.

**Запишете действително получените адреси.** Те зависят от реда на превключване. В следващите упражнения ще използвате адресите от тази таблица:

| PC | VLAN | Получен IP адрес | Gateway | DNS Server |
|----|------|------------------|---------|------------|
| PC1 | 10 | | | |
| PC2 | 10 | | | |
| PC3 | 20 | | | |
| PC4 | 20 | | | |
| PC5 | 10 | | | |
| PC6 | 20 | | | |

**Трябва да видите:**
```
IP Address: 192.168.10.11 (или друг)
Subnet Mask: 255.255.255.0
Default Gateway: 192.168.10.1
DNS Server: 8.8.8.8
```

### Ако не работи:

**Command Prompt:**
```
ipconfig /release
ipconfig /renew
```

---

## ЧАСТ 6: Проверка (10 мин)

### Test 1: Проверка на получените адреси

**На PC (Command Prompt):**
```
ipconfig
```

**Очаквано за PC1 (VLAN 10)** (примерно – реалният адрес зависи от реда на заявките, проверете с `ipconfig`):
```
IP Address: 192.168.10.11
Subnet Mask: 255.255.255.0
Default Gateway: 192.168.10.1
```

### Test 2: Проверка на DHCP bindings

**Метод 1 (Router като DHCP):**
```cisco
R1# show ip dhcp binding
```

**Очакван изход:**
```
IP address       Hardware address        Type
192.168.10.11    0001.6373.7ABF         Automatic
192.168.10.12    0002.16CE.E0F3         Automatic
192.168.20.11    00D0.BC0F.0D4C         Automatic
```

**Метод 2 (Server като DHCP):**
- **Server → Services → DHCP**
- Вижте таблицата **Current Leases**

### Test 3: Ping тест

**От PC1** (адресите на другите компютри вземете от таблицата в Част 5):
```
ping 192.168.10.1          (gateway)
ping <адреса на PC2>       (друг PC в VLAN 10)
ping 192.168.20.1          (gateway VLAN 20)
ping <адреса на PC3>       (PC в VLAN 20)
```

**Всички трябва да работят!**

---

## ЧАСТ 6А: DORA в Simulation (15 мин)

**a.** Превключете на **Simulation**. В **Edit Filters** оставете само **DHCP**.

**b.** От PC1 → **Command Prompt**:

```
C:\> ipconfig /release
C:\> ipconfig /renew
```

**c.** Натискайте **Capture/Forward** и отваряйте всеки DHCP пакет. Попълнете:

| Съобщение | Source IP | Destination IP | Кой го изпраща |
|-----------|-----------|----------------|----------------|
| Discover | | | |
| Offer | | | |
| Request | | | |
| ACK | | | |

**d.** Отворете таб **OSI Model** на Discover.

_На кой слой е DHCP? По кой транспортен протокол и порт пътува?_ ______

<details markdown="1">
<summary>Отговори за самопроверка</summary>

- Първият компютър, поискал адрес във VLAN 10, обикновено получава **192.168.10.11** – първия неизключен адрес. Кой компютър ще е първи, зависи от реда на превключване; затова работим с адресите от таблицата, а не с предварително зададени.
- **Discover** и **Request** са от `0.0.0.0` до `255.255.255.255`: компютърът още няма адрес и не знае къде е сървърът. Offer и ACK ги изпраща R1 (192.168.10.1).
- DHCP е на **приложния слой (7)**, пътува по **UDP**, портове 68 (клиент) и 67 (сървър).

</details>

---

## ЧАСТ 7: Troubleshooting (10 мин)

### Проблем 1: PC не получава адрес

**Симптоми:**
```
DHCP Request Failed
IP Address: 0.0.0.0
```

**Проверки:**
```cisco
! Има ли DHCP pool за този subnet?
R1# show ip dhcp pool

! Интерфейсът UP ли е?
R1# show ip interface brief

! Правилен ли е VLAN на порта?
SW1# show vlan brief
```

**Решение:**
1. Проверете DHCP pool конфигурацията
2. Проверете VLAN assignment на порта на switch-а (комутатора)
3. Release и renew отново

### Проблем 2: PC получава 169.254.x.x

**Какво значи?**
- Windows автоматично раздава **APIPA адрес**
- Появява се когато DHCP server **НЕ е достъпен**

**Решение:**
1. Проверете дали DHCP service е ON (ако ползвате Server)
2. Проверете физическата свързаност
3. Проверете ip helper-address (ако Server е в друг VLAN)

### Проблем 3: Грешен gateway

**Симптоми:**
- PC получава адрес
- Ping в същия VLAN работи
- Ping извън VLAN-а НЕ работи

**Решение:**
```cisco
! Проверка на pool
R1# show running-config | section dhcp

! Трябва да видите:
ip dhcp pool ADMIN_POOL
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1   ← Проверете!
```

---

## ЧАСТ 7А (разширение): Когато DHCP не отговаря

Запазете копие на файла като `D02-03_Extra_YourName.pkt` и работете в него.

**a.** На R1 изтрийте pool-а за IT:

```cisco
R1(config)# no ip dhcp pool IT_POOL
```

**b.** На PC3 изпълнете `ipconfig /release` и `ipconfig /renew`, после `ipconfig`.

- _Какъв адрес получава PC3? От коя мрежа е той?_ ______
- _Може ли PC3 да ping-не шлюза си 192.168.20.1? Защо?_ ______

<details markdown="1">
<summary>Отговор за самопроверка</summary>

PC3 получава адрес от **169.254.0.0/16** (APIPA) – Windows го задава сам, когато DHCP сървър не отговори. Този адрес не е в мрежата 192.168.20.0/24, затова шлюзът е недостъпен.

</details>

---

## ЧАСТ 8: Статична резервация за Server (BONUS – 10 мин)

**Забележка:** Бонусът е незадължителен. Ако го изпълните, File Server може да остане в основния файл (D02-04 го предвижда на Fa0/6 и 192.168.10.50).

### Scenario:
Искаме File Server винаги да получава **192.168.10.50**

**Защо File Server, не Web Server?**
- Web Server обикновено е на **.3** (ще го добавим в D02-04)
- File Server е по-подходящ за **.50** (сървърна зона)

### Стъпка 1: Добавете File Server

1. **Добавете Server-PT** в VLAN 10
2. Име: File Server
3. Свържете към **SW1 Fa0/6**

```cisco
SW1(config)# interface FastEthernet0/6
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# description File-Server
SW1(config-if)# no shutdown
SW1(config-if)# exit
```

### Стъпка 2: Намерете MAC адреса

**File Server → Config → FastEthernet0 → MAC Address**

(Ако сървърът вече е на DHCP, MAC адресът се вижда и с `R1# show ip dhcp binding`.)

```
Пример: 00D0.974B.97FC    ← вашият MAC адрес ще е различен!
```

### Стъпка 3: Excluded address

```cisco
R1(config)# ip dhcp excluded-address 192.168.10.50
```

**Защо?** За да не го раздава pool-ът на друго устройство.

### Стъпка 4: Manual binding

```cisco
R1(config)# ip dhcp pool FILE_SERVER
R1(dhcp-config)# host 192.168.10.50 255.255.255.0
R1(dhcp-config)# client-identifier 0100.d097.4b97.fc
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# exit
```

**Забележка:** Client-identifier = "01" + MAC адрес. Използвайте **вашия** MAC адрес, а не примерния.

**ВАЖНО за Packet Tracer:** ръчната резервация не е налична във всички версии. Преди Стъпка 4 проверете с `R1(dhcp-config)# ?` дали има команди `host` и `client-identifier`. Ако ги няма, пропуснете Стъпки 4 и 5 и използвайте резервния вариант по-долу (статичен адрес). Командата `hardware-address` не се използва.

### Стъпка 5: DHCP на Server

**File Server → Desktop → IP Configuration**
- Изберете **DHCP**
- Кликнете бутона

**Трябва да получи:**
```
IP Address: 192.168.10.50
```

**Проверка:** `R1# show ip dhcp binding` и `R1# show ip dhcp pool FILE_SERVER`.

**Ако сървърът не получи .50:** сравнете client-identifier с колоната Client-ID в `show ip dhcp binding` (идентификаторът не винаги е "01" + MAC) и проверете дали excluded-address не пречи на резервацията във вашата версия на Packet Tracer.

**Резервен вариант:** задайте на File Server статичен адрес 192.168.10.50 (Desktop → IP Configuration → Static, маска 255.255.255.0, Gateway 192.168.10.1). Командата excluded-address вече пази адреса от DHCP. Това не е DHCP резервация, но дава същия краен резултат.

**Забележка:** Web Server ще добавим в **D02-04** на адрес **192.168.10.3**

---

## СРАВНЕНИЕ: Router vs Server метод

| Аспект | Router DHCP | Server DHCP |
|--------|-------------|-------------|
| **Конфигурация** | CLI команди | GUI (по-лесно) |
| **Lease Time** |  Проверете с `lease ?` |  Зависи от версията на PT |
| **Flexibility** | По-гъвкав | Основни настройки |
| **Реален свят** | Често се използва | При малки мрежи |
| **За упражнението** | Основен метод | BONUS |

**Препоръка:** Научете и двата метода!

---

## ЗАПИС НА ОСНОВНИЯ ФАЙЛ (за D02-04)

**Контролен тест:** DHCP сървърът е само R1; PC1–PC6 получават адреси (`ipconfig`); PC1 → PC3 ping успешен; `show ip dhcp binding` показва клиентите.

**Запазете файла като:** `D02-03_YourName.pkt` – това е началният файл за D02-04.

**Задачите по-долу изпълнявайте в отделен файл** (`D02-03_Extra_YourName.pkt`).

---

## ЗАДАЧИ ЗА САМОСТОЯТЕЛНА РАБОТА

### Задача 1: Трети VLAN
- Създайте VLAN 30 (Guest: 192.168.30.0/24)
- Добавете VLAN 30 към trunk-а (Fa0/1): `switchport trunk allowed vlan add 30`
- Добавете subinterface на R1 (`interface g0/0.30`, `encapsulation dot1Q 30`, IP 192.168.30.1)
- Добавете DHCP pool
- Тествайте с нов PC

### Задача 2: Променете DNS
- Използвайте Cloudflare DNS: **1.1.1.1**
- Обновете pools
- Release/renew на PC-тата

### Задача 3: Server DHCP
- Пробвайте Server метода (ЧАСТ 4)
- Ако вашата версия има поле Lease Time, настройте го на 2 дни
- Сравнете с Router метода

---

## Обяснете сами (без готов отговор)

1. Защо Discover се изпраща като broadcast?
2. Какво доказва в таблицата `show ip dhcp binding`, че адресът е получил точно PC1?
3. Какво ще се случи, ако в ADMIN_POOL сгрешите `default-router` на 192.168.10.254?

---

## CHECKLIST ЗА ЗАВЪРШВАНЕ

```
- DHCP pools създадени (VLAN 10 и 20)
- Excluded addresses конфигурирани
- PC-тата получават адреси автоматично
- Ping работи между всички VLAN-и
- show ip dhcp binding показва клиентите
- Попълнена е таблицата с получените адреси (Част 5)
- В Simulation е попълнена таблицата DORA (Част 6А)
- (BONUS) Server DHCP тестван
- (BONUS) Manual binding за File Server
- Конфигурацията е запазена (copy run start)
```

---

## КАКВО НАУЧИХМЕ

1. Какво е DHCP и защо е важен
2. DORA процес (Discover, Offer, Request, ACK) и как изглежда в Simulation
3. Конфигурация на DHCP на Router
4. Excluded addresses
5. (BONUS) Server като DHCP (lease time – ако версията на PT има такова поле)
6. (BONUS) Manual binding за сървъри
7. Troubleshooting: адрес 169.254.x.x означава, че DHCP сървър не е отговорил

---

## СЛЕДВАЩА СТЪПКА

В **D02-04** ще научим:
- DNS конфигурация
- Name resolution (ping по име вместо IP)
- Интеграция на DHCP със DNS

**Запазете файла като:** `D02-03_YourName.pkt` (преди задачите; тях запазете отделно като `D02-03_Extra_YourName.pkt`)

---

**гл. ас. Светослав Атанасов**
svetoslav.atanasov@trakia-uni.bg


<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
