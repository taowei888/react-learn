import React, { useMemo, useState } from "react";

function App() {
  const [search, setSearch] = useState("");
  const [goods, setGoods] = useState([
    { id: 1, name: "鸡", price: 10, count: 1 },
    { id: 2, name: "鸭", price: 20, count: 1 },
    { id: 3, name: "鹅", price: 30, count: 1 },
  ]);
  const handleAdd = (id: number) => {
    setGoods(
      goods.map((item) =>
        item.id === id ? { ...item, count: item.count + 1 } : item
      )
    );
  };
  const handleSub = (id: number) => {
    setGoods(
      goods.map((item) =>
        item.id === id ? { ...item, count: item.count - 1 } : item
      )
    );
  };
  //   const total = () => {
  //     console.log("total");
  //     //很复杂的计算逻辑 每次搜索框改变，这里都会重新执行，很不友好
  //     return goods.reduce((total, item) => total + item.price * item.count, 0);
    //   };
    
    // 当我们使用 useMemo 缓存后，只有 goods 发生变化时， total 才会重新计算, 而 search 发生变化时， total 不会重新计算。
  const total = useMemo(() => {
    console.log("total");
    //很复杂的计算逻辑 每次搜索框改变，这里都会重新执行，很不友好
    return goods.reduce((total, item) => total + item.price * item.count, 0);
  }, [goods]);
  return (
    <div>
      <h1>父组件</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table border={1} cellPadding={5} cellSpacing={0}>
        <thead>
          <tr>
            <th>名称</th>
            <th>价格</th>
            <th>数量</th>
          </tr>
        </thead>
        <tbody>
          {goods.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.price * item.count}</td>
              <td>
                <button onClick={() => handleAdd(item.id)}>+</button>
                <span>{item.count}</span>
                <button onClick={() => handleSub(item.id)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>总价：{total}</h2>
    </div>
  );
}

export default App;
