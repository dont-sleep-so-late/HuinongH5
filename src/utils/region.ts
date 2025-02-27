// 地区数据接口
export interface Region {
  name: string
  children?: Region[]
}

// 地区数据
export const regionData: Region[] = [
  {
    name: '北京市',
    children: [
      {
        name: '北京市',
        children: [
          { name: '东城区' },
          { name: '西城区' },
          { name: '朝阳区' },
          { name: '海淀区' },
          { name: '丰台区' },
          { name: '石景山区' },
          { name: '门头沟区' },
          { name: '房山区' },
          { name: '通州区' },
          { name: '顺义区' },
          { name: '昌平区' },
          { name: '大兴区' },
          { name: '怀柔区' },
          { name: '平谷区' },
          { name: '密云区' },
          { name: '延庆区' },
        ],
      },
    ],
  },
  {
    name: '广东省',
    children: [
      {
        name: '广州市',
        children: [
          { name: '越秀区' },
          { name: '海珠区' },
          { name: '荔湾区' },
          { name: '天河区' },
          { name: '白云区' },
          { name: '黄埔区' },
          { name: '番禺区' },
          { name: '花都区' },
          { name: '南沙区' },
          { name: '从化区' },
          { name: '增城区' },
        ],
      },
      {
        name: '深圳市',
        children: [
          { name: '福田区' },
          { name: '罗湖区' },
          { name: '南山区' },
          { name: '宝安区' },
          { name: '龙岗区' },
          { name: '盐田区' },
          { name: '龙华区' },
          { name: '坪山区' },
          { name: '光明区' },
        ],
      },
    ],
  },
  // 这里只是示例数据，实际项目中应该包含完整的中国省市区数据
]
