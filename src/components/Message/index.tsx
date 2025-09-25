import ReactDom from "react-dom/client";
import "./index.css";
const Message = () => {
  return <div>提示组件</div>;
};

interface Item {
  msgContainer: HTMLDivElement;
  root: ReactDom.Root;
}
const queue: Item[] = [];
window.onShow = () => {
  const msgContainer = document.createElement("div");
  msgContainer.className = "message";
  msgContainer.style.top = `${queue.length * 50}px`;
  document.body.appendChild(msgContainer);
  const root = ReactDom.createRoot(msgContainer);
  root.render(<Message />);
  queue.push({
    msgContainer,
    root,
  });
  setTimeout(() => {
    const item = queue.find((item) => item.msgContainer === msgContainer)!;
    item.root.unmount(); //卸载组件
    document.body.removeChild(item.msgContainer); //卸载dom
    queue.splice(queue.indexOf(item), 1); //卸载数据
  }, 2000);
};

declare global {
  interface Window {
    onShow: () => void;
  }
}

export default Message;
