import { StoryboardShot } from '@/components/agent/agent-result-area'

export interface AgentResultDetail {
  id: string
  agentId: string
  taskName: string
  createdAt: string
  status: string
  costPoints: number
  processTime: string
  type: 'text' | 'audio' | 'video' | 'image' | 'file' | 'storyboard'
  textContent?: string
  textInfo?: { wordCount: number; language: string; duration?: string }
  audioUrl?: string
  audioFileName?: string
  audioInfo?: { duration: string; format: string; bitrate: string; voiceName: string }
  videoUrl?: string
  videoFileName?: string
  videoInfo?: { resolution: string; duration: string; format: string; frameRate: string }
  imageUrl?: string
  beforeImageUrl?: string
  imageFileName?: string
  imageInfo?: { width: number; height: number; format: string; size: string }
  fileUrl?: string
  fileName?: string
  fileInfo?: { size: string; format: string; pages?: number }
  storyboard?: StoryboardShot[]
  sourceText?: string
  videoKeywords?: string[]
  summary?: string
  keyPoints?: string[]
  actionItems?: string[]
  keywords?: string[]
  beforeVideoUrl?: string
  multiVoiceResults?: { speaker: string; voiceType: string; audioUrl: string; text: string }[]
  segments?: { id: string; speaker: string; startTime: string; endTime: string; text: string }[]
  subtitleTracks?: { index: number; startTime: string; endTime: string; text: string; translatedText?: string }[]
  params?: Record<string, any>
}

