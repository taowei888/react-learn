import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { useState } from "react";

// 模拟 API 接口 - 基础查询
const fetchTodos = async () => {
  console.log("接口调用");
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 模拟可能的网络错误
  if (Math.random() < 0.1) {
    throw new Error("网络请求失败");
  }

  return [
    { id: 1, title: "学习 React", completed: false },
    { id: 2, title: "学习 TanStack Query", completed: false },
    { id: 3, title: "构建项目", completed: true },
  ];
};

// 第3步：带参数的条件查询 - 根据 ID 获取单个 Todo
const fetchTodoById = async (id: number) => {
  console.log("fetchTodoById 接口调用, ID:", id);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 模拟可能的获取失败
  if (Math.random() < 0.1) {
    throw new Error(`获取 Todo ${id} 失败`);
  }

  return { id, title: `Todo ${id} 详细信息`, completed: Math.random() > 0.5 };
};

// 第4步：高级特性 - 模拟其他API接口
const fetchUserProfile = async () => {
  console.log("fetchUserProfile 接口调用");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { id: 1, name: "张三", email: "zhang@example.com" };
};

const fetchUserSettings = async () => {
  console.log("fetchUserSettings 接口调用");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return { theme: "dark", language: "zh-CN", notifications: true };
};

// 乐观更新的 Mutation
const updateTodoOptimistic = async (todo: {
  id: number;
  title: string;
  completed: boolean;
}) => {
  console.log("updateTodoOptimistic 接口调用:", todo);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 模拟可能的更新失败
  if (Math.random() < 0.2) {
    throw new Error("更新失败，网络错误");
  }

  return { ...todo, updatedAt: new Date().toISOString() };
};

