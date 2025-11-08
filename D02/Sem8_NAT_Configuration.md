# SEM 8: NAT (Network Address Translation) конфигурация

**Продължителност:** 75-90 минути  
**Цел:** Научаване на NAT конфигурация за симулиране на връзка с интернет и споделяне на публични IP адреси

---

## ЦЕЛИ НА УПРАЖНЕНИЕТО

След завършване на този семинар ще можете да:
- ✅ Разбирате какво е NAT и защо се използва
- ✅ Конфигурирате Static NAT (1:1 mapping)
- ✅ Конфигурирате Dynamic NAT (pool-based)
- ✅ Конфигурирате PAT (Port Address Translation) - най-често използван
- ✅ Симулирате връзка с интернет в Packet Tracer
- ✅ Troubleshoot NAT проблеми

---

## ТЕОРЕТИЧНА ОСНОВА

### Какво е NAT?

**Network Address Translation (NAT)** е техника за транслиране на private IP адреси към public IP адреси при комуникация с интернет.

**Защо е нужен NAT?**
- Липса на достатъчно IPv4 адреси
- Сигурност (скрива вътрешната топология)
- Икономия (не е нужен публичен IP за всяко устройство)
- Лесна промяна на ISP (само външният IP се променя)

### Типове NAT:

#### 1. **Static NAT** (1:1 mapping)
```
Inside Local    ←→    Inside Global
192.168.1.10    ←→    203.0.113.10
192.168.1.11    ←→    203.0.113.11
```
- Перманентно 1:1 mapping
- Използва се за сървъри (Web, Mail, FTP)
- Нужен е отделен публичен IP за всяко устройство

#### 2. **Dynamic NAT** (Pool-based)
```
Inside Local         Inside Global Pool
192.168.1.10    →    203.0.113.10-20 (избира се свободен)
192.168.1.11    →    203.0.113.11 (ако има свободен)
```
- Временно mapping от pool
- First-come, first-served
- Ако pool-ът е пълен, новите връзки чакат

#### 3. **PAT** (Port Address Translation) - NAT Overload
```
Inside Local          Inside Global (IP:Port)
192.168.1.10:54321 → 203.0.113.1:54321
192.168.1.11:54322 → 203.0.113.1:54322
192.168.1.12:54323 → 203.0.113.1:54323
```
- Споделя един публичен IP за много устройства
- Използва port numbers за разграничаване
- **Най-често използван** в домашни и малки мрежи
- До 65,535 едновременни връзки на IP адрес

---

## ТОПОЛОГИЯ

### Целева топология:

```
        INTERNET
       (Симулиран)
      209.165.200.1
            │
            │ Se0/0/0 (outside)
            │ 209.165.200.2/30
        ┌───▼────┐
        │   R1   │ (NAT Router)
        │  (ISP) │
        └───┬────┘
            │ G0/0 (inside)
            │ 203.0.113.1/24
            │
        ┌───▼────┐
        │  SW1   │
        └┬──┬──┬─┘
         │  │  │
    ┌────▼──▼──▼────────┐
    │                   │
┌───▼───┐          ┌────▼────┐
│  PC1  │          │ Server1 │
│.10.10 │          │  .10.50 │
└───────┘          └─────────┘
  DHCP              Static NAT

Internal Network: 192.168.10.0/24
Public IP range: 203.0.113.0/24 (Test-Net-3, RFC 5737)
ISP connection: 209.165.200.0/30
```

---

## ЧАСТ 1: Static NAT (за сървъри)

### СТЪПКА 1: Изграждане на базовата топология

В Packet Tracer:
- **1x Router 2911** (R1)
- **1x Switch 2960-24TT** (SW1)
- **2x PC** (PC1, Server1)
- **1x Cloud** (симулира интернет)

**Кабелиране:**
```
R1 Se0/0/0 ↔ Cloud
R1 Gi0/0 ↔ SW1 Gi0/1
SW1 Fa0/1 ↔ PC1
SW1 Fa0/2 ↔ Server1
```

