import React, { useState, useRef } from "react";

const App: React.FC = () => {
  const [value, setValue] = useState("123");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const value2 = "456";
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange2 = () => {
    console.log(inputRef.current?.value);
  };

  // const [files, setFiles] = useState<File | null>(null);
  // const handleChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFiles(e.target.files?.[0]!);
  // };
  const inputFileRef = useRef<HTMLInputElement>(null);
  const handleChange3 = () => {
    console.log(inputFileRef.current?.files);
  };

  return (
    <>
      <div>
        <input type="text" value={value} onChange={handleChange} />
        <div>{value}</div>
      </div>

      <br />

      <div>
        <input
          type="text"
          defaultValue={value2}
          onChange={handleChange2}
          ref={inputRef}
        />
        <div>{value2}</div>
      </div>

      <br />
      <div>
        {/* 文件输入框通常作为非受控组件使用，通过 onChange 事件处理文件选择，而不是通过 value 控制。 */}
        {/* <input type="file" value={files} onChange={handleChange3} /> */}
        <input type="file" onChange={handleChange3} ref={inputFileRef} />
      </div>
    </>
  );
};

export default App;
