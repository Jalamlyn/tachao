import { useState, useCallback } from 'react';
import { AuthState, UserInfo } from '../types';
import { generateWxAuthUrl, getWxUserInfo, checkWxAuth, saveWxUserInfo } from '@/service/apis/wx';
import { generateWecomAuthUrl, wecomLogin, checkWecomAuth, saveWecomUserInfo } from '@/service/apis/wecom';
import { aiLog } from '@/utils/AITraceLogger';
import { useLoginInfo } from '@/hooks/useLoginInfo';

export const useAuthFlow = () => {
  const [authState, setAuthState] = useState<AuthState>({
    type: 'none',
    status: 'idle',
    error: null,
    userInfo: null
  });

  const { setLoginInfo } = useLoginInfo();

  const handleWxAuth = useCallback(async (appId: string, formId: string) => {
    const traceId = aiLog.start();
    setAuthState(prev => ({ ...prev, status: 'authorizing' }));

    try {
      const code = new URLSearchParams(window.location.search).get('code');
      const existingAuth = checkWxAuth();

      if (existingAuth) {
        setAuthState(prev => ({
          ...prev,
          type: 'wechat',
          status: 'authorized',
          userInfo: existingAuth
        }));
        setLoginInfo({
          type: 'wechat',
          userInfo: {
            name: existingAuth.nickname,
            avatar: existingAuth.headimgurl,
            ...existingAuth,
          },
        });
        return true;
      }

      if (code) {
        const userInfo = await getWxUserInfo(appId, code);
        saveWxUserInfo(userInfo);
        setAuthState(prev => ({
          ...prev,
          type: 'wechat',
          status: 'authorized',
          userInfo
        }));
        setLoginInfo({
          type: 'wechat',
          userInfo: {
            name: userInfo.nickname,
            avatar: userInfo.headimgurl,
            ...userInfo,
          },
        });
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
        return true;
      }

      const currentUrl = `${window.location.origin}/form/${formId}`;
      const authUrl = generateWxAuthUrl(appId, currentUrl, 'snsapi_userinfo', formId);
      window.location.href = authUrl;
      return false;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        status: 'error',
        error: '微信授权失败，请重试'
      }));
      return false;
    }
  }, [setLoginInfo]);

  const handleWecomAuth = useCallback(async (formId: string) => {
    const traceId = aiLog.start();
    setAuthState(prev => ({ ...prev, status: 'authorizing' }));

    try {
      const code = new URLSearchParams(window.location.search).get('code');
      const existingAuth = checkWecomAuth();

      if (existingAuth) {
        setAuthState(prev => ({
          ...prev,
          type: 'wecom',
          status: 'authorized',
          userInfo: existingAuth
        }));
        setLoginInfo({
          type: 'wecom',
          userInfo: existingAuth,
        });
        return true;
      }

      if (code) {
        const loginResult = await wecomLogin(code);
        const userInfo = {
          name: loginResult.name || '企业微信用户',
          id: loginResult.userId,
          token: loginResult.tokenValue,
        };
        saveWecomUserInfo(userInfo);
        setAuthState(prev => ({
          ...prev,
          type: 'wecom',
          status: 'authorized',
          userInfo
        }));
        setLoginInfo({
          type: 'wecom',
          userInfo,
          token: loginResult.tokenValue,
        });
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
        return true;
      }

      const currentUrl = `${window.location.origin}/form/${formId}`;
      const authUrl = generateWecomAuthUrl(currentUrl, formId);
      window.location.href = authUrl;
      return false;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        status: 'error',
        error: '企业微信授权失败，请重试'
      }));
      return false;
    }
  }, [setLoginInfo]);

  return {
    authState,
    handleWxAuth,
    handleWecomAuth,
  };
};


https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd792f04d6c8ca1be&redirect_uri=https://www.mobenai.com.cn/&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect