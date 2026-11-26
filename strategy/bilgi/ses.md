# Ses bilgi dosyası (kanal-ses-tasarim)

Bulgular tarihli ve kaynaklıdır. Eski bulgu silinmez; yanlış çıkan "GEÇERSİZ (tarih, neden)" diye işaretlenir.
Doğrulanmamış rakamlar **[doğrulanmalı]** diye işaretli. Sayfaların çoğu bu makineden açılmadı; bilgiler arama özetlerine dayanır.

---

## TTS seçenekleri karşılaştırması (2026-11-26)

Varsayılan kullanım: ayda ~20 video × ~30 sn = 10-15 dk ses. Türkçe konuşma ≈ 13-15 karakter/sn olduğundan
15 dk ≈ **13.500 karakter**; tekrar denemelerle (×3) ≈ **40.000 karakter/ay** (tahmin).

| Seçenek | Türkçe kalite / duygu | Karakter sesi ayırma | Ticari + YouTube para kazanma | Aylık maliyet (40 bin krk.) | Ücretsiz kota | Anahtar | Kelime zamanlaması | Remotion |
|---|---|---|---|---|---|---|---|---|
| **ElevenLabs** (Eleven v3 / Multilingual v2) | Piyasadaki en ifadeli model; v3 ses etiketleri ([sighs], [laughs], [whispers]) ile oyunculuk. Türkçe destekli (v3: 70+ dil) | Çok iyi: **Voice Design** ile metin tarifinden özgün ses üretilir (klon değil) | **Yalnızca ücretli planda** ticari lisans; ücretsiz plan ticari kullanılamaz + atıf ister. Beta özellik çıktısı ticari kullanılamaz | Starter $6 (30 bin kredi) yetmeyebilir; Creator ~$22 (100-121 bin kredi) rahat [doğrulanmalı] | 10 bin kredi/ay (yalnız deneme, ticari değil) | elevenlabs.io > Profil > API Keys | **Var**: `/with-timestamps` karakter düzeyinde `alignment` döner. v3 ile çalıştığı **[doğrulanmalı]**; Multilingual v2'de varsayılan | Kolay: JSON'u kelimelere birleştir → `Caption[]` |
| **Microsoft Azure Speech** (tr-TR nöral) | Temiz, anlaşılır ama haber/eğitim tonu; Türkçe yalnız 2 hazır ses: **tr-TR-EmelNeural** (K), **tr-TR-AhmetNeural** (E). Türkçe konuşma stilleri (cheerful vb.) bulunamadı [doğrulanmalı] | Zayıf: 2 ses + SSML `prosody` (hız/perde) ile 4 karakter ayrıştırmak zor. Çok dilli/HD seslerin Türkçe desteği [doğrulanmalı] | Ücretli kademede hazır nöral ses çıktısı ticari kullanılabilir (Product Terms, MS Q&A). F0 ücretsiz kademede ticari kullanım [doğrulanmalı] | **0 $** (kota içinde); sonrası ~15-16 $/1M krk. [doğrulanmalı] | **0,5 milyon karakter/ay** (nöral, HD olmayan) | portal.azure.com > Speech kaynağı (F0) > anahtar + bölge | **Var**: SDK `WordBoundary` olayı (kelime, ses ofseti). Bazı SDK sürümlerinde 0 döndüğü bildirildi | Kolay: ofsetleri `Caption[]`'a çevir |
| **Google Cloud TTS – Chirp 3: HD** | Yeni nesil, doğal; tr-TR listede | Orta-iyi: çok sayıda hazır ses (adlar `tr-TR-Chirp3-HD-*`) [Türkçe ses listesi doğrulanmalı] | Ticari kullanım Google Cloud şartlarıyla serbest [doğrulanmalı] | ~1,2 $ (30 $/1M) | 1M krk./ay (ikincil kaynak) [doğrulanmalı] | console.cloud.google.com > API anahtarı/hizmet hesabı; **faturalandırma açılmalı** | **Yok**: Chirp 3 HD SSML'i `<mark>` içermiyor → Whisper gerekir | Orta |
| **Google Gemini-TTS** (`gemini-2.5-flash-tts`) | Doğal dille stil yönetimi (ton, hız, duygu); tr-TR **GA** | İyi: stil istemiyle karakter tarifi | Google Cloud şartları [doğrulanmalı] | < 1 $ (1 $/1M girdi + 20 $/1M ses tokeni; 25 token/sn) | Yok | Google Cloud (faturalandırma açık) | **Yok** → Whisper | Orta |
| **OpenAI** `gpt-4o-mini-tts` | `instructions` ile ton/duygu yönetilir; Türkçe aksan/telaffuz kalitesine dair kaynak bulunamadı [dinleyerek test edilmeli] | Orta: sabit hazır sesler + talimat | Ticari kullanım serbest; **son kullanıcıya sesin YZ olduğunu açıkça bildirme şartı** var (TTS rehberi) | ~0,5-1 $ (~0,015 $/dk) | Yok | platform.openai.com > API keys (ön ödemeli kredi) | **Yok** → Whisper | Orta |
| **Piper** (yerel, açık) | Robotik, duygusuz; mizaha uygun değil | Zayıf | `tr_TR-dfki`: veri seti **CC BY-NC-SA 4.0 → ticari YASAK**. `fahrettin`, `fettah`: veri lisansı bulunamadı [doğrulanmalı]; repo "MIT" etiketi eğitim verisini kapsamaz | 0 $ | Sınırsız | Yok | Fonem süresinden çıkarılabilir; pratikte Whisper | Zor |
| **Coqui XTTS v2** | İyi ama… | Referans ses klonlamaya dayanır | **Coqui Public Model License: yalnız ticari olmayan kullanım** (çıktılar dahil); şirket kapandı, ticari lisans alınamıyor. Ayrıca klonlama mantığı kanal kuralına aykırı | — | — | — | — | **Kullanılmaz** |
| **edge-tts** (Edge'in resmî olmayan uç noktası) | Azure sesleriyle aynı | Azure ile aynı | **Resmî izin yok**; MS Q&A yanıtı: geçerli Azure aboneliği olmadan ticari kullanım şartları ihlal edebilir. Uç nokta her an kapanabilir | 0 $ | — | Yok | WordBoundary verir | **Kullanılmaz** (para kazanan kanal için hukuki risk) |

### Zamanlama vermeyen seçenekler için: Whisper ile hizalama
- `@remotion/install-whisper-cpp`: `transcribe({ tokenLevelTimestamps: true })` + `toCaptions()` doğrudan `@remotion/captions` `Caption[]` üretir (projedeki `ShortsCaptions` bileşeni bu biçimi okur). Yerel, ücretsiz, anahtar gerekmez.
- Türkçe için `.en` olmayan çok dilli model (ör. large-v3 / large-v3-turbo) ve dil = `tr` seçilmeli; dil parametresinin adı [doğrulanmalı].
- Whisper large-v3 Türkçe FLEURS WER ≈ %7,5 (ElevenLabs'in iddiası, rakip kaynağı) [doğrulanmalı]. **Metni zaten bildiğimiz için** Whisper'ın yazdığı kelimeler değil, yalnızca **zamanları** kullanılmalı; kelimeler senaryodan alınıp sırayla eşlenmeli (yanlış yazım altyazıya girmez).
- Whisper kelime zamanları 100-400 ms sapabilir (arXiv 2509.09987 ve ilgili çalışmalar); karaoke vurgusu için kabul edilebilir, gözle kontrol şart.
- Ücretli alternatif: ElevenLabs **Forced Alignment** (ses + metin → kelime/karakter zamanı; STT ile aynı ücret).

### Genel notlar (2026-11-26)
- Ses kitaplığı (ElevenLabs Voice Library) sesleri çoğunlukla gerçek kişilerin paylaştığı klonlardır ve ek şartlar taşıyabilir → **kullanmıyoruz; yalnız Voice Design ile üretilmiş özgün sesler.**
- Hiçbir servis Türkçe mizah için kör dinleme testiyle karşılaştırılmamış; karar öncesi aynı 3 replik her serviste dinlenmeli.
- YouTube: genel TTS sesi "sentetik içerik" etiketi gerektirmez (01-kurallar §3). OpenAI kullanılırsa açıklamaya YZ ses bildirimi eklemek sözleşme şartı.

### Kaynaklar
- ElevenLabs fiyat/plan: https://www.elevenlabs.io/pricing · https://elevenlabs.io/pricing/api · https://dev.to/techsifted/elevenlabs-pricing-2026-plans-credits-and-api-costs-explained-1549 · https://eesel.ai/blog/elevenlabs-pricing
- ElevenLabs yayın/ticari kullanım: https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform · https://elevenlabs.io/terms
- ElevenLabs zamanlama: https://elevenlabs.io/docs/api-reference/text-to-speech-with-timestamps · https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps.md · https://elevenlabs.io/docs/overview/capabilities/forced-alignment
- ElevenLabs v3: https://elevenlabs.io/blog/v3-audiotags · https://elevenlabs.io/blog/eleven-v3-character-direction · https://help.elevenlabs.io/hc/en-us/articles/35869113958801-How-much-does-it-cost-to-generate-using-Eleven-v3 · https://elevenlabs.io/text-to-speech/turkish
- Azure: https://azure.microsoft.com/tr-tr/pricing/details/speech/ · https://techcommunity.microsoft.com/t5/azure-ai/azure-neural-text-to-speech-updates-51-new-voices-added-to-the/ba-p/1988418 · https://learn.microsoft.com/en-us/answers/questions/1651510/azure-text-to-speech-wordboundary-event-always-ret · https://learn.microsoft.com/en-us/answers/questions/325589/using-microsoft-speech-studio-tts-audio-commercial · https://learn.microsoft.com/azure/ai-services/speech-service/high-definition-voices
- Google: https://cloud.google.com/text-to-speech/pricing · https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd · https://docs.cloud.google.com/text-to-speech/docs/release-notes · https://cloud.google.com/text-to-speech/docs/gemini-tts
- OpenAI: https://developers.openai.com/api/docs/models/gpt-4o-mini-tts · https://developers.openai.com/api/docs/guides/text-to-speech
- Piper: https://huggingface.co/rhasspy/piper-voices/blob/6fb8245d6d27fef8988272e0c8e9f5018da1bbbf/tr/tr_TR/dfki/medium/MODEL_CARD · https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/tr/tr_TR
- Coqui XTTS: https://huggingface.co/coqui/XTTS-v2/commits/v2.0.0/LICENSE.txt · https://github.com/coqui-ai/TTS/discussions/4145
- edge-tts: https://github.com/rany2/edge-tts · https://learn.microsoft.com/en-us/answers/questions/2088770/are-opensource-edge-tts-free-for-commercial-use
- Whisper/Remotion: https://www.remotion.dev/docs/install-whisper-cpp/transcribe · https://www.remotion.dev/docs/install-whisper-cpp/to-captions · https://elevenlabs.io/speech-to-text/turkish · https://arxiv.org/pdf/2509.09987

---

## Karakter ses tarifleri (2026-11-26, ilk sürüm)

Tümü özgün, sentetik sesler; hiçbir gerçek kişiye (ünlü, oyuncu, seslendirme sanatçısı) benzetme istenmez.
ElevenLabs Voice Design istemleri İngilizce yazıldı (araç İngilizce tarifle daha tutarlı olduğu için [doğrulanmalı]); konuşulan dil Türkçe.

| Karakter | Ton tarifi | Voice Design istemi (özet) | Azure yedeği (SSML prosody) |
|---|---|---|---|
| **Kazım** (kiracı karınca) | 20'li yaşlarda genç erkek; hızlı, telaşlı, iyimser ama çaresiz; cümle sonları yukarı kalkar, sık iç çeker | "Young Turkish man, mid-20s, light tenor, fast and slightly anxious delivery, hopeful but overwhelmed, comedic, clear Istanbul Turkish" | Ahmet, rate +12%, pitch +8% |
| **Hamdi Bey** (ev sahibi hamamböceği) | 55-60 yaş erkek; kalın, yavaş, kendinden emin, kibar görünen pişkinlik; uzatılan "efendim" | "Mature Turkish man, late 50s, deep baritone, slow, smug and overly polite, slight raspiness, calm authority" | Ahmet, rate -12%, pitch -12% |
| **Uğur Hoca** (uğur böceği öğretmen) | 40'lı yaşlar; sıcak, net, anlatıcı; merakı yükselten vurgular, "Kısacası çocuklar…"da sahne arası duraklama. Cinsiyeti karakter rehberiyle teyit edilmeli | "Warm Turkish teacher voice, 40s, articulate and friendly, enthusiastic storyteller, medium pace, clear diction" | Ahmet (ya da Emel), rate 0%, pitch +2% |
| **Nermin Teyze** | 60'lı yaşlarda kadın; sıcak, yüksek enerji, ünlemli, "aaa" ve "canım" dolu, hafif yüksek perde | "Turkish woman in her 60s, warm and chatty, high energy, exclamatory, affectionate auntie, slightly high pitch" | Emel, rate +6%, pitch +6% |
| Emlakçı Ercan / Cengiz (yan) | Ercan: hızlı, satıcı ağzı, aşırı neşeli. Cengiz: tembel, uzatarak, uykulu | ayrı Voice Design tarifleri | Ahmet ±prosody (ayrışma zayıf) |

v3 ile oyunculuk: replik başına 1 etiket yeter ([sighs], [excited], [whispers], [laughs]); etiketlerin Türkçe metinde çalıştığı [doğrulanmalı].

## Seviye önerisi (2026-11-26, başlangıç değeri; ilk videolarda kulakla ve ölçerle ayarlanmalı)
- Son miks ≈ -14 LUFS (YouTube normalizasyonu; [doğrulanmalı]), tepe ≤ -1 dBTP.
- Seslendirme: miksin referansı, Remotion `volume=1`.
- Müzik: konuşma altında konuşmadan ~18-22 dB aşağıda (Remotion'da ~0,08-0,12); konuşma yokken ~0,25'e çıkabilir.
- Efektler: konuşmayla çakışanlar 0,3-0,5; boşluktaki vurgu/logo 0,7-0,9 (mevcut şablon zaten bu aralıkta).
