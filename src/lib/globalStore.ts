export default {
  organizationId: null,
  username: null,
  appId: null,
  actualBalance: 0,
  subscription: {
    status: null, // 'active' | 'expired' | null
    type: null, // 'personal' | 'enterprise' | null
    expireDate: null,
    features: null,
  },
  isInChatting: false,
}
