# D02-07: Втори комутатор, управление през VLAN 99 и SSH

> **Поток:** начинаещи | **Време:** ~90 мин | **Среда:** Cisco Packet Tracer 8.2.2
> **Задължителен минимум:** Части 1–5. **Разширение:** Част 6.
> **Връзка с курса:** лекции D02-01 (йерархичен мрежов дизайн, плоски мрежи), D02-02 (комутация, trunk); администриране на мрежата от разстояние; държавен въпрос 13 (дизайн).
> **Начало:** отворете `D02-06_YourName.pkt` (или `D02-05_YourName.pkt`, ако сте пропуснали D02-06) и го запазете като `D02-07_YourName.pkt`.
> **Ако изоставате:** започнете от готовия начален файл `D02-07_Start.pkt` от преподавателя.

## Какво ще направите

Мрежата расте: добавяте втори комутатор за нов етаж. Това е **разширяване на малка мрежа с втори комутатор и централизирано маршрутизиране**. Още не е пълна трислойна архитектура, но вече личат ролите от модела: комутатор за достъп и комутатор, който ги събира. После ще управлявате всички мрежови устройства **от разстояние и шифровано** (SSH) – така, както работи мрежовият администратор.

## Кратка теория

### Плоска и йерархична мрежа

**Плоска мрежа:** всички устройства на един-два комутатора в един broadcast домейн. Лесна е, но при растеж става бавна, несигурна и трудна за поддръжка.

**Йерархичен модел (Cisco)** – еталон, с който сравняваме нашата мрежа:

| Слой | Роля в модела | Какво има в нашата мрежа |
|------|---------------|--------------------------|
| **Core** (ядро) | Бързо пренасяне между частите на голяма мрежа | Отделно ядро няма – мрежата е малка |
| **Distribution** (разпределение) | Събира комутаторите за достъп, маршрутизиране между VLAN, политики (ACL) | SW1 събира SW2; R1 маршрутизира между VLAN-ите и прилага ACL, а в D02-08 става и изход към ISP |
| **Access** (достъп) | Свързва крайните устройства | SW2 и портовете за компютри на SW1 |

> В малки мрежи Cisco описва и **двуслоен** вариант, при който Core и Distribution са обединени (collapsed core). Нашата мрежа е по-близо до него, отколкото до пълния трислоен модел.

### Управление на мрежовите устройства

- **Management VLAN 99** – отделна мрежа само за управлението на комутаторите. Потребителите са във VLAN 10 и 20.
- **Внимание:** отделният VLAN сам по себе си **не спира** достъпа. R1 маршрутизира към VLAN 99, затова всеки потребител може да стигне до адресите за управление. Достъпът се ограничава с ACL на линиите за отдалечен достъп (`access-class`) на **всяко** устройство – Част 6.
- **SSH** – отдалечен достъп до командния ред, при който всичко (включително паролата) се шифрова. **Telnet** прави същото, но без шифроване – затова не се използва.

---

## Част 1: Втори комутатор (25 мин)

### Стъпка 1: Свързване

**a.** Добавете **Switch 2960** (SW2) и два компютъра (PC5, PC6).

**b.** Кабели:

```
SW1 GigabitEthernet0/1 ↔ SW2 GigabitEthernet0/1   (Copper Cross-Over)
SW2 FastEthernet0/2    ↔ PC5                      (Copper Straight-Through)
SW2 FastEthernet0/3    ↔ PC6                      (Copper Straight-Through)
```

```
              [R1]  маршрутизиране между VLAN (в D02-08 и изход към ISP)
               |  trunk
              [SW1] събира комутаторите (+ портове за PC1–PC4)
               |  trunk Gi0/1 ↔ Gi0/1
              [SW2] Access
              /    \
          [PC5]    [PC6]
         VLAN 10   VLAN 20
```

### Стъпка 2: Trunk на SW1 към SW2

```cisco
SW1# configure terminal
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# description Trunk to SW2
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,99
SW1(config-if)# end
```

### Стъпка 3: Конфигурация на SW2

