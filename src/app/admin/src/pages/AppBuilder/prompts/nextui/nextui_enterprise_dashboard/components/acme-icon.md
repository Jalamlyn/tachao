```jsx
<mo-ai-code type="component" name="comp_acme_icon">
const {
  wpm,
  React,
  Icon
} = context;

const AcmeIcon = ({ size = 32, ...props }) => (
  <Icon 
    icon="logos:acme" 
    width={size} 
    height={size}
    {...props}
  />
);

wpm.export('comp_acme_icon', AcmeIcon);
</mo-ai-code>
```