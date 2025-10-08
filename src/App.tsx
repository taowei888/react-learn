// import { useState, useEffect } from "react";
// import Card from "./components/Card";
// import Father from "./components/Father";
// import ReactQuery from "./components/ReactQuery";
// import Control from "./components/Control"
import Ref from "./components/Ref"
function App() {
  return (
    <>
      <Ref></Ref>
      {/* <Control></Control> */}
      {/* <ReactQuery></ReactQuery> */}
      {/* <Father/ > */}
      {/* <button onClick={() => window.onShow()}>打开消息</button>
      <Card></Card>
      <Card></Card> */}
    </>
  );
}



// const App = () => {
//   const [count, setCount] = useState(0);
//   const [name, setName] = useState("");
//   // 组件在挂载的时候就执行了 类似于componentDidMount
//   // useEffect(() => {
//   //   console.log("组件挂载时执行");
//   // });

//   // 操作dom
//   // useEffect(() => {
//   //   const data = document.getElementById("data");
//   //   console.log(data);
//   // }, []);

//   // 网络请求
//   // useEffect(() => {
//   //   fetch("http://localhost:5173/");
//   // }, []);

//   // 无依赖项更新 有响应式值发生改变时 useEffect的副作用函数就会执行
//   // useEffect(() => {
//   //   console.log("无依赖项更新", count, name);
//   // });

//   // 有依赖项更新 依赖项数组中的count值发生改变时，useEffect的副作用函数就会执行。而当name值改变时,由于它不在依赖项数组中,所以不会触发副作用函数的执行
//   // useEffect(() => {
//   //   console.log("执行了", count);
//   // }, [count]);

//   // 依赖项空值 赖项为空数组时，useEffect的副作用函数只会执行一次，也就是组件挂载时执行
//   // useEffect(() => {
//   //   console.log("依赖项空值");
//   // }, []);

//   // useEffect的副作用函数可以返回一个清理函数，当组件卸载时，useEffect的副作用函数就会执行清理函数。
//   // 清理函数在副作用函数运行之前，清除上一次的副作用函数，类似于componentWillUnmount
//   const [show, setShow] = useState(true);
//   const Child = (props: { name: string }) => {
//     useEffect(() => {
//       console.log("副作用函数执行", props.name);
//       // 返回一个清理函数
//       return () => {
//         console.log("先执行清理函数", props.name);
//       };
//     }, [props.name]);
//     return <div>Child:{props.name}</div>;
//   };

//   // 应用 防抖
//   // const Child = (props: { name: string }) => {
//   //   useEffect(() => {
//   //     const timer = setTimeout(() => {
//   //       fetch("http://localhost:5173/");
//   //     }, 1000);
//   //     return () => {
//   //       clearTimeout(timer);
//   //     };
//   //   }, [props.name]);
//   //   return <div>Child</div>;
//   // };
//   return (
//     <div id="data">
//       <div>
//         <h3>count:{count}</h3>
//         <button onClick={() => setCount(count + 1)}>+</button>
//       </div>
//       <div>
//         <h3>name:{name}</h3>
//         <input value={name} onChange={(e) => setName(e.target.value)} />
//       </div>
//       <div>
//         <div>
//           <h3>父组件</h3>
//           <button onClick={() => setShow(!show)}>显示/隐藏</button>
//         </div>
//         <hr />
//         <h3>子组件</h3>
//         {show && <Child name={name} />}
//       </div>
//     </div>
//   );
// };

// function App() {
//   let one = "空"; //普通变量
//   const [name, setName] = useState("派蒙"); //状态
//   const [arr, setArr] = useState([1, 2, 3]);
//   const [obj, setObject] = useState(() => {
//     const date =
//       new Date().getFullYear() +
//       "-" +
//       (new Date().getMonth() + 1) +
//       "-" +
//       new Date().getDate();
//     return {
//       date,
//       name: "温迪",
//       age: 6000,
//     };
//   });

//   const heandleClick = () => {
//     one = "荧";
//     setName("阿斯莫代");

//     // 数组
//     // setArr([4, 5, 6]);
//     // setArr([0,...arr])
//     // setArr([...arr, 4]);
//     // setArr(arr.filter((item) => item !== 1));
//     // setArr(
//     //   arr.map((item) => {
//     //     return item == 1 ? 111 : item;
//     //   })
//     // );

//     // const startIndex = 0;
//     // const endIndex = 1;
//     // setArr([...arr.slice(startIndex, endIndex), 0.5, ...arr.slice(endIndex)]);

//     const newList = [...arr].map((v) => v + 1);
//     // newList.sort((a, b) => b - a);
//     // setArr(newList);

//     newList.reverse();
//     setArr(newList);

//     // 对象
//     setObject({
//       ...obj,
//       name: "巴巴托斯",
//     });
//   };

//   return (
//     <>
//       <button onClick={heandleClick}>click</button>
//       <div>{one}</div>
//       <div>{name}</div>
//       <div>{arr}</div>
//       <div>日期：{obj.date}</div>
//       <div>姓名：{obj.name}</div>
//     </>
//   );
// }

// function App() {
//   const fn = (param: number) => console.log("click", param);
//   const b1 = false;
//   const id = "999";
//   const style = { color: "red" };
//   const cls1 = "a";
//   const cls2 = "b";
//   const html = '<h1 style="color:red">title</h1>';
//   const arr = [1, 2, 3, 4, 5];
//   return (
//     <>
//       <div>{"1"}</div>
//       <div>{1}</div>
//       <div>{new Date().getTime()}</div>
//       <div>{[1, 2, 3]}</div>
//       <div>{b1 ? 1 : 2}</div>
//       <button onClick={() => fn(123)}>click</button>
//       <div id={id} style={style} className={cls1}>
//         test
//       </div>
//       <div className={`${cls1} ${cls2} aa bb cc`}>多个class</div>
//       <div dangerouslySetInnerHTML={{ __html: html }}></div>

//       {arr.map((item) => {
//         return <div id={String(item)}>{item}</div>;
//       })}
//     </>
//   );
// }

export default App;