// 第2步：Mutation 操作 - 模拟添加新 Todo
const addTodo = async (newTodo: { title: string }) => {
  console.log("Mutation 接口调用:", newTodo);
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 模拟可能的添加失败
  if (Math.random() < 0.1) {
    throw new Error("添加失败，服务器错误");
  }

  return {
    id: Date.now(),
    title: newTodo.title,
    completed: false,
  };
};

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function ReactQuery() {
  // ===== 第1步：基础查询 =====
  // TanStack Query 的核心特性：
  // - 自动缓存：相同 queryKey 的数据会被缓存
  // - 自动重试：请求失败时会自动重试
  // - 后台更新：窗口重新获得焦点时自动重新获取数据
  const {
    data: todos,
    isLoading, // 🔑 只在首次加载且无缓存数据时为 true
    isError, // 🔑 当 queryFn 抛出错误或返回被拒绝的 Promise 时为 true
    error, // 🔑 具体的错误对象，包含错误信息（Error 实例或其他抛出的值）
    isFetching, // 🔑 任何时候正在请求数据都为 true（首次加载、refetch、后台更新）
    refetch, // 手动重新获取数据的函数
  } = useQuery({
    queryKey: ["todos"], // 查询键：用于缓存和标识查询
    queryFn: fetchTodos, // 查询函数：实际的数据获取逻辑

    // 🕐 staleTime（数据新鲜时间）- 控制何时认为数据"过期"
    staleTime: 5 * 60 * 1000, // 5分钟 = 300000ms
    // 📋 作用：
    // - 在 5分钟内，数据被视为"新鲜"，不会重新请求
    // - 超过 5分钟后，数据变为"陈旧"，下次访问时会后台重新获取
    // 💡 影响的行为：
    // - 窗口重新获得焦点时是否重新请求
    // - 组件重新挂载时是否重新请求
    // - refetch() 不受此限制，总是会重新请求
    // 📊 对返回值的影响：
    // - isStale: 数据是否过期（超过 staleTime）
    // - 不影响 isLoading、isFetching、data 等其他状态

    // 🗑️ gcTime（垃圾回收时间）- 控制缓存何时被清理
    gcTime: 10 * 60 * 1000, // 10分钟 = 600000ms
    // 📋 作用：
    // - 当查询变为"不活跃"状态（没有组件使用）后，开始计时
    // - 10分钟内如果有组件重新使用，直接返回缓存数据
    // - 超过 10分钟后，缓存被彻底清除，下次使用需要重新加载
    // 💡 影响的行为：
    // - 决定 data 何时变为 undefined
    // - 决定是否需要重新显示 loading 状态
    // - 影响内存使用（缓存清理）
    // 📊 对返回值的影响：
    // - data: 缓存清除后会变为 undefined
    // - isLoading: 缓存清除后重新访问会变为 true
    // - 其他状态会重置为初始状态

    retry: 0, // 重试次数：失败时重试3次
    // ❗ 注意：即使注释了上面的 retry，仍然会重试！为什么？
  });

  // 💡 为什么注释了 retry 仍然会重试？
  //
  // 🔧 TanStack Query 有多层重试配置：
  // 1. 全局默认配置（在 main.tsx 的 QueryClient 中）
  // 2. 组件级别配置（这里的 useQuery 中）
  // 3. TanStack Query 内置默认值
  //
  // 📋 优先级：组件配置 > 全局配置 > 内置默认值
  //
  // 🔍 查看你的 main.tsx：
  // const queryClient = new QueryClient({
  //   defaultOptions: {
  //     queries: {
  //       retry: 3, // 👈 这里设置了全局的重试次数！
  //     },
  //   },
  // });
  //
  // ✅ 解决方案：
  // - 方案1：在这里显式设置 retry: 0（覆盖全局配置）
  // - 方案2：修改 main.tsx 中的全局配置
  // - 方案3：使用 retry: false（完全禁用重试）

  // 📝 staleTime vs gcTime 实际时间线示例：
  //
  // ⏰ T=0: 首次加载数据
  // - isLoading: true → false
  // - data: undefined → 缓存数据
  // - 数据状态：新鲜
  //
  // ⏰ T=3分钟: 切换到其他页面再回来
  // - data: 缓存数据（立即显示）
  // - 数据状态：新鲜，不重新请求
  //
  // ⏰ T=6分钟: 切换到其他页面再回来（超过staleTime=5分钟）
  // - data: 缓存数据（立即显示）
  // - 数据状态：陈旧，后台自动重新请求
  // - isFetching: false → true → false
  //
  // ⏰ T=15分钟: 组件卸载超过10分钟，重新挂载（超过gcTime=10分钟）
  // - data: undefined（缓存已清除）
  // - isLoading: true（需要重新加载）
  // - 重新执行完整的加载流程

  // 🔍 isLoading vs isFetching 重要区别：
  // isLoading: 只在首次加载且无缓存数据时为 true，有缓存后调用 refetch 不会变为 true
  // isFetching: 任何网络请求进行时都为 true（首次加载、refetch、后台更新等）

  // 实际应用场景：
  // - isLoading 用于显示骨架屏：if (isLoading) return <Skeleton />
  // - isFetching 用于显示刷新指示：{isFetching && <RefreshIndicator />}

  // 当调用 refetch() 时的执行流程：
  // 1. refetch() 触发新的网络请求
  // 2. useQuery 内部状态发生变化（isFetching: false → true，但 isLoading 保持 false）
  // 3. React 检测到状态变化，触发组件重新渲染
  // 4. 整个 ReactQuery 函数重新执行
  // 5. 所以组件内的所有代码都会重新执行，包括下面这些 console.log
  // console.log("todos", todos); // ❗ 重要：refetch时这里显示的是缓存数据，不是undefined
  // console.log("isLoading", isLoading); // ❗ refetch时这里不会变为true，因为已有缓存数据
  // console.log("isError", isError); // ✅ 当 queryFn 执行出错时变为 true
  // console.log("error", error); // ✅ 具体的错误信息，通常是 Error 对象
  // console.log("isFetching", isFetching); // ✅ refetch时这里会变为true

  // 🔍 isError 和 error 详解：
  //
  // 💡 错误来源：专门收集 queryFn（fetchTodos）执行时的错误
  //
  // 📋 触发 isError = true 的情况：
  // 1. queryFn 抛出错误：throw new Error("网络请求失败")
  // 2. queryFn 返回被拒绝的 Promise：Promise.reject("失败原因")
  // 3. fetch 请求失败且没有被处理（如网络断开）
  // 4. async/await 中的未捕获异常
  //
  // 📋 error 对象包含：
  // - error.message: 错误消息文本
  // - error.name: 错误类型名称
  // - error.stack: 错误堆栈信息（开发调试用）
  //
  // 🔄 错误重试机制：
  // - TanStack Query 会根据 retry 配置自动重试
  // - 只有在重试次数用完后，isError 才会变为 true
  // - 每次重试失败，error 都会更新为最新的错误信息
  //
  // 🎯 实际应用：
  // if (isError) {
  //   return <div>加载失败: {error?.message}</div>
  // }
  //
  // ❓ 如果不是 queryFn 报错，而是 useQuery 本身报错呢？
  //
  // 🔴 useQuery 本身的错误（配置错误、Hook 使用错误等）：
  // - 这些错误会直接抛出到 React 组件层面
  // - 不会被 isError/error 捕获
  // - 会导致整个组件崩溃，触发 React 错误边界
  //
  // 📋 useQuery 可能的错误类型：
  // 1. Hook 规则违反：在条件语句中调用 useQuery
  // 2. 配置错误：queryKey 不是数组、queryFn 不是函数
  // 3. QueryClient 未提供：没有 QueryClientProvider
  //
  // 🛡️ 处理方式：
  // try {
  //   const { data, isError, error } = useQuery({...});
  // } catch (hookError) {
  //   // ❌ 这样捕获不到！useQuery 的错误会在渲染过程中抛出
  // }
  //
  // ✅ 正确处理方式：使用 React Error Boundary
  // <ErrorBoundary fallback={<div>应用出错了</div>}>
  //   <ReactQuery />
  // </ErrorBoundary>
  //
  // 📝 错误分层：
  // - React 层：组件、Hook 使用错误 → Error Boundary 捕获
  // - Query 层：queryFn 执行错误 → isError/error 捕获
  // - 网络层：HTTP 状态码、超时等 → queryFn 内部处理后传递给 Query 层

  // 🔍 为什么 refetch 时 todos 不是 undefined？

  // ❗ 重要澄清：我刚才的说法有误导性，让我重新解释！

  // 📌 基础原理（React 通用）：
  // - React 状态在重新渲染时会保持，这是 React 的基本机制
  // - useState 的状态不会因为组件重新渲染而重置

  // 📌 区别在于**数据获取和缓存策略**：

  // 🔸 如果用原生 React 手动管理：
  // const [data, setData] = useState();
  // const refetch = () => {
  //   setData(undefined);        // 👈 这是**开发者主动选择**清空状态
  //   fetchData().then(setData); // 然后等待新数据
  // };
  // // 开发者**可以选择**不清空，那状态也会保持

  // 🔸 TanStack Query 的策略：
  // - useQuery 内部帮你管理状态，**默认采用**"缓存优先"策略
  // - 它**选择**在 refetch 时保持缓存数据，而不是清空
  // - 这是设计决策，不是技术限制

  // 🎯 真正的区别：
  // - React 状态保持：两者都有（基础机制）
  // - 数据获取策略：TanStack Query 提供了更好的默认行为

  // 🔧 只有在以下情况 todos 才会是 undefined：
  //    - 首次加载且还没有任何缓存数据
  //    - 缓存过期且被清除（gcTime 过期）
  //    - 手动清除缓存（queryClient.removeQueries）

  // 💡💡💡 重要澄清：React 状态的持久化机制
  // 你可能会疑问：组件重新渲染时，状态不是应该重置为初始值吗？
  //
  // ❌ 错误理解：
  // const [count, setCount] = useState(0); // 以为每次渲染都重置为0
  //
  // ✅ 正确理解：
  // React 内部维护了一个状态存储，useState(0) 中的 0 只是**初始值**
  // 1. 首次渲染：React 创建状态，初始值为 0
  // 2. setCount(1) 调用：React 更新内部存储的状态为 1
  // 3. 重新渲染：useState(0) 被调用，但 React 返回存储的值 1，不是初始值 0
  // 4. 状态只有在组件**卸载**时才会被清除，重新渲染时会保持
  //
  // 🔑 关键：React Hook 的状态是**持久化**的，不会因重新渲染而重置！

  // ===== 第2步：Mutation（数据变更）=====
  const [newTodoTitle, setNewTodoTitle] = useState("");

  // 获取 QueryClient 实例，用于手动操作缓存
  const queryClient = useQueryClient();

  // 🔄 useMutation - 用于数据的增删改操作
  const addTodoMutation = useMutation({
    mutationFn: addTodo, // 变更函数：实际执行的异步操作

    // ✅ 成功回调：Mutation 执行成功时触发
    onSuccess: (newTodo) => {
      console.log("Mutation 成功:", newTodo);
      // 手动更新缓存数据：将新 Todo 添加到现有缓存中
      queryClient.setQueryData<Todo[]>(["todos"], (oldTodos) => {
        return oldTodos ? [...oldTodos, newTodo] : [newTodo];
      });
      setNewTodoTitle(""); // 清空输入框
    },

    // ❌ 错误回调：Mutation 执行失败时触发
    onError: (error) => {
      console.error("Mutation 失败:", error);
      alert("添加失败，请重试");
    },

    // 📋 其他生命周期回调：
    // onMutate: () => {}, // 开始执行前触发，可用于乐观更新
    // onSettled: () => {}, // 无论成功失败都会触发
  });

  // console.log("addTodoMutation", addTodoMutation);

  // 触发 Mutation 的处理函数
  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      // 调用 mutate 方法执行 Mutation
      addTodoMutation.mutate({ title: newTodoTitle.trim() });
    }
  };

  // 手动使查询失效，触发重新获取（替代方案）
  const handleInvalidate = () => {
    // ❗ 重要澄清：invalidateQueries 不是清理缓存！
    // 📋 它的实际作用：
    // 1. 标记缓存为"过期"状态（stale）
    // 2. 如果有组件正在使用这个查询，立即重新获取数据
    // 3. 缓存数据仍然存在，用户仍能看到旧数据
    // 4. 新数据返回后，替换缓存中的旧数据
    //
    // 🔍 vs 其他方法的区别：
    // - invalidateQueries(): 标记过期，重新获取
    // - removeQueries(): 真正删除缓存，data 变为 undefined
    // - setQueryData(): 直接更新缓存数据
    //
    // 💡 使用场景：
    // 当你不确定服务器数据是否有变化时，使用这个方法让数据"刷新"
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  };

  // ===== 第3步：带参数的条件查询 =====
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 🔍 带参数的条件查询 - 根据选中的 ID 获取详细信息
  const {
    data: selectedTodo,
    isLoading: isTodoLoading,
    isError: isTodoError,
    error: todoError,
    isFetching: isTodoFetching,
  } = useQuery({
    queryKey: ["todo", selectedId], // 🔑 查询键包含参数，确保不同 ID 的查询独立缓存
    queryFn: () => fetchTodoById(selectedId!), // 🔑 查询函数使用参数，注意类型断言
    enabled: !!selectedId, // 🔑 条件查询：只有当 selectedId 存在时才执行
    staleTime: 2 * 60 * 1000, // 2分钟新鲜时间

    // 📋 条件查询的核心概念：
    // - enabled: 控制查询是否执行，false 时查询暂停
    // - queryKey: 包含参数，不同参数会创建独立的缓存条目
    // - queryFn: 可以使用 queryKey 中的参数
    // - 当参数变化时，会自动执行新的查询
  });

  // ===== 第4步：高级特性 =====

  // 🚀 1. 并行查询 - 同时执行多个独立的查询
  const userQueries = useQueries({
    queries: [
      {
        queryKey: ["userProfile"],
        queryFn: fetchUserProfile,
        staleTime: 5 * 60 * 1000, // 5分钟
      },
      {
        queryKey: ["userSettings"],
        queryFn: fetchUserSettings,
        staleTime: 3 * 60 * 1000, // 3分钟
      },
    ],
  });

  // 解构并行查询的结果
  const [userProfileQuery, userSettingsQuery] = userQueries;

  // ⚡ 2. 乐观更新 Mutation
  //
  // 💡 乐观更新（Optimistic Updates）是什么意思？
  //
  // 🤔 传统方式（悲观更新）：
  // 1. 用户点击按钮
  // 2. 显示 loading 状态
  // 3. 等待服务器响应（可能很慢）
  // 4. 收到成功响应后才更新 UI
  // 5. 用户体验：需要等待，感觉慢
  //
  // ✨ 乐观更新方式：
  // 1. 用户点击按钮
  // 2. 立即更新 UI（假设会成功）
  // 3. 同时发送请求到服务器
  // 4. 如果成功：保持 UI 更新
  // 5. 如果失败：撤销 UI 更新，恢复原状
  // 6. 用户体验：立即反馈，感觉很快
  //
  // 🎯 乐观更新的核心思想：
  // "乐观地假设操作会成功，先更新 UI 给用户看，失败了再说"
  //
  // 🌟 适用场景：
  // - 成功率很高的操作（如点赞、收藏、切换开关）
  // - 网络延迟较高的环境
  // - 对用户体验要求很高的应用

  const updateTodoMutation = useMutation({
    mutationFn: updateTodoOptimistic,

    // 🔄 乐观更新：在请求发送前立即更新UI
    onMutate: async (newTodo) => {
      console.log("开始乐观更新:", newTodo);

      // 取消正在进行的查询，避免冲突
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 保存之前的数据，以便回滚
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // 乐观更新：立即更新缓存数据
      queryClient.setQueryData<Todo[]>(["todos"], (old) => {
        if (!old) return [newTodo];
        return old.map((todo) =>
          todo.id === newTodo.id
            ? { ...todo, ...newTodo, optimistic: true } // 标记为乐观更新
            : todo
        );
      });

      // 返回上下文对象，供其他回调使用
      return { previousTodos };
    },

    // ✅ 成功：移除乐观标记
    onSuccess: (data) => {
      console.log("乐观更新成功:", data);
      // 可以选择用服务器返回的数据更新，或者保持乐观更新的数据
    },

    // ❌ 失败：回滚到之前的数据
    onError: (err, _variables, context) => {
      console.log("乐观更新失败，回滚数据:", err);
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },

    // 🔄 完成：无论成功失败都重新获取数据确保一致性
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // 处理乐观更新
  const handleOptimisticUpdate = (todo: Todo) => {
    updateTodoMutation.mutate({
      ...todo,
      completed: !todo.completed, // 切换完成状态
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>TanStack Query 学习</h1>

      {/* 🚀 并行查询状态指示器 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f0f8ff",
        }}
      >
        <h3>并行查询状态（useQueries）</h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <strong>用户信息:</strong>
            <br />
            isLoading: {userProfileQuery.isLoading.toString()}
            <br />
            isFetching: {userProfileQuery.isFetching.toString()}
            <br />
            isError: {userProfileQuery.isError.toString()}
            {userProfileQuery.data && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                数据: {userProfileQuery.data.name} (
                {userProfileQuery.data.email})
              </div>
            )}
          </div>
          <div>
            <strong>用户设置:</strong>
            <br />
            isLoading: {userSettingsQuery.isLoading.toString()}
            <br />
            isFetching: {userSettingsQuery.isFetching.toString()}
            <br />
            isError: {userSettingsQuery.isError.toString()}
            {userSettingsQuery.data && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                数据: {userSettingsQuery.data.theme},{" "}
                {userSettingsQuery.data.language}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 状态指示器 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>基础查询状态</h3>
        <p>
          <strong>isLoading:</strong> {isLoading.toString()} |{" "}
          <strong>isFetching:</strong> {isFetching.toString()} |{" "}
          <strong>isError:</strong> {isError.toString()}
        </p>
        {isFetching && <p>正在获取数据...</p>}
      </div>

      {/* Mutation 状态指示器 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#fff3cd",
        }}
      >
        <h3>Mutation 状态</h3>
        <p>
          <strong>isPending:</strong> {addTodoMutation.isPending.toString()} |{" "}
          <strong>isError:</strong> {addTodoMutation.isError.toString()} |{" "}
          <strong>isSuccess:</strong> {addTodoMutation.isSuccess.toString()}
        </p>
        {addTodoMutation.isPending && <p>正在添加数据...</p>}
      </div>

      {/* 添加新 Todo */}
      <div style={{ marginBottom: "20px" }}>
        <h3>添加新 Todo（Mutation 示例）</h3>
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="输入新的 Todo"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleAddTodo} disabled={addTodoMutation.isPending}>
          {addTodoMutation.isPending ? "添加中..." : "添加"}
        </button>
        {addTodoMutation.isError && (
          <p style={{ color: "red" }}>
            添加失败: {addTodoMutation.error?.message}
          </p>
        )}
      </div>

      {/* 控制按钮 */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => refetch()} disabled={isFetching}>
          手动刷新
        </button>
        <button onClick={handleInvalidate} style={{ marginLeft: "10px" }}>
          使缓存失效（替代方案）
        </button>
      </div>

      {/* Todo 列表 */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Todo 列表（基础查询示例）</h3>

        {isLoading && <p>加载中...</p>}

        {isError && (
          <div style={{ color: "red" }}>
            <p>加载失败: {error?.message}</p>
            <button onClick={() => refetch()}>重试</button>
          </div>
        )}

        {todos && (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id} style={{ marginBottom: "10px" }}>
                <span
                  style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => setSelectedId(todo.id)}
                  style={{
                    marginLeft: "10px",
                    backgroundColor:
                      selectedId === todo.id ? "#007bff" : "#f8f9fa",
                    color: selectedId === todo.id ? "white" : "black",
                    border: "1px solid #ccc",
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}
                >
                  查看详情
                </button>
                <button
                  onClick={() => handleOptimisticUpdate(todo)}
                  disabled={updateTodoMutation.isPending}
                  style={{
                    marginLeft: "5px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "2px 8px",
                    cursor: updateTodoMutation.isPending
                      ? "not-allowed"
                      : "pointer",
                    opacity: updateTodoMutation.isPending ? 0.6 : 1,
                  }}
                >
                  {updateTodoMutation.isPending ? "更新中..." : "切换状态"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 选中的 Todo 详情 */}
      {selectedId && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Todo 详情（条件查询示例）</h3>
          <p>
            <strong>选中 ID:</strong> {selectedId}
          </p>

          {/* 条件查询状态指示器 */}
          <div
            style={{
              marginBottom: "10px",
              padding: "8px",
              backgroundColor: "#fff3cd",
              fontSize: "14px",
            }}
          >
            <strong>条件查询状态:</strong> isLoading: {isTodoLoading.toString()}{" "}
            | isFetching: {isTodoFetching.toString()} | isError:{" "}
            {isTodoError.toString()}
          </div>

          {isTodoLoading && <p>加载详情中...</p>}

          {isTodoError && (
            <div style={{ color: "red" }}>
              <p>加载详情失败: {todoError?.message}</p>
            </div>
          )}

          {selectedTodo && (
            <div>
              <p>
                <strong>标题:</strong> {selectedTodo.title}
              </p>
              <p>
                <strong>完成状态:</strong>{" "}
                {selectedTodo.completed ? "完成" : "未完成"}
              </p>
              <p>
                <strong>缓存键:</strong> ["todo", {selectedId}]
              </p>
            </div>
          )}

          <button
            onClick={() => setSelectedId(null)}
            style={{ marginTop: "10px", padding: "5px 10px" }}
          >
            关闭详情
          </button>
        </div>
      )}

      {/* ⚡ 乐观更新状态指示器 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h3>乐观更新状态</h3>
        <p>
          <strong>isPending:</strong> {updateTodoMutation.isPending.toString()}{" "}
          | <strong>isError:</strong> {updateTodoMutation.isError.toString()} |{" "}
          <strong>isSuccess:</strong> {updateTodoMutation.isSuccess.toString()}
        </p>
        {updateTodoMutation.isPending && <p>正在执行乐观更新...</p>}
        {updateTodoMutation.isError && (
          <p style={{ color: "red" }}>
            乐观更新失败: {updateTodoMutation.error?.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ReactQuery;
