<mo-ai-code type="component" name="comp_table_pagination">
const {
  wpm,
  React,
  observer,
  NextUI
} = context;

const { Pagination } = NextUI;

const TablePagination = observer(({
  page,
  total,
  selectedKeys,
  totalItems,
  onChange
}) => {
  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="text-small text-default-400">
        {selectedKeys === "all"
          ? "已选择全部"
          : `已选择 ${selectedKeys.size} / ${totalItems} 项`}
      </span>
      <Pagination
        showControls
        showShadow
        color="primary"
        page={page}
        total={total}
        onChange={onChange}
      />
    </div>
  );
});

context.wpm.export('comp_table_pagination', TablePagination);
</mo-ai-code>