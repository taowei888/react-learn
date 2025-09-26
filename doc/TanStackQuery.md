# TanStack Query 学习笔记

## 概述

TanStack Query 是一个专门为 Web 应用程序设计的**数据获取和状态管理库**，通常被描述为"Web 应用程序缺失的数据获取库"。它专注于处理**服务器状态**，解决了传统状态管理库难以处理的复杂问题。

## 核心概念

### 什么是服务器状态？

服务器状态具有以下特点，使其区别于客户端状态：
- **远程持久化**：数据存储在远程服务器上
- **异步API**：需要通过异步操作获取
- **共享性**：可能被其他用户或进程修改
- **易过期**：本地缓存可能与服务器数据不一致

### 为什么需要 TanStack Query？

传统状态管理库（如 Redux）主要设计用于管理客户端状态，在处理服务器状态时面临挑战：
- 复杂的缓存逻辑
- 重复请求的去重
- 后台数据同步
- 数据过期和更新策略

TanStack Query 的目标：**"在数据控制你之前，先控制应用数据"**

## 安装和设置

### 安装方法

```bash
# 使用 npm
npm i @tanstack/react-query

# 使用 pnpm（推荐）
pnpm add @tanstack/react-query

# 使用 yarn
yarn add @tanstack/react-query
```

### 推荐安装 ESLint 插件

```bash
npm i -D @tanstack/eslint-plugin-query
```

### 浏览器兼容性

- Chrome >= 91
- Firefox >= 90
- Edge >= 91
- Safari >= 15
- iOS >= 15
- Opera >= 77

### 基本初始化

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 1. 创建 QueryClient
const queryClient = new QueryClient()

// 2. 用 QueryClientProvider 包裹应用
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 应用组件 */}
    </QueryClientProvider>
  )
}
```

## 核心功能特性

### 1. 零配置
- 开箱即用，无需复杂配置
- 提供合理的默认设置

### 2. 自动缓存
- 智能缓存查询结果
- 自动管理缓存生命周期

### 3. 后台数据同步
- 自动在后台更新数据
- 保持数据的新鲜度

### 4. 性能优化
- 请求去重
- 并行查询优化
- 分页和懒加载支持

### 5. 开发体验
- 减少样板代码
- 提供一致的数据获取方式
- 优秀的 TypeScript 支持

## Query（查询）详解

### 什么是 Query？

Query 是**对异步数据源的声明式依赖**，它与**唯一键**绑定。Query 通常与基于 Promise 的方法一起使用，从服务器获取数据。

### 基本语法

```tsx
import { useQuery } from '@tanstack/react-query'

const { isPending, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList
})
```

### 核心组件

#### 1. queryKey（查询键）
- 查询的**唯一标识符**
- 用于缓存、重新获取、共享查询
- 通常是数组形式

```tsx
queryKey: ['todos']           // 简单键
queryKey: ['todos', id]       // 带参数的键
queryKey: ['todos', { status: 'done' }]  // 带对象的键
```

#### 2. queryFn（查询函数）
- 返回 Promise 的函数
- Promise 应该解析数据或抛出错误

```tsx
queryFn: () => fetch('/api/todos').then(res => res.json())
queryFn: async () => {
  const response = await fetch('/api/todos')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}
```

## Query 状态管理

### 主要状态

#### 1. 数据状态（status）
- `isPending` 或 `status === 'pending'`：还没有数据
- `isError` 或 `status === 'error'`：查询遇到错误
- `isSuccess` 或 `status === 'success'`：查询成功且数据可用

#### 2. 获取状态（fetchStatus）
- `'fetching'`：正在获取数据
- `'paused'`：想要获取但被暂停
- `'idle'`：没有在做任何事情

### 附加状态信息
- `error`：错误状态下可用
- `data`：成功状态下可用
- `isFetching`：表示正在进行数据获取

## 基本使用示例

### 简单的数据获取

```tsx
import { useQuery } from '@tanstack/react-query'

