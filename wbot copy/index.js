const { Client,Location,MessageMedia  } = require('whatsapp-web.js');
var qrcode = require('qrcode-terminal');
const yts = require('yt-search');
const DownloadYTFile = require('yt-dl-playlist');
const fs = require('fs');
const path = require('path') 
const downloadStatus = {};

const client = new Client();

const downloadedMusics = [];
const downloadPath = path.resolve(__dirname, 'downloads');
client.on('qr', (qr) => {
    // Generate and scan this code with your phone
  qrcode.generate(qr, {small: true})
    console.log('QR RECEIVED', qr);
});

client.on('ready', async () => {
    console.log('Client is ready!');
    await fs.readdir(path.resolve(__dirname, 'downloads'), (err, itens) => {
        itens.map(item => downloadedMusics.push(item));
        downloadStatus.baixando = false;
      });
});

client.on('message_create',async msg =>{
    console.log('SENT',msg);
   
    if(msg.body.startsWith('!play')){
                const opts = {
                  query: msg.body.split('!play')[1],
                  // pageStart: 1,
                  // pageEnd: 3, 
                }
            console.log(opts)
                const { videos } = await yts(opts);
            
                if (videos.length == 0) {
                  return msg.reply("not found");   
                }
            
                const { videoId, title, duration } = videos[0];
                console.log(videoId)
 if (downloadedMusics.includes(`${videoId}.mp3`)){
      media =  MessageMedia.fromFilePath(path.resolve(__dirname, 'downloads', `${videoId}.mp3`));
      return msg.reply(media);   
    } else if (duration.seconds >= 900) {
      return msg.reply("it should be less than 15 minutes");
    }
    if (downloadStatus.baixando == true) {
      return msg.reply("Somebody somewhere in my zipzopt is already downloading a song at the moment. Wait! (or pay me a bot server)");
    }

    downloadStatus.baixando = true;
    // msg.reply("https://www.youtube.com/watch?v="+videoId);

    const downloader = new DownloadYTFile({ 
      outputPath: downloadPath,
      ffmpegPath: './ffmpeg/bin/ffmpeg.exe',
      maxParallelDownload: 1,
    });
const download = await downloader.download(videoId, `${videoId}.mp3`);
    if (!download){
      return msg.reply("Error, please try again.");
    }

    downloadStatus.baixando = false;

    media =  MessageMedia.fromFilePath(path.resolve(__dirname, 'downloads', `${videoId}.mp3`));
    return msg.reply(media);

            }
})

client.initialize();