```cisco
Switch> enable
Switch# configure terminal
Switch(config)# hostname SW2
SW2(config)# no ip domain-lookup
SW2(config)# enable secret class123
SW2(config)# line console 0
SW2(config-line)# password cisco
SW2(config-line)# login
SW2(config-line)# exit
SW2(config)# vlan 10
SW2(config-vlan)# name Administration
SW2(config-vlan)# exit
SW2(config)# vlan 20
SW2(config-vlan)# name IT_Department
SW2(config-vlan)# exit
SW2(config)# vlan 99
SW2(config-vlan)# name Management
SW2(config-vlan)# exit
SW2(config)# interface GigabitEthernet0/1
SW2(config-if)# description Trunk to SW1
SW2(config-if)# switchport mode trunk
SW2(config-if)# switchport trunk native vlan 99
SW2(config-if)# switchport trunk allowed vlan 10,20,99
SW2(config-if)# exit
SW2(config)# interface FastEthernet0/2
SW2(config-if)# switchport mode access
SW2(config-if)# switchport access vlan 10
SW2(config-if)# description PC5-Admin
SW2(config-if)# exit
SW2(config)# interface FastEthernet0/3
SW2(config-if)# switchport mode access
SW2(config-if)# switchport access vlan 20
SW2(config-if)# description PC6-IT
SW2(config-if)# exit
SW2(config)# interface vlan 99
SW2(config-if)# ip address 192.168.99.3 255.255.255.0
SW2(config-if)# no shutdown
SW2(config-if)# exit
SW2(config)# ip default-gateway 192.168.99.1
SW2(config)# end
SW2# copy running-config startup-config
```

> VLAN-ите се създават на **всеки** комутатор, през който минава трафикът им. Native VLAN и списъкът с разрешени VLAN-и трябва да съвпадат на двата края на trunk-а.

### Стъпка 4: Компютрите на SW2

PC5 и PC6 → **IP Configuration** → **DHCP**.

> **Предвидете:** От коя мрежа ще получи адрес PC5 и от коя – PC6?

| PC | Получен адрес | Gateway | `ping` до PC1 |
|----|---------------|---------|---------------|
| PC5 | | | |
| PC6 | | | |

```cisco
SW2# show interfaces trunk
SW2# show vlan brief
```

---

## Част 2: SSH на R1 (15 мин)

```cisco
R1# configure terminal
R1(config)# ip domain-name company.local
R1(config)# crypto key generate rsa
How many bits in the modulus [512]: 1024
R1(config)# ip ssh version 2
R1(config)# username admin secret cisco123
R1(config)# line vty 0 4
R1(config-line)# transport input ssh
R1(config-line)# login local
R1(config-line)# end
R1# copy running-config startup-config
```

| Команда | Защо е нужна |
|---------|--------------|
| `ip domain-name` | Името на домейна е част от името на ключа |
| `crypto key generate rsa` | Създава ключовете за шифроване (1024 бита) |
| `ip ssh version 2` | Използва по-сигурната версия 2 |
| `username admin secret` | Потребител за вход |
| `transport input ssh` | Отдалечен достъп **само** по SSH (Telnet е забранен) |
| `login local` | Проверява потребителя и паролата от локалния списък |

---

## Част 3: SSH на SW1 и SW2 (15 мин)

На **всеки** от двата комутатора:

```cisco
SW1(config)# ip domain-name company.local
SW1(config)# crypto key generate rsa
How many bits in the modulus [512]: 1024
SW1(config)# ip ssh version 2
SW1(config)# username admin secret cisco123
SW1(config)# line vty 0 15
SW1(config-line)# transport input ssh
SW1(config-line)# login local
SW1(config-line)# end
SW1# copy running-config startup-config
```

> Комутаторите имат 16 линии за отдалечен достъп (`vty 0 15`), а R1 – пет (`vty 0 4`). Паролите са само примерни.

---

## Част 4: Администриране от разстояние (15 мин)

От PC1 → **Command Prompt**:

```
C:\> ssh -l admin 192.168.10.1
C:\> ssh -l admin 192.168.99.2
C:\> ssh -l admin 192.168.99.3
```

След всеки вход изпълнете една команда (например `show vlan brief` на SW2) и излезте с `exit`.

| Устройство | Адрес за управление | Влизането успешно ли е? | Prompt след вход |
|------------|---------------------|-------------------------|------------------|
| R1 | 192.168.10.1 | | |
| SW1 | 192.168.99.2 | | |
| SW2 | 192.168.99.3 | | |

