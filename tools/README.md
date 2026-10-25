# tools/ — 确定性工具层（Deterministic checks）

`plab.py` 把"代码能定案的事实"从 agent 手里拿出来：标识符能否解析、文献是否撤稿或更正、初稿引用是否都在白名单内、报告的 p 值与统计量是否自洽。agent 只负责代码判不了的语义问题（陈述与原文是否相符）。仅依赖 Python 标准库，任何 harness 用 `python3` 即可运行；网络失败时结果记为 `unknown`/`found: null`，绝不误判为"编造"。

| 子命令 | 用途 | 流水线位置 |
|---|---|---|
| `resolve` | PMID/DOI 解析、题录比对（`bibMatch`）、撤稿/关注/更正三源核查（PubMed 出版类型与 CommentsCorrections、Crossref `updated-by`、OpenAlex `is_retracted`；设 `PLAB_MAILTO` 后加查 Crossref Retraction Watch） | S2 引文核查关卡 |
| `cited` | 从 Markdown 初稿提取参考文献列表及其 PMID/DOI | S8 引文终检 / S7.6 |
| `whitelist` | 初稿引用 ⊆ 允许集合（证据表 ∪ SAP 方法学文献 ∪ 深审核验来源），自动做 PMID↔DOI 互映射 | S8 引文终检 |
| `oa-fetch` | 合法下载开放获取 PDF：先 PMC Open Access 数据集（NCBI，AWS 开放数据，含许可证与 md5 校验），再 OpenAlex 报告的 OA 位置；付费墙与反爬页面一律不绕过，列入待获取清单 | S7.6 文献归档 |
| `dedup` | 跨库候选文献去重（标识符 + 标题/年份） | S2 证据综合前 |
| `schema` | 数据文件结构（列名/类型/缺失/唯一值计数/疑似直接标识列），不输出任何单元格取值 | S4 code-to-data 第一步 |
| `statcheck` | 从 APA 格式报告（t/F/χ²/r/z + 自由度 + p）复算 p 值（支持 Markdown 斜体和中间 CI），标记不一致与显著性判定翻转；checked=0 是未匹配，不是通过 | S4 统计审稿 / S8 终检 |
| `manifest` | 核对 SHA-256 清单与产物字节，分别统计列出与验证通过数；不读取数据行到模型上下文 | S4 复现 / S8 交付 |

```bash
python3 tools/plab.py resolve PMID:9500320 DOI:10.1038/nature12968
python3 tools/plab.py whitelist 06-draft.md --allowed allowed.json
python3 tools/plab.py oa-fetch --draft 06-draft.md --dir papers/ --out papers.json
python3 tools/plab.py statcheck 06-draft.md
python3 tools/plab.py schema ~/research-data/project/data.csv
python3 tools/plab.py manifest 04-analysis/CHECKSUMS-analysis.sha256 --root 04-analysis --out tool-records/manifest.json
```

测试：`python3 -m unittest discover -s tools/tests -v`（离线）；`PLAB_ONLINE=1` 追加在线用例（对 L1 植错集中经 API 核验的案例跑确定性判定）。

可选环境变量：`PLAB_MAILTO`（加入 OpenAlex/Crossref polite pool 并启用 Retraction Watch 查询；不设则不发送任何邮箱）、`NCBI_API_KEY`（提高 NCBI 限流上限）。

机制出处（借鉴思路，未复制代码）：statcheck（Nuijten et al., 2016）的 p 值一致性检查；NCBI PMC Open Access 数据集的合法批量获取途径。

覆盖边界：statcheck 不推断分列表格或缺失自由度；匹配数不是全稿统计结论数。resolve 的 found=null/unknown 不算确定性核验通过。OA 下载保留来源提供的许可证，未知时不补猜；接口失败与付费墙分别记录。

`manifest` 只接受标准 SHA-256 两空格格式（亦支持 `shasum` 的 ` *` 二进制标记）。清单路径按命令当前目录解析，文件条目相对 `--root`；清单自身与解析后的文件路径都必须在该根目录内。拒绝绝对条目、`..`、反斜线、逃逸的符号链接、重复路径、空清单与非法格式。返回 `available`（清单可读）、`listed`（格式合法且安全的唯一列出路径数）、`verified`（摘要匹配的文件数）、`missing`/`mismatched`（失败路径）、`invalid`（行号、可得路径与原因）、`ok`。清单缺失时正常返回 `available=false, ok=false`；缺失、摘要不符或非法条目均不算验证通过。仅清单20项通过就报告20，不能采信自报26项或以目录文件总数代替。工具只输出计数、路径与状态，不输出文件内容。
