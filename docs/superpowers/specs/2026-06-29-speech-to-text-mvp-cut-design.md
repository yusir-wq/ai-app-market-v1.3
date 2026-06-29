# AI语音转文字 — MVP 功能裁剪设计

**日期**: 2026-06-29  
**范围**: AI语音转文字智能体，为 MVP 上线剔除次要功能

---

## 裁剪内容

| # | 功能 | 位置 | 决策 |
|---|------|------|------|
| 1 | 输入区实时录音 | `agent-input-area.tsx` → `SpeechToTextInputArea` | 删除 tabs 切换 UI、录音状态、计时器、`renderRecorder()`；仅保留上传模式 |
| 2 | 转写结果查找/替换 | `agent-result-detail-view.tsx` → `SpeechToTextResult` | 删除 Search Popover 及所有关联状态/函数 |
| 3 | 转写结果翻译 + 双语 | `agent-result-detail-view.tsx` → `SpeechToTextResult` | 删除 Languages Popover 及双语显示逻辑 |
| 4 | 智能总结翻译 + 双语 | `agent-result-detail-view.tsx` → `SpeechToTextResult` | 删除智能总结卡片的翻译 Popover 及双语显示 |
| 5 | Intro 实时录音文案 | `agent-speech-to-text-intro.tsx` | FAQ 去掉"支持实时转写吗？"条目；Steps 去掉"也可实时录音转换" |

---

## 保留内容

- 文件上传区（拖拽、格式/大小提示、消耗智点）
- "区分说话人"开关
- 转写内容编辑功能（编辑/保存模式、Textarea）
- 转写内容复制、下载
- 说话人分段展示（Badge + 时间戳）
- 智能总结卡片本身（仅去掉翻译）
- 智能总结重新生成、复制

---

## 实现方案

**方案 A — 直接删除代码**：物理删除相关状态、函数、JSX，不留死代码。

## 涉及文件

| 文件 | 改动类型 |
|------|---------|
| `components/agent/agent-input-area.tsx` | 删除 `SpeechToTextInputArea` 内录音逻辑，简化为纯上传 |
| `components/workspace/agent-result-detail-view.tsx` | 删除 `SpeechToTextResult` 内查找/替换、翻译相关代码 |
| `components/agent/agent-speech-to-text-intro.tsx` | 删除实时录音 FAQ 和 Steps 文案 |
