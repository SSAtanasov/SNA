# Системно и мрежово администриране

**Преподавател:** гл. ас. Светослав Атанасов  
**Email:** svetoslav.atanasov@trakia-uni.bg

---

## I. Как е организиран курсът

Лекциите са общи за всички. Семинарите са в два потока:

- **Поток АКС + ИКТО** – изграждате мрежа на една фирма стъпка по стъпка в Cisco Packet Tracer (D01 и D02).
- **Поток КСК** – наблюдавате същите протоколи в реален трафик с Wireshark и в PDU на Packet Tracer (D03).

Двата потока работят върху едни и същи понятия: едните **настройват** услугата, другите **доказват по пакетите** какво се случва. Финалният тест е общ.

---

## II. Поток АКС + ИКТО – Packet Tracer (D02)

Всяко упражнение започва от файла на предходното. От D02-06 задължителна е кратката част (безжично свързване и DHCP); IoT сървърът и автоматизацията са по избор.

| № | Упражнение | Време | Статус |
|---|------------|-------|--------|
| D02-01 | [Първата мрежа – Router, Switch и три компютъра](D02/D02-01_Basic_Network.md) | 100 мин | задължително |
| D02-02 | [VLAN – една физическа мрежа, няколко логически](D02/D02-02_VLANs_InterVLAN.md) | 100 мин | задължително |
| D02-03 | [DHCP – адресите се раздават сами](D02/D02-03_DHCP.md) | 60 мин | задължително |
| D02-04 | [DNS – имена вместо числа](D02/D02-04_DNS.md) | 60 мин | задължително |
| D02-05 | [ACL – кой с кого може да говори](D02/D02-05_ACL.md) | 90 мин | задължително |
| D02-06 | [IoT – умен офис със сензор и лампа](D02/D02-06_IoT_Integration.md) | 75 мин | кратка част задължителна |
| D02-07 | [Втори комутатор, управление през VLAN 99 и SSH](D02/D02-07_Management_Hierarchical.md) | 90 мин | задължително |
| D02-08 | [NAT – офисът излиза в „Интернет“](D02/D02-08_NAT.md) | 75 мин | задължително |
| D02-09 | [Диагностика – мрежата не работи, намерете защо](D02/D02-09_Troubleshooting_PT.md) | 90 мин | задължително |

**Среда:** Cisco Packet Tracer 8.2.2.

---

## III. Поток КСК – Wireshark и PDU (D03)

| № | Упражнение | Време |
|---|------------|-------|
| D03-01 | [Преглед на прихванат мрежов трафик във Wireshark](D03/D03-01_View_Captured_Traffic_in_Wireshark.md) | 45 мин |
| D03-02 | Packet Tracer, работа с PDU (файлът `D03-02.pka` е от преподавателя) | – |
| D03-03 | [Ethernet рамки във Wireshark](D03/D03-03_Examine_Ethernet_Frames.md) | 45 мин |
| D03-04 | [IPv4 пакети във Wireshark](D03/D03-04_IPv4_Packets_in_Wireshark.md) | 60 мин |
| D03-05 | [IPv6 пакети във Wireshark](D03/D03-05_IPv6_Packets_in_Wireshark.md) | 60 мин |
| D03-06 | [TCP комуникационен процес във Wireshark](D03/D03-06_TCP_Communication_Process.md) | 60 мин |
| D03-07 | [DHCP процесът (DORA) във Wireshark](D03/D03-07_DHCP_in_Wireshark.md) | 45 мин |
| D03-08 | [DNS запитвания и отговори във Wireshark](D03/D03-08_DNS_in_Wireshark.md) | 45 мин |
| D03-09 | [ICMP съобщения и tracert във Wireshark](D03/D03-09_ICMP_and_Traceroute.md) | 45 мин |
| D03-10 | [Пътят на пакета през шлюз и NAT (Packet Tracer, PDU)](D03/D03-10_Packet_Path_and_NAT_PT.md) | 50 мин |
| D03-11 | [UDP, TCP и QUIC във Wireshark](D03/D03-11_UDP_TCP_QUIC.md) | 45 мин |
| D03-12 | [Трафикът през погледа на администратора – статистики](D03/D03-12_Traffic_Statistics.md) | 45 мин |
| D03-13 | [Диагностика по готови прихващания](D03/D03-13_Troubleshooting_with_Captures.md) | 60 мин |

**Среда:** Windows 10/11, Wireshark 4.6.x с Npcap. Готовите прихващания са в папката `D03/captures` (вижте [D03/README](D03/README.md)).

---

## IV. Контакти

**Консултации:** по график или по имейл.

*Последна актуализация: ноември 2026 г.*

<script data-goatcounter="https://satanasov.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script src="/SNA/assets/js/analytics-logger.js"></script>
