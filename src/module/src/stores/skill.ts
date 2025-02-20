import { context } from "@/lib/context";

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { makeAutoObservable, runInAction } = mobx;

class SkillStore {
  skills = [];
  categories = [];
  matches = [];
  loading = false;
  matching = false;
  showMatches = false;
  error = null;
  searchQuery = '';
  selectedCategory = 'all';
  selectedSkill = null;

  constructor() {
    makeAutoObservable(this);
    this.loadSkills();
  }

  loadSkills = async () => {
    try {
      this.loading = true;
      this.error = null;
      
      // 模拟技能分类数据
      const categories = [
        { id: 'all', name: '全部' },
        { id: 'parenting', name: '育儿' },
        { id: 'cooking', name: '烹饪' },
        { id: 'education', name: '教育' },
        { id: 'handcraft', name: '手工' }
      ];
      
      // 模拟技能数据
      const skills = [
        {
          id: 1,
          name: '烘焙',
          icon: 'solar:cookie-bold-duotone',
          category: 'cooking',
          users: 28,
          description: '专业烘焙技能，包括面包、蛋糕等烘焙食品的制作。',
          rating: 4.8
        },
        {
          id: 2,
          name: '编织',
          icon: 'solar:knitting-bold-duotone',
          category: 'handcraft',
          users: 15,
          description: '手工编织技能，可以制作各种毛衣、围巾等织物。',
          rating: 4.5
        },
        {
          id: 3,
          name: '育儿',
          icon: 'solar:baby-bold-duotone',
          category: 'parenting',
          users: 42,
          description: '专业育儿经验，包括婴幼儿护理、早教等。',
          rating: 4.9
        },
        {
          id: 4,
          name: '早教',
          icon: 'solar:book-bold-duotone',
          category: 'education',
          users: 35,
          description: '儿童早期教育经验，培养孩子的学习兴趣和能力。',
          rating: 4.7
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      runInAction(() => {
        this.categories = categories;
        this.skills = skills;
        this.loading = false;
      });

      api.log.info('加载技能列表成功', {
        skillsCount: skills.length,
        categoriesCount: categories.length
      });
    } catch (error) {
      api.log.error('加载技能列表失败', {
        error: error.message
      });
      
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
        this.skills = [];
      });
      
      message.error('加载技能列表失败');
    }
  }

  setSearchQuery = (query) => {
    this.searchQuery = query;
  }

  setSelectedCategory = (category) => {
    this.selectedCategory = category;
  }

  setSelectedSkill = (skill) => {
    this.selectedSkill = skill;
    this.showMatches = false; // 重置匹配显示状态
    this.matches = []; // 清空之前的匹配结果
  }

  get filteredSkills() {
    return this.skills.filter(skill => {
      const matchesCategory = this.selectedCategory === 'all' || skill.category === this.selectedCategory;
      const matchesSearch = skill.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          skill.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  startMatching = async (skillId) => {
    if (!skillId) {
      api.log.warn('开始匹配时未提供skillId');
      return;
    }

    try {
      api.log.info('开始匹配技能', { skillId });
      
      runInAction(() => {
        this.matching = true;
        this.showMatches = false;
        this.matches = [];
      });

      // 模拟匹配过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟匹配数据
      const matches = [
        {
          id: 1,
          userId: 'user1',
          name: '张女士',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50',
          skills: ['烘焙', '育儿'],
          rating: 4.8,
          distance: '2.5km',
          matchRate: 95,
          exchangeSkills: ['早教', '手工']
        },
        {
          id: 2,
          userId: 'user2',
          name: '李女士',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50',
          skills: ['编织', '烘焙'],
          rating: 4.6,
          distance: '3.1km',
          matchRate: 85,
          exchangeSkills: ['育儿', '烹饪']
        }
      ];
      
      runInAction(() => {
        this.matches = matches;
        this.matching = false;
        this.showMatches = true;
      });

      api.log.info('技能匹配完成', {
        skillId,
        matchesCount: matches.length
      });

      return matches;
    } catch (error) {
      api.log.error('技能匹配失败', {
        error: error.message,
        skillId
      });
      
      runInAction(() => {
        this.error = error.message;
        this.matching = false;
        this.showMatches = false;
        this.matches = [];
      });
      
      message.error('匹配失败');
    }
  }

  get hasSkills() {
    return Array.isArray(this.skills) && this.skills.length > 0;
  }

  get hasMatches() {
    return this.showMatches && Array.isArray(this.matches) && this.matches.length > 0;
  }
}

const skillStore = new SkillStore();
context.wpm.export('store_skill', skillStore);