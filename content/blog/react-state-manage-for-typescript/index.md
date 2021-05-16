---
title: React State Manage for Typescript
date: "2021-05-16T18:06:56.346Z"
description: "How to manage state of react"
tags: ["react", "state", "typescript"]
private: false
---

在這邊紀錄一下管理 state 的方式，在執行一個 network call 的時候，我們會有 loading, loaded, error 的 state，要在其中傳遞取得的資料，或者錯誤的時候，有些人會用這樣的方式來寫。

```typescript
const HomeScreen = () => {
  const apiResult = useApiCall();
  const [loading, setLoading] = useState<boolean>(false);_
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isRequestLoading(apiResult)) {
      setLoading(true);
    } else if (isRequestLoaded(apiResult)) {
      setLoading(false);
      setError(null);
      setData(apiResult.data);
    } else {
      setLoading(false);
      setError(apiResult.error);
    }
  }, [apiResult]);

  
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <DataView data={data!} />
  );
};

```

像上面這種寫法雖然可以運作，但是沒有好好的運用 type 所帶來的好處，我們可以做得更好，上面引入了三種 state， `data`, `loading` 跟 `error`，我們希望可以把他合成一個，並且減少 null check。

```typescript
enum HomeScreenStateType {
  Loading = 0,
  Loaded = 1,
  Error = 2,
};

interface HomeScreenStateLoading {
  type: HomeScreenStateType.Loading;
};
const HomeScrrenStateLoading: HomeScreenStateLoading = {
  type: HomeScreenStateType.Loading;
};
interface HomeScreenStateLoaded {
  type: HomeScreenStateType.Loaded;
  data: any;
};
function HomeScreenStateLoaded(data: any): HomeScreenStateLoaded {
  return {
    type: HomeScreenStateType.Loaded,
    data,
  };
};
interface HomeScreenStateError {
  type: HomeScreenStateType.Error;
  error: Error;
};
function HomeScreenStateError(error: Error): HomeScreenStateError {
  return {
    type: HomeScreenStateType.Error,
    error,
  };
};
state HomeScreenState = HomeScreenStateLoading | HomeScreenStateLoaded | HomeScreenStateError;

const HomeScreen = () => {
  const apiResult = useApiCall();
  const viewState = useMemo<HomeScreenState>(() => {
    if (isRequestLoading(apiResult)) {
      return HomeScreenStateLoading;
    } else if (isRequestLoaded(apiResult)) {
      return HomeScreenStateLoaded(apiResult.data);
    } else {
      return HomeScreenStateError(apiResult.error);
    };
  }, [apiResult]);

  if (viewState.type === HomeScreenStateType.Loading) {
    return <Loading />;
  };
  if (viewState.type === HomeScreenStateType.Error) {
    return <Error error={viewState.error} />
  };
  return <DataView data={viewState.data} />
};
```

雖然包含 type definitaion 的時候，下面的行數遠多於上面的行數，但是下面的程式卻更為整潔，更容易閱讀，並且一次只會動到一個 state，減少我們犯錯的機會，我們讓 type system 變成了一個助力，省去不必要的 null check，這種作法在 kotlin 也很常用到，透過 kotlin 的 `sealed class`，聽說 swift 的 `enum` 也可以做到同樣的事情，不過我跟 swift 相當不熟，所以不太清楚。

