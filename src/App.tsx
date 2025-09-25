import { useState } from "react";

function App() {
  let one = "空"; //普通变量
  const [name, setName] = useState("派蒙"); //状态
  const [arr, setArr] = useState([1, 2, 3]);
  const [obj, setObject] = useState(() => {
    const date =
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      new Date().getDate();
    return {
      date,
      name: "温迪",
      age: 6000,
    };
  });

  const heandleClick = () => {
    one = "荧";
    setName("阿斯莫代");

    // 数组
    // setArr([4, 5, 6]);
    // setArr([0,...arr])
    // setArr([...arr, 4]);
    // setArr(arr.filter((item) => item !== 1));
    // setArr(
    //   arr.map((item) => {
    //     return item == 1 ? 111 : item;
    //   })
    // );

    // const startIndex = 0;
    // const endIndex = 1;
    // setArr([...arr.slice(startIndex, endIndex), 0.5, ...arr.slice(endIndex)]);

    const newList = [...arr].map((v) => v + 1);
    // newList.sort((a, b) => b - a);
    // setArr(newList);

    newList.reverse();
    setArr(newList);

    // 对象
    setObject({
      ...obj,
      name: "巴巴托斯",
    });
  };

  return (
    <>
      <button onClick={heandleClick}>click</button>
      <div>{one}</div>
      <div>{name}</div>
      <div>{arr}</div>
      <div>日期：{obj.date}</div>
      <div>姓名：{obj.name}</div>
    </>
  );
}

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
