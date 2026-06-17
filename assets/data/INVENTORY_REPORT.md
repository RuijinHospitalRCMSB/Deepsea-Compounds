# 深海化合物数据库 — 数据清单统计报告
## Deep-Sea Compound Database — Inventory Report

> 统计日期：2026-06-14
> 数据来源：逐页解析 363 个化合物 HTML 文件，去重统计

---

## 1. 化合物概览 Compound Overview

| 统计项 | 数值 |
|--------|:----:|
| 化合物总数 Total Compounds | **363** |
| 有活性数据的化合物 Bioactive | **344** |
| 有靶标数据的化合物 With Targets | **58** |
| 既有活性又有靶标 Both | **44** |
| 仅有活性数据 Only Phenotype | **300** |
| 仅有靶标数据 Only Target | **14** |
| 无数据 Neither | **5** |

---

## 2. 表型活性清单 Phenotype (Bioactivity) Inventory

| 类别 Category | 条目数 Entries | 涉及化合物 Compounds |
|---------------|:-------------:|:-------------------:|
| Bioactivity | 852 | 122 |
| Anticancer | 585 | 96 |
| Cytotoxicity | 415 | 110 |
| Antimicrobial | 398 | 78 |
| ChEMBL | 80 | 14 |
| Antifungal | 39 | 12 |
| Antibacterial | 36 | 12 |
| Anti-inflammatory | 20 | 13 |
| Antiviral | 13 | 13 |
| Antioxidant | 10 | 10 |
| Enzyme Inhibition | 10 | 10 |
| Antiparasitic | 6 | 4 |
| Antitubercular | 2 | 2 |
| ADMET | 2 | 1 |
| Anti-allergic | 2 | 2 |
| Anti-HIV | 1 | 1 |
| Anti-migratory/Anti-invasive | 1 | 1 |
| Antimalarial | 1 | 1 |
| Antiplasmodial | 1 | 1 |
| Cardioprotective | 1 | 1 |
| Neuroprotective | 1 | 1 |
| Other | 13 | 8 |
| **总计 Total** | **2489** | **344** |

---

## 3. 靶标互作清单 Target Interaction Inventory

| 类别 Category | 条目数 Entries | 靶标数 Targets |
|---------------|:-------------:|:-------------:|
| Enzyme Inhibition | 241 | 161 |
| Bioactivity | 141 | 81 |
| ChEMBL | 19 | 18 |
| Antimicrobial | 5 | 1 |
| Protease Inhibitor | 5 | 2 |
| Anticancer | 2 | 2 |
| Inhibitory | 2 | 2 |
| Microtubule | 2 | 1 |
| Protease Inhibition | 1 | 1 |
| Calmodulin Inhibition | 1 | 0 |
| Other | 3 | 1 |
| **总计 Total** | **422** | **256** |

---

## 4. 微生物菌株清单 Microbial Strain Inventory

| 属 Genus | 菌株数 Strains |
|----------|:-------------:|
| _Penicillium_ | 20 |
| _Aspergillus_ | 15 |
| _Streptomyces_ | 13 |
| _Chaetomium_ | 7 |
| _Talaromyces_ | 4 |
| _Poecillastra_ | 3 |
| _Engyodontium_ | 2 |
| _Epicoccum_ | 2 |
| _Phomopsis_ | 2 |
| _Pseudonocardia_ | 2 |
| _Dermacoccus_ | 2 |
| _Micromonospora_ | 2 |
| _Spongosorites_ | 2 |
| _Discodermia_ | 2 |
| _Emericella_ | 2 |
| _Zyzzya_ | 2 |
| 其他36个单菌株属 | 各1 |
| **总计** | **131 strains, 65 genera** |

---

## 5. 参考文献清单 Reference Inventory

| 统计项 | 数值 |
|--------|:----:|
| 独立 PMID 总数 | **567** |
| 被多化合物引用的 PMID | **110** |
| 仅被一化合物引用的 PMID | **457** |
| 有参考文献的化合物数 | **318** |

---

## 6. 与旧版数据对比 Verification

| 指标 | JSON旧值 | HTML新值(去重) | 差异原因 |
|------|:-------:|:-------------:|----------|
| 化合物总数 | 361 | **363** | 新增2个HTML页面 |
| 有活性数据化合物 | 344 | **344** | 一致 |
| 活性条目总数 | 2395 | **2489** | 修正了漏解析的条目 |
| 有靶标数据化合物 | 58 | **58** | 一致 |
| 靶标互作总数 | 517 | **422** | 旧JSON有跨化合物重复计数 |
| 独立靶标数 | 290 | **256** | 旧JSON含非UniProt条目 |
| 菌株数 | 131 | **131** | 一致 |
| 参考文献数 | 912 | **567** | 旧JSON按化合物计数(含重复) |

---

_生成方式：Python BeautifulSoup 逐页解析 363 个 HTML → 按 (化合物+类别+PMID/UniProt) 去重_