// 模拟结果数据
const mockResultDetails: Record<string, AgentResultDetail> = {
  // 1. AI语音转文字
  'result-speech-to-text': {
    id: 'result-speech-to-text',
    agentId: 'speech-to-text',
    taskName: '会议录音转写',
    createdAt: '2024-01-15 14:30',
    status: 'completed',
    costPoints: 10,
    processTime: '32秒',
    type: 'text',
    textContent: '这是会议录音的转写结果。\n\n主持人：大家好，今天我们来讨论一下下季度的产品规划。\n\n产品经理：根据用户反馈，我们需要重点优化搜索功能和推荐算法。\n\n技术负责人：搜索功能的重构预计需要两周时间，推荐算法优化需要一个月。\n\n主持人：好的，那我们下季度重点推进这两个方向。',
    textInfo: { wordCount: 120, language: 'zh', duration: '05:23' },
    segments: [
      { id: '1', speaker: '主持人', startTime: '00:00', endTime: '00:08', text: '大家好，今天我们来讨论一下下季度的产品规划。' },
      { id: '2', speaker: '产品经理', startTime: '00:09', endTime: '00:18', text: '根据用户反馈，我们需要重点优化搜索功能和推荐算法。' },
      { id: '3', speaker: '技术负责人', startTime: '00:19', endTime: '00:28', text: '搜索功能的重构预计需要两周时间，推荐算法优化需要一个月。' },
      { id: '4', speaker: '主持人', startTime: '00:29', endTime: '00:35', text: '好的，那我们下季度重点推进这两个方向。' },
    ],
    summary: '本次产品规划会议核心结论：下季度重点推进两大方向。\n\n一、搜索功能重构：技术团队预计需要两周时间完成，将针对用户反馈的痛点进行全面优化。\n\n二、推荐算法优化：预计需要一个月，旨在提升用户匹配精准度和内容分发效率。\n\n两项工作均为产品经理基于用户反馈提出，已获主持人确认，将作为下季度重点项目推进。',
    keyPoints: [
      '下季度产品规划聚焦搜索功能和推荐算法两大方向',
      '搜索功能重构预计需要两周，推荐算法优化预计需要一个月',
      '产品经理已基于用户反馈明确了优化优先级',
      '技术负责人已完成工时评估，具备可行性',
    ],
    actionItems: [
      '产品经理：输出搜索功能优化的详细需求文档',
      '技术负责人：制定搜索重构的技术方案和时间排期',
      '技术负责人：输出推荐算法优化的实施计划',
      '主持人：下周一召开需求评审会，对齐各方目标',
    ],
    keywords: ['产品规划', '搜索功能', '推荐算法', '用户反馈', '重构', '优化', '下季度'],
    params: { language: 'zh', speakers: 3, format: 'paragraph' },
  },

  // 2. 文字转语音
  'result-text-to-speech': {
    id: 'result-text-to-speech',
    agentId: 'text-to-speech',
    taskName: '有声书配音',
    createdAt: '2024-01-14 10:15',
    status: 'completed',
    costPoints: 5,
    processTime: '18秒',
    type: 'audio',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioFileName: 'audiobook-chapter1.mp3',
    audioInfo: { duration: '02:35', format: 'MP3', bitrate: '192kbps', voiceName: 'Bella' },
    sourceText: '萤火虫的秘密\n深夜，九岁的阿布悄悄溜出外婆家，提着一盏熄灭的马灯走向神秘的黑森林。\n他想抓住传说中能实现愿望的"黄金萤火虫"，来治好外婆的眼睛。林子里静得只能听到他自己的心跳，微风吹过，树叶沙沙作响。\n当它们围绕着阿布翩翩起舞时，阿布闭上眼睛，在心里虔诚地许愿。等他再次睁开眼，手里的马灯竟然自己亮了起来。',
    params: { voice: 'female-gentle', speed: 1.0, volume: 100, format: 'mp3' },
  },

  'result-text-to-speech-2': {
    id: 'result-text-to-speech-2',
    agentId: 'text-to-speech',
    taskName: '品牌故事配音',
    createdAt: '2024-01-13 16:30',
    status: 'completed',
    costPoints: 10,
    processTime: '32秒',
    type: 'audio',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioFileName: 'brand-story.mp3',
    audioInfo: { duration: '04:12', format: 'MP3', bitrate: '256kbps', voiceName: 'Alex' },
    sourceText: '在这个快速迭代的时代，科技创新正以前所未有的速度改变着我们的生活。从清晨智能闹钟的轻柔唤醒，到夜晚智能助手的贴心陪伴，科技已经融入了我们生命中的每一个角落。\n\n想象一下，当你迈进家门的那一刻，灯光自动亮起，温度已经调整到最舒适的度数，就连你最爱的音乐也已经在背景中轻轻流淌……这一切，不再是科幻电影中的场景，而是正在发生的现实。\n\n让我们一起拥抱这个充满无限可能的智能时代，用科技的力量，去创造更美好的明天。',
    params: { voice: 'male-calm', speed: 1.0, volume: 100, format: 'mp3' },
  },

  'result-text-to-speech-3': {
    id: 'result-text-to-speech-3',
    agentId: 'text-to-speech',
    taskName: '课程旁白配音',
    createdAt: '2024-01-12 11:00',
    status: 'completed',
    costPoints: 15,
    processTime: '48秒',
    type: 'audio',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioFileName: 'course-narration-3chapters.mp3',
    audioInfo: { duration: '06:20', format: 'MP3', bitrate: '192kbps', voiceName: 'Luna' },
    sourceText: '机器学习的核心思想是让计算机从数据中学习规律，而不是通过显式编程来完成任务。这就像教一个孩子认识水果——你不需要告诉他苹果有多圆、是什么颜色，只需要给他看足够多的苹果，他自己就能学会辨认。\n\n监督学习是机器学习中最常见的类型。想象你有一个经验丰富的老师，他为每道题都标注了正确答案。你的任务是学习这些例题，然后在遇到新题时给出正确答案。\n\n而无监督学习则完全不同——它更像是在一个陌生的城市探索，没有任何地图或向导。你需要自己发现数据中隐藏的模式和结构。',
    params: { voice: 'female-lively', speed: 1.1, volume: 100, format: 'mp3' },
  },

  // 3. AI视频转文字
  'result-video-to-text': {
    id: 'result-video-to-text',
    agentId: 'video-to-text',
    taskName: '视频课程转写',
    createdAt: '2024-01-13 16:45',
    status: 'completed',
    costPoints: 20,
    processTime: '1分15秒',
    type: 'text',
    textContent: '欢迎来到今天的机器学习课程。\n\n机器学习是人工智能的一个重要分支，它让计算机能够从数据中学习规律。\n\n我们将从监督学习开始，逐步深入到无监督学习和强化学习。\n\n首先，让我们来看一下什么是监督学习...',
    textInfo: { wordCount: 280, language: 'zh', duration: '12:40' },
    segments: [
      { id: '1', speaker: '讲师', startTime: '00:00', endTime: '00:06', text: '欢迎来到今天的机器学习课程。' },
      { id: '2', speaker: '讲师', startTime: '00:07', endTime: '00:18', text: '机器学习是人工智能的一个重要分支，它让计算机能够从数据中学习规律。' },
      { id: '3', speaker: '讲师', startTime: '00:19', endTime: '00:28', text: '我们将从监督学习开始，逐步深入到无监督学习和强化学习。' },
      { id: '4', speaker: '讲师', startTime: '00:29', endTime: '00:35', text: '首先，让我们来看一下什么是监督学习。' },
    ],
    summary: '本视频为机器学习入门课程的第一讲，总时长约12分40秒。\n\n主讲人首先介绍了机器学习的定义：它是人工智能的重要分支，核心特点是让计算机从数据中自动学习规律，而无需显式编程。\n\n课程规划采用循序渐进的方式，从监督学习入门，逐步深入到无监督学习和强化学习。视频最后以监督学习的具体讲解作为切入点展开教学。\n\n适合对AI和机器学习感兴趣的技术初学者观看学习。',
    keyPoints: [
      '机器学习是AI的重要分支，核心是从数据中自动学习规律',
      '课程将按监督学习 → 无监督学习 → 强化学习的路径推进',
      '监督学习是课程的第一个重点模块',
      '无需显式编程，计算机通过数据训练获得判断能力',
    ],
    actionItems: [
      '学员：预习监督学习的基本概念（分类、回归）',
      '学员：准备Python开发环境和常用ML库',
      '讲师：下次课程准备监督学习的案例数据集',
    ],
    keywords: ['机器学习', '人工智能', '监督学习', '无监督学习', '强化学习', '数据训练', '入门课程'],
    params: { language: 'zh', speakers: 1, format: 'paragraph' },
  },

  // 4. AI生成视频文案
  'result-topic-to-copywriting': {
    id: 'result-topic-to-copywriting',
    agentId: 'topic-to-copywriting',
    taskName: '产品宣传片脚本',
    createdAt: '2024-01-09 11:00',
    status: 'completed',
    costPoints: 15,
    processTime: '45秒',
    type: 'text',
    textContent: '# 30秒产品宣传片脚本\n\n## 开场（0-5秒）\n镜头：产品特写，光影流动\n旁白：当科技遇见美学，一切皆有可能。\n\n## 功能展示（5-20秒）\n镜头：用户手势操作产品\n旁白：全新智能助手，懂你所想，应你所需。\n\n## 结尾（20-30秒）\n镜头：品牌Logo + 产品全景\n旁白：未来已来，立即体验。',
    textInfo: { wordCount: 150, language: 'zh', duration: '30秒脚本' },
    params: { style: 'promotional', duration: '30', target: 'product' },
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
      { id: 'shot-1', index: 1, duration: '0:00-0:03', caption: '品牌Logo动画渐入，配轻快背景音乐，纯黑背景凸显质感', description: '品牌Logo动画渐入，配轻快背景音乐，纯黑背景凸显质感', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-2', index: 2, duration: '0:03-0:08', caption: '产品全景展示，慢推镜头，突出产品的流线型设计和金属质感', description: '产品全景展示，慢推镜头，突出产品的流线型设计和金属质感', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-3', index: 3, duration: '0:08-0:15', caption: '产品核心功能特写：AI智能识别、语音控制、手势交互，配合功能说明字幕', description: '产品核心功能特写：AI智能识别、语音控制、手势交互，配合功能说明字幕', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-4', index: 4, duration: '0:15-0:22', caption: '用户使用场景：家庭、办公室、户外，展示真实使用体验和便捷性', description: '用户使用场景：家庭、办公室、户外，展示真实使用体验和便捷性', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-5', index: 5, duration: '0:22-0:28', caption: '产品对比画面：传统方案 vs 本产品，关键指标数据可视化', description: '产品对比画面：传统方案 vs 本产品，关键指标数据可视化', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'shot-6', index: 6, duration: '0:28-0:30', caption: 'CTA行动号召：立即购买 + 品牌Slogan，配强烈节奏收尾音乐', description: 'CTA行动号召：立即购买 + 品牌Slogan，配强烈节奏收尾音乐', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop', voiceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    ],
    sourceText: '全新一代智能语音助手，重新定义人机交互体验。AI驱动、声纹识别、多设备联动，让科技真正融入生活。',
    params: { videoStyle: 'modern', duration: '30', ratio: '9:16', bgm: true, captions: true },
  },

  // 6. AI图生视频
  'result-image-to-video-1': {
    id: 'result-image-to-video-1',
    agentId: 'image-to-video',
    taskName: '图生视频',
    createdAt: '2024-01-12 10:30',
    status: 'completed',
    costPoints: 80,
    processTime: '1分28秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
    videoFileName: 'waterfall.mp4',
    videoInfo: { resolution: '1920×1080', duration: '00:15', format: 'MP4', frameRate: '30fps' },
    sourceText: '让图片中的瀑布动起来，水流倾泻而下，水雾在阳光下形成彩虹，画面气势磅礴',
    params: { ratio: '16:9', duration: '15', resolution: '1080p', bgm: true },
  },

  'result-image-to-video-2': {
    id: 'result-image-to-video-2',
    agentId: 'image-to-video',
    taskName: '图生视频',
    createdAt: '2024-01-11 09:15',
    status: 'completed',
    costPoints: 50,
    processTime: '58秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
    videoFileName: 'product-showcase.mp4',
    videoInfo: { resolution: '1080×1920', duration: '00:10', format: 'MP4', frameRate: '24fps' },
    sourceText: '这张产品图，让镜头从左到右缓慢推进，灯光逐一亮起，营造科技感揭幕仪式',
    params: { ratio: '9:16', duration: '10', resolution: '720p', bgm: true },
  },

  'result-image-to-video-3': {
    id: 'result-image-to-video-3',
    agentId: 'image-to-video',
    taskName: '图生视频',
    createdAt: '2024-01-09 16:40',
    status: 'completed',
    costPoints: 40,
    processTime: '42秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4',
    videoFileName: 'timelapse.mp4',
    videoInfo: { resolution: '1920×1080', duration: '00:08', format: 'MP4', frameRate: '30fps' },
    sourceText: '让风景照中的云朵缓缓飘动，湖面泛起微波，打造延时摄影效果',
    params: { ratio: '16:9', duration: '8', resolution: '1080p', bgm: false },
  },

  'result-image-to-video-4': {
    id: 'result-image-to-video-4',
    agentId: 'image-to-video',
    taskName: '图生视频',
    createdAt: '2024-01-07 14:20',
    status: 'completed',
    costPoints: 60,
    processTime: '1分05秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerJoyrides.mp4',
    videoFileName: 'portrait-animation.mp4',
    videoInfo: { resolution: '1080×1080', duration: '00:05', format: 'MP4', frameRate: '24fps' },
    sourceText: '让人物肖像的眼睛慢慢睁开，嘴角微微上扬，头发轻轻飘动，赋予静态照片生命',
    params: { ratio: '1:1', duration: '5', resolution: '720p', bgm: true },
  },

  'result-image-to-video-5': {
    id: 'result-image-to-video-5',
    agentId: 'image-to-video',
    taskName: '图生视频',
    createdAt: '2024-01-05 11:00',
    status: 'completed',
    costPoints: 55,
    processTime: '47秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerMeltdowns.mp4',
    videoFileName: 'food-video.mp4',
    videoInfo: { resolution: '1920×1080', duration: '00:12', format: 'MP4', frameRate: '30fps' },
    sourceText: '让美食照片中的热气缓缓上升，汤汁轻轻晃动，筷子夹起食物的瞬间慢动作',
    params: { ratio: '16:9', duration: '12', resolution: '540p', bgm: true },
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
    params: { sourceLanguage: 'en', targetLanguage: 'zh', voiceType: 'female-zh', keepOriginalAudio: false },
  },

  // 8. AI视频配音
  'result-video-dubbing': {
    id: 'result-video-dubbing',
    agentId: 'video-dubbing',
    taskName: '产品演示视频配音',
    createdAt: '2025-01-10 11:20',
    status: 'completed',
    costPoints: 40,
    processTime: '1分28秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
    videoFileName: 'product_demo_dubbed.mp4',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioFileName: 'dubbing-output.mp3',
    audioInfo: { duration: '01:20', format: 'MP3', bitrate: '256kbps', voiceName: '男声-沉稳' },
    subtitleTracks: [
      { index: 1, startTime: '00:00', endTime: '00:04', text: '欢迎来到AI视频配音工具的使用教程。', translatedText: 'Welcome to the AI video dubbing tutorial.' },
      { index: 2, startTime: '00:01', endTime: '00:05', text: '今天我们将演示如何为视频自动添加AI配音。', translatedText: 'Today we demonstrate how to add AI dubbing to videos.' },
      { index: 3, startTime: '00:05', endTime: '00:10', text: '首先选择你喜欢的配音音色，系统会自动合成配音。', translatedText: 'First choose your favorite voice, and the system will synthesize the dubbing.' },
      { index: 4, startTime: '00:10', endTime: '00:15', text: '你还可以添加背景音乐，让视频更加生动有趣。', translatedText: 'You can also add background music to make the video more lively.' },
      { index: 5, startTime: '00:15', endTime: '00:20', text: '处理完成后，即可预览带配音和字幕的视频效果。', translatedText: 'Once done, preview the video with dubbing and subtitles.' },
    ],
    params: { voice: 'male-calm', bgm: 'inspire', speed: 1.0, volume: 100 },
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

  // 10. AI视频去水印
  'result-video-watermark-removal': {
    id: 'result-video-watermark-removal',
    agentId: 'video-watermark-removal',
    taskName: '教程视频去水印',
    createdAt: '2025-01-05 09:30',
    status: 'completed',
    costPoints: 50,
    processTime: '1分28秒',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
    videoFileName: 'clean_tutorial.mp4',
    params: { removalMode: 'smart', fillMode: 'ai-inpaint', regions: [{ x: 500, y: 20, width: 80, height: 40 }] },
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