// 获取仓库数据的示例
function RepoInfo() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/TanStack/query')
        .then(res => res.json())
  })

  if (isPending) return 'Loading...'
  if (error) return 'An error has occurred: ' + error.message

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>
      <strong>✨ {data.stargazers_count}</strong>
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
```

### 推荐的渲染模式

```tsx
function TodoList() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList
  })

  // 1. 首先检查 isPending
  if (isPending) {
    return <div>Loading...</div>
  }

  // 2. 然后检查 isError
  if (isError) {
    return <div>Error: {error.message}</div>
  }

  // 3. 渲染成功状态
  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

## 重要概念理解

### 1. 状态与获取状态的区别

理解 `status`（数据状态）和 `fetchStatus`（查询函数状态）的区别对于全面的查询管理很重要：

- **status** 关注的是**数据**的状态
- **fetchStatus** 关注的是**查询函数**的状态

### 2. 查询键的重要性

查询键不仅是标识符，还决定了：
- 何时重新获取数据
- 如何缓存数据
- 如何在组件间共享数据

### 3. 声明式数据依赖

TanStack Query 采用声明式方法，只需要描述**需要什么数据**，而不是**如何获取数据**。

## 渐进式学习方式

为了更好地掌握 TanStack Query，本项目采用**渐进式解锁功能**的学习方式。通过逐步解锁每个功能，确保深入理解每个概念。

---

## ✅ 第1步：基础查询 (useQuery)

### 核心概念
- **查询键 (queryKey)**: `["todos"]` - 用于标识和缓存查询的唯一键
- **查询函数 (queryFn)**: `fetchTodos` - 实际执行数据获取的异步函数
- **自动缓存**: 相同查询键的数据自动缓存，提高性能
- **状态管理**: 多种状态指示器帮助控制UI渲染
- **后台更新**: 窗口重新获得焦点时自动刷新数据
- **自动重试**: 请求失败时根据配置自动重试
- **手动刷新**: 使用 `refetch()` 函数主动触发数据更新

### 重要状态区别

#### isLoading vs isFetching
这是初学者最容易混淆的概念：

```tsx
const { data, isLoading, isFetching, refetch } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});
```

- **`isLoading`**: 只在**首次加载且无缓存数据**时为 `true`
- **`isFetching`**: **任何网络请求进行时**都为 `true`（包括首次加载、refetch、后台更新）

**实际场景：**
- 首次访问：`isLoading: true`, `isFetching: true`
- 调用 `refetch()`：`isLoading: false`, `isFetching: true` （因为已有缓存数据）

**应用建议：**
- `isLoading` 用于显示骨架屏：`if (isLoading) return <Skeleton />`
- `isFetching` 用于显示刷新指示：`{isFetching && <RefreshIndicator />}`

### 缓存机制详解

#### staleTime vs gcTime
```tsx
const query = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 5 * 60 * 1000,  // 5分钟数据新鲜时间
  gcTime: 10 * 60 * 1000,    // 10分钟垃圾回收时间
});
```

**staleTime（数据新鲜时间）**：
- 控制数据何时被认为"过期"
- 在新鲜期内，不会重新请求数据
- 超过新鲜时间后，下次访问会后台刷新
- `refetch()` 不受此限制，总是会重新请求

**gcTime（垃圾回收时间）**：
- 控制缓存何时被清理
- 当查询变为"不活跃"后开始计时
- 超时后缓存被彻底清除，`data` 变为 `undefined`
- 影响下次访问是否需要重新显示 loading

### 错误处理

```tsx
const { isError, error } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});

// isError 和 error 专门收集 queryFn 执行时的错误
// 不是 useQuery Hook 本身的配置错误
```

**错误来源：**
- `queryFn` 抛出的错误
- Promise 被拒绝的情况
- 网络请求失败

**错误处理注意事项：**
- TanStack Query 会先按 `retry` 配置自动重试
- 只有重试全部失败后，`isError` 才变为 `true`
- useQuery 本身的配置错误会直接抛出到组件层，需要用 Error Boundary 捕获

