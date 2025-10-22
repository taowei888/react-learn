# React 严格模式（StrictMode）详解

## 📚 文档概述

本文档深入解析 React 严格模式（Strict Mode）的工作原理、使用场景和最佳实践。严格模式是 React 提供的一个开发工具，通过故意执行双重调用来帮助开发者发现潜在的副作用问题，提升应用的健壮性。

---

## 🎯 什么是严格模式

### 基本概念

React.StrictMode 是一个用于**突出显示应用程序中潜在问题**的工具组件。它不会渲染任何可见的 UI，只在开发环境中生效。

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 核心特点

- ✅ **仅开发模式生效**：生产环境完全无影响
- ✅ **不渲染额外 UI**：不会增加 DOM 节点
- ✅ **可局部使用**：可以包裹部分组件树
- ✅ **递归生效**：会影响所有子组件

```javascript
// 可以选择性地包裹部分组件
function App() {
  return (
    <div>
      <Header />  {/* 不受严格模式影响 */}

      <React.StrictMode>
        <MainContent />  {/* 受严格模式影响 */}
        <Sidebar />      {/* 受严格模式影响 */}
      </React.StrictMode>

      <Footer />  {/* 不受严格模式影响 */}
    </div>
  );
}
```

---

## 🔍 严格模式的核心机制

### 双重调用（Double Invoking）

严格模式会**故意**双重调用以下函数：

```javascript
// 1. 函数组件体
function MyComponent() {
  console.log('组件渲染');  // 会打印 2 次
  return <div>Hello</div>;
}

// 2. useState 的初始化函数
const [state, setState] = useState(() => {
  console.log('state 初始化');  // 会执行 2 次
  return initialValue;
});

// 3. useMemo 的计算函数
const value = useMemo(() => {
  console.log('计算 memoized 值');  // 会执行 2 次
  return expensiveCalculation();
}, [dep]);

// 4. useReducer 的 reducer 函数
const reducer = (state, action) => {
  console.log('reducer 执行');  // 会执行 2 次
  return newState;
};
```

### Effect 的 mount-unmount-remount 循环

**这是严格模式最重要的特性！**

```javascript
useEffect(() => {
  console.log('Effect 执行（setup）');

  return () => {
    console.log('Effect 清理（cleanup）');
  };
}, []);

// 正常模式输出：
// Effect 执行（setup）

// 严格模式输出：
// Effect 执行（setup）        - 第一次挂载
// Effect 清理（cleanup）      - 模拟卸载
// Effect 执行（setup）        - 模拟重新挂载
```

**执行流程可视化**：

```
正常模式：
  [Mount] → Setup Effect → (组件运行) → (组件卸载) → Cleanup Effect

严格模式：
  [Mount] → Setup Effect → Cleanup Effect → Setup Effect → (组件运行) → (组件卸载) → Cleanup Effect
           ↑_______________模拟 unmount-remount_______________↑
```

---

## 💡 为什么需要严格模式

### 问题背景：React 的并发特性

React 18+ 引入了并发渲染特性，组件可能会：
- **暂停和重启**渲染过程
- **重新挂载**已卸载的组件
- **重用**之前的状态

如果你的组件副作用没有正确清理，这些场景都会出问题！

### 现实场景中的组件重新挂载

```javascript
// 场景 1：路由切换
// 用户：Home → Profile → Back → Home
// Home 组件：mount → unmount → mount

// 场景 2：条件渲染
function App() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(!show)}>切换</button>
      {show && <Modal />}  {/* Modal 会多次 mount/unmount */}
    </div>
  );
}

// 场景 3：Tab 切换
<Tabs>
  <Tab label="Tab1"><Component1 /></Tab>
  <Tab label="Tab2"><Component2 /></Tab>
</Tabs>
// 切换 Tab 时组件会反复挂载和卸载

// 场景 4：保留与恢复（React 18 新特性）
// React 可能会卸载不可见的组件，并在需要时重新挂载它们
// 这是为了优化性能和内存使用
```