Опитайте и `telnet 192.168.99.3`. _Какво става и защо?_ ______

### Наблюдение в Simulation

**a.** Превключете на **Simulation**, филтри **SSH** и **TCP**.

**b.** От PC5 изпълнете `ssh -l admin 192.168.99.2`.

| Въпрос | Отговор |
|--------|---------|
| Транспортен протокол и destination порт на SSH | |
| Има ли TCP three-way handshake преди SSH? | |
| Има ли етикет 802.1Q на връзката SW2 → SW1? Ако да – кой VLAN? | |

<details markdown="1">
<summary>Отговори за самопроверка</summary>

- PC5 получава адрес от 192.168.10.0/24 (VLAN 10), а PC6 – от 192.168.20.0/24 (VLAN 20): VLAN-ите са едни и същи на двата комутатора, а DHCP заявките стигат до R1 през trunk-овете.
- `telnet` е отказан, защото `transport input ssh` разрешава само SSH.
- SSH работи по **TCP порт 22** и започва с three-way handshake (SYN, SYN-ACK, ACK).
- На trunk-а SW2 → SW1 пакетът от PC5 носи етикет **VLAN 10**.

</details>

**Запазете файла като:** `D02-07_YourName.pkt` – от него започва D02-08.

---

## Част 5: Документиране (10 мин)

Попълнете таблицата за управление на мрежата:

| Устройство | Роля в йерархията | Адрес за управление | VLAN | Шлюз | Отдалечен достъп |
|------------|-------------------|---------------------|------|------|------------------|
| R1 | | | | – | |
| SW1 | | | | | |
| SW2 | | | | | |

---

## Част 6 (разширение): Ограничаване на достъпа и Port Security

### a. SSH само от Администрацията – на R1, SW1 и SW2

```cisco
R1(config)# access-list 50 remark SSH only from Admin VLAN
R1(config)# access-list 50 permit 192.168.10.0 0.0.0.255
R1(config)# access-list 50 deny any
R1(config)# line vty 0 4
R1(config-line)# access-class 50 in
R1(config-line)# end
```

Повторете на **SW1 и SW2** (там линиите са `vty 0 15`):

```cisco
SW1(config)# access-list 50 permit 192.168.10.0 0.0.0.255
SW1(config)# access-list 50 deny any
SW1(config)# line vty 0 15
SW1(config-line)# access-class 50 in
SW1(config-line)# end
```

Проверете: от PC1 `ssh -l admin 192.168.10.1` и `ssh -l admin 192.168.99.3` → работят; от PC3 `ssh -l admin 192.168.20.1` и `ssh -l admin 192.168.99.3` → отказани.

_Ако приложите ACL само на R1, може ли PC3 да влезе в SW2? Защо?_ ______

> **Внимание:** грешка в ACL за VTY може да ви заключи отвън. Тогава влезте през конзолата (таб CLI) и премахнете `access-class`.

### b. Port Security на портовете на PC1 и PC2

```cisco
SW1(config)# interface range FastEthernet0/2 - 3
SW1(config-if-range)# switchport port-security
SW1(config-if-range)# switchport port-security maximum 1
SW1(config-if-range)# switchport port-security mac-address sticky
SW1(config-if-range)# switchport port-security violation restrict
SW1(config-if-range)# end
```

Направете ping от PC1 и PC2, после `show port-security address`. Свържете чужд компютър на мястото на PC1 и проверете `show port-security interface FastEthernet0/2`. Върнете PC1 преди да запишете файла.

---

## Обяснете сами (без готов отговор)

1. Защо комутаторите се управляват от VLAN 99, а не от VLAN-ите на потребителите?
2. Какво доказва, че управлението на SW2 минава през R1?
3. С какво SSH е по-добър от Telnet и какво би видял атакуващ, който прихване Telnet сесия?
4. Защо отделният VLAN 99 сам по себе си не пази комутаторите от потребителите?

## Запомнете

- Моделът Access – Distribution – Core е еталон за сравнение; в малка мрежа слоевете се обединяват.
- Мрежовите устройства се управляват от отделна мрежа (Management VLAN) и само по SSH, а достъпът до тях се ограничава с ACL на всяко устройство.
- VLAN-ите трябва да съществуват на всеки комутатор, през който минават.

<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
