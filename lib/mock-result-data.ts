import type { SpeakerSegment, StoryboardShot, MultiVoiceResult } from '@/components/agent/agent-result-area'

// ============================================================
// 结果详情类型
// ============================================================

export interface AgentResultDetail {
  id: string
  agentId: string
  taskName: string
  createdAt: string
  status: 'completed' | 'failed'
  costPoints: number
  processTime: string
  type: 'text' | 'audio' | 'video' | 'image' | 'storyboard'

  // 文本类
  textContent?: string
  segments?: SpeakerSegment[]

  // 摘要类
  keyPoints?: string[]
  actionItems?: string[]
  keywords?: string[]

  // 音频类
  audioUrl?: string
  audioFileName?: string
  audioInfo?: { duration: string; format: string; bitrate: string; voiceName: string }

  // 视频类
  videoUrl?: string
  videoFileName?: string
  videoInfo?: { resolution: string; duration: string; format: string; frameRate: string }
  beforeVideoUrl?: string

  // 字幕
  subtitleTracks?: { index: number; startTime: string; endTime: string; text: string }[]

  // 文案分块
  copywritingHook?: string
  copywritingBody?: string
  copywritingCTA?: string

  // 分镜
  storyboard?: StoryboardShot[]

  // 图片
  imageUrl?: string
  beforeImageUrl?: string
  imageInfo?: { width: number; height: number; format: string; size: string }

  // 多人配音
  multiVoiceResults?: MultiVoiceResult[]

  // 源文本
  sourceText?: string

  // 处理参数记录
  params?: Record<string, any>
}

// ============================================================
// 每个智能应用的 Mock 结果详情
// ============================================================