**严格模式通过 mount-unmount-remount 循环模拟这些真实场景！**

---

## 🐛 严格模式能发现哪些问题

### 问题 1：忘记清理事件监听器

```javascript
// ❌ 错误代码：会导致内存泄漏
function WindowSize() {
  const [size, setSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // ⚠️ 忘记返回清理函数！
  }, []);

  return <div>窗口宽度: {size}px</div>;
}

// 严格模式暴露的问题：
// 1. 第一次：添加 listener1
// 2. 模拟卸载：（没有清理函数，listener1 仍然存在）
// 3. 第二次：添加 listener2
// 结果：每次 resize 事件会触发 2 次 setSize，导致：
//   - handleResize 执行 2 次
//   - 组件渲染 2 次
//   - 内存中有 2 个监听器（泄漏！）

// 现实影响：
// 如果组件经历 10 次 mount-unmount，会累积 10 个监听器！
```

```javascript
// ✅ 正确代码：清理监听器
function WindowSize() {
  const [size, setSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // ✅ 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div>窗口宽度: {size}px</div>;
}

// 严格模式验证：
// 1. 第一次：添加 listener1
// 2. 清理：移除 listener1 ✅
// 3. 第二次：添加 listener2
// 结果：只有 1 个监听器，正常工作！
```

### 问题 2：定时器没有清理

```javascript
// ❌ 错误代码：定时器堆积
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    // ⚠️ 没有清理定时器！
  }, []);

  return <div>计数: {count}</div>;
}

// 严格模式暴露的问题：
// 1. 第一次：启动 timer1（每秒 +1）
// 2. 模拟卸载：（timer1 继续运行）
// 3. 第二次：启动 timer2（每秒 +1）
// 结果：每秒 count 增加 2（timer1 + timer2 同时运行）
//   → 数字跳得很快
//   → 两个定时器都在消耗资源
```

```javascript
// ✅ 正确代码：清理定时器
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    // ✅ 返回清理函数
    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div>计数: {count}</div>;
}

// 严格模式验证：
// 1. 第一次：启动 timer1
// 2. 清理：清除 timer1 ✅
// 3. 第二次：启动 timer2
// 结果：只有 1 个定时器，每秒 +1，正常！
```

### 问题 3：API 请求的竞态条件

```javascript
// ❌ 错误代码：竞态条件（Race Condition）
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));

    // ⚠️ 没有取消机制！
  }, [userId]);

  return <div>{user?.name}</div>;
}

// 严格模式暴露的问题：
// 1. 第一次：发送请求 A
// 2. 模拟卸载：（请求 A 继续进行）
// 3. 第二次：发送请求 B
// 结果：两个请求都会完成，哪个后返回就显示哪个
//   → 请求 A 慢，请求 B 快 → 先显示 B，后被 A 覆盖 ❌
//   → 显示了旧数据！

// 现实场景：
// 用户快速切换 userId：1 → 2 → 3
// 如果请求返回顺序是：3 → 1 → 2
// 最终显示的是 userId=2 的数据，但当前 userId=3！
```

```javascript
// ✅ 正确代码 1：使用取消标记
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {  // ✅ 检查是否已取消
          setUser(data);
        }
      });

    return () => {
      cancelled = true;  // ✅ 清理：标记为已取消
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}

// ✅ 正确代码 2：使用 AbortController（推荐）
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${userId}`, {
      signal: controller.signal  // ✅ 传入 abort signal
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('请求已取消');
        }
      });

    return () => {
      controller.abort();  // ✅ 清理：取消请求
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}

// 严格模式验证：
// 1. 第一次：发送请求 A
// 2. 清理：取消请求 A ✅
// 3. 第二次：发送请求 B
// 结果：只有请求 B 会更新状态，正常！
```

#### 实用建议：不是所有请求都需要清理

**不需要清理的情况**：

```javascript
// ✅ 场景 1：一次性请求，组件不会卸载
function App() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // 应用初始化时获取配置，App 组件不会卸载
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig);
  }, []);

  // 不需要清理，因为组件不会卸载
}

