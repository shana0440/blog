---
title: Download a video on the niconico
date: "2021-10-13T10:48:55.178Z"
description: "A post describe how to download a video on niconico"
tags: ["writing", "HLS"]
private: true
---

## What is the problem

So, I would like to download a video on [niconico](https://www.nicovideo.jp/) and I found an amazing tool - [nndownload](https://github.com/AlexAplin/nndownload), it eazy to use and work prefectly, but I think why not write a downloader by myself, then I can understand how niconico distribute the videos, so I write a [niconico downloader](https://github.com/shana0440/niconico-downloader-go).

## How to start

Let's open an video and check the network requests on DevTools.

Take this video as a sample [山神カルタ、17 秒間に話題が 3 回転半【2021 年 9 月】](https://www.nicovideo.jp/watch/sm39371086), we can see there have a `master.m3u8?...` request, that mean niconico is using HLS, we will talk about HLS later, first we need to found where can found this url.

We can take a look the source code of [nndownload](https://github.com/AlexAplin/nndownload/blob/master/nndownload/nndownload.py), at [line 1138](https://github.com/AlexAplin/nndownload/blob/dcb2e3101f8944751d3f4c1878eb8aefc373144d/nndownload/nndownload.py#L1138), it take the url from the `template_params`, and this url is assign at [line 1454](https://github.com/AlexAplin/nndownload/blob/dcb2e3101f8944751d3f4c1878eb8aefc373144d/nndownload/nndownload.py#L1454), seems we need to send a request to get the video url, from source code, we can see how to send that request.

First we get the video information from `#js-initial-watch-data`, it have a JSON data, after we parse it, we can found the url at `.media.delivery.movie.session.urls[0].url`, this url is `https://api.dmc.nico/api/sessions`, we can found this url at DevTools and we can see the `master.m3u8` in the response of this API, now we get the video url!

Now we can try to download the video from the `master.m3u8` url, but I found out if the video is really long and it is membership only, I will get the 403 error, after I check the source code of [nndownload](https://github.com/AlexAplin/nndownload/blob/dcb2e3101f8944751d3f4c1878eb8aefc373144d/nndownload/nndownload.py#L1264) and DevTools, I found out niconico will send a heartbeat request to keep video alive, you can found the heartbeat request on DevTools, it look like `https://api.dmc.nico/api/sessions/4bfawp78bhx9lwo3w54vjhqy3d1mg3rgkpsnzfud49x3284h86-096719170a1a2425553b0102552e3531315c372b54?_format=json&_method=PUT` and the request body is almost same as the `https://api.dmc.nico/api/sessions`.

As long as we keep sending the heartbeat request, the video will keep alive, so now we finally can start to download the video.

> The video url will change everytime to keep private.

## Let's talk about HLS

HLS is used to send audio and video over the HTTP, it design by Apple.

HLS will breaks down audio and video files into smaller files, then we can download those files and play it one by one, you can know more about HLS on [Apple document](https://developer.apple.com/documentation/http_live_streaming).

HLS has three type of files, `master.m3u8`, `playlist.m3u8` and `xxxx.ts`.

### What is .m3u8

Before we start talking `master.m3u8`, I like to talk about what is `.m3u8`, it similar to `.m3u`, they are used to describe where can found the file you looking for, the `.m3u8` is for video, and `.m3u` is designed for audio.

### master.m3u8

The `master.m3u8` is used to found the playlist, each playlist is for different bandwidth, so we can switch to lower quality if network condition is bad, the following code is the example response of `master.m3u8`.

```m3u
#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=9772246,AVERAGE-BANDWIDTH=6416121,RESOLUTION=1920x1080,FRAME-RATE=59.940
1/ts/playlist.m3u8?ht2_nicovideo=60375500.8mifksnoim_r0x4e0_2pmklnbsu9ln7
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2180773,AVERAGE-BANDWIDTH=1431821,RESOLUTION=1280x720,FRAME-RATE=59.940
2/ts/playlist.m3u8?ht2_nicovideo=60375500.8mifksnoim_r0x4e0_2pmklnbsu9ln7
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1398279,AVERAGE-BANDWIDTH=918062,RESOLUTION=854x480,FRAME-RATE=59.940
3/ts/playlist.m3u8?ht2_nicovideo=60375500.8mifksnoim_r0x4e0_2pmklnbsu9ln7
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1038574,AVERAGE-BANDWIDTH=681892,RESOLUTION=640x360,FRAME-RATE=30.000
4/ts/playlist.m3u8?ht2_nicovideo=60375500.8mifksnoim_r0x4e0_2pmklnbsu9ln7
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=978081,AVERAGE-BANDWIDTH=642175,RESOLUTION=640x360,FRAME-RATE=30.000
5/ts/playlist.m3u8?ht2_nicovideo=60375500.8mifksnoim_r0x4e0_2pmklnbsu9ln7
```

You can see there have a lot of playlist for different bandwidth.

### playlist.m3u8

The `playlist.m3u8` is used to found the playable media, each segment is a single `.ts` file.

```m3u
#EXTM3U
#EXT-X-VERSION:3         # HLS version
#EXT-X-TARGETDURATION:7  # Each segment should less than 7
#EXT-X-MEDIA-SEQUENCE:1  # The segment is start from 1
#EXT-X-PLAYLIST-TYPE:VOD

#EXTINF:6.006,
1.ts?ht2_nicovideo=60375500.8u4madym0z_r0x4dr_338f5p4rtz39f
#EXTINF:6.006,
2.ts?ht2_nicovideo=60375500.8u4madym0z_r0x4dr_338f5p4rtz39f
#EXT-X-ENDLIST
```

### xxx.ts

The segment is what we really want, it contain the video and audio, to download the whole video, just download all segments from `playlist.m3u8`, and merge all segment into one file.

## References

- https://github.com/AlexAplin/nndownload
- https://en.wikipedia.org/wiki/M3U
- https://www.cloudflare.com/learning/video/what-is-http-live-streaming
