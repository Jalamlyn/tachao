```jsx
<mo-ai-code type="component" name="comp_team_avatar">
const {
  wpm,
  React,
  NextUI
} = context;

const { Avatar } = NextUI;

const TeamAvatar = React.forwardRef(({name, className, classNames = {}, ...props}, ref) => (
  <Avatar
    {...props}
    ref={ref}
    classNames={{
      ...classNames,
      base: cn("bg-transparent border border-divider", classNames?.base, className),
      name: cn("text-default-500 text-[0.6rem] font-semibold", classNames?.name),
    }}
    getInitials={(name) =>
      (name[0] || "") + (name[name.lastIndexOf(" ") + 1] || "").toUpperCase()
    }
    name={name}
    radius="md"
    size="sm"
  />
));

TeamAvatar.displayName = "TeamAvatar";

wpm.export('comp_team_avatar', TeamAvatar);
</mo-ai-code>
```