// ✅ 场景 2：按钮点击发起的请求
function SubmitButton() {
  const handleSubmit = () => {
    // 用户主动触发，通常会等待结果
    fetch('/api/submit', { method: 'POST' })
      .then(res => res.json())
      .then(data => alert('提交成功'));
  };

  return <button onClick={handleSubmit}>提交</button>;

  // 不需要清理，用户会等待响应
}

// ✅ 场景 3：日志记录等不关心响应的请求
function logEvent(eventName) {
  fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify({ event: eventName })
  });

  // 发出去就行，不关心响应，不需要清理
}
```

**需要清理的情况**：

```javascript
// ❌ 场景 1：依赖项频繁变化（如搜索）
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // query 变化频繁，必须取消旧请求
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, [query]);  // 用户每次输入都触发
}

// ❌ 场景 2：路由参数变化（如详情页）
function UserProfile({ userId }) {
  useEffect(() => {
    // userId 变化时组件不卸载，但需要取消旧请求
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);  // 切换用户时触发
}

// ❌ 场景 3：组件可能在请求返回前卸载
function ProductDetail({ productId }) {
  useEffect(() => {
    // 用户可能在请求返回前离开页面
    // → 组件卸载但请求仍会 setState
    // → 警告：Can't perform a React state update on an unmounted component
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(setProduct);
  }, [productId]);
}
```

#### 封装方案：让请求清理变简单

**方案 1：自定义 Hook（一次封装，到处使用）**

```javascript
// hooks/useFetch.js
import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

    setLoading(true);

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err);
          setLoading(false);
        }
      });

    // ✅ 清理逻辑封装在 Hook 里
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// 使用 - 超级简单！
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return <div>{user.name}</div>;
}
```

**方案 2：使用成熟的数据请求库（强烈推荐）**

```javascript
// TanStack Query（React Query）
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  // ✅ 自动处理：取消、缓存、重试、去重
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json())
  });

  if (isLoading) return <div>加载中...</div>;

  return <div>{user.name}</div>;
}

// React Query 自动帮你：
// ✅ 取消过期请求
// ✅ 缓存结果（同样的请求不会重复发）
// ✅ 自动重试失败请求
// ✅ 请求去重（多个组件请求同一数据只发一次）
// ✅ 自动刷新过期数据
```

```javascript
// SWR（另一个优秀的库）
import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

function UserProfile({ userId }) {
  // ✅ 同样自动处理所有复杂情况
  const { data: user, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher
  );

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误</div>;

  return <div>{user.name}</div>;
}
```

**方案 3：简化的可复用 Hook（适合小项目）**

```javascript
// hooks/useAbortableFetch.js
import { useEffect, useRef } from 'react';

export function useAbortableFetch() {
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      // 组件卸载时取消所有请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchWithAbort = async (url, options = {}) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的控制器
    abortControllerRef.current = new AbortController();

    return fetch(url, {
      ...options,
      signal: abortControllerRef.current.signal
    });
  };

  return fetchWithAbort;
}

// 使用
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const fetchWithAbort = useAbortableFetch();

  useEffect(() => {
    if (!query) return;

    // ✅ 自动取消之前的请求
    fetchWithAbort(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
  }, [query]);

  return <SearchResults results={results} />;
}
```

**实际项目建议**：

| 项目规模 | 推荐方案 | 理由 |
|---------|---------|------|
| **小项目**（<10个请求） | 简单标记法 `let cancelled = false` | 代码简单，够用 |
| **中型项目**（10-50个请求） | 自定义 `useFetch` Hook | 一次封装，到处复用 |
| **大型项目**或**复杂数据流** | TanStack Query 或 SWR | 专业、功能全、省心 |

**不处理取消的实际问题示例**：

```javascript
// 用户快速输入搜索：r → e → a → c → t

// ❌ 不处理取消：
// - 发起 5 个请求
// - 可能返回顺序：react → r → reac → re → rea
// - 最终显示：rea 的结果（错误！）