---

### СТЪПКА 2: Базова конфигурация на Router

```cisco
enable
configure terminal
hostname R1-NAT
no ip domain-lookup

! Inside interface (към вътрешната мрежа)
interface gigabitEthernet 0/0
 description Inside Network
 ip address 192.168.10.1 255.255.255.0
 no shutdown
 exit

! Outside interface (към ISP/Internet)
interface serial 0/0/0
 description Outside to ISP
 ip address 209.165.200.2 255.255.255.252
 clock rate 64000
 no shutdown
 exit

! Default route (симулира интернет маршрут)
ip route 0.0.0.0 0.0.0.0 209.165.200.1

end
copy running-config startup-config
```

---

### СТЪПКА 3: Конфигуриране на Static NAT за Server

**Сценарий:** Server1 е Web server на 192.168.10.50 и трябва да е достъпен от интернет на публичен IP 203.0.113.50

```cisco
configure terminal

! Дефиниране на inside и outside интерфейси
interface gigabitEthernet 0/0
 ip nat inside
 exit

interface serial 0/0/0
 ip nat outside
 exit

! Static NAT mapping (inside local → inside global)
ip nat inside source static 192.168.10.50 203.0.113.50

end
copy running-config startup-config
```

**Обяснение:**
- `ip nat inside` - маркира интерфейса като вътрешен
- `ip nat outside` - маркира интерфейса като външен
- `ip nat inside source static` - създава 1:1 mapping

---

### СТЪПКА 4: Тестване на Static NAT

#### 4.1 Конфигурирай устройствата

**Server1:**
- IP: `192.168.10.50`
- Mask: `255.255.255.0`
- Gateway: `192.168.10.1`
- DNS: `8.8.8.8`

**PC1:**
- IP: `192.168.10.10`
- Mask: `255.255.255.0`
- Gateway: `192.168.10.1`

#### 4.2 Провери NAT translations

```cisco
show ip nat translations
```

**Очакван изход:**
```
Pro Inside global      Inside local       Outside local      Outside global
--- 203.0.113.50       192.168.10.50      ---                ---
```

#### 4.3 Тест ping

От PC1:
```
C:\> ping 203.0.113.50
```

От Router (симулира external ping):
```cisco
ping 203.0.113.50 source serial 0/0/0
```

#### 4.4 Статистики

```cisco
show ip nat statistics

! Виж броя на translations
show ip nat translations verbose
```

---

## ЧАСТ 2: Dynamic NAT (pool-based)

### СТЪПКА 5: Конфигуриране на Dynamic NAT

**Сценарий:** Имаме pool от 10 публични IP адреса (203.0.113.10-19) за динамична употреба

```cisco
configure terminal

! Създай ACL за inside addresses (кои private IPs могат да използват NAT)
access-list 1 permit 192.168.10.0 0.0.0.255

! Създай NAT pool (диапазон от публични IPs)
ip nat pool PUBLIC_POOL 203.0.113.10 203.0.113.19 netmask 255.255.255.0

! Свържи ACL с NAT pool
ip nat inside source list 1 pool PUBLIC_POOL

end
copy running-config startup-config
```

**Обяснение:**
- `access-list 1` - определя кои вътрешни IP адреси могат да използват NAT
- `ip nat pool` - създава pool от публични IP адреси
- `ip nat inside source list 1 pool` - свързва ACL с pool

### СТЪПКА 6: Тестване на Dynamic NAT

От PC1:
```
C:\> ping 8.8.8.8
```

На Router:
```cisco
show ip nat translations

! Виж динамичните mappings
```

**Очакван изход:**
```
Pro Inside global      Inside local       Outside local      Outside global
icmp 203.0.113.10:1    192.168.10.10:1    8.8.8.8:1          8.8.8.8:1
```

---

## ЧАСТ 3: PAT (NAT Overload) - Най-често използван

