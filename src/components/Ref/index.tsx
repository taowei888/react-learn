import { useRef, useState } from "react";

const App = () => {
  //首先，声明一个 初始值 为 null 的 ref 对象
  const div = useRef(null);
  const handleClick = () => {
    //当 React 创建 DOM 节点并将其渲染到屏幕时，React 将会把 DOM 节点设置为 ref 对象的 current 属性
    console.log(div.current);
  };

  // let num = 0;
  // 利用useRef解决num被重置的问题
  const num = useRef(0);
  const [count, setCount] = useState(0);
  const handleClick2 = () => {
    setCount(count + 1);
    console.log("count---", count);
    num.current = count;
  };

  // 每次组件重新渲染时，timer 都会被重置为 null，导致 clearInterval 无法清除定时器
  // let timer: ReturnType<typeof setInterval> | null = null;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [t, setT] = useState(0);
  // 改变 ref.current 属性时，React 不会重新渲染组件。React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象，连续点击handleStart，该功能会异常
  const handleStart = () => {
    timer.current = setInterval(() => {
      setT((t) => t + 1);
    }, 300);
  };
  const handleEnd = () => {
    console.log(timer.current);
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  return (
    <>
      {/*然后将 ref 对象作为 ref 属性传递给想要操作的 DOM 节点的 JSX*/}
      <div ref={div}>dom元素</div>
      <button onClick={handleClick}>获取dom元素</button>
      <br />
      <br />
      <br />

      <div>num:{num.current}</div>
      <div>count:{count}</div>
      <button onClick={handleClick2}>单点击</button>
      <br />
      <br />
      <br />

      <div>
        <button onClick={handleStart}>开始计数</button>
        <button onClick={handleEnd}>结束计数</button>
        <div>{t}</div>
      </div>
    </>
  );
};
export default App;