// ✅ 处理取消：
// - 发起 5 个请求，但前 4 个被取消
// - 只有最后一个返回：react
// - 最终显示：react 的结果（正确！）
```

> **总结**：不需要每次都手写取消逻辑！选择合适的封装方案，请求清理就会变得简单。

### 问题 4：WebSocket 连接重复

```javascript
// ❌ 错误代码：重复连接
function Chat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };

    // ⚠️ 没有关闭连接！
  }, []);

  return (
    <ul>
      {messages.map((msg, i) => <li key={i}>{msg}</li>)}
    </ul>
  );
}

// 严格模式暴露的问题：
// 1. 第一次：建立连接 ws1
// 2. 模拟卸载：（ws1 继续连接）
// 3. 第二次：建立连接 ws2
// 结果：同时存在 2 个 WebSocket 连接
//   → 每条消息收到 2 次（重复显示）
//   → 浪费服务器资源
//   → 可能被服务器识别为异常行为
```

```javascript
// ✅ 正确代码：清理连接
function Chat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };

    // ✅ 返回清理函数
    return () => {
      ws.close();  // ✅ 关闭连接
    };
  }, []);

  return (
    <ul>
      {messages.map((msg, i) => <li key={i}>{msg}</li>)}
    </ul>
  );
}

// 严格模式验证：
// 1. 第一次：建立连接 ws1
// 2. 清理：关闭 ws1 ✅
// 3. 第二次：建立连接 ws2
// 结果：只有 1 个连接，正常工作！
```

### 问题 5：订阅没有取消

```javascript
// ❌ 错误代码：订阅泄漏
import { eventEmitter } from './eventEmitter';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (data) => {
      setNotifications(prev => [...prev, data]);
    };

    eventEmitter.on('notification', handleNotification);

    // ⚠️ 没有取消订阅！
  }, []);

  return (
    <ul>
      {notifications.map((n, i) => <li key={i}>{n}</li>)}
    </ul>
  );
}

// 严格模式暴露的问题：
// 1. 第一次：订阅 listener1
// 2. 模拟卸载：（listener1 仍然存在）
// 3. 第二次：订阅 listener2
// 结果：每个通知会被处理 2 次
//   → 重复的通知显示
//   → 内存泄漏
```

```javascript
// ✅ 正确代码：取消订阅
import { eventEmitter } from './eventEmitter';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (data) => {
      setNotifications(prev => [...prev, data]);
    };

    eventEmitter.on('notification', handleNotification);

    // ✅ 返回清理函数
    return () => {
      eventEmitter.off('notification', handleNotification);
    };
  }, []);

  return (
    <ul>
      {notifications.map((n, i) => <li key={i}>{n}</li>)}
    </ul>
  );
}
```

### 问题 6：DOM 操作没有恢复

```javascript
// ❌ 错误代码：DOM 状态污染
function Modal() {
  useEffect(() => {
    // 禁止页面滚动
    document.body.style.overflow = 'hidden';

    // ⚠️ 没有恢复原状！
  }, []);

  return <div className="modal">Modal 内容</div>;
}

