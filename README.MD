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
| dark_mode | boolean | 选项 | 地图夜间黑暗模式开关
| traffic | boolean | 选项 | 实时路况
| hours_to_show | Number | 选项 | 指定时间内的历史路径,这里是填的是小时
| key | string | **必选** | 自己去高德申请key,内置的key说不定哪天就失效了.
| securityJsCode | string | 选项 | 高德安全密钥,2021年12月后申请的新Key必填
| rest_key | string | 选项 | 单独申请的、平台为**Web服务(REST API)**的Key,仅用于坐标转换,见下方说明
| angle | entity id | 选项 | 方向传感器实体,开启追踪(点击左上角按钮)时地图自动旋转

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
