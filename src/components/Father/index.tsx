import Son from "../Son";
import Brother from "../Brother";
function Father() {
  const cb = (params: string) => {
    console.log("子组件触发了 父组件的事件", params);
  };
  return (
    <>
      <Son
        id={123}
        bool={false}
        obj={{ a: 1, b: "1" }}
        arr={[1, 2, 3]}
        fn={(a: number, b: number) => a + b}
        empty={null}
        element={<div>元素</div>}
        cb={cb}
      >
        <div>123</div>
      </Son>
      <Brother></Brother>
    </>
  );
}

export default Father;
