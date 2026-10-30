<!--
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-02-16 22:33:53
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-10-26 14:34:38
 -->

# Lovelace Gaode Map Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

这个是一个基于高德地图API的Lovelace卡片,完全复刻的官方地图卡片,几乎包含了原来卡片的所有功能. 未来可能会支持更多新的技能.

+ 完全复刻官方的卡片
+ 支持前台自定义卡片配置.

## 更新

+ v1.1
  + 修复未设置路径显示的时候出现空白的错误

  
+ v1.2 **破坏性更新** ( 注意下面的配置示例的变化 )
  + 修复多个key冲突的问题
  + 更改卡片关键字为 `gaode-map-card`
  + 更改配置entities格式和官方map卡片一样

+ v1.2.1
  + 修复`device_tracker`未纳入范围显示的问题

+ v1.2.2
  + 修复覆盖层导致地图不能缩放移动的问题

+ v1.2.3
  + 增加了实时路况的显示开关
  + 修复了icon显示的问题
  
+ v1.2.4
  + 增加了背景根据主题变化( 主题需要定义 card-background-color )
  + 条目编辑改用官方的组件( 虽然官方也有bug )
  + 整理代码修复bug若干
  + 适配面板模式
  + 增加一个方向的参数,配置(angle: sensor.che_liang_fang_xiang)根据方向传感器,地图自动调整方向
+ v1.2.5
  + 增加设备来源数据的坐标体系选择,默认不设置为`gps:GPS原始坐标`. 可选项为`baidu：百度经纬度` `mapbar：图吧经纬度` `gaode: 高德经纬度`
+ v1.2.6
  + 优化代码,修复116带来的一些问题

    ```` yaml
    aspect_ratio: '1'
    dark_mode: auto
    entities:
      - entity: person.ha
        type: mapbar
      - entity: device_tracker.mix
        type: gaode
      - entity: person.fi
        type: baidu
      - entity: device_tracker.cx11_csp_001
        type: gps
    hours_to_show: '18'
    key: f87e0casfdasfe7dfasdf979f0
    traffic: false
    type: 'custom:gaode-map-card'

  ````
+ v1.2.7
  + 优化代码,减少载入
+ v1.2.8 ( 适配新版 HomeAssistant 2024.4+ / 2025.x / 2026.x )
  + 移除对 `LitElement.prototype.html/css` 的依赖(Lit 3 已删除),修复新版报错
  + 卡片编辑器改为纯 DOM 实现,不再使用已被 HA 删除的 `paper-*`/`mwc-*`/`hui-entity-editor` 组件
  + 标记点不再依赖 `ha-entity-marker`/`ha-icon`,改用自带样式;缩放按钮不再依赖 `ha-icon-button`
  + 主题(跟随主题)兼容 HA 2024.4 的 `hass.themes` 新结构(变量嵌套在 `variables` 下)
  + 详细变更与原因见 `docs/变更说明-09-18.md`

