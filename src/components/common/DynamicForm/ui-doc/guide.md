### Watch 使用规范

- 使用 setValue 一定要在所有计算完成之后
- 仔细审查代码, 避免陷入死循环
- 监听字段只能用 endsWith 方法, 或者用字段的完整key, 比如 `user.name`
- 不允许使用 startsWith 方法, 容易陷入死循环
