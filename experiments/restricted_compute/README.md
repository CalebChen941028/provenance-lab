# 受限计算通道：独立离线原型

该原型用macOS已有的sandbox-exec运行受限reader，可信宿主运行固定审核计算任务。原数据、程序副本、结果及stdout/stderr保存在private；reader只能写public，不能读取private或额外登记的数据源目录。宿主返回固定结构汇总，并从已验证的分箱计数生成SVG，不发布worker任意文件。

## 运行

在仓库根目录执行，无额外Python依赖、无模型调用：

```sh
python3 -B experiments/restricted_compute/verify.py --out /tmp/plab-restricted-check
```

在本机补验D52行键案例：

```sh
python3 -B experiments/restricted_compute/verify.py \
  --out /tmp/plab-restricted-d52-check \
  --d52-evidence /tmp/plab-d52-la1-acceptance
```

第二条命令只读现有独立重跑数据及修复副本，在新临时目录计算；不重跑ZCode模型或修改原稿。`result.json`只含汇总、计数和指纹，`tests.log`记录测试名称与结果。测试中的合成数据及私有日志由临时目录持有，结束后清理。

## 文件与接口

- `channel.py`：可信宿主API。`Channel.request`只接受`{"task":"summary"|"row_keys","dataset":"active"}`，不接受任意命令、程序或路径。
- `trusted_job.py`：固定计算任务，使用标准库；筛选前保存源行键。
- `registry.json`：审核程序指纹及任务列表。程序变更必须重新审核，不能在执行时自动更新指纹求通过。
- `test_channel.py`：真实OS进程对抗和正常对照，含输出限制、超时及源行键测试。
- `verify.py`：执行测试、可选D52案例及原208文件指纹核对。
- `ACCEPTANCE.md`：冻结的v1标准。

`summary`返回完整病例样本量、均值、简单线性斜率和固定分箱计数，用于验证通道，不能代替D52的多协变量主分析。`row_keys`只返回选择数、正确映射数与布尔，不回传观测值或行号列表。图件为通道交付测试的分箱图，不冒充论文图件。

## 信任与适用边界

宿主、任务注册表和审核程序可信；reader是受限子进程。测试会由可信测试架构注入异常worker，验证stdout/stderr收存及无效结果拒绝；该注入不是公开请求能力。合法汇总本身是明确的信息发布，数值校验不提供差分隐私，也不能识别误批准程序把秘密编码进合法数字的所有方式。

当前配置保护private及登记的数据源目录，保留系统运行库读取；它不是全机器数据副本扫描。public不得预放原始数据；其他未登记副本需要单独治理。权限来自子进程沙箱，不来自同UID的chmod或文件夹名称。后台进程、任意第三方工具和未登记数据域尚未完成独立生命周期审计，不扩大测试结论。

本机可运行的配置采用deny-default，开放运行库所需读取、进程创建、sysctl读取及指定目录写入，并显式拒绝保护域读写；网络和其余默认操作不开放。更窄的运行库目录白名单探针在本机启动失败，未计作通过。该配置只在本轮记录的系统和Python上验证，不作为跨平台沙箱配置分发。

现有ZCode进程不由本原型启动，其原生Read/Bash仍可能在非受限宿主执行。因此本地原型通过不能证明现有ZCode已隔离。接入前必须保证所有相关工具入口受边界约束，注册表和宿主不能被reader改动，检索、统计、图表等正常工作仍可完成。本轮未修改ZCode配置、安装、正式工作流或全域协议，不启动真实试跑。
