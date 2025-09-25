import React, { type JSX } from "react";
interface Props {
  title: string;
  id: number;
  bool: boolean;
  obj: {
    a: number;
    b: string;
  };
  arr: number[];
  fn: (a: number, b: number) => number;
  empty: null;
  element: JSX.Element;
  children: React.ReactNode;
  cb: (params: string) => void;
}
// 获取props
// const Son: React.FC<Props> = (props) => {
//   console.log(props);
//   return <div>son</div>;
// };

// 定义默认值
// 将属性变为可选，然后将props进行解构
type defaultProps = Omit<Props, "title"> & {
  title?: string;
};

// 兄弟组件通信，发布订阅
const event = new Event("msg");
const clickTap = () => {
  event.params = { msg: "来自Son组件消息" };
  window.dispatchEvent(event);
};
declare global {
  interface Event {
    params: unknown;
  }
}

// props.children 类似于 Vue 插槽
const Son: React.FC<defaultProps> = ({ title = "默认标题", children, cb }) => {
  return (
    <>
      <div>{title}</div>
      {children}
      {/* 子传父，回调函数参数拿到值 */}
      <button onClick={() => cb("这是参数")}>子传父</button>
      <button onClick={clickTap}>派发事件</button>
    </>
  );
};
export default Son;