export const mockResultDetails: Record<string, AgentResultDetail> = {
  // 1. AI语音转文字
  'result-speech-to-text': {
    id: 'result-speech-to-text',
    agentId: 'speech-to-text',
    taskName: '会议录音转写',
    createdAt: '2024-01-15 14:30',
    status: 'completed',
    costPoints: 20,
    processTime: '1分32秒',
    type: 'text',
    textContent: `【AI语音转文字结果】

大家好，今天我们来讨论一下人工智能在医疗领域的应用。

首先，AI可以帮助医生更准确地诊断疾病。通过深度学习算法，AI系统可以分析医学影像，识别出早期肿瘤的迹象。据斯坦福大学的研究，AI在皮肤癌检测上的准确率已经超过了很多皮肤科专家。

其次，在药物研发方面，AI可以大大缩短新药的研发周期。传统方法需要10到15年，而借助AI技术，这个时间可以缩短到3到5年。最近一家AI制药公司成功将候选药物的筛选时间从18个月压缩到了3个月。

最后，AI还可以用于个性化治疗方案的制定。通过分析患者的基因数据和病史，AI可以为每位患者定制最合适的治疗方案。

谢谢大家。`,
    segments: [
      { id: 'seg-1', speaker: '说话人1', startTime: '00:00', endTime: '00:08', text: '大家好，今天我们来讨论一下人工智能在医疗领域的应用。' },
      { id: 'seg-2', speaker: '说话人1', startTime: '00:08', endTime: '00:22', text: '首先，AI可以帮助医生更准确地诊断疾病。通过深度学习算法，AI系统可以分析医学影像，识别出早期肿瘤的迹象。据斯坦福大学的研究，AI在皮肤癌检测上的准确率已经超过了很多皮肤科专家。' },
      { id: 'seg-3', speaker: '说话人1', startTime: '00:22', endTime: '00:38', text: '其次，在药物研发方面，AI可以大大缩短新药的研发周期。传统方法需要10到15年，而借助AI技术，这个时间可以缩短到3到5年。最近一家AI制药公司成功将候选药物的筛选时间从18个月压缩到了3个月。' },
      { id: 'seg-4', speaker: '说话人1', startTime: '00:38', endTime: '00:50', text: '最后，AI还可以用于个性化治疗方案的制定。通过分析患者的基因数据和病史，AI可以为每位患者定制最合适的治疗方案。' },
      { id: 'seg-5', speaker: '说话人1', startTime: '00:50', endTime: '00:53', text: '谢谢大家。' },
    ],
    params: { language: 'zh', speakerCount: '1', punctuation: true, timestamps: true, summarize: true },
  },

  // 2. 文字转语音
  'result-text-to-speech': {
    id: 'result-text-to-speech',
    agentId: 'text-to-speech',
    taskName: '产品宣传配音',
    createdAt: '2024-01-14 09:15',
    status: 'completed',
    costPoints: 15,
    processTime: '18秒',
    type: 'audio',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioFileName: 'product-ad.mp3',
    audioInfo: { duration: '00:45', format: 'MP3', bitrate: '320kbps', voiceName: '女声-温柔' },
    sourceText: '新品上市！智能语音助手小V，全新升级第二代。24小时陪伴，懂你说的每句话。现在下单立减100元，前100名用户还送价值299元的智能家居套装。赶快行动吧！',
    params: { voice: 'female-gentle', speed: 1.0, pitch: 0, volume: 100, outputFormat: 'mp3' },
  },

  // 3. AI视频转文字
  'result-video-to-text': {
    id: 'result-video-to-text',
    agentId: 'video-to-text',
    taskName: '产品发布会视频转写',
    createdAt: '2024-01-13 15:20',
    status: 'completed',
    costPoints: 25,
    processTime: '1分45秒',
    type: 'text',
    textContent: `【AI视频转文字结果】

各位来宾，欢迎参加我们2024年度新品发布会。今天我将为大家介绍三款全新产品。

第一款是我们最新研发的智能语音助手V2，它采用了全新的端侧AI芯片，响应速度提升了300%，支持离线唤醒和连续对话。无论是在嘈杂的地铁还是安静的办公室，它都能精准识别你的指令。

第二款产品是面向B端的企业级AI中台。可以帮助企业在不招募AI团队的情况下，快速搭建自己的智能客服、智能推荐和智能质检系统。目前已经有超过200家企业接入使用。

第三款是面向开发者的AI开放平台SDK，支持零代码接入语音识别、图像处理、自然语言理解等50多项AI能力。开发者注册后10分钟即可完成首个AI应用的搭建。

这三款产品即日起开放预售，前1000名用户可享受8折优惠。感谢大家的关注。`,
    segments: [
      { id: 'seg-1', speaker: '主持人', startTime: '00:00', endTime: '00:08', text: '各位来宾，欢迎参加我们2024年度新品发布会。今天我将为大家介绍三款全新产品。' },
      { id: 'seg-2', speaker: '主持人', startTime: '00:08', endTime: '00:30', text: '第一款是我们最新研发的智能语音助手V2，它采用了全新的端侧AI芯片，响应速度提升了300%，支持离线唤醒和连续对话。' },
      { id: 'seg-3', speaker: '主持人', startTime: '00:30', endTime: '00:52', text: '第二款产品是面向B端的企业级AI中台。可以帮助企业在不招募AI团队的情况下，快速搭建自己的智能客服、智能推荐和智能质检系统。' },
      { id: 'seg-4', speaker: '主持人', startTime: '00:52', endTime: '01:15', text: '第三款是面向开发者的AI开放平台SDK，支持零代码接入语音识别、图像处理、自然语言理解等50多项AI能力。' },
      { id: 'seg-5', speaker: '主持人', startTime: '01:15', endTime: '01:22', text: '这三款产品即日起开放预售，前1000名用户可享受8折优惠。感谢大家的关注。' },
    ],
    params: { language: 'auto', speakerCount: 'auto', timestamps: true, mergeConsecutive: true },
  },

  // 4. AI生成视频文案
  'result-topic-to-copywriting': {
    id: 'result-topic-to-copywriting',
    agentId: 'topic-to-copywriting',
    taskName: '新品发布短视频脚本',
    createdAt: '2024-01-09 16:30',
    status: 'completed',
    costPoints: 10,
    processTime: '8秒',
    type: 'text',
    copywritingHook: '你是不是也有过这样的经历——明明很努力，却总是达不到预期效果？',
    copywritingBody: `今天我要分享3个让你效率翻倍的小技巧：

1️⃣ 番茄工作法：25分钟专注 + 5分钟休息
这个方法看似简单，但坚持下来效果惊人。研究表明，短时间高强度专注比长时间低效工作产出高67%。

2️⃣ 两分钟法则：能在2分钟内完成的事立刻做
回复邮件、整理桌面、记录灵感...这些小事一旦堆积，就会变成让人头疼的大事。

3️⃣ 批量处理：同类任务集中处理，减少切换成本
大脑在任务切换时需要约23分钟才能完全恢复专注。把同类任务放在一起处理，每天能节省2小时。`,
    copywritingCTA: '试试这三个方法，评论区告诉我效果！关注我，每天进步一点点！',
    params: { copywritingType: 'short-video', tone: 'casual', length: 'medium', includeHook: true, includeCTA: true },
  },

  // 5. AI文案生视频
  'result-copywriting-to-video': {
    id: 'result-copywriting-to-video',
    agentId: 'copywriting-to-video',
    taskName: '品牌宣传片生成',
    createdAt: '2024-01-08 09:00',
    status: 'completed',
    costPoints: 120,
    processTime: '5分20秒',
    type: 'storyboard',
    storyboard: [
      { id: 'shot-1', index: 1, duration: '0:00-0:03', description: '品牌Logo动画渐入，配轻快背景音乐，纯黑背景凸显质感', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-2', index: 2, duration: '0:03-0:08', description: '产品全景展示，慢推镜头，突出产品的流线型设计和金属质感', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-3', index: 3, duration: '0:08-0:15', description: '产品核心功能特写：AI智能识别、语音控制、手势交互，配合功能说明字幕', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-4', index: 4, duration: '0:15-0:22', description: '用户使用场景：家庭、办公室、户外，展示真实使用体验和便捷性', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-5', index: 5, duration: '0:22-0:28', description: '产品对比画面：传统方案 vs 本产品，关键指标数据可视化', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-6', index: 6, duration: '0:28-0:30', description: 'CTA行动号召：立即购买 + 品牌Slogan，配强烈节奏收尾音乐', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    ],
    sourceText: '全新一代智能语音助手，重新定义人机交互体验。AI驱动、声纹识别、多设备联动，让科技真正融入生活。',
    params: { videoStyle: 'modern', duration: '30', ratio: '9:16', bgm: true, captions: true },
  },

  // 6. AI图生视频
  'result-image-to-video': {
    id: 'result-image-to-video',
    agentId: 'image-to-video',
    taskName: '旅行相册MV',
    createdAt: '2024-01-12 10:30',
    status: 'completed',
    costPoints: 80,
    processTime: '1分28秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
    videoFileName: 'travel-mv.mp4',
    videoInfo: { resolution: '1920×1080', duration: '00:15', format: 'MP4', frameRate: '30fps' },
    params: { effect: 'kenburns', duration: '15', ratio: '16:9', bgm: true },
  },

  // 7. AI视频翻译
  'result-video-translate': {
    id: 'result-video-translate',
    agentId: 'video-translate',
    taskName: '英文课程中文字幕',
    createdAt: '2024-01-11 14:00',
    status: 'completed',
    costPoints: 60,
    processTime: '3分12秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
    videoFileName: 'lecture-zh-subtitled.mp4',
    videoInfo: { resolution: '1920×1080', duration: '02:30', format: 'MP4', frameRate: '24fps' },
    subtitleTracks: [
      { index: 1, startTime: '00:00', endTime: '00:05', text: "Welcome to today's lecture on machine learning" },
      { index: 2, startTime: '00:00', endTime: '00:05', text: '欢迎来到今天的机器学习讲座' },
      { index: 3, startTime: '00:05', endTime: '00:15', text: 'Today we will cover supervised learning and its real-world applications' },
      { index: 4, startTime: '00:05', endTime: '00:15', text: '今天我们将讲解监督学习及其实际应用' },
      { index: 5, startTime: '00:15', endTime: '00:25', text: 'Supervised learning is a type of machine learning where the model is trained on labeled data' },
      { index: 6, startTime: '00:15', endTime: '00:25', text: '监督学习是一种机器学习类型，模型在标注数据上进行训练' },
      { index: 7, startTime: '00:25', endTime: '00:35', text: 'Common examples include spam detection, image classification, and speech recognition' },
      { index: 8, startTime: '00:25', endTime: '00:35', text: '常见示例包括垃圾邮件检测、图像分类和语音识别' },
    ],
    params: { sourceLanguage: 'en', targetLanguage: 'zh', outputType: 'burn', bilingual: true },
  },

  // 8. AI视频配音
  'result-video-dubbing': {
    id: 'result-video-dubbing',
    agentId: 'video-dubbing',
    taskName: '解说视频配音',
    createdAt: '2024-01-10 11:20',
    status: 'completed',
    costPoints: 40,
    processTime: '1分28秒',
    type: 'audio',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioFileName: 'dubbing-output.mp3',
    audioInfo: { duration: '01:20', format: 'MP3', bitrate: '256kbps', voiceName: '男声-沉稳' },
    multiVoiceResults: [
      { speaker: '旁白', voiceType: '男声-沉稳', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', text: '在这个快速变化的时代，人工智能正在重塑每一个行业。' },
      { speaker: '专家', voiceType: '男声-活力', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', text: '我们看到，AI技术已经从实验室走向了实际应用。在医疗、教育、金融等领域，AI正在发挥越来越重要的作用。' },
      { speaker: '用户', voiceType: '女声-活泼', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', text: '用了这个AI助手之后，我的工作效率提高了至少三倍！以前需要花一天完成的工作，现在两个小时就搞定了。' },
    ],
    params: { voice: 'male-calm', speed: 1.0, volume: 100, keepOriginalAudio: false },
  },

  // 9. AI字幕生成
  'result-video-subtitle': {
    id: 'result-video-subtitle',
    agentId: 'video-subtitle',
    taskName: '课程视频配字幕',
    createdAt: '2024-01-12 10:30',
    status: 'completed',
    costPoints: 30,
    processTime: '48秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
    videoFileName: 'lecture-subtitled.mp4',
    videoInfo: { resolution: '1920×1080', duration: '01:15', format: 'MP4', frameRate: '24fps' },
    subtitleTracks: [
      { index: 1, startTime: '00:00', endTime: '00:05', text: '欢迎大家来到今天的课程' },
      { index: 2, startTime: '00:05', endTime: '00:12', text: '今天我们要讲的是机器学习的基础概念' },
      { index: 3, startTime: '00:12', endTime: '00:20', text: '机器学习是人工智能的一个重要分支' },
      { index: 4, startTime: '00:20', endTime: '00:28', text: '它让计算机能够从数据中学习规律' },
      { index: 5, startTime: '00:28', endTime: '00:35', text: '而不需要显式地编写程序规则' },
      { index: 6, startTime: '00:35', endTime: '00:45', text: '机器学习的核心思想是通过大量数据训练模型' },
      { index: 7, startTime: '00:45', endTime: '00:55', text: '使模型能够在新的数据上做出准确的预测' },
      { index: 8, startTime: '00:55', endTime: '01:05', text: '常见的机器学习任务包括分类、回归和聚类' },
      { index: 9, startTime: '01:05', endTime: '01:10', text: '我们将在接下来的课程中详细展开讲解' },
      { index: 10, startTime: '01:10', endTime: '01:15', text: '谢谢大家，我们下节课再见' },
    ],
    params: { sourceLanguage: 'zh', targetLanguage: 'zh', subtitleStyle: 'burn', bilingual: false },
  },
}

// 获取结果详情
export function getResultDetail(id: string): AgentResultDetail | undefined {
  return mockResultDetails[id]
}

// 获取某智能体的所有历史结果
export function getResultsByAgentId(agentId: string): AgentResultDetail[] {
  return Object.values(mockResultDetails).filter(r => r.agentId === agentId)
}
