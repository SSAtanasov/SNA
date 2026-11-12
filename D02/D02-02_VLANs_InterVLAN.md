# D02-02: VLAN – една физическа мрежа, няколко логически

> **Поток:** начинаещи | **Време:** ~100 мин | **Среда:** Cisco Packet Tracer 8.2.2
> **Задължителен минимум:** Части 1–5. **Разширение:** Част 6.
> **Връзка с курса:** лекции D02-01 (йерархичен дизайн, плоски мрежи), D02-02 (комутация, broadcast домейни), D02-03 (IPv4 подмрежи), D03-02 (маршрутизация); държавен въпрос 13 (VLAN, маршрутизиране между VLAN).
> **Начало:** отворете `D02-01_YourName.pkt` и го запазете като `D02-02_YourName.pkt`.
> **Ако изоставате:** започнете от готовия начален файл `D02-02_Start.pkt` от преподавателя.

## Какво ще направите

Ще разделите офиса на два отдела – **Администрация** и **IT** – без да сменяте нито един кабел. Ще видите три състояния на мрежата: (A) компютрите в един отдел се виждат; (Б) двата отдела не се виждат, защото няма маршрутизиране; (В) отделите се виждат отново – през маршрутизатора.

## Кратка теория

**VLAN (Virtual LAN)** разделя един комутатор на няколко логически комутатора. Всеки VLAN е отделен **broadcast домейн** и отделна IP подмрежа.

```
Без VLAN: всички в 192.168.1.0/24 – ARP broadcast стига до всички.
С VLAN:   VLAN 10 Admin = 192.168.10.0/24
          VLAN 20 IT    = 192.168.20.0/24
          VLAN 99 Management = 192.168.99.0/24 (за управлението на комутатора)
```

**Access порт** – към краен компютър; принадлежи на **един** VLAN.
**Trunk порт** – между мрежови устройства; носи **много** VLAN-и. За да се различават, рамките получават етикет **802.1Q** с номера на VLAN. Рамките от **native VLAN** минават без етикет.
**Router-on-a-Stick** – един физически порт на маршрутизатора се разделя на **подинтерфейси** (Gi0/0.10, Gi0/0.20), по един за всеки VLAN. Всеки подинтерфейс е шлюзът на своя VLAN.

> **Защо не VLAN 1?** Всички портове са във VLAN 1 по подразбиране и той не може да се изтрие. Затова за потребителите и за управлението използваме други VLAN-и.

---

## Част 1: VLAN-и и access портове на SW1 (20 мин)

### Стъпка 1: Създаване на VLAN-ите

```cisco
SW1> enable
SW1# configure terminal
SW1(config)# vlan 10
SW1(config-vlan)# name Administration
SW1(config-vlan)# exit
SW1(config)# vlan 20
SW1(config-vlan)# name IT_Department
SW1(config-vlan)# exit
SW1(config)# vlan 99
SW1(config-vlan)# name Management
SW1(config-vlan)# exit
```

### Стъпка 2: Портовете към компютрите

```cisco
SW1(config)# interface range FastEthernet0/2 - 3
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# exit
SW1(config)# interface range FastEthernet0/4 - 5
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 20
SW1(config-if-range)# end
SW1# show vlan brief
```

_В кой VLAN е всеки от портовете Fa0/2–Fa0/5? В кой е останал Fa0/1?_ ______

### Стъпка 3: Нови адреси на компютрите

| PC | VLAN | IP адрес | Маска | Gateway |
|----|------|----------|-------|---------|
| PC1 (Fa0/2) | 10 | 192.168.10.10 | 255.255.255.0 | 192.168.10.1 |
| PC2 (Fa0/3) | 10 | 192.168.10.11 | 255.255.255.0 | 192.168.10.1 |
| PC3 (Fa0/4) | 20 | 192.168.20.10 | 255.255.255.0 | 192.168.20.1 |
| PC4 (Fa0/5) | 20 | 192.168.20.11 | 255.255.255.0 | 192.168.20.1 |

---

## Част 2: Състояния A и Б – без маршрутизиране (10 мин)

> **Предвидете:** Кои от двата ping-а ще успеят: PC1 → PC2 и PC1 → PC3?

От PC1:

```
C:\> ping 192.168.10.11
C:\> ping 192.168.20.10
```

| Тест | Резултат | Защо |
|------|----------|------|
| A: PC1 → PC2 (един VLAN) | | |
| Б: PC1 → PC3 (различни VLAN) | | |

---

## Част 3: Trunk и управление на SW1 (15 мин)

### Стъпка 1: Trunk към R1

```cisco
SW1# configure terminal
SW1(config)# interface FastEthernet0/1
SW1(config-if)# description Trunk to R1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,99
SW1(config-if)# exit
```

### Стъпка 2: Управлението се премества във VLAN 99

```cisco
SW1(config)# interface vlan 1
SW1(config-if)# no ip address
SW1(config-if)# shutdown
SW1(config-if)# exit
SW1(config)# interface vlan 99
SW1(config-if)# ip address 192.168.99.2 255.255.255.0
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 192.168.99.1
SW1(config)# end
SW1# copy running-config startup-config
```

---

## Част 4: Router-on-a-Stick на R1 (20 мин)

