# React 条件渲染与默认值最佳实践

## 目录
- [条件渲染](#条件渲染)
- [默认值处理](#默认值处理)
- [常见陷阱](#常见陷阱)
- [最佳实践速查表](#最佳实践速查表)

---

## 条件渲染

### 1. 逻辑与 `&&` - 简洁但有陷阱

#### ✅ 适用场景：布尔值条件
```jsx
{isLoggedIn && <UserPanel />}
{hasPermission && <AdminButton />}
{showModal && <Modal />}
```

#### ⚠️ 陷阱：数字和字符串
```jsx
// ❌ 错误示例
const count = 0;
{count && <div>有 {count} 条数据</div>}
// 页面显示：0

const message = '';
{message && <div>{message}</div>}
// 页面显示：（空字符串）

// ✅ 修复方法
{count > 0 && <div>有 {count} 条数据</div>}
{!!count && <div>有 {count} 条数据</div>}
{message.length > 0 && <div>{message}</div>}
```

#### 原因解析
```js
// 逻辑与（&&）运算符从左到右对操作数求值，遇到第一个假值操作数时立即返回；如果所有的操作数都是真值，则返回最后一个操作数的值。

// 能够转化为 true 的值叫做真值，能够转化为 false 的值叫做假值。

// 能够转化为 false 的表达式的示例如下：

// false；
// null；
// NaN；
// 0；
// 空字符串（"" 或 '' 或 ``）；
// undefined。

0 && 'hello'        // 返回 0
'' && 'hello'       // 返回 ''
false && 'hello'    // 返回 false
true && 'hello'     // 返回 'hello'

// React 渲染规则：
{0}          // 渲染成 "0" ⚠️
{''}         // 渲染成空字符串 ⚠️
{false}      // 不渲染 ✅
{null}       // 不渲染 ✅
{undefined}  // 不渲染 ✅
```

---

### 2. 三元运算符 `? :` - 最安全推荐

#### ✅ 推荐写法
```jsx
{isLoading ? <Spinner /> : <Content />}

{hasData ? (
  <div>
    <DataList items={data} />
  </div>
) : null}

{count > 0 ? (
  <div>共 {count} 条记录</div>
) : (
  <div>暂无数据</div>
)}
```

#### 优势
- 明确处理 true/false 两种情况
- 不会有 `0` 或 `''` 被渲染的问题
- 代码意图清晰

---

### 3. 提前 return - 最优雅（推荐）

#### ✅ 适用场景：复杂条件或多层嵌套
```jsx
const UserProfile = ({ user, isLoading, error }) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!user) {
    return <EmptyState message="用户不存在" />;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
};
```

#### 优势
- 避免深层嵌套
- 代码线性化，易读
- 清晰的边界条件处理

---

### 4. 变量存储 - 复杂逻辑

#### ✅ 适用场景：需要复杂计算
```jsx
const ProductCard = ({ product, isVip, discount }) => {
  let priceDisplay = null;

  if (isVip && discount) {
    priceDisplay = (
      <div className="text-red-500">
        VIP价：¥{(product.price * discount).toFixed(2)}
      </div>
    );
  } else if (discount) {
    priceDisplay = (
      <div className="text-orange-500">
        优惠价：¥{(product.price * discount).toFixed(2)}
      </div>
    );
  } else {
    priceDisplay = <div>¥{product.price}</div>;
  }

  return (
    <div>
      <h3>{product.name}</h3>
      {priceDisplay}
    </div>
  );
};
```

---

## 默认值处理

### 1. 逻辑或 `||` - 常用但有陷阱

#### ✅ 适用场景：字符串/对象默认值
```jsx
<div>用户名：{username || '访客'}</div>
<img alt={altText || '图片描述'} />
<MyComponent config={options || {}} />
```

#### ⚠️ 陷阱：数字 0 和布尔值 false
```jsx
// ❌ 错误示例
const score = 0;
{score || '暂无评分'}  // 显示：暂无评分（错误！0 分应该显示）

const isPublished = false;
{isPublished || '草稿'}  // 显示：草稿（错误！false 不应该被替换）

// ✅ 修复方法
{score ?? '暂无评分'}
{isPublished ?? '草稿'}
```

#### 原因解析
```js
// || 运算符返回值规则：参考 && ，和 && 相反
// 返回第一个 truthy 值，或最后一个 falsy 值

0 || 'default'          // 'default' ⚠️ 把 0 当成了空值
'' || 'default'         // 'default' ✅
false || 'default'      // 'default' ⚠️
null || 'default'       // 'default' ✅
undefined || 'default'  // 'default' ✅
```

---

### 2. 空值合并 `??` - 推荐（ES2020）

#### ✅ 只替换 null 和 undefined
```jsx
{price ?? 0}              // price 为 null/undefined 时才显示 0
{stock ?? '无库存'}        // stock 为 null/undefined 时才用默认值
{isActive ?? true}        // isActive 为 null/undefined 时才为 true
```

#### 对比 `||` 和 `??`
```js
// || 把所有 falsy 值都替换
0 || 100          // 100 ⚠️
'' || '默认'      // '默认' ⚠️
false || true     // true ⚠️

// ?? 只替换 null/undefined
0 ?? 100          // 0 ✅
'' ?? '默认'      // '' ✅
false ?? true     // false ✅
null ?? 100       // 100 ✅
undefined ?? 100  // 100 ✅
```

---

## 常见陷阱

### 陷阱 1：数组长度判断
```jsx
// ❌ 错误
const items = [];
{items.length && <div>共 {items.length} 项</div>}
// 显示：0

// ✅ 正确
{items.length > 0 && <div>共 {items.length} 项</div>}
{items.length ? <div>共 {items.length} 项</div> : null}
```

### 陷阱 2：字符串空值判断
```jsx
// ❌ 错误（可能接收到 "0" 字符串）
const value = "0";
{value && <div>{value}</div>}  // 显示 "0"（正确），但逻辑不清晰

// ✅ 正确
{value.trim() && <div>{value}</div>}
{value !== '' && <div>{value}</div>}
```

### 陷阱 3：嵌套三元运算符
```jsx
// ❌ 可读性差
{isLoading ? <Spinner /> : hasError ? <Error /> : hasData ? <List /> : <Empty />}

// ✅ 提前 return
const Content = () => {
  if (isLoading) return <Spinner />;
  if (hasError) return <Error />;
  if (hasData) return <List />;
  return <Empty />;
};
```

### 陷阱 4：对象和数组作为条件
```jsx
// ⚠️ 对象和数组永远是 truthy
const obj = {};
const arr = [];

{obj && <div>有对象</div>}   // 永远显示（即使对象为空）
{arr && <div>有数组</div>}   // 永远显示（即使数组为空）

// ✅ 正确判断
{Object.keys(obj).length > 0 && <div>有对象</div>}
{arr.length > 0 && <div>有数组</div>}
```

---

## 最佳实践速查表

| 场景 | 推荐写法 | 避免写法 |
|------|----------|----------|
| 布尔条件渲染 | `{isTrue && <Component />}` | - |
| 数字条件渲染 | `{count > 0 && <Component />}` | `{count && <Component />}` |
| 字符串条件渲染 | `{str.length > 0 && <Component />}` | `{str && <Component />}` |
| 数组条件渲染 | `{arr.length > 0 && <Component />}` | `{arr.length && <Component />}` |
| 二选一渲染 | `{cond ? <A /> : <B />}` | 嵌套三元 |
| 复杂条件 | 提前 return | 深层嵌套 |
| 文本默认值 | `{text ?? '默认'}` | `{text \|\| '默认'}` (若 text 可能为 0) |
| 数字默认值 | `{num ?? 0}` | `{num \|\| 0}` |
| 布尔默认值 | `{bool ?? false}` | `{bool \|\| false}` |
| 对象默认值 | `{obj ?? {}}` | - |

---

## 决策流程图

```
需要条件渲染？
  ├─ 是布尔值条件？
  │   └─ 使用 && ✅
  │
  ├─ 是数字/字符串条件？
  │   └─ 使用显式比较 + && 或三元运算符 ✅
  │
  ├─ 需要 else 分支？
  │   └─ 使用三元运算符 ✅
  │
  └─ 复杂逻辑？
      └─ 提前 return 或变量存储 ✅

需要默认值？
  ├─ 值可能是 0/false/''？
  │   └─ 使用 ?? ✅
  │
  └─ 值只可能是 null/undefined？
      └─ 使用 || 或 ?? 均可 ✅
```

---

## 团队规范建议

### 强制规范（必须遵守）
1. **禁止** 直接用数字/字符串作 `&&` 条件：`{count && <div/>}` ❌
2. **禁止** 嵌套超过 2 层的三元运算符
3. **禁止** 用 `||` 处理数字默认值：`{score || 0}` ❌

### 推荐规范
1. 优先使用 `??` 而非 `||` 处理默认值
2. 复杂条件（>3 行）提取为独立组件或函数
3. 布尔条件使用语义化命名：`isLoading`, `hasData`, `canEdit`

---

## 实战示例

### 示例 1：列表组件
```jsx
const ProductList = ({ products, isLoading, error }) => {
  // 优先处理边界条件
  if (isLoading) {
    return <div className="text-center"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-500">加载失败：{error.message}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-gray-500">暂无商品</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### 示例 2：表单字段
```jsx
const FormField = ({ value, placeholder, error, maxLength }) => {
  return (
    <div>
      <input
        value={value ?? ''}                          // 空值合并
        placeholder={placeholder || '请输入'}         // 文本默认值可用 ||
        maxLength={maxLength ?? 100}                 // 数字默认值必须用 ??
      />
      {error && (                                    // 布尔条件用 &&
        <div className="text-red-500">{error}</div>
      )}
      {maxLength && (                                // 有最大长度才显示
        <div className="text-gray-400">
          {value?.length ?? 0} / {maxLength}
        </div>
      )}
    </div>
  );
};
```

### 示例 3：用户信息卡片
```jsx
const UserCard = ({ user }) => {
  if (!user) {
    return <div>用户不存在</div>;
  }

  const displayName = user.nickname ?? user.username ?? '匿名用户';
  const avatarUrl = user.avatar || '/default-avatar.png';
  const followerCount = user.followers ?? 0;

  return (
    <div className="card">
      <img src={avatarUrl} alt={displayName} />
      <h3>{displayName}</h3>

      {user.bio && <p className="bio">{user.bio}</p>}

      {user.isVerified && (
        <span className="badge">已认证</span>
      )}

      <div>
        粉丝：{followerCount > 0 ? (
          <span className="text-blue-500">{followerCount}</span>
        ) : (
          <span className="text-gray-400">0</span>
        )}
      </div>
    </div>
  );
};
```

---

## 总结

### 核心原则
1. **安全第一**：优先使用三元运算符和 `??`
2. **可读性优先**：复杂逻辑提前 return
3. **显式优于隐式**：明确写出判断条件

### 记住这三点
- `&&` 用于布尔条件，数字/字符串要显式比较
- `??` 优于 `||`，避免 0/false 被替换
- 提前 return 让代码更清晰

---
