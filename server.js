const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('youtube-dl-exec');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ====== APIFY API KEY (AMAN DI BACKEND) ======
const APIFY_API_KEY = 'apify_api_auWgjo0eFfap8Sb4icbPuSRVkEJdKc0dQqi0';

// ====== FUNGSI DOWNLOAD DENGAN APIFY ======
async function downloadWithApify(url, platform) {
    let actorId = 'apify/tiktok-scraper';
    if (platform === 'instagram') actorId = 'apify/instagram-scraper';
    else if (platform === 'pinterest') actorId = 'apify/pinterest-scraper';

    try {
        const runRes = await axios.post(
            `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_API_KEY}`,
            {
                directUrls: [url],
                resultsLimit: 1,
                shouldDownloadVideo: true
            }
        );

        const runId = runRes.data.data.id;

        let status = 'RUNNING';
        let result = null;
        while (status === 'RUNNING' || status === 'READY') {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const statusRes = await axios.get(
                `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_KEY}`
            );
            status = statusRes.data.data.status;

            if (status === 'SUCCEEDED') {
                const resultRes = await axios.get(
                    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_API_KEY}`
                );
                result = resultRes.data;
                break;
            } else if (status === 'FAILED' || status === 'TIMED-OUT') {
                throw new Error('Download gagal atau timeout');
            }
        }

        if (result && result.length > 0) {
            const item = result[0];
            return {
                title: item.text || item.caption || 'Video',
                downloadUrl: item.videoUrl || item.videoURL || item.downloadUrl || item.url
            };
        } else {
            throw new Error('Tidak ada hasil dari Apify');
        }
    } catch (error) {
        console.error('Apify Error:', error.message);
        throw error;
    }
}

// ====== ENDPOINT DOWNLOAD ======
app.post('/api/download', async (req, res) => {
    const { url, platform } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL tidak boleh kosong' });
    }

    try {
        // ====== YOUTUBE ======
        if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
            const result = await exec(url, {
                dumpSingleJson: true,
                noWarnings: true,
                noCallHome: true,
                noCheckCertificate: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true,
                format: 'best[height<=720]'
            });

            const videoUrl = result.url || result.webpage_url;
            const title = result.title || 'video';
            return res.json({
                success: true,
                title: title,
                downloadUrl: videoUrl,
                platform: 'youtube'
            });
        }

        // ====== TIKTOK, INSTAGRAM, PINTEREST (pakai Apify) ======
        let detectedPlatform = platform;
        if (!detectedPlatform) {
            if (url.includes('tiktok.com')) detectedPlatform = 'tiktok';
            else if (url.includes('instagram.com')) detectedPlatform = 'instagram';
            else if (url.includes('pinterest.com')) detectedPlatform = 'pinterest';
            else detectedPlatform = 'tiktok';
        }

        const result = await downloadWithApify(url, detectedPlatform);
        return res.json({
            success: true,
            title: result.title,
            downloadUrl: result.downloadUrl,
            platform: detectedPlatform
        });

    } catch (error) {
        console.error('Download Error:', error.message);
        return res.status(500).json({
            error: 'Terjadi kesalahan saat memproses download',
            detail: error.message
        });
    }
});

// ====== ENDPOINT STATUS ======
app.get('/api/status', (req, res) => {
    res.json({ status: 'Joell Downloader aktif', version: '1.0.0' });
});

// ====== JALANKAN SERVER ======
app.listen(PORT, () => {
    console.log(`✅ Joell Downloader running on http://localhost:${PORT}`);
});