---

## ✅ 第2步：Mutations（数据变更）

### 核心概念
- **useMutation**: 专门用于数据的增删改操作，区别于 useQuery 的查询操作
- **mutationFn**: 实际执行变更的异步函数
- **手动触发**: 使用 `mutate()` 方法手动执行，不会自动执行
- **生命周期回调**: `onSuccess`, `onError`, `onMutate`, `onSettled`
- **缓存更新**: 两种方式 - 手动更新缓存 vs 使查询失效

### Mutation vs Query 核心区别

| 特性 | Query (useQuery) | Mutation (useMutation) |
|------|------------------|------------------------|
| 执行时机 | 自动执行 | 手动执行 |
| 缓存机制 | 有缓存 | 无缓存 |
| 用途 | 获取数据 | 变更数据 |
| 状态 | isLoading/isFetching | isPending/isSuccess/isError |

### 缓存更新策略

#### 方式1：手动更新缓存
```tsx
const addTodoMutation = useMutation({
  mutationFn: addTodo,
  onSuccess: (newTodo) => {
    // 直接更新缓存数据
    queryClient.setQueryData(["todos"], (oldTodos) => {
      return oldTodos ? [...oldTodos, newTodo] : [newTodo];
    });
  },
});
```

#### 方式2：使查询失效
```tsx
const handleInvalidate = () => {
  // ❗ 重要：invalidateQueries 不是清理缓存！
  // 而是标记缓存为"过期"，触发重新获取
  queryClient.invalidateQueries({ queryKey: ["todos"] });
};
```

**invalidateQueries vs 清理缓存：**
- `invalidateQueries()`: 标记过期，重新获取，数据仍可见
- `removeQueries()`: 真正删除缓存，`data` 变为 `undefined`
- `setQueryData()`: 直接更新缓存数据

---

## ✅ 第3步：带参数的条件查询

### 核心概念
- **动态查询键**: `["todo", selectedId]` - 包含参数，不同参数独立缓存
- **enabled 选项**: `!!selectedId` - 控制查询是否执行
- **参数传递**: `queryFn` 中使用外部变量
- **独立缓存**: 每个不同的 ID 都有独立的缓存条目
- **自动执行**: 参数变化时自动触发新的查询

### 条件查询详解

```tsx
const [selectedId, setSelectedId] = useState(null);

const { data: selectedTodo } = useQuery({
  queryKey: ["todo", selectedId],      // 包含参数的查询键
  queryFn: () => fetchTodoById(selectedId!),  // 使用参数的查询函数
  enabled: !!selectedId,               // 条件执行
});
```

**关键理解：**
- `enabled: false` 时查询完全暂停，不发起网络请求
- 不同的 `selectedId` 会创建独立的缓存条目：`["todo", 1]`, `["todo", 2]`
- 参数变化时自动触发新查询，无需手动调用

### 实际应用场景
- 主从查询：选择列表项查看详情
- 搜索功能：只有输入关键词时才搜索
- 分页查询：根据页码加载不同页的数据
- 依赖查询：先获取用户信息，再根据用户ID获取订单

---

## ✅ 第4步：高级特性

### 1. 并行查询（useQueries）

```tsx
const userQueries = useQueries({
  queries: [
    {
      queryKey: ["userProfile"],
      queryFn: fetchUserProfile,
    },
    {
      queryKey: ["userSettings"],
      queryFn: fetchUserSettings,
    },
  ],
});

const [userProfileQuery, userSettingsQuery] = userQueries;
```

**核心优势：**
- **同时执行**: 多个独立查询同时发起，提高性能
- **独立状态**: 每个查询有独立的 loading、error、data 状态
- **配置灵活**: 每个查询可以有不同的配置选项
- **性能提升**: 总时间 ≈ max(查询时间) 而不是累加

### 2. 乐观更新（Optimistic Updates）

**什么是乐观更新？**

乐观更新是一种用户体验优化策略：