```cisco
R1> enable
R1# configure terminal
R1(config)# interface GigabitEthernet0/0
R1(config-if)# no ip address
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# interface GigabitEthernet0/0.10
R1(config-subif)# description Gateway for VLAN 10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# exit
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# description Gateway for VLAN 20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
R1(config-subif)# exit
R1(config)# interface GigabitEthernet0/0.99
R1(config-subif)# description Gateway for Management
R1(config-subif)# encapsulation dot1Q 99 native
R1(config-subif)# ip address 192.168.99.1 255.255.255.0
R1(config-subif)# end
R1# copy running-config startup-config
```

| Команда | Какво прави |
|---------|-------------|
| `no ip address` на Gi0/0 | Премахва стария адрес 192.168.1.1; физическият порт остава без адрес |
| `interface GigabitEthernet0/0.10` | Създава подинтерфейс |
| `encapsulation dot1Q 10` | „Рамките с етикет VLAN 10 са за този подинтерфейс“ |
| `encapsulation dot1Q 99 native` | Рамките **без** етикет (native VLAN 99) са за този подинтерфейс |

---

## Част 5: Състояние В – с маршрутизиране и наблюдение на етикетите (25 мин)

### Стъпка 1: Тестове в Realtime

От PC1:

```
C:\> ping 192.168.20.10
C:\> tracert 192.168.20.10
C:\> ping 192.168.99.2
```

| Тест | Резултат | Брой преходи в tracert |
|------|----------|------------------------|
| В: PC1 → PC3 | | |
| PC1 → SW1 (управление) | | – |

### Стъпка 2: Проверка на устройствата

```cisco
SW1# show vlan brief
SW1# show interfaces trunk
R1# show ip interface brief
R1# show ip route
```

_Кои мрежи вижда R1 като директно свързани (C)?_ ______

### Стъпка 3: Етикетът 802.1Q в Simulation

**a.** На PC1 изпълнете `arp -d`. Превключете на **Simulation**, филтри **ARP** и **ICMP**.

**b.** От PC1 изпълнете `ping 192.168.10.11` (към PC2) и натискайте **Capture/Forward**.

_До кои устройства стига ARP заявката? Стига ли до PC3 и PC4?_ ______

**c.** Изчистете списъка със събития (**Reset Simulation**). От PC1 изпълнете `ping 192.168.20.10` (към PC3).

**d.** Кликнете на ICMP пакета, когато е на връзката SW1 → R1, и отворете **Outbound PDU Details** на SW1. Потърсете **802.1Q**.

| Къде е пакетът | VLAN в етикета 802.1Q |
|----------------|-----------------------|
| SW1 → R1 (към шлюза) | |
| R1 → SW1 (след маршрутизирането) | |
| SW1 → PC3 (access порт) | |

**e.** В същите две точки (SW1 → R1 и R1 → SW1) отворете IP заглавката и запишете **TTL**: преди R1 ___, след R1 ___. _Кое устройство промени TTL и защо комутаторът не го променя?_ ______

<details markdown="1">
<summary>Отговори за самопроверка</summary>

- **Състояние A** работи – PC1 и PC2 са в един VLAN. **Състояние Б** не работи – PC3 е в друга мрежа, а шлюзът 192.168.10.1 още не съществува.
- **Състояние В** работи; `tracert` показва **2 прехода**: 192.168.10.1 (R1) и PC3.
- ARP заявката от PC1 стига до PC2 и през trunk-а до R1, но **не** до PC3 и PC4 – те са в друг broadcast домейн.
- SW1 → R1: етикет **VLAN 10**; R1 → SW1: етикет **VLAN 20**; SW1 → PC3: **без етикет** (access порт).
- TTL намалява с 1 при преминаване през **R1**: маршрутизаторът намалява TTL на всеки пакет, който препраща. Комутаторът работи на слой 2 и не променя IP заглавката.

</details>

**Запазете файла като:** `D02-02_YourName.pkt` – от него започва D02-03.

---

## Част 6 (разширение): Адресен план

**a.** Отделът за гости трябва да е във VLAN 30 (192.168.30.0/24). Без да го изпълнявате, напишете командите на SW1 (VLAN, порт Fa0/6, добавяне към trunk-а) и на R1 (подинтерфейс). Подсказка: `switchport trunk allowed vlan add 30`.

**b.** В 192.168.50.0/24 направете план за: отдел A – 40 устройства, отдел B – 25, отдел C – 10, управление – 5. За всяка подмрежа определете маска, адрес на мрежата, шлюз и broadcast. Подмрежите не трябва да се припокриват. Започнете от най-голямата.

---

## Обяснете сами (без готов отговор)

1. Защо в състояние Б ping-ът не минава, въпреки че PC1 и PC3 са на един и същ комутатор?
2. Какво доказва в Simulation, че R1 връща пакета към SW1 с друг VLAN?
3. Какво ще се случи, ако на R1 напишете `encapsulation dot1Q 20` в подинтерфейса Gi0/0.10?

## Запомнете

- Всеки VLAN е отделен broadcast домейн и отделна IP подмрежа.
- Между VLAN-и се преминава **само** през устройство от слой 3 (маршрутизатор).
- По trunk-а рамките носят етикет 802.1Q с номера на VLAN (освен native VLAN).

<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