// 严格模式暴露的问题：
// 1. 第一次：设置 overflow = 'hidden'
// 2. 模拟卸载：（overflow 仍是 'hidden'）
// 3. 第二次：再次设置 overflow = 'hidden'
// 结果：即使 Modal 卸载，页面仍然无法滚动！
```

```javascript
// ✅ 正确代码：恢复 DOM 状态
function Modal() {
  useEffect(() => {
    // 保存原始值
    const originalOverflow = document.body.style.overflow;

    // 禁止页面滚动
    document.body.style.overflow = 'hidden';

    // ✅ 返回清理函数，恢复原状
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return <div className="modal">Modal 内容</div>;
}
```

---

## 📋 清理副作用的完整清单

### 常见副作用及清理方法

| 副作用类型 | 创建 | 清理 |
|-----------|------|------|
| **事件监听** | `addEventListener` | `removeEventListener` |
| **定时器** | `setTimeout` / `setInterval` | `clearTimeout` / `clearInterval` |
| **网络请求** | `fetch` | `AbortController.abort()` |
| **WebSocket** | `new WebSocket()` | `ws.close()` |
| **事件订阅** | `emitter.on()` | `emitter.off()` |
| **动画** | `requestAnimationFrame()` | `cancelAnimationFrame()` |
| **第三方库** | 初始化（如地图、编辑器） | 销毁方法（如 `destroy()`） |
| **DOM 操作** | 修改全局 DOM 状态 | 恢复原始状态 |
| **localStorage** | 可能不需要清理 | 根据业务需求 |

### 清理函数模板

```javascript
useEffect(() => {
  // 1. 保存原始状态（如果需要）
  const originalState = getCurrentState();

  // 2. 创建资源/订阅/连接
  const resource = createResource();

  // 3. 设置副作用
  setupSideEffect(resource);

  // 4. 返回清理函数
  return () => {
    // 清理资源
    cleanupResource(resource);

    // 恢复原始状态
    restoreState(originalState);
  };
}, [dependencies]);
```

---

## ✅ 最佳实践

### 1. 开发时始终启用严格模式

```javascript
// ✅ 推荐：在根组件启用
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. 养成清理副作用的习惯

**口诀：创建什么，就清理什么**

```javascript
// ✅ 好习惯：每个 useEffect 都考虑是否需要清理
useEffect(() => {
  // 做了什么？
  const subscription = subscribeToSomething();

  // 需要清理吗？YES!
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 3. 使用 ESLint 规则

```json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn"  // 检查依赖项
  }
}
```

### 4. 理解双重调用是正常的

```javascript
// ⚠️ 不要尝试"修复"双重调用
// ❌ 错误做法：试图阻止双重执行
let hasRun = false;

useEffect(() => {
  if (hasRun) return;  // ❌ 错误！这违背了严格模式的目的
  hasRun = true;

  doSomething();
}, []);

// ✅ 正确做法：接受双重调用，确保正确清理
useEffect(() => {
  const resource = doSomething();

  return () => {
    cleanupResource(resource);  // ✅ 正确的清理
  };
}, []);
```

### 5. 使用开发工具

```javascript
// 使用 console 调试双重调用
useEffect(() => {
  console.log('Effect setup');

  return () => {
    console.log('Effect cleanup');
  };
}, []);

// 使用 React DevTools 的 Profiler 查看组件挂载次数
```

---

## 🤔 常见问题解答

### Q1: 为什么我的 console.log 打印了两次？

**A**: 这是严格模式的正常行为。在开发环境中，React 故意双重调用组件函数来帮助你发现副作用问题。

```javascript
function MyComponent() {
  console.log('组件渲染');  // 开发模式：打印 2 次
  return <div>Hello</div>;
}

// 这是正常的！生产环境只会打印 1 次。
```

### Q2: 严格模式会影响性能吗？

**A**:
- ✅ **开发环境**：会略微降低性能（双重调用），但这是为了帮助你发现问题
- ✅ **生产环境**：完全没有影响，严格模式会被自动禁用

### Q3: 我的 Effect 执行了 3 次（setup → cleanup → setup），正常吗？

**A**: 完全正常！这是严格模式模拟 mount → unmount → remount 的流程。

```javascript
// 严格模式执行流程：
1. setup（第一次挂载）
2. cleanup（模拟卸载）
3. setup（模拟重新挂载）

// 组件卸载时：
4. cleanup（真正的卸载）
```

### Q4: 可以禁用严格模式吗？

**A**: 可以，但强烈不推荐！

```javascript
// ❌ 不推荐：移除 StrictMode
root.render(<App />);

// ✅ 推荐：保持 StrictMode，修复发现的问题
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

禁用严格模式会隐藏问题，而不是解决问题。这些问题在生产环境中仍然会出现！

### Q5: 第三方库不兼容严格模式怎么办？

