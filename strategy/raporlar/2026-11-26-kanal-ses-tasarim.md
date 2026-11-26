# Ses tasarım raporu: Türkçe TTS seçimi (2026-11-26, kanal-ses-tasarim)

Ayrıntılı tablo ve tüm kaynaklar: `strategy/bilgi/ses.md` > "TTS seçenekleri karşılaştırması". Hiçbir şey kurulmadı, anahtar istenmedi.
Not: Bilgiler arama özetlerine dayanır; fiyatlar ve bazı özellikler **[doğrulanmalı]**. Türkçe mizah için yapılmış bağımsız bir dinleme testi bulunamadı.

## Karar

**1. tercih: ElevenLabs (ücretli plan) + Voice Design ile 4 özgün karakter sesi.**
- Mizah için gereken oyunculuk (iç çekme, telaş, pişkinlik) en güçlü bu modelde (Eleven v3 ses etiketleri). Türkçe destekli.
- Voice Design sesi metin tarifinden **sıfırdan üretir**, kimsenin sesi klonlanmaz. Voice Library'deki hazır sesleri kullanmıyoruz (çoğu gerçek kişilerin klonu).
- **Kelime zamanlaması var:** `/v1/text-to-speech/{voice_id}/with-timestamps` karakter düzeyinde zaman döner → kelimelere birleştirip `ShortsCaptions`'ın okuduğu `Caption[]` biçimine çevrilir. v3 modelinin bu uç noktada çalıştığı **doğrulanmalı**; çalışmazsa Multilingual v2 ya da Whisper ile hizalama.
- Lisans: **ücretli planda ticari kullanım ve para kazanma serbest**. Ücretsiz plan ticari değil ve atıf ister: yayımlanacak ses ücretsiz planda **üretilmemeli**. Beta özelliklerle üretilen çıktı da ticari kullanılamaz (v3'ün durumu doğrulanmalı).
- Maliyet: ~40 bin karakter/ay (tekrar denemeler dahil). Starter 6 $/ay (30 bin kredi) sıkı, **Creator ~22 $/ay** rahat. Önce Starter (ilk ay 1 $ kampanyası) ile başla, yetmezse yükselt.

**Yedek: Microsoft Azure Speech (tr-TR-AhmetNeural / tr-TR-EmelNeural).**
- **Ayda 0,5 milyon karakter ücretsiz**, bizim kullanımın ~12 katı. Ücretli kademede ticari kullanım açıkça serbest.
- `WordBoundary` olayıyla **doğrudan kelime zamanı**. Zayıf yanı: Türkçede yalnız 2 ses, ton haber spikeri gibi. 4 karakteri yalnız hız/perde ile ayırmak sınırlı kalır.

**Test adayı: Google Gemini-TTS** (tr-TR GA, doğal dille stil yönetimi, ayda < 1 $). Zamanlama vermez → Whisper gerekir.

**Elenenler:** Coqui XTTS v2 (lisansı ticari kullanımı yasaklıyor, klonlamaya dayanıyor) · Piper `tr_TR-dfki` (veri CC BY-NC-SA, ticari yasak; diğer Türkçe seslerin lisansı belirsiz, kalite robotik) · **edge-tts** (Edge'in resmî olmayan uç noktası, ticari izin yok, Microsoft'un forum yanıtı aboneliksiz ticari kullanımın şartları ihlal edebileceğini söylüyor, uç nokta her an kapanabilir) · OpenAI `gpt-4o-mini-tts` (ucuz, ama zamanlama vermiyor, Türkçe kalitesi kanıtlanmadı, sesin YZ olduğunu bildirme şartı var).

**Zamanlama yedeği:** `@remotion/install-whisper-cpp` (`tokenLevelTimestamps: true` + `toCaptions()`). Yerelde ve ücretsiz çalışır. Çok dilli model ve Türkçe dil seçilmeli. Kelimeler Whisper'ın yazdığından değil **senaryodan** alınmalı, Whisper'dan yalnız zamanlar kullanılmalı.

## Gereken API anahtarı
- **ElevenLabs:** elevenlabs.io'da hesap aç → Profil > API Keys. Ücretsiz plan 10 bin kredi/ay verir, yalnız deneme için. Yayın için Starter ya da Creator aboneliği gerekir.
- (Yedek) **Azure:** portal.azure.com'da "Speech" kaynağı aç (F0 ücretsiz kademe) → anahtar + bölge. Hesap açarken kart doğrulaması istenebilir **[doğrulanmalı]**. F0'da ticari kullanım **doğrulanmalı**; gerekirse S0'a geçilir, bizim hacimde maliyet birkaç sent olur.
- Anahtar `.env` dosyasında tutulmalı, depoya gönderilmemeli.

## Karakter ses tarifleri (özgün sentetik sesler, hiçbir gerçek kişiye benzetme yok)
| Karakter | Ton | Azure yedeği |
|---|---|---|
| **Kazım** | 20'li yaşlarda erkek, açık tenor; hızlı, telaşlı, umutlu ama çaresiz; sık iç çeker | Ahmet, hız +12%, perde +8% |
| **Hamdi Bey** | 55-60 yaş, kalın bariton; yavaş, kibar görünümlü pişkinlik, uzatılmış "efendim" | Ahmet, hız -12%, perde -12% |
| **Uğur Hoca** | 40'larda; sıcak, net diksiyon, meraklı anlatıcı; "Kısacası çocuklar…"dan önce duraklar (cinsiyet karakter rehberinden teyit edilmeli) | Ahmet, 0%, perde +2% |
| **Nermin Teyze** | 60'larda kadın; sıcak, ünlemli, yüksek enerji, "canım" ve "aaa" dolu | Emel, hız +6%, perde +6% |

Voice Design için İngilizce tarif istemleri `bilgi/ses.md` dosyasında. Her repliğe en fazla 1 v3 etiketi: [sighs], [excited], [whispers], [laughs].

**Seviyeler (başlangıç):** konuşma referans (volume 1), müzik konuşma altında ~0,08-0,12, efektler konuşma üstündeyse 0,3-0,5, boşlukta 0,7-0,9. Son miks hedefi ≈ -14 LUFS **[doğrulanmalı]**.

## Genel Müdür için öneriler
1. Kanal sahibinden **ElevenLabs Starter** aboneliği (ilk ay ~1 $) ve API anahtarı alınması için onay istenmeli. Yayın sesi asla ücretsiz planla üretilmemeli.
2. Kanal sahibi ödeme yapmadan önce kısa bir **kör dinleme testi** yapmalı: aynı 3 replik ElevenLabs (ücretsiz deneme), Azure (ücretsiz) ve Gemini-TTS'te okutulsun. Karar kanal sahibinin kulağıyla verilmeli.
3. Onaydan sonra bir `scripts/tts` betiği yazılmalı: replik → `public/voice/<video>/*.mp3` + `Caption[]` JSON. Yedek yol Whisper hizalaması olarak eklenmeli.
4. Uğur Hoca'nın cinsiyeti ve yaşı `bilgi/karakterler.md` ile kesinleştirilmeli. 4 ses üretildikten sonra her birinin `voice_id`'si bu dosyaya kaydedilmeli.
5. Strateji §6'daki "Yapay içerik etiketi kapalı" kararı ElevenLabs ve Azure için geçerli kalır. OpenAI seçilirse açıklamaya YZ ses bildirimi zorunlu olur.