```
传统方式（悲观更新）：
用户操作 → 显示loading → 等待服务器 → 成功后更新UI

乐观更新方式：
用户操作 → 立即更新UI → 后台发请求 → 成功保持/失败回滚
```

**核心思想：**"乐观地假设操作会成功，先更新UI给用户看，失败了再说"

#### 乐观更新实现

```tsx
const updateTodoMutation = useMutation({
  mutationFn: updateTodoOptimistic,

  // 🔄 在请求发送前立即更新UI
  onMutate: async (newTodo) => {
    // 1. 取消正在进行的查询，避免冲突
    await queryClient.cancelQueries({ queryKey: ["todos"] });

    // 2. 保存之前的数据，以便回滚
    const previousTodos = queryClient.getQueryData(["todos"]);

    // 3. 乐观更新：立即更新缓存数据
    queryClient.setQueryData(["todos"], (old) => {
      return old.map(todo =>
        todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
      );
    });

    return { previousTodos };
  },

  // ✅ 成功时通常不需要额外操作，UI已经是正确的了
  onSuccess: (data) => {
    console.log('更新成功:', data);
  },

  // ❌ 失败时回滚到之前的数据
  onError: (err, variables, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(["todos"], context.previousTodos);
    }
  },

  // 🔄 无论成功失败都重新获取数据确保一致性
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

**乐观更新的价值：**
- **立即反馈**: 用户操作立即看到结果
- **更好体验**: 在网络延迟较高时尤其重要
- **适用场景**: 成功率很高的操作（点赞、切换开关等）

## React 组件重新渲染机制

### 什么会触发组件重新渲染？

1. **状态变化** (`useState`, `useReducer`)
2. **Props 变化**
3. **父组件重新渲染**
4. **Context 值变化**
5. **自定义 Hook 返回的状态变化**（如 `useQuery` 的返回值）

### 重新渲染时的代码执行

**✅ 会重新执行：**
- 整个函数组件体（从函数开始到return）
- 所有 Hook 调用（useState、useQuery等）
- 所有普通 JavaScript 代码（变量声明、console.log等）
- JSX 返回值

**❌ 不会重新执行：**
- 函数组件外部的代码
- Hook 的回调函数（依赖项未变化时）

### 关键理解

- **React 组件就是函数**，每次渲染就是重新调用这个函数
- **useState 的状态是持久化的**，不会因重新渲染而重置
- **TanStack Query 的缓存机制**：refetch 时 `data` 显示缓存数据，不是 `undefined`

这是 TanStack Query 的优势：提供更好的默认行为，而 React 原生状态管理需要开发者手动处理这些复杂情况。

## 配置层级和优先级

TanStack Query 有多层配置：

1. **组件级别配置**（useQuery 中的选项）
2. **全局默认配置**（QueryClient 创建时）
3. **内置默认值**（TanStack Query 自带）

**优先级：** 组件配置 > 全局配置 > 内置默认值

这就是为什么注释掉组件中的 `retry: 3` 后，仍然会重试的原因 - 全局配置起了作用。

## 实际项目应用建议

1. **合理设置缓存时间**：根据数据更新频率调整 `staleTime`
2. **错误边界处理**：使用 Error Boundary 捕获 Hook 配置错误
3. **性能优化**：适当使用并行查询减少等待时间
4. **用户体验**：在高频交互中使用乐观更新
5. **调试工具**：安装 React Query DevTools 辅助开发

---

## 学习总结

TanStack Query 的核心功能：

✅ **基础查询** - 理解缓存机制和状态管理
✅ **数据变更** - 掌握 Mutation 和缓存更新策略
✅ **条件查询** - 学会参数化查询和条件控制
✅ **高级特性** - 实践并行查询和乐观更新

TanStack Query 不仅仅是一个数据获取库，更是一个完整的服务器状态管理解决方案。它通过优秀的默认行为和灵活的配置选项，大大简化了现代 React 应用中的数据管理复杂度。

*持续更新中...*
