export default function Brother() {
  //接受参数
  window.addEventListener("msg", (e) => {
    console.log("Brother组件接收到了", e.params);
  });

  return <div className="card"></div>;
}
