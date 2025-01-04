```jsx
<mo-ai-code type="component" name="comp_acme_icon">
const {
  wpm,
  React
} = context;

const AcmeIcon = ({ size = 32, className, ...props }) => (
  <div className={className} style={{ fontSize: size * 0.5 }} {...props}>
    模
  </div>
);

wpm.export('comp_acme_icon', AcmeIcon);
</mo-ai-code>
```