+ v1.2.9 ( 修复 [#24](https://github.com/fineemb/lovelace-cn-map-card/issues/24) 所述的三个"地图/标记点不显示"问题 )
  + **`w3color.js` 内联进 `cn-map-card.js`**,单文件自包含。原来 `import './w3color.js'` 依赖 HACS 一并下载同目录文件,但 HACS plugin 类型只支持声明单个 `filename`,该请求会 404 并导致整个 ES module 加载失败(卡片与编辑器完全不渲染)
  + **`hacs.json` 补回 `content_in_root` / `filename`**,否则 HACS 会去 `dist/` 找一个不存在的文件名
  + **修复 `setFitView` 竞态**:从"遍历实体后同步判断"改为"每个标记点真正加入地图后再触发自适应视野",修复地图停在默认中心(北京)、看起来像标记点不显示的假象
  + **新增可选配置 `rest_key`**:`gps`/`baidu`/`mapbar` 坐标改用高德 REST 接口转换,绕开 `AMap.convertFrom` 对绝大多数 Key 必然失败的问题(`USERKEY_PLAT_NOMATCH` / `INVALID_USER_SCODE`)
  + 不再在模块顶层无条件写 `window._AMapSecurityConfig = { securityJsCode:'' }`(会覆盖用户自己的安全密钥),改为由 `securityJsCode` 配置项注入
  + 地图加载完成后立即刷新一次标记点,不再需要等下一次状态推送
  + 详细变更与原因见 `docs/变更说明-09-19.md`

+ v1.2.10 ( 修复 `dark_mode` 配置导致的高德内部崩溃 )
  + 修复 `TypeError: Cannot read properties of undefined (reading 'pn')`。`dark_mode` 取值过去原样拼进 `amap://styles/<值>`,非法样式名会让高德内部加载失败并抛错,同时中断整条状态更新。已统一做取值归一化,并对 `setMapStyle` 兜底
  + `dark_mode` 兼容 `true`/`false`(夜间/白天)、`auto`、高德内置样式名、自定义样式 ID;无法识别的取值回退 `auto`
  + 地图样式/主题更新不再受 `entities` 为空的影响(原先 `entities` 为空时整条更新直接早退)
  + 详细变更与原因见 `docs/变更说明-09-19.md` 的「追加修复」一节

+ v1.2.11 ( 修复"地图显示了但没有任何标记点" + 补齐失败诊断 )
  + **修复级联失效**:`_loadMap` 里样式/路况等增强步骤的异常过去会打断整个回调,导致 `loaded` 永远为 `false` —— 而 `set hass` 开头就 `if(!this.loaded) return`,于是底图正常显示、所有标记点却永远不添加。现在这些步骤被逐个隔离,任何一个失败都不会影响标记点
  + **失败不再静默**:实体不存在、实体缺经纬度、坐标转换失败,各自都有明确的一次性告警(带可执行的处置建议);以往这几种情况都是静默跳过,只能看到一张空地图
  + 坐标转换失败时直接给出三种处置:`rest_key` / `type: gaode` / 临时用 `gaode` 接受偏移
  + 标记点创建不再依赖精度圈:半径非法或无 `gps_accuracy` 时跳过圈,不连累标记点
  + 缺少 `key` / `securityJsCode` 时在连接阶段就明确报错
  + 详细变更与原因见 `docs/变更说明-09-19.md` 的「追加修复（v1.2.11）」一节

+ v1.2.12 ( 修复"人员的历史轨迹不显示" )
  + **修复时间控件取值格式**:`start_time` / `end_time` 原先写入 `yyyy-MM-dd hh:mm`(空格分隔),而 `datetime-local` 只接受 `yyyy-MM-ddTHH:mm` —— 浏览器会把非法值置空,随后 `new Date("")` 得到 Invalid Date,`toISOString()` 抛 `RangeError`,整条轨迹静默消失。现已改为标准格式并显式按本地时间解析
  + **不再要求配置 `hours_to_show`**:原先只有 `hours_to_show > 0` 才会请求历史,不写这个选项目前永远不会有轨迹。现在默认查询"今天 00:00 至今",配置 `hours_to_show` 则按该时长回溯(底部时间控件仍可手动覆盖)
  + 历史接口返回空数组 / 请求失败不再静默:`res[0]` 之前会直接抛 TypeError 且无 `catch`,现在有明确的 info/warn 诊断
  + `hours_to_show` 现在真正生效(此前该配置被注释掉,窗口固定为"今天 00:00 至今")
  + 轨迹更新时同步重建停留点圆点(此前只 `setPath`,圆点会停在旧位置);追踪模式下刷新轨迹时不再传空颜色(空 `strokeColor` 画出的线不可见)
  + REST 坐标转换的分批请求改为**串行**发送:1000 点轨迹原本会瞬间并发 25 个请求,极易触发高德 QPS 限制导致整条轨迹失败
  + 不再改写 `Date.prototype.format`(会污染全局 Date 原型,与其它卡片冲突)
  + 详细变更与原因见 `docs/变更说明-09-19.md` 的「追加修复（v1.2.12）」一节

+ v1.2.13 ( 修复"切换视图后轨迹消失"与失败后不再重试 )
  + **修复生命周期**:`disconnectedCallback` 增加地图销毁与状态复位。切换视图 / 进出编辑模式会先 disconnect 再 connect,原实现只断开 ResizeObserver,旧的 `loaded` / `markers` / `paths` 会残留 —— 新地图上没有这些对象,而 `entities` 未变又不会重建,表现为"切回来以后标记点和历史轨迹都不见了"
  + **轨迹失败后可自愈**:历史请求或坐标转换一次性失败(HA 启动中 / 高德 QPS / 网络抖动)时,不再只能刷新页面;后续状态推送会对缺失的轨迹做有限重试(最多 3 次,间隔 30/60/90 秒)
  + 修复失败被永久锁死:`historyPath` 改为**绘制成功后**才记录点数。此前转换失败也会先写入,导致同点数的重试被去重逻辑直接挡掉
  + 停留时长算不出来(NaN)时圆点半径兜底,不再打断整段轨迹绘制
  + 请求不再携带 `significant_changes_only`(默认行为已返回全部状态变化,显式传参无收益且可能因参数变动被拒)
  + 成功绘制时输出一条 `[轨迹] 返回 N 条记录 / 有效坐标 M 个 / 窗口 ...` 的 info,便于排查
  + 详细变更与原因见 `docs/变更说明-09-19.md` 的「追加修复（v1.2.13）」一节
  
## 预览
![](1.gif)

## HACS 安装
搜索Gaode Map card, 或者手动添加地址安装
## 手动安装
1. 下载 `cn-map-card.js`
1. 复制到 `www\community\lovelace-cn-map`
1. 在Lovelace的resources下添加以下配置
    ``` yaml
    resources:
      - url: /local/community/lovelace-cn-map/cn-map-card.js
        type: module
    ```
1. 在Lovelace视图 `views.cards` 内部添加卡片配置
    ```yaml
      type: 'custom:gaode-map-card'
      default_zoom: '9'
      dark_mode: false
      hours_to_show: '168'
      entities:
        - person.a
        - person.b
        - person.c
        - zone.school
        - zone.home
      key: f87e0c9c4f3e1e78f963075d142979f0
      title: Map
    ```

## 选项

| 属性名 | 类型 | 默认 | 描述
| ---- | ---- | ------- | -----------
| title | string | 选项 | 卡片标题
| entities | entity id | **必选** | 需要显示的条目,支持person,zone,device_tracker
| default_zoom | Number | 选项 | 地图默认缩放等级
| dark_mode | string / boolean | `auto` | 地图样式。`auto` 跟随主题;`true`/`dark` 夜间;`false`/`normal` 白天;也可填高德内置样式名(`light`/`grey`/…)或你在控制台发布的自定义样式 ID。无法识别的取值自动回退 `auto` |
| traffic | boolean | 选项 | 实时路况
| hours_to_show | Number | 选项 | 历史轨迹时长(小时)。决定默认查询窗口;不配置时默认查询「今天 00:00 至今」。卡片底部的时间选择可手动覆盖 |
| key | string | **必选** | 自己去高德申请key,内置的key说不定哪天就失效了.
| securityJsCode | string | 选项 | 高德安全密钥,2021年12月后申请的新Key必填
| rest_key | string | 选项 | 单独申请的、平台为**Web服务(REST API)**的Key,仅用于坐标转换,见下方说明
| angle | entity id | 选项 | 方向传感器实体,开启追踪(点击左上角按钮)时地图自动旋转

## 地图上没有标记点？按这个顺序看

v1.2.11 起,所有会导致"标记点不显示"的原因都会在浏览器控制台留下明确提示(同一条原因只提示一次)。
先打开控制台(F12)看 `GaodeMapCard:` 开头的日志:

| 控制台提示 | 原因 | 处置 |
| --- | --- | --- |
| `未配置 key` / `未配置 securityJsCode` | 地图 JS API 无法初始化 | 补上配置项,见「选项」表 |
| `高德地图加载失败(key / securityJsCode / 网络 / Key 平台类型)` | JS API 本身没加载起来(此时底图也出不来) | 检查 Key 是否为"Web端(JS API)"平台、`securityJsCode` 是否正确 |
| `实体 xxxx 在 hass.states 中不存在` | 实体 ID 写错 / 实体已删除 | 核对实体 ID |
| `实体 xxxx 没有 longitude/latitude 属性` | 该实体本身没有坐标 | `person` 需要挂一个带 GPS 的 `device_tracker`;`zone` 需要配置圆心坐标 |
| `坐标转换失败(...)` | 纯 JS API Key 调用 `AMap.convertFrom` 必然失败,见下一节 | 配置 `rest_key`,或把实体的 `type` 改为 `gaode` |
| `地图样式 ... 设置失败,回退 normal` | `dark_mode` 取值异常 | 升级到最新版即可,不会再中断 |
| 完全没有 `GaodeMapCard:` 日志 | 页面里跑的还是旧文件 | 强刷浏览器 / 清缓存,HACS 更新到最新版 |

控制台首行应显示当前版本号(如 `Version 1.2.11`),可用来确认加载的是新文件。

## 关于 `rest_key`(标记点不显示时先看这条)

实体坐标不是高德坐标时(默认 `type: gps`,另有 `baidu` / `mapbar`),卡片需要做一次坐标系转换。

原实现调用的是 `AMap.convertFrom`,而该接口内部请求的是高德"坐标转换"REST 接口,**要求 Key 具备"Web服务(REST API)"平台权限**;但用来渲染地图的 Key 只能是"Web端(JS API)"平台 —— 同一个 Key 不能同时具备两个平台。因此对于按官方文档申请的普通 Key,这个转换是**必然失败**的,表现为实体坐标无法定位、标记点不显示(控制台可见 `INVALID_USER_SCODE` / `USERKEY_PLAT_NOMATCH`)。

解决办法:另外申请一个平台为 **Web服务(REST API)** 的 Key,配置到 `rest_key`:

```yaml
type: 'custom:gaode-map-card'
key: 你的Web端(JS API)Key
securityJsCode: 你的安全密钥
rest_key: 你的Web服务(REST API)Key
entities:
  - person.a
  - device_tracker.b
```

```yaml
# 需要分别指定坐标体系时
entities:
  - entity: person.a          # 默认 gps,走 rest_key 转换
  - entity: person.b
    type: gaode               # 已是高德坐标,不需要转换
```

- 未配置 `rest_key` 时行为与旧版本完全一致(仍走 `AMap.convertFrom`),不影响现有配置。
- 历史轨迹可能上千个点,而 REST 坐标转换接口单次上限 40 个点,卡片已自动分批请求。
- `type: gaode` 的实体本身已是高德(GCJ-02)坐标,不需要转换,也不消耗 `rest_key`。

## 历史轨迹不显示？

按以下顺序排查(v1.2.12 起每一步都有控制台提示):

1. **该时间段是否真的有历史数据**。轨迹默认查询「今天 00:00 至今」;要更长的时间范围请配置
   `hours_to_show`(单位小时),或用卡片底部的时间选择手动指定。注意 `person` 的历史来自其关联的
   `device_tracker`,如果只建了 `person` 而没有 GPS 来源,就不会有历史。
2. **至少需要 2 个带经纬度的记录**才能连成线。控制台会提示「只有 N 个有效记录,不足以绘制轨迹」。
3. **坐标转换必须可用**。轨迹和标记点用同一套转换逻辑:没有配置 `rest_key` 且 Key 是纯 JS API 平台时,
   转换必然失败(见上一节)。控制台会出现「坐标转换失败」。
4. **HA 的 recorder 是否已启用**。历史接口请求失败时会提示 `获取实体 xxx 的历史轨迹失败: ...`,
   常见原因是 recorder 未启用 / 该实体被 `exclude` 排除。
5. **点数很多时**会分批请求高德 REST 接口(每批 40 点,串行发送)。若控制台出现
   `CUQPS_HAS_EXCEEDED_THE_LIMIT`,说明并发或频率超过 Key 配额,可缩短 `hours_to_show`。

`hours_to_show` 只在**首次建立标记点**时决定默认窗口;之后修改需要刷新页面(或改卡片配置触发重建)。

**切换视图后轨迹/标记点消失?** v1.2.13 已修。此前卡片 detach 时未销毁地图与派生状态,
重新 attach 会新建一张地图,但旧的 marker / polyline 仍指向已销毁的实例,而 `entities` 没变
又不会重建。升级后重新连接会自动完整重建。

**轨迹偶发不出现?** v1.2.13 起会在后续状态更新中自动重试(最多 3 次,间隔 30/60/90 秒),
不再需要刷新页面。若控制台出现 `[轨迹] 返回 N 条记录, 有效坐标 M 个`,说明数据已取到;
若没有这一行,看前面是否有 `坐标转换失败` 或 `获取实体 xxx 的历史轨迹失败`。

## 关于 `Cannot read properties of undefined (reading 'pn')`

该报错抛在高德 JS API 内部(`x.prototype._getUserStyle` 里的 `i.mapStyle.pn(...)`),根因在**配置侧**:

`dark_mode` 的取值过去被原样拼进 `amap://styles/<值>` —— 未配置 `dark_mode` 时是 `amap://styles/undefined`,
写 `dark_mode: true` 时是 `amap://styles/true`。样式名非法 → 高德内部样式加载失败 → 内部 `mapStyle` 保持 `undefined`
→ `_getUserStyle` 读取 `mapStyle.pn` 抛 `TypeError`,并**中断整条状态更新**(主题、路况、标记点都不再刷新)。

v1.2.10 起:

- 取值统一归一化,无法识别的取值回退 `auto`,不会再有 `undefined` / `true` 这类样式名;
- `setMapStyle` 增加兜底,即便样式名非法也只回退 `normal` 并打一条 warn,不再中断更新。

若升级后仍看到该报错,先确认浏览器加载的是新文件(强刷 / 清缓存),控制台首行应显示 `Version 1.2.10`。
