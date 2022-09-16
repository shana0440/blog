---
title: Apollo Optimistic Response
date: "2021-05-29T10:04:21.236Z"
description: "When optimistic response not works"
tags: ["writing", "graphql", "apollo", "react", "mutation", "ux"]
private: false
---

在使用 mutation 的時候，apollo client 提供一個叫做 optimistic response 的功能，讓我們能在得到 response 之前，先使用一個假的回應，來修改我們的 UI，提供使用者一個較好的 UX。

舉例來說，我們可能想要在使用者按下刪除留言的時候，就立刻把留言刪除，而不是等 server response 之後才刪除，讓使用者有立即的回饋。

##### example

```ts
const DeleteCommentDocument = gql`
  mutation DeleteComment($commentID: ID!) {
    deleteComment(commentID: $commentID) {
      id
      deletedAt
    }
  }
`

function useDeleteComment() {
  const [mutate] = useMutation(DeleteCommentDocument)
  return useCallback(
    (id: string) => {
      mutate({
        variables: { commentID: id },
        optimisticResponse: {
          deleteComment: {
            __typename: "Comment",
            id: id,
            deletedAt: new Date(),
          },
        },
      })
    },
    [mutate]
  )
}
```

但是在有些情況下 optimistic response 不會有作用，就是在 fetch-policy 是 `network-only` or `no-cache` 的時候。

原因是出在 optimistic response 是修改 local 的 cache，並且 mutation 會通知 query observer update result，接著 query observer 會透過 [fetchQueryByPolicy](https://github.com/apollographql/apollo-client/blob/18b439e1b151f1e41385ff5cd3186a230cefee4c/src/core/QueryManager.ts#L1030) 來根據目前的 `fetchPolicy` 決定傳什麼資料給 subscriber。

從 source code 可以看到 `fetchQueryByPolicy` 會回傳 `[resultsFromCache]`, `[resultsFromCache, resultsFromLink]` or `[resultsFromLink]`，這些代表著 subscriber 會收到哪些資料，當 `fetchPolicy` 是 `network-only` or `no-cache` 的時候並不會收到來自 cache 的資料，因此就算設定了 optimistic response ，UI 也不會有改變。

## References

- https://github.com/apollographql/apollo-client
