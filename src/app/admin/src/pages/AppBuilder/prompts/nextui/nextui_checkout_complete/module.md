```jsx
<mo-ai-code type="module" name="module_checkout">
const {
  wpm,
  React,
  ReactRouterDom,
  observer,
  NextUI,
  Icon,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId
} = context;

class CheckoutModule {
  // 验证配送信息
  validateShippingInfo(info) {
    const requiredFields = [
      'email',
      'firstName',
      'lastName',
      'address',
      'city',
      'country',
      'postalCode',
      'phone'
    ];

    return requiredFields.every(field => {
      return info[field] && info[field].trim() !== '';
    });
  }

  // 验证支付信息
  validatePaymentInfo(info) {
    const requiredFields = [
      'email',
      'card-number',
      'card-month',
      'card-year',
      'card-cvc',
      'cardholderName'
    ];

    return requiredFields.every(field => {
      return info[field] && info[field].trim() !== '';
    });
  }
}

const module = new CheckoutModule();
wpm.export('module_checkout', module);
</mo-ai-code>
```