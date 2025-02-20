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

const { makeAutoObservable } = mobx;

class ThemeStore {
  isDark = false;

  constructor() {
    makeAutoObservable(this);
    this.loadTheme();
  }

  loadTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDark = savedTheme === 'dark';
      }
      this.applyTheme();

      api.log.info('主题加载完成', {
        isDark: this.isDark,
        source: 'localStorage'
      });
    } catch (error) {
      api.log.error('主题加载失败', {
        error: error.message
      });
    }
  }

  toggleTheme = () => {
    try {
      this.isDark = !this.isDark;
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      this.applyTheme();
      
      api.log.info('主题切换成功', {
        isDark: this.isDark
      });
    } catch (error) {
      api.log.error('主题切换失败', {
        error: error.message
      });
    }
  }

  private applyTheme = () => {
    try {
      const html = document.documentElement;
      if (this.isDark) {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
      } else {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
      }
    } catch (error) {
      api.log.error('主题应用失败', {
        error: error.message
      });
    }
  }
}
const themeStore = new ThemeStore()
context.wpm.export('store_theme', themeStore);