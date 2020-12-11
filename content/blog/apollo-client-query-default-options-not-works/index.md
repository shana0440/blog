---
title: apollo-client query default options not works?
date: "2020-12-11T19:01:44.526Z"
description: "A lesson learned"
tags: ["graphql", "apollo", "react"]
---

首先這是一個愚蠢的錯誤，但是花了滿多時間 trace code 才知道問題出在哪裡，在這邊紀錄一下，免得以後忘記。

## Basic knowledge

目前的專案使用 `graphql-codegen` 這個套件，來自動幫我們從 graphql query language 生成對應的 typescript，以及 react hook 來方便我們使用，下面是一個範例。

```graphql
type User {
  name
  email
}

query Me {
  ... on User {
    name
    email
  }
}
```

上面的 query 會被生成下面對應的 hook，並且可以使用在 react component 中。s

```tsx
const Profile = () => {
  const { data, loading, error } = useMeQuery()

  if (error) {
    return <Text>error</Text>
  }

  if (loading) {
    return <Text>loading</Text>
  }

  return <Text>{data!.name}</Text>
}
```

在我們使用這個 query 之前呢，我們需要先設定好 `ApolloProvider`，在 `ApolloProvider` 中提供 `ApolloClient` ，這樣 `useXXXQuery` 就可以使用我們設定好的 client。

```tsx
const GraphqlProvider = ({ children }) => {
  const client = new ApolloClient({
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
    },
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
```

## What happened

可以看到我們在上面請 apollo client 不要使用 cache，但實際上我們在用的時候，發現 apollo client 還是會使用 query ，這引出了一個 bug，在我們的 app 裡面，第三方的 api 要求我們傳目前使用者的語言過去，他們會回傳對應的語言，我們透過 header 來傳送使用者目前的語言，當使用者一開始是英語，我們送出 query 取得英語的資料，再來使用者換成中文，apollo client 就直接從 cache 裡面拿資料，而不會在送出新的 query ，因為 apollo client 只有在 variables 不同的時候才會送出新的 query ，當他發現 variables 中的資料都相同，以前有查詢過相同的資料，就會從 cache 裡面拿，所以使用者就只能一直看到英文的資料。

我們就很好奇為什麼 default options 並沒有用，於是開始我們的 trace code 之旅。

`useMeQuery` 實際上是下面這段程式碼

```tsx
const useMeQuery = options => {
  // MeQueryDocument is we defined `query Me {...}`
  return useBaseQuery(MeQueryDocument, options)
}
```

而 `useBaseQuery` 會建立一個 `QueryData`，並執行 `QueryData.execute()` 來取得資料。
接著 `QueryData.execute()` 會從 `getExecuteResult` 來取的結果。

```tsx
public execute(): QueryResult<TData, TVariables> {
  this.refreshClient();

  const { skip, query } = this.getOptions();
  if (skip || query !== this.previousData.query) {
    this.removeQuerySubscription();
    this.previousData.query = query;
  }

  this.updateObservableQuery();

  if (this.isMounted) this.startQuerySubscription();

  return this.getExecuteSsrResult() || this.getExecuteResult();
}
```

來看一下 `getExecuteResult` 的 implementation

```tsx
private getExecuteResult(): QueryResult<TData, TVariables> {
  const result = this.getQueryResult();
  this.startQuerySubscription();
  return result;
};
```

可以看到他從 `this.getQueryResult` 取得了 query 的結果。

`getQueryResult` 很長，我只節錄相關的部分。

```tsx
private getQueryResult = (): QueryResult<TData, TVariables> => {
  ...
  if (options.skip) {
    ...
  } else if (this.currentObservable) {
    const currentResult = this.currentObservable.getCurrentResult()
    const { data, loading, partial, networkStatus, errors } = currentResult
    ...
  }
  ...
}
```

可以看出他從 `this.currentObservable.getCurrentResult` 來取得資料，接著我們來看 `currentObservable` 是怎麼被建立出來的。

可以找到 `initializeObservableQuery`，中間有段程式是這樣。

```tsx
if (!this.currentObservable) {
  ...
  this.currentObservable = this.refreshClient().client.watchQuery({
    ...observableQueryOptions,
  })
  ...
}
```

這邊的 client 就是指 apollo client，我們來看一下 apollo client 的 watchQuery 做了什麼

```tsx
public watchQuery<T = any, TVariables = OperationVariables>(
  options: WatchQueryOptions<TVariables, T>,
): ObservableQuery<T, TVariables> {
  if (this.defaultOptions.watchQuery) {
    options = compact(this.defaultOptions.watchQuery, options);
  }

  // XXX Overwriting options is probably not the best way to do this long term...
  if (
    this.disableNetworkFetches &&
    (options.fetchPolicy === 'network-only' ||
      options.fetchPolicy === 'cache-and-network')
  ) {
    options = { ...options, fetchPolicy: 'cache-first' };
  }

  return this.queryManager.watchQuery<T, TVariables>(options);
}
```

`this.defaultOptions.watchQuery` o.O ，這就是為什麼我們的 default options 沒用，因為從一開始就用錯惹 lol。

## 後記

寫這種 trace code 的文章真的滿難的，想寫的很詳細，但這樣文章又會太長，而且充滿無關的程式碼，去除一些程式碼，就變得很像魔法，突然就找到下一個在哪，但其實中間都花了很多時間在理解程式，很難把其中的心酸寫出來 QQ
