import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.NEXT_PUBLIC_APIFY_TOKEN! });

export async function POST(req: Request) {
  try {
    const { username, resultsLimit = 30 } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    const run = await client.actor('xMc5Ga1oCONPmWJIa').call({ username: [username], resultsLimit });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to scrape Instagram' }, { status: 500 });
  }
} 

// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   // Return static mock data for local/dev use
//   return NextResponse.json([
//     {
//         "inputUrl": "https://www.instagram.com/vibelayer_app",
//         "id": "3655232771961404159",
//         "type": "Video",
//         "shortCode": "DK5_tcAIDr_",
//         "caption": "🚨 Tired of staring at a boring desktop all day?\nWhat if your screen actually vibed with you?\n\n✨ Meet VibeLayer - your adorable, always-on-top sticker companion that brings life to your workspace!\n\n💻 Now launching our waitlist site - be the first to get early access + exclusive vibes 👇\n🔗 Link in bio\n\n—\n\n✅ Drop stickers anywhere on your screen\n✅ Import from your files, URLs, Giphy, or Unsplash\n✅ One-click background removal\n✅ Fully offline. Fully fun.\n\n---\n\n🐾 Your screen deserves a personality.\nJoin the VibeLayer waitlist today!\n\n🖼️💌🎉\n#VibeLayer #BuildInPublic #IndieDev #Waitlist #ElectronApp #DesktopApp #DevTools #Personalization #WebDev #NextJS #TailwindCSS #Supabase #TechStartups #AestheticVibes #ProductivityHacks #UIUX #SoftwareDesign #DevLife #StickerApp #InstaTech #StartupLaunch #LaunchDay #EarlyAccess #ProductHunt",
//         "hashtags": [
//             "VibeLayer",
//             "BuildInPublic",
//             "IndieDev",
//             "Waitlist",
//             "ElectronApp",
//             "DesktopApp",
//             "DevTools",
//             "Personalization",
//             "WebDev",
//             "NextJS",
//             "TailwindCSS",
//             "Supabase",
//             "TechStartups",
//             "AestheticVibes",
//             "ProductivityHacks",
//             "UIUX",
//             "SoftwareDesign",
//             "DevLife",
//             "StickerApp",
//             "InstaTech",
//             "StartupLaunch",
//             "LaunchDay",
//             "EarlyAccess",
//             "ProductHunt"
//         ],
//         "mentions": [],
//         "url": "https://www.instagram.com/p/DK5_tcAIDr_/",
//         "commentsCount": 0,
//         "firstComment": "",
//         "latestComments": [],
//         "dimensionsHeight": 1137,
//         "dimensionsWidth": 640,
//         "displayUrl": "https://instagram.fagc1-1.fna.fbcdn.net/v/t51.2885-15/504115930_17842214910518618_1491707937082701436_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=instagram.fagc1-1.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QFLT8mWYPPg-_df4tMYZf26m8_bo3tdu1HnY-xkgFdBcdadBTIuusJFUoLJIyTFUW0&_nc_ohc=UCtg0pfb55wQ7kNvwGwDIQJ&_nc_gid=kiYxmjUcnWvkHMMc6lRg2A&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfTRbnIwfCvq3UALZthmpt4AH0hDb_oF3GdS5_fTAn4Isg&oe=6872B505&_nc_sid=10d13b",
//         "images": [],
//         "videoUrl": "https://instagram.fagc1-2.fna.fbcdn.net/o1/v/t16/f2/m86/AQNOVRkPDdzQMVlf_ay1tKR7ggaQ3J19UmPD01ycF2s7Ujhi1s_McaJ56eLeb29pQycaoFwxbuxvSQds2-rNutFFHXLpX65N9uH1R4I.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzE4LmJhc2VsaW5lIn0&_nc_cat=100&vs=30777839105136677_1837770839&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9DMjQ1MkYyQjJDOEMxRERERTFDQTEyRjMzQTRDOTNBQl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRnZuT1I2YmhlZVpfMXNGQUQxaVZXNzhiTzVXYnFfRUFBQUYVAgLIARIAKAAYABsAFQAAJsjCpYzzhb1AFQIoAkMzLBdAPhmZmZmZmhgSZGFzaF9iYXNlbGluZV8xX3YxEQB1%2Fgdl5p0BAA%3D%3D&_nc_rid=91c53d5f69&ccb=9-4&oh=00_AfSAsustPbG8Pq24pls4xRh7zRowmnuRaCJ7yMjT7ft8Wg&oe=686ECDBE&_nc_sid=10d13b",
//         "alt": null,
//         "likesCount": 3,
//         "videoViewCount": 0,
//         "videoPlayCount": 20,
//         "timestamp": "2025-06-15T03:24:40.000Z",
//         "childPosts": [],
//         "locationName": "Bangalore, India",
//         "locationId": "106377336067638",
//         "ownerFullName": "VibeLayer",
//         "ownerUsername": "vibelayer_app",
//         "ownerId": "75383006617",
//         "productType": "clips",
//         "videoDuration": 30.116,
//         "isSponsored": false,
//         "taggedUsers": [
//             {
//                 "full_name": "ΜØĦƗŦ ŇΔǤΔŘΔĴ",
//                 "id": "40445051406",
//                 "is_verified": false,
//                 "profile_pic_url": "https://instagram.fagc1-1.fna.fbcdn.net/v/t51.2885-19/501562547_18053356346347407_1901417916896172794_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fagc1-1.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QFLT8mWYPPg-_df4tMYZf26m8_bo3tdu1HnY-xkgFdBcdadBTIuusJFUoLJIyTFUW0&_nc_ohc=vBTY7GrFl-sQ7kNvwGIyQGM&_nc_gid=kiYxmjUcnWvkHMMc6lRg2A&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfTHYCRBa3L0yQ25qVdKVZFye7_MvLTKJWOCKjPE9qE9ig&oe=6872B405&_nc_sid=10d13b",
//                 "username": "mohit_nagaraj"
//             }
//         ],
//         "musicInfo": {
//             "artist_name": "Blood Soul Beats",
//             "song_name": "CLASH",
//             "uses_original_audio": false,
//             "should_mute_audio": false,
//             "should_mute_audio_reason": "",
//             "audio_id": "596023469802339"
//         },
//         "isCommentsDisabled": false
//     }
//   ]);
// } 