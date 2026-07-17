import { Pet, Shelter, Message } from './types';

export const SHELTERS: Record<string, Shelter> = {
  'happy-paws': {
    id: 'happy-paws',
    name: '快乐爪子救助站',
    location: '德克萨斯州休斯顿 / 北京市朝阳区',
    distance: '距您12英里 / 2.5km',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4qzi_LEoPxyz05CMUE5Yqyg4rcrNCqnugPFkbTIpvwvbw1tnuJCJ93QX9czKYc2OPUfFttsS7hzLhILysuJbwJOhV7iCDbo0PVtqPAH4Vhy91c3zEdpKcEfHROyx-1pFtMYE8-Ih5bk_JoyQMgTLVdT_lx5X7knLZn70f18jequrAhVO7fOG4oKxKCqmI7F2F5Pp4J1-ecJRsp7Nwj8mZbZX2xDt5lxlzpEbiJqND9YiFPofAStWViy5sch4v-qvRzWcbb2Y-N0iX'
  }
};

export const INITIAL_PETS: Pet[] = [
  {
    id: 'luna-bc',
    name: '露娜',
    breed: '边境牧羊犬混血',
    age: '2岁',
    gender: '母',
    weight: '15公斤',
    size: '中型',
    location: '德克萨斯州休斯顿',
    distance: '距您12英里',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL0PaGA9O0PrEbacb6pEAfs-O33xvBz98vkspyTBCQ7GpCjrUTn3DTQo3IGfWqPEGvjg2yWrEpe_z_jBkKQIhOjziJvgr-PWKyQTCCiFU-0OX8pRo5n-0o8iIAK4RLfs6Y-7vGY8d2Zmz8bg3YbUyT2eB8EyCKQxrxQ6H_8_FTFcKTxEFGqs33IjSsRwGgjg8wnmLBk9zct6gYoqW4TvpQCGqrA71FrX2Dn3iPxDIm47nnTvvQBYAEbaoBwXfV3cmjIG0wcVL1B9IO',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '精力充沛', '喜欢孩子'],
    description: [
      '露娜是一只聪明、充满活力的甜心，正在寻找一个热爱运动的家庭。她的前任主人意识到无法适应她的工作犬天性后，她来到了我们的救助中心。',
      '她擅长敏捷训练，喜欢接飞盘，而且对孩子非常温柔。露娜需要一个带院子的家，以及喜欢每天跑步或长途徒步的主人。她已经完全接受了室内训练，并懂得坐下、停留和握手等基本指令。'
    ],
    isVaccinated: true,
    isNeutered: true,
    isHouseTrained: true,
    isEnergetic: true,
    isGoodWithKids: true,
    category: 'dog',
    shelterId: 'happy-paws'
  },
  {
    id: 'bubu',
    name: '布布',
    breed: '金毛寻回犬',
    age: '3个月',
    gender: '公',
    weight: '6公斤',
    size: '小型',
    location: '北京海淀区',
    distance: '2.5km',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK-8oTzin0sivfBHZYPUCN6v3E1ysYGDzsFoMWL0NdM7P5gKCegtk3HfyKY6KJMpWHTmdEXs90PLLBWmuOolfpzorNgsSHjekctCHOPAcxNGffiDmSxTeIhg0vu8fqnCXJge-xdKHlp9hmqh1iJzndH4mc6bgM8idTrIDKh4o-boiSYEqdBubt5xOyQnAoZsTkObHST4WGiQ2Qnf_YHmUE_R2iFrz-LfhIZG00vvmflBdHo6iqbp-ewFGFp9Ct6OoSTRDmlhlcM46',
    tags: ['已接种疫苗', '未绝育', '正在室内训练', '精力充沛', '极其亲人'],
    description: [
      '布布是一个超级粘人的金毛小家伙！它对世界充满好奇，对任何人都百分之百的热情友好。',
      '它总是摇着尾巴跟在你身后，特别喜欢和人互动，玩巡回游戏，非常适合家庭抚养。目前正在志愿者帮助下接受定点排便训练。'
    ],
    isVaccinated: true,
    isNeutered: false,
    isHouseTrained: false,
    isEnergetic: true,
    isGoodWithKids: true,
    category: 'dog',
    shelterId: 'happy-paws'
  },
  {
    id: 'xueqiu',
    name: '雪球',
    breed: '波斯猫',
    age: '1岁',
    gender: '母',
    weight: '4公斤',
    size: '小型',
    location: '北京朝阳区',
    distance: '1.8km',
    imageUrl: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?auto=format&fit=crop&w=600&q=80',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '温顺黏人'],
    description: [
      '雪球是一只纯白色的波斯猫，毛发蓬松柔软，眼睛像蓝宝石一样美丽闪亮。',
      '它性格非常安静优雅，喜欢在温暖的阳光下打盹、玩羽毛逗猫棒，或者安静地趴在你的大腿上。它期待一个温馨、轻声细语的家庭。'
    ],
    isVaccinated: true,
    isNeutered: true,
    isHouseTrained: true,
    isEnergetic: false,
    isGoodWithKids: true,
    category: 'cat',
    shelterId: 'happy-paws'
  },
  {
    id: 'charlie',
    name: '查理',
    breed: '比格犬',
    age: '2岁',
    gender: '公',
    weight: '11公斤',
    size: '中型',
    location: '北京东城区',
    distance: '3.1km',
    imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '精力充沛', '嗅觉灵敏'],
    description: [
      '查理是一只聪明又有些贪吃的经典比格犬，标志性的宽大耳朵走起路来一摇一摆，特别滑稽可爱。',
      '它对气味十分敏锐，非常喜欢户外探索和玩追逐游戏，它性格开朗，需要每天有充足的户外活动时间和高品质的散步陪伴。'
    ],
    isVaccinated: true,
    isNeutered: true,
    isHouseTrained: true,
    isEnergetic: true,
    isGoodWithKids: true,
    category: 'dog',
    shelterId: 'happy-paws'
  },
  {
    id: 'badi',
    name: '巴迪',
    breed: '金毛寻回犬',
    age: '幼犬',
    gender: '公',
    weight: '5公斤',
    size: '小型',
    location: '北京丰台区',
    distance: '4.2km',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    tags: ['已接种疫苗', '未绝育', '温顺温和', '容易训练'],
    description: [
      '巴迪是布布的好伙伴，性格相比金毛同类要稍微文静内敛一点点，极具洞察力。',
      '它学东西非常快，只需要温和的表扬和美味小零食就能很好地配合指令。它渴望能有一个属于自己的爱它的家。'
    ],
    isVaccinated: true,
    isNeutered: false,
    isHouseTrained: false,
    isEnergetic: true,
    isGoodWithKids: true,
    category: 'dog',
    shelterId: 'happy-paws'
  },
  {
    id: 'xiaoxiong',
    name: '小熊',
    breed: '博美犬',
    age: '青年',
    gender: '公',
    weight: '3公斤',
    size: '小型',
    location: '北京西城区',
    distance: '1.2km',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '蓬松可爱', '机警过人'],
    description: [
      '小熊是一只如同精致毛绒玩具一般迷人的博美犬，金黄色的被毛保养得极佳，十分厚实蓬松。',
      '它总是神采奕奕，喜欢在人怀里撒娇和展示它可爱的小碎步。它懂得基本的礼仪，非常聪明警觉。'
    ],
    isVaccinated: true,
    isNeutered: true,
    isHouseTrained: true,
    isEnergetic: true,
    isGoodWithKids: false,
    category: 'dog',
    shelterId: 'happy-paws'
  },
  {
    id: 'luna-cat',
    name: '露娜猫',
    breed: '中华田园猫',
    age: '成年',
    gender: '母',
    weight: '4.5公斤',
    size: '中型',
    location: '北京朝阳区',
    distance: '2.3km',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
    tags: ['已接种疫苗', '已绝育', '已受室内训练', '性格沉稳'],
    description: [
      '露娜是一只优雅美丽的中华田园狸花猫，双眼炯炯有神，拥有一身极其漂亮紧致的斑纹。',
      '它性格独立、沉稳，不吵不闹，但在熟悉你之后也会极其温柔地蹭你的脚踝撒娇。对生活环境自适应性极佳，非常省心。'
    ],
    isVaccinated: true,
    isNeutered: true,
    isHouseTrained: true,
    isEnergetic: false,
    isGoodWithKids: true,
    category: 'cat',
    shelterId: 'happy-paws'
  },
  {
    id: 'pipi',
    name: '皮皮',
    breed: '虎皮鹦鹉',
    age: '6个月',
    gender: '公',
    weight: '80克',
    size: '小型',
    location: '北京海淀区',
    distance: '2.8km',
    imageUrl: 'https://images.unsplash.com/photo-1522858113798-51119d259301?auto=format&fit=crop&w=600&q=80',
    tags: ['已体检', '叫声悦耳', '羽色艳丽'],
    description: [
      '皮皮是一只活泼、羽毛极其亮丽的亮绿色虎皮鹦鹉。它非常有灵性，喜欢站在人的肩膀上，对人类的声音很好奇。',
      '它能模仿简单的旋律和哨音，是特别有趣且占地空间小的萌宠。'
    ],
    isVaccinated: false,
    isNeutered: false,
    isHouseTrained: false,
    isEnergetic: true,
    isGoodWithKids: true,
    category: 'bird',
    shelterId: 'happy-paws'
  },
  {
    id: 'tuantuan',
    name: '团团',
    breed: '三线仓鼠',
    age: '3个月',
    gender: '母',
    weight: '120克',
    size: '小型',
    location: '北京东城区',
    distance: '1.5km',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
    tags: ['性格温顺', '体型迷你', '吃相治愈'],
    description: [
      '团团是一只圆滚滚、极为温顺好静的三线仓鼠。最喜欢的事情就是缩在干草木屑中睡觉或者拼命踩跑轮。',
      '每当喂它瓜子和谷物的时候，它的腮帮子就会塞得鼓鼓的，动作非常搞笑解压。适合忙碌、希望能有一份静静陪伴的上班族。'
    ],
    isVaccinated: false,
    isNeutered: false,
    isHouseTrained: false,
    isEnergetic: false,
    isGoodWithKids: true,
    category: 'hamster',
    shelterId: 'happy-paws'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderName: '快乐爪子救助站',
    senderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4qzi_LEoPxyz05CMUE5Yqyg4rcrNCqnugPFkbTIpvwvbw1tnuJCJ93QX9czKYc2OPUfFttsS7hzLhILysuJbwJOhV7iCDbo0PVtqPAH4Vhy91c3zEdpKcEfHROyx-1pFtMYE8-Ih5bk_JoyQMgTLVdT_lx5X7knLZn70f18jequrAhVO7fOG4oKxKCqmI7F2F5Pp4J1-ecJRsp7Nwj8mZbZX2xDt5lxlzpEbiJqND9YiFPofAStWViy5sch4v-qvRzWcbb2Y-N0iX',
    messageText: '你好！关于 Luna 的领养申请，我们觉得您的生活环境和条件非常匹配，方便跟您进行一个简短的电话沟通吗？',
    time: '10:24',
    unread: true,
    isShelter: true
  },
  {
    id: 'msg-2',
    senderName: '志愿者 小李',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    messageText: '申请材料已收到，我们会尽快处理。如果您有任何问题，可以随时在消息中留言给我。',
    time: '昨天',
    unread: false,
    isShelter: false
  }
];
