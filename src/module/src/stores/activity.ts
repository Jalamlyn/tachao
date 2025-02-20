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

const activityDataService = await wpm.import('service_activity_data');

class ActivityStore {
  activities = [];
  loading = false;
  error = null;
  selectedActivity = null;
  initialized = false;
  joiningActivity = false;
  joinModalOpen = false;
  currentJoinActivity = null;

  constructor() {
    makeAutoObservable(this);
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      this.loading = true;
      await activityDataService.initialize();
      this.initialized = true;
      
      api.log.info('ActivityStore初始化成功');
    } catch (error) {
      api.log.error('ActivityStore初始化失败', {
        error: error.message
      });
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  loadNearbyActivities = async (location) => {
    try {
      this.loading = true;
      this.error = null;
      
      api.log.info('开始加载附近活动', {
        location
      });

      const activities = await activityDataService.getNearbyActivities(location);
      
      runInAction(() => {
        this.activities = activities;
        this.loading = false;
        this.error = null;
      });

      api.log.info('加载附近活动成功', {
        activitiesCount: activities.length,
        location
      });
    } catch (error) {
      api.log.error('加载附近活动失败', {
        error: error.message,
        location
      });
      
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
        this.activities = [];
      });
      
      message.error('加载活动失败：' + error.message);
    }
  }

  selectActivity = (activityId) => {
    try {
      const activity = this.activities.find(a => a.id === activityId);
      
      runInAction(() => {
        this.selectedActivity = activity;
      });

      api.log.info('选择活动', {
        activityId,
        activityTitle: activity?.title
      });
    } catch (error) {
      api.log.error('选择活动失败', {
        error: error.message,
        activityId
      });
    }
  }

  openJoinModal = (activity) => {
    runInAction(() => {
      this.currentJoinActivity = activity;
      this.joinModalOpen = true;
    });
  }

  closeJoinModal = () => {
    runInAction(() => {
      this.currentJoinActivity = null;
      this.joinModalOpen = false;
    });
  }

  joinActivity = async (activityId, formData) => {
    try {
      api.log.info('开始报名活动', {
        activityId,
        formData
      });

      this.joiningActivity = true;

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新活动参与人数
      const activityIndex = this.activities.findIndex(a => a.id === activityId);
      if (activityIndex === -1) {
        throw new Error('活动不存在');
      }

      runInAction(() => {
        this.activities[activityIndex] = {
          ...this.activities[activityIndex],
          participants: this.activities[activityIndex].participants + 1
        };
      });

      api.log.info('活动报名成功', {
        activityId,
        activityTitle: this.activities[activityIndex].title
      });

      message.success('报名成功');
      this.closeJoinModal();

    } catch (error) {
      api.log.error('活动报名失败', {
        activityId,
        error: error.message
      });
      message.error('报名失败：' + error.message);
    } finally {
      runInAction(() => {
        this.joiningActivity = false;
      });
    }
  }

  get hasActivities() {
    return Array.isArray(this.activities) && this.activities.length > 0;
  }

  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}米`;
    }
    return `${(meters / 1000).toFixed(1)}公里`;
  }
}

const activityStore = new ActivityStore();
context.wpm.export('store_activity', activityStore);