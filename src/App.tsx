// import { useState } from 'react'
import "./App.css";

function App() {
  const fn = (param: number) => console.log("click", param);
  const b1 = false;
  const id = "999";
  const style = { color: "red" };
  const cls1 = "a";
  const cls2 = "b";
  const html = '<h1 style="color:red">title</h1>';
  const arr = [1, 2, 3, 4, 5];
  return (
    <>
      <div>{"1"}</div>
      <div>{1}</div>
      <div>{new Date().getTime()}</div>
      <div>{[1, 2, 3]}</div>
      <div>{b1 ? 1 : 2}</div>
      <button onClick={() => fn(123)}>click</button>
      <div id={id} style={style} className={cls1}>
        test
      </div>
      <div className={`${cls1} ${cls2} aa bb cc`}>多个class</div>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>

      {arr.map((item) => {
        return <div id={String(item)}>{item}</div>;
      })}
    </>
  );
}

export default App;
