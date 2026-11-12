# D03: Wireshark и PDU – поток А (напреднали)

Упражненията показват в реален трафик същите протоколи, които поток Б настройва в Packet Tracer. Всяко упражнение има задължителен минимум и разширение, обявени в началото му.

**Среда:** Windows 10/11, Wireshark 4.6.x с Npcap. Wireshark се стартира като администратор.

---

## I. Упражнения

| № | Упражнение | Време | Основни протоколи |
|---|------------|-------|-------------------|
| D03-01 | [Преглед на прихванат мрежов трафик](D03-01_View_Captured_Traffic_in_Wireshark.md) | 45 мин | ARP, `ping`, `arp -a` |
| D03-02 | Packet Tracer, работа с PDU (`D03-02.pka` от преподавателя) | – | PDU, капсулиране |
| D03-03 | [Ethernet рамки](D03-03_Examine_Ethernet_Frames.md) | 45 мин | Ethernet II, MAC, OUI |
| D03-04 | [IPv4 пакети](D03-04_IPv4_Packets_in_Wireshark.md) | 60 мин | IPv4 заглавка, TTL, `tracert` |
| D03-05 | [IPv6 пакети](D03-05_IPv6_Packets_in_Wireshark.md) | 60 мин | IPv6, ICMPv6, NDP |
| D03-06 | [TCP комуникационен процес](D03-06_TCP_Communication_Process.md) | 60 мин | Three-way handshake, флагове |
| D03-07 | [DHCP процесът (DORA)](D03-07_DHCP_in_Wireshark.md) | 45 мин | DHCP, опции, lease |
| D03-08 | [DNS запитвания и отговори](D03-08_DNS_in_Wireshark.md) | 45 мин | DNS, кеш, NXDOMAIN |
| D03-09 | [ICMP съобщения и tracert](D03-09_ICMP_and_Traceroute.md) | 45 мин | ICMP типове, Time Exceeded |
| D03-10 | [Пътят на пакета през шлюз и NAT](D03-10_Packet_Path_and_NAT_PT.md) | 50 мин | MAC и IP по пътя, PAT (Packet Tracer) |
| D03-11 | [UDP, TCP и QUIC](D03-11_UDP_TCP_QUIC.md) | 45 мин | UDP, QUIC, SNI |
| D03-12 | [Статистики във Wireshark](D03-12_Traffic_Statistics.md) | 45 мин | Protocol Hierarchy, Conversations |
| D03-13 | [Диагностика по готови прихващания](D03-13_Troubleshooting_with_Captures.md) | 60 мин | ARP, DNS, ICMP, TCP RST |

---

## II. Препоръчана последователност

D03-01 → D03-03 → D03-04 → D03-06 (слоеве 2–4) → D03-07 → D03-08 (услуги) → D03-09 → D03-10 (пътят на пакета) → D03-13 (диагностика). D03-05, D03-11 и D03-12 разширяват същите теми.

---

## III. Файлове за прихващане

Подготвени за обучение; адресите извън локалните мрежи са от диапазоните за документация.

| Файл | Упражнение |
|------|------------|
| [D03-11_quic.pcapng](captures/D03-11_quic.pcapng) | D03-11 – резервен запис на HTTP/3 |
| [D03-11_quic_keylog.txt](captures/D03-11_quic_keylog.txt) | D03-11 – ключове за разшифроване (разширение) |
| [D03-13_case1.pcapng](captures/D03-13_case1.pcapng) | D03-13, случай 1 |
| [D03-13_case2.pcapng](captures/D03-13_case2.pcapng) | D03-13, случай 2 |
| [D03-13_case3.pcapng](captures/D03-13_case3.pcapng) | D03-13, случай 3 |
| [D03-13_case4.pcapng](captures/D03-13_case4.pcapng) | D03-13, случай 4 |

---

## IV. Чести затруднения

- **Не се виждат интерфейси.** Стартирайте Wireshark като администратор и проверете дали е инсталиран Npcap.
- **Виждам само собствения си трафик.** Това е нормално в комутирана мрежа: комутаторът изпраща до вашия порт само вашите рамки и broadcast/multicast. Чуждият трафик се вижда само през огледален порт (SPAN).
- **Грешни контролни суми в изпратените пакети.** Мрежовата карта ги изчислява след прихващането (checksum offloading). Не е грешка.
- **Прихващането съдържа лични данни.** Прихващайте само собствения си трафик в залата и не споделяйте файловете извън упражнението.

<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