**A**: 可以选择性地禁用严格模式包裹：

```javascript
function App() {
  return (
    <React.StrictMode>
      <div>
        <MyComponents />  {/* 启用严格模式 */}

        {/* 第三方组件可以排除在外 */}
        <LegacyComponent />
      </div>
    </React.StrictMode>
  );
}

// 或者只包裹部分组件
function App() {
  return (
    <div>
      <LegacyComponent />  {/* 不受严格模式影响 */}

      <React.StrictMode>
        <MyComponents />  {/* 启用严格模式 */}
      </React.StrictMode>
    </div>
  );
}
```

### Q6: 严格模式会检测哪些过时的 API？

**A**: 严格模式会警告以下过时的用法：

```javascript
// 1. 过时的字符串 ref（React 16.3+）
<MyComponent ref="myRef" />  // ⚠️ 警告

// 应该使用：
const myRef = useRef();
<MyComponent ref={myRef} />

// 2. 过时的 findDOMNode（React 16.3+）
import { findDOMNode } from 'react-dom';
findDOMNode(this);  // ⚠️ 警告

// 应该使用 ref

// 3. 过时的 context API（React 16.3+）
// 旧 API：
class Child extends React.Component {
  static contextTypes = { color: PropTypes.string };
  render() {
    return <div>{this.context.color}</div>;
  }
}

// 新 API：
const ColorContext = React.createContext();
function Child() {
  const color = useContext(ColorContext);
  return <div>{color}</div>;
}

// 4. 不安全的生命周期方法（React 16.3+）
componentWillMount()          // ⚠️ 警告
componentWillReceiveProps()   // ⚠️ 警告
componentWillUpdate()         // ⚠️ 警告

// 应该使用：
static getDerivedStateFromProps()
componentDidUpdate()
```

---

## 🧪 完整示例：正确与错误对比

### 示例：实时搜索组件

```javascript
// ❌ 错误版本：有多个问题
function SearchWithIssues({ defaultQuery }) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setIsLoading(true);

    // 问题 1：没有取消之前的请求
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      });

    // 问题 2：没有防抖，高频请求
    // 问题 3：没有返回清理函数
  }, [query]);

  // 问题 4：没有清理 debounce timer
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div>
      <input value={query} onChange={handleInputChange} />
      {isLoading && <div>加载中...</div>}
      <ul>
        {results.map(item => <li key={item.id}>{item.title}</li>)}
      </ul>
    </div>
  );
}

// 严格模式会暴露的问题：
// 1. 快速输入时，多个请求同时进行（竞态条件）
// 2. 组件重新挂载时，旧请求仍在进行
// 3. 可能显示旧的搜索结果
```

