import React, { useState } from "react";
interface User {
  name: string;
  age: number;
  email: string;
}
interface CardProps {
  user: User;
}

// React.memo 是一个 React API，用于优化性能。它通过记忆上一次的渲染结果，仅当 props 发生变化时才会重新渲染, 避免重新渲染。
const Card = React.memo(function ({ user }: CardProps) {
// 不使用React.memo，父组件每次 search 发生变化，子组件也会重新渲染
// const Card = function ({ user }: CardProps) {
  console.log("Card render"); // 每次父组件的 state 发生变化，子组件都会重新渲染
  const styles = {
    backgroundColor: "lightblue",
    padding: "20px",
    borderRadius: "10px",
    margin: "10px",
  };
  return (
    <div style={styles}>
      <h1>{user.name}</h1>
      <p>{user.age}</p>
      <p>{user.email}</p>
    </div>
  );
});
function App() {
  const [users, setUsers] = useState<User>({
    name: "咩咩子",
    age: 8,
    email: "miemiezi@qq.com",
  });
  const [search, setSearch] = useState("");
  return (
    <div>
      <h1>父组件</h1>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <br />
      <br />
      <br />
      <div>
        <button
          onClick={() =>
            setUsers({
              name: "王咩",
              age: 108,
              email: "wangmie@qq.com",
            })
          }
        >
          更新user
        </button>
      </div>
      <Card user={users} />
    </div>
  );
}

export default App;
