```jsx
<mo-ai-code type="store" name="store_table">
const {
  wpm,
  mobx
} = context;

const { makeAutoObservable } = mobx;

class TableStore {
  items = [];

  constructor() {
    makeAutoObservable(this);

    // 初始化示例数据
    this.items = [
      {
        id: 1,
        name: "项目 A",
        status: "active",
        createdAt: "2024-01-01",
      },
      {
        id: 2,
        name: "项目 B",
        status: "paused",
        createdAt: "2024-01-15",
      },
      {
        id: 3,
        name: "项目 C",
        status: "deleted",
        createdAt: "2024-02-01",
      },
    ];
  }

  setItems(items) {
    this.items = items;
  }

  addItem(item) {
    this.items.push(item);
  }

  updateItem(id, data) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
    }
  }

  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
  }
}

const store = new TableStore();
wpm.export('store_table', store);
</mo-ai-code>
```