```javascript
// ✅ 正确版本：完善的清理机制
import { useState, useEffect, useRef } from 'react';

function SearchFixed({ defaultQuery }) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef(null);

  // Effect 1: 执行搜索（带请求取消）
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    // ✅ 使用 AbortController 取消请求
    const controller = new AbortController();

    setIsLoading(true);

    fetch(`/api/search?q=${query}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('请求已取消');
        } else {
          console.error('搜索失败:', err);
          setIsLoading(false);
        }
      });

    // ✅ 清理函数：取消请求
    return () => {
      controller.abort();
    };
  }, [query]);

  // 带防抖的输入处理
  const handleInputChange = (e) => {
    const value = e.target.value;

    // ✅ 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // ✅ 设置新的防抖定时器
    debounceTimerRef.current = setTimeout(() => {
      setQuery(value);
    }, 300);
  };

  // ✅ 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <input
        defaultValue={defaultQuery}
        onChange={handleInputChange}
        placeholder="搜索..."
      />
      {isLoading && <div>加载中...</div>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

// 严格模式验证：
// ✅ 所有请求都能正确取消
// ✅ 定时器能正确清理
// ✅ 不会出现竞态条件
// ✅ 组件重新挂载后状态正确
```

---

## 📊 严格模式检查清单

在开发 React 组件时，使用这个清单检查是否正确处理了副作用：

### 副作用检查清单

- [ ] **事件监听器**
  - [ ] 添加了监听器？
  - [ ] 返回了清理函数移除监听器？

- [ ] **定时器**
  - [ ] 使用了 `setTimeout` / `setInterval`？
  - [ ] 返回了清理函数清除定时器？

- [ ] **网络请求**
  - [ ] 发起了 API 请求？
  - [ ] 使用了 `AbortController` 或取消标记？
  - [ ] 处理了竞态条件？

- [ ] **WebSocket / SSE**
  - [ ] 建立了连接？
  - [ ] 返回了清理函数关闭连接？

- [ ] **订阅**
  - [ ] 订阅了数据源？
  - [ ] 返回了清理函数取消订阅？

- [ ] **第三方库**
  - [ ] 初始化了第三方库（地图、编辑器等）？
  - [ ] 调用了库的销毁方法？

- [ ] **DOM 操作**
  - [ ] 修改了全局 DOM 状态（如 `document.body`）？
  - [ ] 恢复了原始状态？

- [ ] **动画**
  - [ ] 使用了 `requestAnimationFrame`？
  - [ ] 使用了 `cancelAnimationFrame` 清理？

### 组件测试清单

- [ ] 组件在严格模式下正常工作
- [ ] console 中没有警告信息
- [ ] 快速切换路由时没有错误
- [ ] 条件渲染多次后状态正确
- [ ] 没有内存泄漏
- [ ] 没有重复的副作用（双重订阅、双重请求等）

---

## 🎓 核心要点总结

### 1. 严格模式的目的

- ✅ 帮助发现潜在的副作用问题
- ✅ 模拟真实世界的组件重新挂载场景
- ✅ 确保清理函数正确实现
- ✅ 提升应用的健壮性

### 2. 关键机制

```javascript
// 组件函数、useState、useMemo 等会双重调用
function Component() {
  console.log('渲染');  // 打印 2 次
}

// Effect 会经历 mount-unmount-remount 循环
useEffect(() => {
  console.log('setup');
  return () => console.log('cleanup');
}, []);
// 输出：setup → cleanup → setup
```

### 3. 最重要的原则

**口诀：创建什么，就清理什么**

| 创建 | 必须清理 |
|------|---------|
| `addEventListener` | `removeEventListener` |
| `setInterval` | `clearInterval` |
| `fetch` | `controller.abort()` |
| `new WebSocket()` | `ws.close()` |
| `subscribe()` | `unsubscribe()` |
| `requestAnimationFrame()` | `cancelAnimationFrame()` |
| 任何第三方库初始化 | 调用其销毁方法 |

### 4. 开发建议

- ✅ 始终在开发环境启用严格模式
- ✅ 把严格模式的警告当作错误处理
- ✅ 每个 Effect 都思考是否需要清理函数
- ✅ 使用 ESLint 检查 hooks 依赖
- ❌ 不要尝试"绕过"严格模式的检查

---

## 📚 扩展阅读

### React 官方文档

- [Strict Mode](https://react.dev/reference/react/StrictMode)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)

---

## 🎯 总结

React 严格模式是一个强大的开发工具，通过故意的双重调用和 mount-unmount-remount 循环，帮助我们：

1. **发现副作用问题** - 在开发阶段就暴露清理函数缺失的问题
2. **提升代码质量** - 强制我们正确处理组件的生命周期
3. **避免生产问题** - 模拟真实场景，确保应用在各种情况下都能正常工作
4. **为未来做准备** - 确保代码兼容 React 的并发特性

**记住**：严格模式看起来让你的组件"执行了两次"，但这不是 bug，而是 feature！它在帮你发现代码中的真正问题。

**最佳实践**：
- 开发时始终启用严格模式
- 遇到双重调用时，不要禁用严格模式，而是修复代码
- 养成为每个副作用编写清理函数的习惯
- 理解并拥抱严格模式，它会让你成为更好的 React 开发者
