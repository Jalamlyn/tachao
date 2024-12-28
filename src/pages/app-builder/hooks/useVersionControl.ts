import { useState, useEffect } from 'react';
import { versionStore } from '../store/versionStore';

export function useVersionControl() {
  const [content, setContent] = useState(versionStore.getCurrentContent());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // 订阅内容更新
    const contentUnsubscribe = versionStore.subscribeToContent(setContent);
    // 订阅历史更新
    const historyUnsubscribe = versionStore.subscribeToHistory(() => forceUpdate({}));

    return () => {
      contentUnsubscribe();
      historyUnsubscribe();
    };
  }, []);

  return {
    content,
    versions: versionStore.getHistory(),
    currentIndex: versionStore.currentIndex,
    addVersion: versionStore.addVersion.bind(versionStore),
    getCurrentVersion: versionStore.getCurrentVersion.bind(versionStore),
    rollback: versionStore.rollback.bind(versionStore),
    forward: versionStore.forward.bind(versionStore),
    canRollback: versionStore.canRollback(),
    canForward: versionStore.canForward(),
    clear: versionStore.clear.bind(versionStore)
  };
}