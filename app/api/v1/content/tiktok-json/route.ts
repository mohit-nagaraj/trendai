import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.NEXT_PUBLIC_APIFY_TOKEN! });

export async function POST(req: Request) {
  try {
    const { unique_id } = await req.json();
    if (!unique_id) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    const input ={
        "excludePinnedPosts": false,
        "profileScrapeSections": [
            "videos"
        ],
        "profileSorting": "latest",
        "profiles": [
            unique_id
        ],
        "resultsPerPage": 10,
        "shouldDownloadCovers": false,
        "shouldDownloadSlideshowImages": false,
        "shouldDownloadSubtitles": false,
        "shouldDownloadVideos": true,
        "videoKvStoreIdOrName": "tiktok"
    }
    console.log(input);
    const run = await client.actor('OtzYfK1ndEGdwWFKQ').call( input );
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(items);
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to scrape TikTok' }, { status: 500 });
  }
} 



// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   // Return static mock data for local/dev use
//   return NextResponse.json([
//     {
//         "id": "7524354452762037512",
//         "text": "🎯 Interviews are tough. But what if you didn’t have to do it alone?\nMeet your new interview sidekick — Final Round AI.\nIt joins your Zoom or Teams call silently and supports you in the moment:\n🧠 Understands your tone and delivery\n💬 Gives live feedback while you talk\n💡 Keeps you confident, clear, and in control\nNo rehearsals. No overthinking. Just smart, real-time guidance when it counts.\n🚀 Try it in 3 steps:\nGo to finalroundai.com\nClick “Interview Copilot”\nConnect Zoom or Teams — and let AI handle the pressure\n🎧 Focus on impressing. AI will take care of the rest.\n👇 Comment “FinalRound” and I’ll DM you the link.\n#finalroundai #MeeniTech #AIInterviewCoach #JobSearch2025 #SmartTools #Zoommeeting #CareerUpgrade #AITools #ai #tech #trending #interview",
//         "textLanguage": "en",
//         "createTime": 1751900293,
//         "createTimeISO": "2025-07-07T14:58:13.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "original sound - Meeni Tech",
//             "musicAuthor": "Meeni Tech",
//             "musicOriginal": true,
//             "playUrl": "https://v77.tiktokcdn-eu.com/e4b68de3a147e0c7045ba03bee0e7d2e/686e4aa2/video/tos/alisg/tos-alisg-v-27dcd7/oUIU4fxNBMBIpr7BCdiFQ9JEyBfVoEBIiCghUa/?a=1233&bti=ODszNWYuMDE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=250&bt=125&ft=.NpOcInz7ThHxKNKXq8Zmo&mime_type=audio_mpeg&qs=6&rc=NjRpZjlmOWZlPDw5OTY1ZkBpamxrcnU5cjV4NDMzODU8NEAyLi0uYmFfNV8xMC5iNDQzYSNob14zMmRjLmlhLS1kMS1zcw%3D%3D&vvpl=1&l=202507081055104D019C976792111B3550&btag=e000b8000",
//             "coverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "originalCoverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "musicId": "7524354495968332561"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7524354452762037512",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250707145813-7524354452762037512"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 20,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ooQAoBrH1EzEeAFr8DXIgDVAA1EeAYfBWA4DEZ~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=NKkMth2q4TWTVQIodQE86aTwjvQ%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ooQAoBrH1EzEeAFr8DXIgDVAA1EeAYfBWA4DEZ~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=NKkMth2q4TWTVQIodQE86aTwjvQ%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/db509c32c3558952be62ecb0ca39c0c0/686f9c22/video/tos/alisg/tos-alisg-pv-0037/760fdb6041794b3298b876a749014138/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=38416&bt=19208&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M29ocHU5cmt3NDMzODgzNEBpM29ocHU5cmt3NDMzODgzNEBwMWZoMmRzcmlhLS1kLzFzYSNwMWZoMmRzcmlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/db509c32c3558952be62ecb0ca39c0c0/686f9c22/video/tos/alisg/tos-alisg-pv-0037/760fdb6041794b3298b876a749014138/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=38416&bt=19208&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M29ocHU5cmt3NDMzODgzNEBpM29ocHU5cmt3NDMzODgzNEBwMWZoMmRzcmlhLS1kLzFzYSNwMWZoMmRzcmlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/a85ab961dc917a58a366f73b39c7baf3/686f9c22/video/tos/alisg/tos-alisg-pv-0037/17ca54549ef64228b4aa093089343de6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=38416&bt=19208&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M29ocHU5cmt3NDMzODgzNEBpM29ocHU5cmt3NDMzODgzNEBwMWZoMmRzcmlhLS1kLzFzYSNwMWZoMmRzcmlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/a85ab961dc917a58a366f73b39c7baf3/686f9c22/video/tos/alisg/tos-alisg-pv-0037/17ca54549ef64228b4aa093089343de6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=38416&bt=19208&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M29ocHU5cmt3NDMzODgzNEBpM29ocHU5cmt3NDMzODgzNEBwMWZoMmRzcmlhLS1kLzFzYSNwMWZoMmRzcmlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250707145813-7524354452762037512"
//         },
//         "diggCount": 158,
//         "shareCount": 0,
//         "playCount": 2314,
//         "collectCount": 23,
//         "commentCount": 12,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "finalroundai"
//             },
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "aiinterviewcoach"
//             },
//             {
//                 "name": "jobsearch2025"
//             },
//             {
//                 "name": "smarttools"
//             },
//             {
//                 "name": "zoommeeting"
//             },
//             {
//                 "name": "careerupgrade"
//             },
//             {
//                 "name": "aitools"
//             },
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             },
//             {
//                 "name": "interview"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7523974732983651591",
//         "text": "Struggle with interviews? You’re not alone.\nTalking too fast, forgetting key points, losing confidence mid-answer — it happens to everyone.\nBut now, you don’t have to go in unprepared.\n✨ Meet Final Round AI — your real-time interview companion.\nIt joins your Zoom or Teams meeting silently and supports you while you speak:\n🎯 Analyzes your tone, speed & clarity\n💬 Gives live feedback to help you stay sharp\n🧠 Boosts your confidence with smart, instant guidance\nNo memorization. No pressure. Just clear, calm support exactly when you need it.\n🚀 Try it now:\n🔗 Go to finalroundai.com\n🎧 Launch \"Interview Copilot\"\n📞 Connect with Zoom or Teams\n💼 Let AI handle the nerves while you focus on showing your best self.\n👇 Drop “FinalRound” in the comments and I’ll DM you the link!\n#FinalRoundAI #Meenitech #AIassistant #interviewcoach #TechTools #AITools #careersupport #ai #tech #trending #interview",
//         "textLanguage": "en",
//         "createTime": 1751811884,
//         "createTimeISO": "2025-07-06T14:24:44.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "original sound - Meeni Tech",
//             "musicAuthor": "Meeni Tech",
//             "musicOriginal": true,
//             "playUrl": "https://v77.tiktokcdn-eu.com/784135e92e1af4f4ae848596419bba37/686e4aa2/video/tos/alisg/tos-alisg-v-27dcd7/oEkBWcoMqUPDkBahguQzofE3FUCJZFa2IfRYFI/?a=1233&bti=ODszNWYuMDE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=250&bt=125&ft=.NpOcInz7ThHxKNKXq8Zmo&mime_type=audio_mpeg&qs=6&rc=ZTM4ZjdlZDM8ZDo1NGU2aUBpajpuNXU5cmU7NDMzODU8NEAxYzIwLl42NTUxNjMvYGE2YSNzZWUzMmRrYmlhLS1kMS1zcw%3D%3D&vvpl=1&l=202507081055104D019C976792111B3550&btag=e000b8000",
//             "coverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "originalCoverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "musicId": "7523974796150295297"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7523974732983651591",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250706142444-7523974732983651591"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 20,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oQf8q6OABACEAUgfx6DbUoIwaEAcbhV7oF7CBp~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=%2BQjzWxlKqA9XimBulgcqwcKGq6Y%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oQf8q6OABACEAUgfx6DbUoIwaEAcbhV7oF7CBp~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=%2BQjzWxlKqA9XimBulgcqwcKGq6Y%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/ad6b546026ae38ee94b1fcfd134ad896/686f9c22/video/tos/alisg/tos-alisg-pv-0037/bd4fcc60d9724955a1d49001485a5cbd/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=41460&bt=20730&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anE8eXk5cmw7NDMzODgzNEBpanE8eXk5cmw7NDMzODgzNEBjb15mMmRrYGlhLS1kLzFzYSNjb15mMmRrYGlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/ad6b546026ae38ee94b1fcfd134ad896/686f9c22/video/tos/alisg/tos-alisg-pv-0037/bd4fcc60d9724955a1d49001485a5cbd/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=41460&bt=20730&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anE8eXk5cmw7NDMzODgzNEBpanE8eXk5cmw7NDMzODgzNEBjb15mMmRrYGlhLS1kLzFzYSNjb15mMmRrYGlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 },
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/f6dacb9d85026d06ad577838c9de5069/686f9c22/video/tos/alisg/tos-alisg-pv-0037/73e143c362c54b6ca9dd2404b1ebd687/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=41460&bt=20730&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anE8eXk5cmw7NDMzODgzNEBpanE8eXk5cmw7NDMzODgzNEBjb15mMmRrYGlhLS1kLzFzYSNjb15mMmRrYGlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/f6dacb9d85026d06ad577838c9de5069/686f9c22/video/tos/alisg/tos-alisg-pv-0037/73e143c362c54b6ca9dd2404b1ebd687/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=41460&bt=20730&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anE8eXk5cmw7NDMzODgzNEBpanE8eXk5cmw7NDMzODgzNEBjb15mMmRrYGlhLS1kLzFzYSNjb15mMmRrYGlhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250706142444-7523974732983651591"
//         },
//         "diggCount": 144,
//         "shareCount": 13,
//         "playCount": 3364,
//         "collectCount": 65,
//         "commentCount": 6,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "finalroundai"
//             },
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "aiassistant"
//             },
//             {
//                 "name": "interviewcoach"
//             },
//             {
//                 "name": "techtools"
//             },
//             {
//                 "name": "aitools"
//             },
//             {
//                 "name": "careersupport"
//             },
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             },
//             {
//                 "name": "interview"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7523606431623351559",
//         "text": "Wish you had support during job interviews — not just before?\nNow you can.\n⚡ Final Round AI is your live interview assistant — it quietly joins your Zoom or Teams call and helps you in real time.\n🧠 Tracks how you speak\n💬 Gives instant feedback to keep you clear and confident\n🎯 Helps you stay calm, focused, and make a strong impression\nNo scripts. No pressure. Just smart support when it matters most.\n📍 Go to finalroundai.com\nTap “Interview Copilot” → Connect Zoom or Teams → You’re ready.\n🎧 Let AI guide you while you focus on landing the job.\n👇 Drop “FinalRound” in the comments and I’ll send you the link.\n\n#finalroundai #meenitech #InterviewTips #jobhunt2025 #SmartTech #aitools #ZoomInterview #ai #tech #trending",
//         "textLanguage": "en",
//         "createTime": 1751726132,
//         "createTimeISO": "2025-07-05T14:35:32.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "original sound - Meeni Tech",
//             "musicAuthor": "Meeni Tech",
//             "musicOriginal": true,
//             "playUrl": "https://v77.tiktokcdn-eu.com/8d211969b508039fb2c7fc612c4bb9a7/686e4aa8/video/tos/alisg/tos-alisg-v-27dcd7/ogMgHR85DGc0DgjS8kLzABwITEpPZeveooCQfn/?a=1233&bti=ODszNWYuMDE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=250&bt=125&ft=.NpOcInz7ThHxKNKXq8Zmo&mime_type=audio_mpeg&qs=6&rc=OmVpZGdlNmhoaWU0OjVlaEBpank2bXQ5cmdtNDMzODU8NEAuXi5gNDBfXi4xLjQzNDAtYSMxZWY2MmRzZGhhLS1kMS1zcw%3D%3D&vvpl=1&l=202507081055104D019C976792111B3550&btag=e000b8000",
//             "coverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "originalCoverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "musicId": "7523606495209081601"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7523606431623351559",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250705143532-7523606431623351559"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 26,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oUJoLTZhAAA2AVtbgEFlaNUDSfykelTEBCCBpI~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=k33BW9hrT%2B7hEvMg0Ck1Qiz0mxs%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oUJoLTZhAAA2AVtbgEFlaNUDSfykelTEBCCBpI~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=k33BW9hrT%2B7hEvMg0Ck1Qiz0mxs%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/a41d6b093291aabe002272883718f380/686f9c28/video/tos/alisg/tos-alisg-pv-0037/8a46a95ad61d4472b97dd3e2a3ef479f/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=36562&bt=18281&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=ajRwbW45cmxtNDMzODgzNEBpajRwbW45cmxtNDMzODgzNEBibGFxMmRrYGhhLS1kLzFzYSNibGFxMmRrYGhhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/a41d6b093291aabe002272883718f380/686f9c28/video/tos/alisg/tos-alisg-pv-0037/8a46a95ad61d4472b97dd3e2a3ef479f/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=36562&bt=18281&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=ajRwbW45cmxtNDMzODgzNEBpajRwbW45cmxtNDMzODgzNEBibGFxMmRrYGhhLS1kLzFzYSNibGFxMmRrYGhhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 },
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/3966ebeecf0ea1bd82c8ffe078c08dd4/686f9c28/video/tos/alisg/tos-alisg-pv-0037/e9ac0bf5fc5040f4b33b42b0e399652f/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=36562&bt=18281&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=ajRwbW45cmxtNDMzODgzNEBpajRwbW45cmxtNDMzODgzNEBibGFxMmRrYGhhLS1kLzFzYSNibGFxMmRrYGhhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/3966ebeecf0ea1bd82c8ffe078c08dd4/686f9c28/video/tos/alisg/tos-alisg-pv-0037/e9ac0bf5fc5040f4b33b42b0e399652f/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=36562&bt=18281&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=ajRwbW45cmxtNDMzODgzNEBpajRwbW45cmxtNDMzODgzNEBibGFxMmRrYGhhLS1kLzFzYSNibGFxMmRrYGhhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250705143532-7523606431623351559"
//         },
//         "diggCount": 20,
//         "shareCount": 0,
//         "playCount": 451,
//         "collectCount": 6,
//         "commentCount": 3,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "finalroundai"
//             },
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "interviewtips"
//             },
//             {
//                 "name": "jobhunt2025"
//             },
//             {
//                 "name": "smarttech"
//             },
//             {
//                 "name": "aitools"
//             },
//             {
//                 "name": "zoominterview"
//             },
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7523173763035221265",
//         "text": "Amazing website for mothers.........\n.\n.\n.\nWebsite Name:\nkiddoworksheets\n\n#meenitech #ai #tech #trending #students #kids #bestwebsites #freewebsite",
//         "textLanguage": "en",
//         "createTime": 1751625395,
//         "createTimeISO": "2025-07-04T10:36:35.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "original sound - Meeni Tech",
//             "musicAuthor": "Meeni Tech",
//             "musicOriginal": true,
//             "playUrl": "https://v77.tiktokcdn-eu.com/2a8354486640d96ce77d4b80c1124a3f/686e4aa9/video/tos/alisg/tos-alisg-v-27dcd7/oAITvzIDcZWfPPgXo81tXYAgGeEFLDaJvCfQ1w/?a=1233&bti=ODszNWYuMDE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=250&bt=125&ft=.NpOcInz7ThHxKNKXq8Zmo&mime_type=audio_mpeg&qs=6&rc=ODRlOjY2O2U8OWQ3NzhmNkBpM2x2dXU5cmd0NDMzODU8NEAvYy81YmI2XjAxY2E1MWJiYSM2a2xuMmRrcWdhLS1kMS1zcw%3D%3D&vvpl=1&l=202507081055104D019C976792111B3550&btag=e000b8000",
//             "coverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "originalCoverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "musicId": "7523173815804185345"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7523173763035221265",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250704103635-7523173763035221265"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 26,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocBSAi8AcIrMxidBVOPfBmHm6xAcBKwEn0E9AA~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=ObSPBDfaQ43Q0Zya8SfCMIDCiBg%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocBSAi8AcIrMxidBVOPfBmHm6xAcBKwEn0E9AA~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=ObSPBDfaQ43Q0Zya8SfCMIDCiBg%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/b32bd0e97437d9f6bb264fd234b08a7f/686f9c28/video/tos/alisg/tos-alisg-pv-0037/c899d615335e40ffbdf603db42c84cd7/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33154&bt=16577&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=Mzxza3I5cjh0NDMzODgzNEBpMzxza3I5cjh0NDMzODgzNEAyYGsvMmRrcGdhLS1kL2BzYSMyYGsvMmRrcGdhLS1kL2Bzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/b32bd0e97437d9f6bb264fd234b08a7f/686f9c28/video/tos/alisg/tos-alisg-pv-0037/c899d615335e40ffbdf603db42c84cd7/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33154&bt=16577&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=Mzxza3I5cjh0NDMzODgzNEBpMzxza3I5cjh0NDMzODgzNEAyYGsvMmRrcGdhLS1kL2BzYSMyYGsvMmRrcGdhLS1kL2Bzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/ac020d25821891f2c18f02360bea94d3/686f9c28/video/tos/alisg/tos-alisg-pv-0037/ca36344c39e44648a58edd4f78f27ebf/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33154&bt=16577&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=Mzxza3I5cjh0NDMzODgzNEBpMzxza3I5cjh0NDMzODgzNEAyYGsvMmRrcGdhLS1kL2BzYSMyYGsvMmRrcGdhLS1kL2Bzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/ac020d25821891f2c18f02360bea94d3/686f9c28/video/tos/alisg/tos-alisg-pv-0037/ca36344c39e44648a58edd4f78f27ebf/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33154&bt=16577&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=Mzxza3I5cjh0NDMzODgzNEBpMzxza3I5cjh0NDMzODgzNEAyYGsvMmRrcGdhLS1kL2BzYSMyYGsvMmRrcGdhLS1kL2Bzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250704103635-7523173763035221265"
//         },
//         "diggCount": 385,
//         "shareCount": 54,
//         "playCount": 9367,
//         "collectCount": 164,
//         "commentCount": 10,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             },
//             {
//                 "name": "students"
//             },
//             {
//                 "name": "kids"
//             },
//             {
//                 "name": "bestwebsites"
//             },
//             {
//                 "name": "freewebsite"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7522869149001927954",
//         "text": "🔥🔥Do you believe it? \nYou can get Labubu now on @temu at a discounted price!\nNew app users can even use my code【dyq4598】to get Rs.40000 coupon bundle. T&Cs apply.\n.\n.\n.\nLink:\nhttps://app.temu.com/k/elw0467l8jq\n\n#shoptemu #temufinds #temureview #temupakistan #meenitech #labubudoll #labubu",
//         "textLanguage": "en",
//         "createTime": 1751554469,
//         "createTimeISO": "2025-07-03T14:54:29.000Z",
//         "isAd": true,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "original sound - Meeni Tech",
//             "musicAuthor": "Meeni Tech",
//             "musicOriginal": true,
//             "playUrl": "https://v77.tiktokcdn-eu.com/a1a1cdd6839df4c7b8478ff4a8151ed0/686e4aa7/video/tos/alisg/tos-alisg-v-27dcd7/o8o5QJmeoBQIpCFJ3BGMYauGSZUbgHfpnmmDEy/?a=1233&bti=ODszNWYuMDE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=250&bt=125&ft=.NpOcInz7ThHxKNKXq8Zmo&mime_type=audio_mpeg&qs=6&rc=PGYzaDVkNjY3aWU4aWk6N0BpM2pmOXU5cmQ8NDMzODU8NEBjLzVhLjJeNS0xYTRfXjExYSNtYDBzMmQ0Z2dhLS1kMS1zcw%3D%3D&vvpl=1&l=202507081055104D019C976792111B3550&btag=e000b8000",
//             "coverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "originalCoverMediumUrl": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=10399&refresh_token=2f76b5d1&x-expires=1752141600&x-signature=C3kb4L3CJ3KN9rDaTyLr3jK1n8s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a",
//             "musicId": "7522869190227774225"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7522869149001927954",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250703145429-7522869149001927954"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 25,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocSmK0AxMBgiBmgIAAIAAwyfTjdwyiEBAtKBK0~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=M8ey3wQ04YsimQTwLHLDjj%2BaWhs%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocSmK0AxMBgiBmgIAAIAAwyfTjdwyiEBAtKBK0~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=M8ey3wQ04YsimQTwLHLDjj%2BaWhs%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/c5106824f7a228bf067dff97504a8d04/686f9c27/video/tos/alisg/tos-alisg-pv-0037/46615250e98c4c6ab04fe65a7e99a0a6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=39006&bt=19503&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M24zNHU5cjg8NDMzODgzNEBpM24zNHU5cjg8NDMzODgzNEBrYjNiMmRzZGdhLS1kLzFzYSNrYjNiMmRzZGdhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/c5106824f7a228bf067dff97504a8d04/686f9c27/video/tos/alisg/tos-alisg-pv-0037/46615250e98c4c6ab04fe65a7e99a0a6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=39006&bt=19503&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M24zNHU5cjg8NDMzODgzNEBpM24zNHU5cjg8NDMzODgzNEBrYjNiMmRzZGdhLS1kLzFzYSNrYjNiMmRzZGdhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/199a7130243ddab0f9ab9f22b5abf4f8/686f9c27/video/tos/alisg/tos-alisg-pv-0037/da18bfe248784199a3fe11e67ddc88d1/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=39006&bt=19503&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M24zNHU5cjg8NDMzODgzNEBpM24zNHU5cjg8NDMzODgzNEBrYjNiMmRzZGdhLS1kLzFzYSNrYjNiMmRzZGdhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/199a7130243ddab0f9ab9f22b5abf4f8/686f9c27/video/tos/alisg/tos-alisg-pv-0037/da18bfe248784199a3fe11e67ddc88d1/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=39006&bt=19503&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M24zNHU5cjg8NDMzODgzNEBpM24zNHU5cjg8NDMzODgzNEBrYjNiMmRzZGdhLS1kLzFzYSNrYjNiMmRzZGdhLS1kLzFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250703145429-7522869149001927954"
//         },
//         "diggCount": 65,
//         "shareCount": 1,
//         "playCount": 7589,
//         "collectCount": 12,
//         "commentCount": 4,
//         "mentions": [
//             "@temu"
//         ],
//         "detailedMentions": [
//             {
//                 "id": "7142258234246300718",
//                 "name": "temu",
//                 "nickName": "temu",
//                 "profileUrl": "https://www.tiktok.com/@7142258234246300718"
//             }
//         ],
//         "hashtags": [
//             {
//                 "name": ""
//             },
//             {
//                 "name": "shoptemu"
//             },
//             {
//                 "name": "temufinds"
//             },
//             {
//                 "name": "temureview"
//             },
//             {
//                 "name": "temupakistan"
//             },
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "labubudoll"
//             },
//             {
//                 "name": "labubu"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7522768627737627912",
//         "text": "used to DREAD interviews.\n\nHeart racing. Blank mind. Saying \"uh\" every 5 seconds. 😬\nBut then I found something that changed the game…\n⚡ Final Round AI — your silent interview partner.\nIt’s not prep work. It’s not a checklist.\nIt literally joins your Zoom or Teams call and helps you while you’re talking.\n🧠 Tracks how you speak\n💬 Guides you with real-time tips\n🎯 Helps you stay focused, confident, and on point\nImagine having a coach in your ear — but smarter, faster, and powered by AI.\nThis is how top candidates are staying ahead in 2025.\n📍 Try it here: finalroundai.com\nTap \"Interview Copilot\", link it with Zoom, and you’re set.\nNo pressure. No panic. Just pure confidence. 💼💪\n👇 Type “FinalRound” if you want the link — I’ll DM you right away.\n#meenitech #FinalRoundAI #CareerHack #JobTips #AIinterview #AICoach #jobinterview #TechTools #WorkSmarter #ai #tech #trending",
//         "textLanguage": "en",
//         "createTime": 1751531084,
//         "createTimeISO": "2025-07-03T08:24:44.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "Vibes",
//             "musicAuthor": "ZHRMusic",
//             "musicOriginal": false,
//             "musicAlbum": "Vibes",
//             "playUrl": "https://sf16-ies-music-sg.tiktokcdn.com/obj/tos-alisg-ve-2774/oEviZQAYB6iOrWNFCKWIMaisARu5gTBJVxkU0",
//             "coverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "originalCoverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "musicId": "7013588396048943105"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7522768627737627912",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250703082444-7522768627737627912"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 24,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/osf3PjLUZCBFnwfEAISA2AAuAm2gYogFDCVmEB~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=ZbxM4NI1MwWrjvIY5PRmeR704yE%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/osf3PjLUZCBFnwfEAISA2AAuAm2gYogFDCVmEB~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=ZbxM4NI1MwWrjvIY5PRmeR704yE%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/027758e714f93b34305c5cda848323a0/686f9c26/video/tos/alisg/tos-alisg-pv-0037/9e3279f9f16e475bb058a607ee6791cf/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=22214&bt=11107&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2lwOW85cmw2NDMzODgzNEBpM2lwOW85cmw2NDMzODgzNEBmcmpfMmRrcGdhLS1kLy1zYSNmcmpfMmRrcGdhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/027758e714f93b34305c5cda848323a0/686f9c26/video/tos/alisg/tos-alisg-pv-0037/9e3279f9f16e475bb058a607ee6791cf/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=22214&bt=11107&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2lwOW85cmw2NDMzODgzNEBpM2lwOW85cmw2NDMzODgzNEBmcmpfMmRrcGdhLS1kLy1zYSNmcmpfMmRrcGdhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/d6ad098355fcade8ada79e9e185c2384/686f9c26/video/tos/alisg/tos-alisg-pv-0037/4eac99f7fc95411d91f81528250ed0ac/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=22214&bt=11107&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2lwOW85cmw2NDMzODgzNEBpM2lwOW85cmw2NDMzODgzNEBmcmpfMmRrcGdhLS1kLy1zYSNmcmpfMmRrcGdhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/d6ad098355fcade8ada79e9e185c2384/686f9c26/video/tos/alisg/tos-alisg-pv-0037/4eac99f7fc95411d91f81528250ed0ac/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=22214&bt=11107&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2lwOW85cmw2NDMzODgzNEBpM2lwOW85cmw2NDMzODgzNEBmcmpfMmRrcGdhLS1kLy1zYSNmcmpfMmRrcGdhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00078000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250703082444-7522768627737627912"
//         },
//         "diggCount": 1233,
//         "shareCount": 128,
//         "playCount": 34100,
//         "collectCount": 887,
//         "commentCount": 9,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "finalroundai"
//             },
//             {
//                 "name": "careerhack"
//             },
//             {
//                 "name": "jobtips"
//             },
//             {
//                 "name": "aiinterview"
//             },
//             {
//                 "name": "aicoach"
//             },
//             {
//                 "name": "jobinterview"
//             },
//             {
//                 "name": "techtools"
//             },
//             {
//                 "name": "worksmarter"
//             },
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7522374394451168520",
//         "text": "👩‍⚕️🩺Amazing website for medical students.......\n👉🔗Website Name:\nhuman.biodigital.com\n\n#MeeniTech #AITools #ai #tech #trending #medicalstudent #medical #viral #students #bestwebsite",
//         "textLanguage": "en",
//         "createTime": 1751439295,
//         "createTimeISO": "2025-07-02T06:54:55.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "Vibes",
//             "musicAuthor": "ZHRMusic",
//             "musicOriginal": false,
//             "musicAlbum": "Vibes",
//             "playUrl": "https://sf16-ies-music-sg.tiktokcdn.com/obj/tos-alisg-ve-2774/oEviZQAYB6iOrWNFCKWIMaisARu5gTBJVxkU0",
//             "coverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "originalCoverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "musicId": "7013588396048943105"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7522374394451168520",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250702065455-7522374394451168520"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 30,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocBiW1v5Eh0BKBMBOkmBfAFKvMAiAAmwAMx0Ij~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=jGzifgJ7kgSAVx57tCUlbglis1s%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ocBiW1v5Eh0BKBMBOkmBfAFKvMAiAAmwAMx0Ij~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=jGzifgJ7kgSAVx57tCUlbglis1s%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/dc783c0ea45dd4d94273732ff1a7a955/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/5d3432f90169462699e3f6e8f9b91329/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=27690&bt=13845&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2pxcWo5cmlnNDMzODgzNEBpM2pxcWo5cmlnNDMzODgzNEAuNHJiMmQ0Y2ZhLS1kLy1zYSMuNHJiMmQ0Y2ZhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/dc783c0ea45dd4d94273732ff1a7a955/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/5d3432f90169462699e3f6e8f9b91329/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=27690&bt=13845&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2pxcWo5cmlnNDMzODgzNEBpM2pxcWo5cmlnNDMzODgzNEAuNHJiMmQ0Y2ZhLS1kLy1zYSMuNHJiMmQ0Y2ZhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/3cc7583124ca8ee646af6a9643a24c18/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/77cedbcfdd504a4c88c391b0538c8bae/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=27690&bt=13845&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2pxcWo5cmlnNDMzODgzNEBpM2pxcWo5cmlnNDMzODgzNEAuNHJiMmQ0Y2ZhLS1kLy1zYSMuNHJiMmQ0Y2ZhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/3cc7583124ca8ee646af6a9643a24c18/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/77cedbcfdd504a4c88c391b0538c8bae/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=27690&bt=13845&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M2pxcWo5cmlnNDMzODgzNEBpM2pxcWo5cmlnNDMzODgzNEAuNHJiMmQ0Y2ZhLS1kLy1zYSMuNHJiMmQ0Y2ZhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250702065455-7522374394451168520"
//         },
//         "diggCount": 229,
//         "shareCount": 28,
//         "playCount": 6255,
//         "collectCount": 135,
//         "commentCount": 18,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "aitools"
//             },
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             },
//             {
//                 "name": "medicalstudent"
//             },
//             {
//                 "name": "medical"
//             },
//             {
//                 "name": "viral"
//             },
//             {
//                 "name": "students"
//             },
//             {
//                 "name": "bestwebsite"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7522028360696974599",
//         "text": "😬 Freeze up in interviews? Talk too much? Forget what to say?\nYou’re not alone — but now, you’ve got backup. 🤖💼\nMeet Final Round AI — your real-time interview wingman.\n🎧 Joins your Zoom or Teams call\n🧠 Analyzes your tone, clarity & pacing\n⚡ Gives instant tips and feedback as you speak\n💬 Helps you stay confident, clear & on point\nThis isn’t prep work — this is live support while you're in the hot seat. 🔥\nYou're not just answering questions — you're crushing them.\n🚀 Ready to try it?\n🔗 Visit finalroundai.com\n📞 Launch “Interview Copilot”\n🎯 Let AI do the heavy lifting — you focus on landing the job\n✅ Stay sharp. Stay calm. Win the room.\n👇 Comment “FinalRound” & I’ll DM you the link!\n#FinalRoundAI #interviewcoach #MeeniTech #SmartTools #CareerBoost #jobready #Zoom #AITools #NextGenTech #ai #tech #trending #SkillUp #interview",
//         "textLanguage": "en",
//         "createTime": 1751358730,
//         "createTimeISO": "2025-07-01T08:32:10.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "Expectations",
//             "musicAuthor": "Chris Alan Lee",
//             "musicOriginal": false,
//             "playUrl": "https://sf16-ies-music-sg.tiktokcdn.com/obj/tos-alisg-ve-2774/057e20e3caec4ae8a468e6a33201344b",
//             "coverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/47ccb712fc744e03b97c5b232ff279cc.jpeg",
//             "originalCoverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/47ccb712fc744e03b97c5b232ff279cc.jpeg",
//             "musicId": "6777282406496864257"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7522028360696974599",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250701083210-7522028360696974599"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 30,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oklABIY4AIBcOAGl9AAJAEaWnPj8cAoiAZiGv~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=aNtXmJsF5CLn6iZozDKEc3F%2FXN0%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oklABIY4AIBcOAGl9AAJAEaWnPj8cAoiAZiGv~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=aNtXmJsF5CLn6iZozDKEc3F%2FXN0%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/ff126066f45355c2fd9ec7a528f6c8a1/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/ed9d1d4baafe43be89eefb0b09a549f1/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33266&bt=16633&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M253Z3k5cjRzNDMzODgzNEBpM253Z3k5cjRzNDMzODgzNEAuYHNjMmRrbmVhLS1kLy1zYSMuYHNjMmRrbmVhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/ff126066f45355c2fd9ec7a528f6c8a1/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/ed9d1d4baafe43be89eefb0b09a549f1/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33266&bt=16633&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M253Z3k5cjRzNDMzODgzNEBpM253Z3k5cjRzNDMzODgzNEAuYHNjMmRrbmVhLS1kLy1zYSMuYHNjMmRrbmVhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/1905754429278c4cc325c7c1d2b1f84c/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/2b63628434bd4acc9b4f61ad4a3060c6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33266&bt=16633&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M253Z3k5cjRzNDMzODgzNEBpM253Z3k5cjRzNDMzODgzNEAuYHNjMmRrbmVhLS1kLy1zYSMuYHNjMmRrbmVhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/1905754429278c4cc325c7c1d2b1f84c/686f9c2c/video/tos/alisg/tos-alisg-pv-0037/2b63628434bd4acc9b4f61ad4a3060c6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=33266&bt=16633&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M253Z3k5cjRzNDMzODgzNEBpM253Z3k5cjRzNDMzODgzNEAuYHNjMmRrbmVhLS1kLy1zYSMuYHNjMmRrbmVhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250701083210-7522028360696974599"
//         },
//         "diggCount": 90,
//         "shareCount": 1,
//         "playCount": 1485,
//         "collectCount": 29,
//         "commentCount": 6,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "finalroundai"
//             },
//             {
//                 "name": "interviewcoach"
//             },
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "smarttools"
//             },
//             {
//                 "name": "careerboost"
//             },
//             {
//                 "name": "jobready"
//             },
//             {
//                 "name": "zoom"
//             },
//             {
//                 "name": "aitools"
//             },
//             {
//                 "name": "nextgentech"
//             },
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             },
//             {
//                 "name": "skillup"
//             },
//             {
//                 "name": "interview"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7521753917152136456",
//         "text": "😰 Got a job interview coming up?\nWish someone could guide you live while you speak? Now it’s possible. 🤖🎧\n\nFinal Round AI just launched your ultimate interview sidekick:\n🎯 Interview Copilot — an AI that joins your interview, listens in, and gives real-time tips, feedback & confidence boosts.\n\n🚫 No more freezing up.\n🚫 No more rambling.\n✅ Just clear, confident answers — exactly when you need them.\n\n🔥 Here’s how to get started:\n🔗 Go to finalroundai.com\n🧠 Open Interview Copilot\n📞 Connect it to Zoom or Teams\n💬 Let the AI guide you — while you stay calm and crush it.\n\n💥 Speak with impact. Think on your feet. Land the job.\n\n👇 Drop “FinalRound” in the comments if you want the link sent directly to you!\n\n#ai #interview #LearnOnTikTok #job #CareerCoach #finalroundai  #meenitech  #Tech #trending ",
//         "textLanguage": "en",
//         "createTime": 1751294809,
//         "createTimeISO": "2025-06-30T14:46:49.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "Vibes",
//             "musicAuthor": "ZHRMusic",
//             "musicOriginal": false,
//             "musicAlbum": "Vibes",
//             "playUrl": "https://sf16-ies-music-sg.tiktokcdn.com/obj/tos-alisg-ve-2774/oEviZQAYB6iOrWNFCKWIMaisARu5gTBJVxkU0",
//             "coverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "originalCoverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "musicId": "7013588396048943105"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7521753917152136456",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250630144649-7521753917152136456"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 32,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o0vJKYcakBot4D1BAzEjEiUwlgKBkGAiAIAAi~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=OUT8NdkQ9IrmjTV7gCiNC3%2B%2FH9E%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o0vJKYcakBot4D1BAzEjEiUwlgKBkGAiAIAAi~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=OUT8NdkQ9IrmjTV7gCiNC3%2B%2FH9E%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/e2f4d955510acc2b5d5492350a492aa5/686f9c2e/video/tos/alisg/tos-alisg-pv-0037/e888005532424861bd04765a74567add/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=3936&bt=1968&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anZ3Z3I5cm1kNDMzODczNEBpanZ3Z3I5cm1kNDMzODczNEBfNW80MmRjMWVhLS1kMTFzYSNfNW80MmRjMWVhLS1kMTFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/e2f4d955510acc2b5d5492350a492aa5/686f9c2e/video/tos/alisg/tos-alisg-pv-0037/e888005532424861bd04765a74567add/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=3936&bt=1968&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anZ3Z3I5cm1kNDMzODczNEBpanZ3Z3I5cm1kNDMzODczNEBfNW80MmRjMWVhLS1kMTFzYSNfNW80MmRjMWVhLS1kMTFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/b9ef16b8f54515d685bf8d04cda641b3/686f9c2e/video/tos/alisg/tos-alisg-pv-0037/3bc648a47b964b52b6e86ef688d804fb/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=3936&bt=1968&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anZ3Z3I5cm1kNDMzODczNEBpanZ3Z3I5cm1kNDMzODczNEBfNW80MmRjMWVhLS1kMTFzYSNfNW80MmRjMWVhLS1kMTFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/b9ef16b8f54515d685bf8d04cda641b3/686f9c2e/video/tos/alisg/tos-alisg-pv-0037/3bc648a47b964b52b6e86ef688d804fb/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=3936&bt=1968&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=anZ3Z3I5cm1kNDMzODczNEBpanZ3Z3I5cm1kNDMzODczNEBfNW80MmRjMWVhLS1kMTFzYSNfNW80MmRjMWVhLS1kMTFzcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250630144649-7521753917152136456"
//         },
//         "diggCount": 23,
//         "shareCount": 0,
//         "playCount": 509,
//         "collectCount": 7,
//         "commentCount": 1,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "ai"
//             },
//             {
//                 "name": "interview"
//             },
//             {
//                 "name": "learnontiktok"
//             },
//             {
//                 "name": "job"
//             },
//             {
//                 "name": "careercoach"
//             },
//             {
//                 "name": "finalroundai"
//             },
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "tech"
//             },
//             {
//                 "name": "trending"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     },
//     {
//         "id": "7521640130281491720",
//         "text": "✅👉Step into the 🤖AI era with confidence.😎\nOpenAI Academy gives you the tools and knowledge to actually use artificial intelligence \n........Not just watch others do it. 🚀\n.\n.\n.\n#openai #LearnAI #meenitech #aitools #chatgpt #prompt #GPT4 #AIforBeginners #FutureSkills #SkillUp #MakeMoneyWithAI",
//         "textLanguage": "en",
//         "createTime": 1751268338,
//         "createTimeISO": "2025-06-30T07:25:38.000Z",
//         "isAd": false,
//         "authorMeta": {
//             "id": "7337708524620203026",
//             "name": "meenitech",
//             "profileUrl": "https://www.tiktok.com/@meenitech",
//             "nickName": "Meeni Tech",
//             "verified": false,
//             "signature": "Keep up with Tech, Ai, tutorials and reviews for easy-to-understand tech content",
//             "bioLink": "linktr.ee/meenitech",
//             "originalAvatarUrl": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "avatar": "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/d76530cf776458e5ef6f57d7754d33ce~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=88fb6601&x-expires=1752141600&x-signature=EbhMumrysjlQhgabxiwfG3223Ww%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
//             "commerceUserInfo": {
//                 "commerceUser": true,
//                 "category": "Others",
//                 "categoryButton": false
//             },
//             "privateAccount": false,
//             "region": "PK",
//             "roomId": "",
//             "ttSeller": false,
//             "following": 0,
//             "friends": 0,
//             "fans": 149800,
//             "heart": 2400000,
//             "video": 395,
//             "digg": 0
//         },
//         "musicMeta": {
//             "musicName": "Vibes",
//             "musicAuthor": "ZHRMusic",
//             "musicOriginal": false,
//             "musicAlbum": "Vibes",
//             "playUrl": "https://sf16-ies-music-sg.tiktokcdn.com/obj/tos-alisg-ve-2774/oEviZQAYB6iOrWNFCKWIMaisARu5gTBJVxkU0",
//             "coverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "originalCoverMediumUrl": "https://p16-sg.tiktokcdn.com/aweme/200x200/tos-alisg-v-2774/oseds8fVMAKIAsAe2sGjA0IusIAuLfMsfLurEz.jpeg",
//             "musicId": "7013588396048943105"
//         },
//         "webVideoUrl": "https://www.tiktok.com/@meenitech/video/7521640130281491720",
//         "mediaUrls": [
//             "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250630072538-7521640130281491720"
//         ],
//         "videoMeta": {
//             "height": 1024,
//             "width": 576,
//             "duration": 31,
//             "coverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o4ABA4OiI3oIfCaA1BDjfEC3UYOVEuFgADiCNi~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=alCGke6kimQ0Bmx%2FCzLRV7Ke%2BQo%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "originalCoverUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o4ABA4OiI3oIfCaA1BDjfEC3UYOVEuFgADiCNi~tplv-tiktokx-origin.image?dr=10395&x-expires=1752141600&x-signature=alCGke6kimQ0Bmx%2FCzLRV7Ke%2BQo%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
//             "definition": "540p",
//             "format": "mp4",
//             "subtitleLinks": [
//                 {
//                     "language": "eng-US",
//                     "downloadLink": "https://v16-webapp.tiktok.com/8db9d6ae6cf3679520a08e86254cbda8/686f9c2d/video/tos/alisg/tos-alisg-pv-0037/f3e243091abb46d39490fa37d00d19b6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=16430&bt=8215&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M21wbm05cnU2NDMzODgzNEBpM21wbm05cnU2NDMzODgzNEA2Yi9pMmRza2VhLS1kLy1zYSM2Yi9pMmRza2VhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/8db9d6ae6cf3679520a08e86254cbda8/686f9c2d/video/tos/alisg/tos-alisg-pv-0037/f3e243091abb46d39490fa37d00d19b6/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=16430&bt=8215&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M21wbm05cnU2NDMzODgzNEBpM21wbm05cnU2NDMzODgzNEA2Yi9pMmRza2VhLS1kLy1zYSM2Yi9pMmRza2VhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "MT",
//                     "sourceUnabbreviated": "machine translation",
//                     "version": "4"
//                 },
//                 {
//                     "language": "urd-PK",
//                     "downloadLink": "https://v16-webapp.tiktok.com/fa46a02fa4b72d5411c17c069d87099b/686f9c2d/video/tos/alisg/tos-alisg-pv-0037/b701b12d1f69404bbdb7f88e5737bc30/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=16430&bt=8215&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M21wbm05cnU2NDMzODgzNEBpM21wbm05cnU2NDMzODgzNEA2Yi9pMmRza2VhLS1kLy1zYSM2Yi9pMmRza2VhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "tiktokLink": "https://v16-webapp.tiktok.com/fa46a02fa4b72d5411c17c069d87099b/686f9c2d/video/tos/alisg/tos-alisg-pv-0037/b701b12d1f69404bbdb7f88e5737bc30/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=16430&bt=8215&cs=0&ds=4&ft=-ElcomH1PD12NjihOh-UxKJ5SY3W3wv25XcAp&mime_type=video_mp4&qs=13&rc=M21wbm05cnU2NDMzODgzNEBpM21wbm05cnU2NDMzODgzNEA2Yi9pMmRza2VhLS1kLy1zYSM2Yi9pMmRza2VhLS1kLy1zcw%3D%3D&l=202507081055104D019C976792111B3550&btag=e00048000",
//                     "source": "ASR",
//                     "sourceUnabbreviated": "automatic speech recognition",
//                     "version": "1:whisper_lid"
//                 }
//             ],
//             "downloadAddr": "https://api.apify.com/v2/key-value-stores/bGSlbK85PXHJ3Ia8T/records/video-meenitech-20250630072538-7521640130281491720"
//         },
//         "diggCount": 58,
//         "shareCount": 2,
//         "playCount": 797,
//         "collectCount": 21,
//         "commentCount": 3,
//         "mentions": [],
//         "detailedMentions": [],
//         "hashtags": [
//             {
//                 "name": "openai"
//             },
//             {
//                 "name": "learnai"
//             },
//             {
//                 "name": "meenitech"
//             },
//             {
//                 "name": "aitools"
//             },
//             {
//                 "name": "chatgpt"
//             },
//             {
//                 "name": "prompt"
//             },
//             {
//                 "name": "gpt4"
//             },
//             {
//                 "name": "aiforbeginners"
//             },
//             {
//                 "name": "futureskills"
//             },
//             {
//                 "name": "skillup"
//             },
//             {
//                 "name": "makemoneywithai"
//             }
//         ],
//         "effectStickers": [],
//         "isSlideshow": false,
//         "isPinned": false,
//         "isSponsored": false,
//         "input": "@meenitech",
//         "fromProfileSection": "videos"
//     }
// ]);
// } 