### СТЪПКА 7: Конфигуриране на PAT

**Сценарий:** Споделяме ЕДИН публичен IP адрес за всички вътрешни устройства

```cisco
configure terminal

! Премахни предишните NAT конфигурации (ако има)
no ip nat inside source list 1 pool PUBLIC_POOL
no ip nat pool PUBLIC_POOL

! ACL за вътрешни адреси
access-list 1 permit 192.168.10.0 0.0.0.255

! PAT using outside interface IP (overload)
ip nat inside source list 1 interface serial 0/0/0 overload

end
copy running-config startup-config
```

**Обяснение:**
- `overload` - ключова дума за PAT (Port Address Translation)
- `interface serial 0/0/0` - използва IP адреса на външния интерфейс за NAT

### СТЪПКА 8: Тестване на PAT

#### 8.1 Генерирай трафик от множество устройства

От PC1:
```
C:\> ping 8.8.8.8 -t
```

От Server1 (ако има браузър):
```
Отвори браузър и посети http://cisco.com (симулирано)
```

#### 8.2 Виж NAT translations с портове

```cisco
show ip nat translations

! Виж статистиките
show ip nat statistics
```

**Очакван изход:**
```
Pro Inside global           Inside local          Outside local         Outside global
icmp 209.165.200.2:1        192.168.10.10:1       8.8.8.8:1             8.8.8.8:1
icmp 209.165.200.2:2        192.168.10.50:1       8.8.8.8:2             8.8.8.8:2
tcp  209.165.200.2:1025     192.168.10.10:1025    172.217.14.206:80     172.217.14.206:80
```

Забележи, че **портовете се различават** за всяко устройство!

---

## ЧАСТ 4: PAT с конкретен IP (не interface)

### СТЪПКА 9: PAT с pool от един IP

Алтернативен метод - използване на конкретен IP адрес:

```cisco
configure terminal

! Премахни предишната конфигурация
no ip nat inside source list 1 interface serial 0/0/0 overload

! Създай pool с ЕДИН IP
ip nat pool PAT_POOL 203.0.113.1 203.0.113.1 netmask 255.255.255.0

! PAT с този pool
ip nat inside source list 1 pool PAT_POOL overload

end
copy running-config startup-config
```

Тествай отново - резултатът е същият, но сега използваме 203.0.113.1 вместо 209.165.200.2

---

## VERIFICATION COMMANDS

### Основни команди за проверка:

```cisco
! Виж всички NAT translations
show ip nat translations

! Виж детайлна информация
show ip nat translations verbose

! Статистики
show ip nat statistics

! Дебъг (внимавай - много output!)
debug ip nat

! Изключи debug
undebug all
```

### Изчистване на NAT translations:

```cisco
! Изчисти всички динамични NAT entries
clear ip nat translation *

! Изчисти конкретен entry
clear ip nat translation inside 192.168.10.10

! Изчисти статистиките
clear ip nat statistics
```

---

## VERIFICATION CHECKLIST

### Static NAT:
```
☐ Сървърът има private IP (192.168.10.50)
☐ Static mapping е конфигуриран (203.0.113.50)
☐ Ping към public IP работи
☐ show ip nat translations показва static mapping
```

### Dynamic NAT:
```
☐ ACL permit вътрешни адреси
☐ NAT pool е създаден
☐ ACL е свързан с pool
☐ show ip nat translations показва динамични mappings
```

### PAT (Overload):
```
☐ ACL permit вътрешни адреси
☐ "overload" keyword е използван
☐ Множество устройства споделят един IP
☐ Различни портове за всяко устройство
☐ show ip nat translations показва port mappings
```

---

## ЧЕСТО СРЕЩАНИ ПРОБЛЕМИ

### Проблем 1: NAT не работи

**Причина:** Inside/Outside интерфейси не са конфигурирани

