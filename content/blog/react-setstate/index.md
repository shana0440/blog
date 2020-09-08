---
private: true
title: react setState
date: "2020-07-20T17:06:44.156Z"
description: "just some logs"
tags: ["react", "state"]
---

今天在工作的時候，公司的 junior developer 寫出了一段程式，讓我覺得可以記錄一下，算是一個滿經典的錯誤，可以用來鑒別對於 react 的一些知識。

先來說明一下這個 component 的用途，這個 component 會送出一個 file array，並且 listen 一個 `FILE_UPLOAD_DONE` 的 event ，然後當所有 files 都上傳完了，顯示 files upload done 的 dialog。

> 有些人會想問為什麼要用 event 來通知 file upload done，在這邊說明一下這個 app 是 electron，所以 api request 會交給 electron main process 處理，而不是 rendering process。

下面是 junior developer 寫出來的程式。

```tsx
interface FileRecord {
  path: string
  isDone: boolean
}

const FilesUpload = () => {
  const ipcRender = useContext(IpcRenderContext)
  const [files, setFiles] = useState<FileRecord[]>([])
  useEffect(() => {
    const listener = filePath => {
      // problematic code
      setFiles(prev => {
        return prev.map(it =>
          it.path == filePath ? { ...it, isDone: true } : it
        )
      })
      // the files we have here, still is the data before setFiles
      const isAllFileUploaded = files.reduce(
        (acc, it) => acc && it.isDone,
        true
      )
      if (isAllFileUploaded) {
        showFilesUploadedDoneDialog()
      }
    }
    ipcRender.on("FILE_UPLOAD_DONE", listener)
    return () => {
      ipcRender.off("FILE_UPLOAD_DONE", listener)
    }
  }, [setFiles, ipcRender, files])

  return (
    <div>
      {files.map(it => (
        <div>{it.path}</div>
      ))}
      <button
        onClick={async () => {
          const selectedFiles = await openSelectFileDialog()
          setFiles(prev => {
            return [...prev, ...selectedFiles]
          })
        }}
      >
        select files
      </button>
      <button
        onClick={() => {
          ipcRender.send("UPLOAD_FILES", files)
        }}
      >
        upload
      </button>
    </div>
  )
}
```

這程式有點行數，為了避免失焦，我直接標出有問題的地方，問題就在於 `setState` 在 react 是 async operator，並不會在呼叫 setState 的當下改變 state，而會等到整個 task 完成，瀏覽器有空閒的時候才會執行，改成下面這段程式，就會運作正常。

```tsx
interface FileRecord {
  path: string
  isDone: boolean
}

const FilesUpload = () => {
  const ipcRender = useContext(IpcRenderContext)
  const [files, setFiles] = useState<FileRecord[]>([])
  useEffect(() => {
    const listener = filePath => {
      setFiles(prev => {
        return prev.map(it =>
          it.path == filePath ? { ...it, isDone: true } : it
        )
      })
    }
    ipcRender.on("FILE_UPLOAD_DONE", listener)
    return () => {
      ipcRender.off("FILE_UPLOAD_DONE", listener)
    }
  }, [setFiles, ipcRender])

  // use another `useEffect` to check all files uploaded
  useEffect(() => {
    const isAllFileUploaded = files.reduce((acc, it) => acc && it.isDone, true)
    if (isAllFileUploaded) {
      showFilesUploadedDoneDialog()
    }
  }, [files])

  return (
    <div>
      {files.map(it => (
        <div>{it.path}</div>
      ))}
      <button
        onClick={async () => {
          const selectedFiles = await openSelectFileDialog()
          setFiles(prev => {
            return [...prev, ...selectedFiles]
          })
        }}
      >
        select files
      </button>
      <button
        onClick={() => {
          ipcRender.send("UPLOAD_FILES", files)
        }}
      >
        upload
      </button>
    </div>
  )
}
```

這個問題對很多有 react 經驗的人來說，算是很容易發現問題點的，但是對於一個 junior ，或者是從 vue (我沒 angular 經驗，不知道 angular 是怎麼運作的) 轉過來的人，可能不太容易察覺，也可以鑑別出一個人到底是真的有在學習，了解 react ，還是十年如一年的工程師。

### refs

- https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous
