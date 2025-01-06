```jsx
<mo-ai-code type="page" name="page_report" title="数据报表">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody } = NextUI;
const ReportDashboard = await context.wpm.import('comp_report_dashboard');

const ReportPage = observer(() => {
  return (
    <div className="space-y-6">
      <ReportDashboard />
    </div>
  );
});

context.wpm.export('page_report', ReportPage);
</mo-ai-code>
```