**Решение:**
```cisco
show ip interface brief

! Виж дали има (NAT inside) или (NAT outside)
! Ако липсва:
interface gigabitEthernet 0/0
 ip nat inside

interface serial 0/0/0
 ip nat outside
```

### Проблем 2: Няма translations

**Причина:** ACL не permit-ва трафика

**Решение:**
```cisco
show access-lists

! Виж дали ACL е правилен
access-list 1 permit 192.168.10.0 0.0.0.255
```

### Проблем 3: Dynamic NAT pool е пълен

**Причина:** Повече устройства от IP адреси в pool-а

**Решение:**
- Използвай PAT (overload) вместо Dynamic NAT
- Увеличи pool-а

### Проблем 4: Ping работи, but HTTP не

**Причина:** Firewall/ACL блокира трафика

**Решение:**
```cisco
! Провери ACL на интерфейсите
show ip access-lists

! Премахни ACL ако блокира
interface gigabitEthernet 0/0
 no ip access-group 100 in
```

---

## TROUBLESHOOTING WORKFLOW

```
1. Провери дали inside/outside е конфигурирано
   ↓
2. Провери ACL (permit правилните addresses)
   ↓
3. Провери NAT pool или overload keyword
   ↓
4. Провери NAT translations (show ip nat translations)
   ↓
5. Провери routing (има ли default route?)
   ↓
6. Debug (debug ip nat) - виж в real-time
```

---

## ЗАДАЧИ ЗА САМОСТОЯТЕЛНА РАБОТА

### Задача 1: Port Forwarding (Static NAT за specific port)

Конфигурирай Port Forwarding за Web server:
- Вътрешен Web server: 192.168.10.50:80
- Външен достъп: 203.0.113.1:8080

```cisco
ip nat inside source static tcp 192.168.10.50 80 203.0.113.1 8080
```

### Задача 2: Multiple Static NAT mappings

Създай Static NAT за:
- Web Server: 192.168.10.50 → 203.0.113.50
- Mail Server: 192.168.10.51 → 203.0.113.51
- FTP Server: 192.168.10.52 → 203.0.113.52

### Задача 3: PAT с backup pool

Конфигурирай PAT, но ако първичният IP е зает, използвай backup от pool.

---

## РЕАЛНИ СЦЕНАРИИ

### Сценарий 1: Малка фирма с 50 служители
- **Решение:** PAT с един публичен IP
- **Конфигурация:** `ip nat inside source list 1 interface GigabitEthernet0/1 overload`

### Сценарий 2: Компания със собствен Web/Mail сървър
- **Решение:** Static NAT за сървърите + PAT за потребителите
- **Web Server:** Static NAT 192.168.1.10 → 203.0.113.10
- **Mail Server:** Static NAT 192.168.1.11 → 203.0.113.11
- **Потребители:** PAT overload

### Сценарий 3: Data Center с множество публични IP-та
- **Решение:** Dynamic NAT pool за flexibility
- **Pool:** 203.0.113.10-203.0.113.100 (91 IPs)

---

## КЛЮЧОВИ КОНЦЕПЦИИ

### NAT Терминология:
- **Inside Local:** Private IP (192.168.10.10)
- **Inside Global:** Public IP (203.0.113.10)
- **Outside Local:** Destination IP as seen from inside
- **Outside Global:** Actual destination IP

### Best Practices:
1. ✅ Използвай PAT за повечето случаи (икономия на IP-та)
2. ✅ Static NAT само за сървъри
3. ✅ ACL трябва да е максимално конкретен (не permit all)
4. ✅ Документирай всеки Static NAT mapping
5. ✅ Използвай `overload` когато имаш ограничен брой публични IP-та

---

Сега знаеш как да:
- Конфигурираш Static NAT за сървъри
- Конфигурираш Dynamic NAT с pools
- Конфигурираш PAT (NAT Overload) за споделяне на IP
- Troubleshoot NAT проблеми

---

**Готово! Запази .pkt файла като `Sem8_NAT_Configuration.pkt`**


<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
